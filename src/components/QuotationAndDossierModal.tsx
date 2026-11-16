import React, { useState, useEffect } from 'react';
import {
  AssistanceCase,
  CaseQuote,
  ApplicationDossier,
  LicenceRecord,
} from '../types/licence';
import {
  Sparkles,
  X,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Printer,
  Download,
  AlertTriangle,
  User,
  Clock,
  CheckSquare,
  Lock,
  Layers,
  Building2
} from 'lucide-react';

interface QuotationAndDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: AssistanceCase | null;
  onUpdateCase: (updatedCase: AssistanceCase) => void;
}

export const QuotationAndDossierModal: React.FC<QuotationAndDossierModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onUpdateCase,
}) => {
  const [activeTab, setActiveTab] = useState<'quote' | 'dossier'>('quote');
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);
  const [isLoadingDossier, setIsLoadingDossier] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [copiedQuoteId, setCopiedQuoteId] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [operatorChecks, setOperatorChecks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && caseItem) {
      // If case has verified documents or paid quote, start on dossier or quote
      if (caseItem.quote?.status === 'paid' && caseItem.dossier) {
        setActiveTab('dossier');
      } else {
        setActiveTab('quote');
      }

      // Generate quote if not present
      if (!caseItem.quote) {
        fetchQuote(caseItem);
      }

      // Generate dossier if not present
      if (!caseItem.dossier) {
        fetchDossier(caseItem);
      }
    }
  }, [isOpen, caseItem]);

  if (!isOpen || !caseItem) return null;

  const fetchQuote = async (c: AssistanceCase) => {
    setIsLoadingQuote(true);
    try {
      const res = await fetch('/api/agent/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: c.id,
          applicantType: c.applicantType,
          licenceId: c.licenceId,
          licenceName: c.licenceName,
          statutorySummary: c.statutoryGovtFeeEst,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated: AssistanceCase = {
          ...c,
          quote: data.quote,
          updatedAt: new Date().toISOString(),
        };
        onUpdateCase(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const fetchDossier = async (c: AssistanceCase) => {
    setIsLoadingDossier(true);
    try {
      const res = await fetch('/api/agent/generate-dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: c.id }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated: AssistanceCase = {
          ...c,
          dossier: data.dossier,
          updatedAt: new Date().toISOString(),
        };
        onUpdateCase(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDossier(false);
    }
  };

  const handleAcceptAndPayQuote = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch(`/api/cases/${caseItem.id}/accept-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateCase(data.case);
        // Switch to Application Dossier
        setActiveTab('dossier');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCopyPayload = () => {
    if (caseItem.dossier) {
      navigator.clipboard.writeText(JSON.stringify(caseItem.dossier.portalFormPayload, null, 2));
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleCopyQuoteId = () => {
    if (caseItem.quote) {
      navigator.clipboard.writeText(caseItem.quote.quoteId);
      setCopiedQuoteId(true);
      setTimeout(() => setCopiedQuoteId(false), 2000);
    }
  };

  const handleToggleCheck = (index: number) => {
    setOperatorChecks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const quote = caseItem.quote;
  const dossier = caseItem.dossier;
  const isPaid = quote?.status === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Step 3: AI Quotation & Application Dossier
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                  Operator Copilot
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent itemized commercials & portal submission dossier.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Case Context Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Case ID:</span>
              <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                {caseItem.id}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <strong className="text-slate-900">{caseItem.customerName}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Licence:</span>
              <strong className="text-slate-900">{caseItem.licenceName}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isPaid ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quote Accepted & Paid</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                ● Awaiting Quote Acceptance
              </span>
            )}
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="bg-white px-6 py-2 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('quote')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'quote'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>1. Itemized Quotation & Commercials</span>
              {isPaid && (
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
                  PAID
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'dossier'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Official Portal Application Dossier</span>
              {dossier && (
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-bold ml-1">
                  Ready
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* ================= TAB 1: ITEMIZED QUOTE ================= */}
          {activeTab === 'quote' && (
            <div className="space-y-6">
              
              {quote ? (
                <div className="space-y-6">
                  {/* Quote ID & Status Strip */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Quote Reference Number</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {quote.quoteId}
                        </span>
                        <button
                          onClick={handleCopyQuoteId}
                          className="text-slate-400 hover:text-slate-700"
                          title="Copy Quote Reference"
                        >
                          {copiedQuoteId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px]">Pricing Transparency</span>
                      <span className="font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Statutory Govt Fee Disclosed Separately</span>
                      </span>
                    </div>
                  </div>

                  {/* Commercial Fee Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-100/70 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <span>Fee Item / Particular</span>
                      <span>Amount (INR)</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {/* Statutory Govt Fees */}
                      <div className="p-4 bg-white space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>1. Statutory Government Fee (100% Official Remittance)</span>
                          </span>
                          <span className="font-mono text-sm">₹{quote.statutoryGovtFee}</span>
                        </div>
                        <div className="pl-4 space-y-1 text-slate-500 text-[11px]">
                          {quote.statutoryFeeBreakdown.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span>• {item.particular}</span>
                              <span className="font-mono">₹{item.amount}</span>
                            </div>
                          ))}
                          <p className="text-emerald-700 font-medium pt-1">
                            Paid directly to the Department Treasury / Bharatkosh / Parivahan portal.
                          </p>
                        </div>
                      </div>

                      {/* Licence Holding Managed Assistance Fee */}
                      <div className="p-4 bg-white space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-500" />
                            <span>2. Licence Holding Managed Assistance Fee ({caseItem.applicantType})</span>
                          </span>
                          <span className="font-mono text-sm">₹{quote.assistanceFee}</span>
                        </div>
                        <div className="pl-4 text-slate-500 text-[11px]">
                          Covers Gemini Multi-Modal document pre-screening, form dossier compilation, and coordinator filing.
                        </div>
                      </div>

                      {/* Taxes */}
                      <div className="p-4 bg-white flex items-center justify-between text-slate-700">
                        <span className="pl-4">3. GST on Assistance Fee (18%)</span>
                        <span className="font-mono font-semibold">₹{quote.taxes}</span>
                      </div>

                      {/* Total */}
                      <div className="p-4 bg-slate-900 text-white flex items-center justify-between font-bold text-sm">
                        <span className="text-white">Total Itemized Payable Amount</span>
                        <div className="text-right">
                          <span className="font-mono text-lg text-emerald-400">
                            ₹{quote.totalPayable}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            All statutory charges + assistance included
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scope of Work Guarantee */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-2 text-xs">
                      <h4 className="font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>Included in Managed Scope</span>
                      </h4>
                      <ul className="space-y-1.5 text-teal-900 text-[11px]">
                        {quote.scopeIncluded.map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-teal-600 mt-0.5">✓</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-slate-500" />
                        <span>Excluded Scope / Department Discretion</span>
                      </h4>
                      <ul className="space-y-1.5 text-slate-600 text-[11px]">
                        {quote.scopeExcluded.map((exc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-slate-400 mt-0.5">•</span>
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Payment / Action Box */}
                  <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                    <div>
                      {isPaid ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Payment Completed & Verified</span>
                          </span>
                          <p className="text-xs text-slate-300 font-mono">
                            Gateway Ref: {quote.paymentReference} · {new Date(quote.acceptedAt || '').toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">
                            Accept Quote & Authorize Filing Assistance
                          </span>
                          <p className="text-[11px] text-slate-400">
                            Immediate coordinator assignment and portal dossier release.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isPaid ? (
                        <button
                          onClick={() => setActiveTab('dossier')}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-xs"
                        >
                          <span>Open Application Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={handleAcceptAndPayQuote}
                          disabled={isProcessingPayment}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-98"
                        >
                          {isProcessingPayment ? (
                            <span>Processing Payment...</span>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-slate-900" />
                              <span>Accept Quote & Pay ₹{quote.totalPayable}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                  <p className="text-xs">Generating itemized statutory quote...</p>
                </div>
              )}

            </div>
          )}

          {/* ================= TAB 2: APPLICATION DOSSIER ================= */}
          {activeTab === 'dossier' && (
            <div className="space-y-6">
              
              {dossier ? (
                <div className="space-y-6">
                  
                  {/* Dossier Header Card */}
                  <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-900 text-sm">
                          {dossier.dossierId}
                        </span>
                        <span className="text-[10px] font-bold bg-teal-200/80 text-teal-800 px-2 py-0.5 rounded">
                          Portal-Ready Dossier
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Target Government Authority: <strong>{dossier.targetPortal}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={dossier.targetPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <span>Open Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Section 1: Pre-Fill Demographic Payload */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span>Pre-Screened Demographic Data (Zero Re-typing)</span>
                      </h4>
                      <button
                        onClick={handleCopyPayload}
                        className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-semibold px-2 py-1 rounded hover:bg-teal-50"
                      >
                        {copiedPayload ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied JSON</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON Payload</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">APPLICANT_LEGAL_NAME</span>
                        <strong className="text-slate-900">{dossier.applicantSummary.legalName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">MOBILE_NUMBER</span>
                        <strong className="font-mono text-slate-900">{dossier.applicantSummary.contactNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">EMAIL_ADDRESS</span>
                        <strong className="text-slate-900">{dossier.applicantSummary.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">JURISDICTION_STATE</span>
                        <strong className="text-slate-900">{dossier.applicantSummary.state}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">DISTRICT_OR_RTO</span>
                        <strong className="text-slate-900">{dossier.applicantSummary.district}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">ENTITY_TYPE</span>
                        <strong className="text-slate-900">{dossier.applicantSummary.entityType}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Verified Documents Package */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-slate-100 px-5 py-3 border-b border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>AI Pre-Screened Document Package</span>
                      </h4>
                    </div>

                    <div className="divide-y divide-slate-100 text-xs">
                      {dossier.verifiedDocuments.length > 0 ? (
                        dossier.verifiedDocuments.map((doc, idx) => (
                          <div key={idx} className="p-4 bg-white flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{doc.docName}</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                  {doc.matchScore}% Match
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                {doc.detectedType} · ID: <span className="font-mono text-slate-800 font-semibold">{doc.maskedId}</span>
                              </p>
                            </div>
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ready for Portal Upload</span>
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No documents verified yet. Complete Step 2 document upload first.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Operator Execution Checklist */}
                  <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-teal-600" />
                      <span>Field Operator Government Filing Checklist</span>
                    </h4>

                    <div className="space-y-2">
                      {dossier.filingChecklist.map((task, i) => (
                        <label key={i} className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(operatorChecks[i])}
                            onChange={() => handleToggleCheck(i)}
                            className="w-4 h-4 text-teal-600 rounded border-slate-300 mt-0.5 focus:ring-teal-500"
                          />
                          <span className={operatorChecks[i] ? 'line-through text-slate-400' : 'text-slate-800'}>
                            {task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-spin" />
                  <p className="text-xs">Preparing portal dossier payload...</p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {caseItem.state} Pilot · {caseItem.district} · Managed Case Assistance
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Done / Return
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
