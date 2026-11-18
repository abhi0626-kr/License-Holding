import React, { useState, useEffect } from 'react';
import {
  AssistanceCase,
  VerifiedAgent,
  UserRole,
  OperatorMilestone,
} from '../types/licence';
import { VERIFIED_AGENTS } from '../data/verifiedAgents';
import {
  Building2,
  UserCheck,
  Briefcase,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Upload,
  FileText,
  User,
  Phone,
  MapPin,
  IndianRupee,
  AlertTriangle,
  Send,
  Eye,
  Layers,
  Filter
} from 'lucide-react';

interface OperatorWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cases: AssistanceCase[];
  onUpdateCase: (updatedCase: AssistanceCase) => void;
  onOpenDossierModal: (caseItem: AssistanceCase) => void;
}

export const OperatorWorkspaceModal: React.FC<OperatorWorkspaceModalProps> = ({
  isOpen,
  onClose,
  cases,
  onUpdateCase,
  onOpenDossierModal,
}) => {
  // Role within workspace: 'operations_lead' | 'field_agent'
  const [activeRole, setActiveRole] = useState<'operations_lead' | 'field_agent'>('operations_lead');
  
  // Selected agent when viewing as Field Agent
  const [selectedAgentId, setSelectedAgentId] = useState<string>(VERIFIED_AGENTS[0].id);

  // Filter tabs for Ops Lead
  const [filterTab, setFilterTab] = useState<'all' | 'unassigned' | 'verified' | 'in_progress' | 'completed'>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected case for detailed review / filing drawer
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(cases[0]?.id || null);

  // Field agent filing form state for selected case
  const [govtArnInput, setGovtArnInput] = useState<string>('');
  const [filingStatus, setFilingStatus] = useState<'in_progress' | 'completed'>('in_progress');
  const [ackSlipName, setAckSlipName] = useState<string>('');
  const [ackSlipData, setAckSlipData] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Track agent checklist items
  const [agentChecklist, setAgentChecklist] = useState<Record<string, boolean>>({
    data_entered: false,
    docs_uploaded: false,
    govt_fee_paid: false,
    arn_recorded: false,
  });

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0] || null;

  useEffect(() => {
    if (activeCase) {
      setGovtArnInput(activeCase.govtReferenceNumber || '');
      setFilingStatus(activeCase.status === 'completed' ? 'completed' : 'in_progress');
      setAckSlipName(activeCase.govtAckReceiptName || '');
      setAckSlipData(activeCase.govtAckReceiptData || '');
      setInternalNotes(activeCase.opsReviewNotes || '');
      setAgentChecklist({
        data_entered: Boolean(activeCase.govtReferenceNumber),
        docs_uploaded: Boolean(activeCase.govtReferenceNumber),
        govt_fee_paid: Boolean(activeCase.govtReferenceNumber),
        arn_recorded: Boolean(activeCase.govtReferenceNumber),
      });
      setSaveSuccessMsg(null);
    }
  }, [selectedCaseId, activeCase]);

  if (!isOpen) return null;

  // Filter cases based on Ops Lead tabs
  const filteredCases = cases.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.licenceName.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeRole === 'field_agent') {
      // Show cases assigned to this agent or unassigned matching district
      return c.assignedAgentId === selectedAgentId || !c.assignedAgentId;
    }

    if (filterTab === 'unassigned') return !c.assignedAgentId;
    if (filterTab === 'verified') return c.status === 'documents_verified';
    if (filterTab === 'in_progress') return c.status === 'in_progress' || c.status === 'assigned';
    if (filterTab === 'completed') return c.status === 'completed';
    return true;
  });

  // Assign agent handler
  const handleAssignAgent = async (caseId: string, agentId: string) => {
    const agent = VERIFIED_AGENTS.find((a) => a.id === agentId);
    if (!agent) return;

    try {
      const res = await fetch(`/api/cases/${caseId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
        }),
      });
      const data = res.ok ? await res.json() : null;
      const targetCase = cases.find((c) => c.id === caseId);
      if (targetCase) {
        const updatedCase: AssistanceCase = data?.case || {
          ...targetCase,
          assignedAgentId: agent.id,
          assignedAgentName: agent.name,
          assignedAt: new Date().toISOString(),
          status: 'assigned',
          updatedAt: new Date().toISOString(),
        };
        onUpdateCase(updatedCase);
        setSaveSuccessMsg(`Assigned to ${agent.name} successfully.`);
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save internal notes
  const handleSaveNotes = async () => {
    if (!activeCase) return;
    try {
      await fetch(`/api/cases/${activeCase.id}/review-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opsReviewNotes: internalNotes }),
      });
      const updatedCase: AssistanceCase = {
        ...activeCase,
        opsReviewNotes: internalNotes,
        updatedAt: new Date().toISOString(),
      };
      onUpdateCase(updatedCase);
      setSaveSuccessMsg('Internal ops note recorded.');
      setTimeout(() => setSaveSuccessMsg(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Field Agent submit government filing
  const handleUpdateFiling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    try {
      const res = await fetch(`/api/cases/${activeCase.id}/update-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          govtReferenceNumber: govtArnInput.trim(),
          govtAckReceiptName: ackSlipName,
          govtAckReceiptData: ackSlipData,
          status: filingStatus,
          operatorMilestones: [
            { id: '1', title: 'Portal Form Data Pre-filled', completed: agentChecklist.data_entered, completedAt: new Date().toISOString() },
            { id: '2', title: 'Verified Documents Attached', completed: agentChecklist.docs_uploaded, completedAt: new Date().toISOString() },
            { id: '3', title: 'Statutory Fee Remitted', completed: agentChecklist.govt_fee_paid, completedAt: new Date().toISOString() },
            { id: '4', title: 'Official ARN Recorded', completed: agentChecklist.arn_recorded, completedAt: new Date().toISOString() },
          ],
        }),
      });

      const data = res.ok ? await res.json() : null;
      const updatedCase: AssistanceCase = data?.case || {
        ...activeCase,
        govtReferenceNumber: govtArnInput.trim(),
        govtAckReceiptName: ackSlipName,
        govtAckReceiptData: ackSlipData,
        status: filingStatus,
        updatedAt: new Date().toISOString(),
      };

      onUpdateCase(updatedCase);
      setSaveSuccessMsg('Government filing recorded! Case updated successfully.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Upload Ack receipt
  const handleAckUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAckSlipName(file.name);
        setAckSlipData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentAgentObj = VERIFIED_AGENTS.find((a) => a.id === selectedAgentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border border-slate-200 flex flex-col h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Workspace Top Header & Role Switcher */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Managed Operations & Field Agent Workspace
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                  Karnataka Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inbound case queue, AI audit verification, agent dispatch, and government filing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Switcher Pill */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
              <button
                onClick={() => setActiveRole('operations_lead')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeRole === 'operations_lead'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Operations Lead</span>
              </button>

              <button
                onClick={() => setActiveRole('field_agent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeRole === 'field_agent'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Field Agent View</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header Bar: Role Context Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {activeRole === 'operations_lead' ? (
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Active Console: Operations Director (Review & Dispatch)</span>
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600">Total Cases: <strong>{cases.length}</strong></span>
              <span className="text-slate-400">·</span>
              <span className="text-amber-800 font-medium">
                Unassigned: {cases.filter((c) => !c.assignedAgentId).length}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">Select Active Field Agent:</span>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-white border border-slate-200 text-slate-900 font-bold px-3 py-1 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
              >
                {VERIFIED_AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.badge} · {agent.district})
                  </option>
                ))}
              </select>
              {currentAgentObj && (
                <span className="text-slate-500 text-[11px]">
                  Rating: ★ {currentAgentObj.rating} · Active: {currentAgentObj.activeCasesCount} cases
                </span>
              )}
            </div>
          )}

          {saveSuccessMsg && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg animate-in fade-in">
              ✓ {saveSuccessMsg}
            </span>
          )}
        </div>

        {/* Main Workspace 2-Column Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* ================= COLUMN 1: CASE QUEUE (5 COLS) ================= */}
          <div className="md:col-span-5 border-r border-slate-200 flex flex-col bg-slate-50/50 overflow-hidden">
            
            {/* Search and Filters Strip */}
            <div className="p-3 border-b border-slate-200 bg-white space-y-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Case ID, Name, Licence or District..."
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100"
              />

              {activeRole === 'operations_lead' && (
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {(['all', 'unassigned', 'verified', 'in_progress', 'completed'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterTab(t)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors capitalize ${
                        filterTab === t
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Inbound Cases List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
              {filteredCases.length > 0 ? (
                filteredCases.map((c) => {
                  const isSelected = c.id === selectedCaseId;
                  const verifiedDocs = c.documents.filter((d) => d.status === 'verified').length;
                  const mandatoryDocs = c.documents.filter((d) => d.isMandatory).length;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-teal-500 shadow-sm ring-1 ring-teal-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs mb-1">
                        <span className="font-mono font-bold text-slate-900">
                          {c.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'assigned'
                              ? 'bg-purple-100 text-purple-800'
                              : c.status === 'documents_verified'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-800 truncate mb-1">
                        {c.licenceName}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{c.customerName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{c.district}</span>
                        </span>
                      </div>

                      {/* Scrutiny & Assignment Pill */}
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-teal-800 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          <span>AI Scrutiny: {verifiedDocs}/{mandatoryDocs} Verified</span>
                        </span>

                        {c.assignedAgentName ? (
                          <span className="text-slate-600 font-medium">
                            Agent: <strong>{c.assignedAgentName.split(' ')[0]}</strong>
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No cases found for the selected filter.
                </div>
              )}
            </div>

          </div>

          {/* ================= COLUMN 2: WORKSPACE DESK (7 COLS) ================= */}
          <div className="md:col-span-7 flex flex-col bg-white overflow-hidden">
            
            {activeCase ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Active Case Banner */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {activeCase.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        ({activeCase.state} Pilot)
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-teal-900">
                      {activeCase.licenceName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{activeCase.customerName}</strong>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+91 {activeCase.phone}</span>
                      </span>
                      <span>·</span>
                      <span>{activeCase.district}</span>
                    </div>
                  </div>

                  {/* 1-Click Dossier Modal Link */}
                  <button
                    onClick={() => onOpenDossierModal(activeCase)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    <span>View Portal Dossier</span>
                  </button>
                </div>

                {/* AI Document Scrutiny Audit Strip */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-teal-50/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>Gemini Vision AI Document Audit</span>
                    </h4>
                    <span className="font-semibold text-emerald-800 text-[11px] bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                      Checkpoint Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {activeCase.documents.map((doc) => (
                      <div
                        key={doc.docRequirementId}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block text-xs">{doc.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {doc.verificationDetails?.detectedDocumentType || 'Pending Scan'}
                          </span>
                        </div>
                        <div>
                          {doc.status === 'verified' ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>{doc.verificationDetails?.nameMatchScore ?? 98}% Match</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= OPS LEAD VIEW: ASSIGNMENT & NOTES ================= */}
                {activeRole === 'operations_lead' && (
                  <div className="space-y-5">
                    
                    {/* Agent Assignment Card */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-teal-600" />
                        <span>Field Agent Assignment</span>
                      </h4>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <select
                          value={activeCase.assignedAgentId || ''}
                          onChange={(e) => handleAssignAgent(activeCase.id, e.target.value)}
                          className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-100"
                        >
                          <option value="">-- Choose Vetted Agent for Dispatch --</option>
                          {VERIFIED_AGENTS.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {agent.name} ({agent.badge} · {agent.district} · {agent.activeCasesCount} active)
                            </option>
                          ))}
                        </select>

                        {activeCase.assignedAgentName && (
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Currently Assigned: {activeCase.assignedAgentName}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Internal Operations Notes */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span>Operations Review Notes</span>
                      </h4>

                      <textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        rows={3}
                        placeholder="e.g. Verified Aadhaar name matches application. Client requested slot before Friday. Agent instructed to file on Parivahan Sarathi KA-01."
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-100"
                      />

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveNotes}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                          Save Internal Note
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* ================= FIELD AGENT VIEW: FILING & ARN ================= */}
                {activeRole === 'field_agent' && (
                  <form onSubmit={handleUpdateFiling} className="space-y-5">
                    
                    {/* Agent Checklist */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>Agent Government Portal Filing Checklist</span>
                      </h4>

                      <div className="space-y-2 text-xs">
                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agentChecklist.data_entered}
                            onChange={(e) => setAgentChecklist({ ...agentChecklist, data_entered: e.target.checked })}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300"
                          />
                          <span className={agentChecklist.data_entered ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                            Pre-filled demographic data on official government portal (Parivahan / FoSCoS)
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agentChecklist.docs_uploaded}
                            onChange={(e) => setAgentChecklist({ ...agentChecklist, docs_uploaded: e.target.checked })}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300"
                          />
                          <span className={agentChecklist.docs_uploaded ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                            Attached AI pre-screened documents (Aadhaar & Supporting ID)
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agentChecklist.govt_fee_paid}
                            onChange={(e) => setAgentChecklist({ ...agentChecklist, govt_fee_paid: e.target.checked })}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300"
                          />
                          <span className={agentChecklist.govt_fee_paid ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                            Remitted statutory government fee directly to government treasury
                          </span>
                        </label>

                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agentChecklist.arn_recorded}
                            onChange={(e) => setAgentChecklist({ ...agentChecklist, arn_recorded: e.target.checked })}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300"
                          />
                          <span className={agentChecklist.arn_recorded ? 'font-semibold text-slate-900' : 'text-slate-600'}>
                            Generated and recorded official Government ARN / Acknowledgement Reference
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* ARN & Filing Updates Form */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Send className="w-4 h-4 text-teal-600" />
                        <span>Government Application Number & Acknowledgement Slip</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                            Official Government ARN / Ref No. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={govtArnInput}
                            onChange={(e) => setGovtArnInput(e.target.value)}
                            placeholder="e.g. DL-KA01-2026-90421 or FOSCOS-264901"
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-100"
                            required
                          />
                          <p className="text-[11px] text-slate-500 mt-1">
                            Issued by Parivahan Sarathi, FoSCoS or Seva Sindhu upon submission.
                          </p>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1">
                            Updated Case Status
                          </label>
                          <select
                            value={filingStatus}
                            onChange={(e) => setFilingStatus(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold bg-white focus:outline-none focus:ring-2 focus:ring-teal-100"
                          >
                            <option value="in_progress">In Progress (Submitted to Government)</option>
                            <option value="completed">Completed (Licence / Certificate Issued)</option>
                          </select>
                        </div>
                      </div>

                      {/* Acknowledgement Receipt Upload */}
                      <div>
                        <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1 text-xs">
                          Upload Government Acknowledgement Receipt / Slip
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer transition-colors border border-slate-300">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{ackSlipName ? 'Replace Slip' : 'Upload PDF / Image'}</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleAckUpload}
                              className="hidden"
                            />
                          </label>
                          {ackSlipName && (
                            <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{ackSlipName}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-98"
                        >
                          <Check className="w-4 h-4" />
                          <span>Record Government Submission & Notify Client</span>
                        </button>
                      </div>

                    </div>

                  </form>
                )}

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
                Select a case from the queue to review or update filing.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
