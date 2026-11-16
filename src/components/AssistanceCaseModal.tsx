import React, { useState, useEffect } from 'react';
import { 
  LicenceRecord, 
  AssistanceCase, 
  ApplicantType, 
  LicenceCategory,
  CaseDocumentItem 
} from '../types/licence';
import { INDIAN_STATES } from '../data/indianStates';
import { KARNATAKA_DISTRICTS } from '../data/karnatakaDistricts';
import { 
  Sparkles, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileCheck2, 
  Copy, 
  Check, 
  HelpCircle,
  Clock,
  IndianRupee,
  Lock
} from 'lucide-react';

interface AssistanceCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLicence: LicenceRecord | null;
  allLicences: LicenceRecord[];
  onCaseCreated: (createdCase: AssistanceCase) => void;
  onStartVerification?: (caseItem: AssistanceCase) => void;
}

const CATEGORY_CODE_MAP: Record<LicenceCategory, string> = {
  'driving-transport': 'DL',
  'business-company': 'BIZ',
  'food-restaurant': 'FOOD',
  'factory-industrial': 'IND',
  'healthcare-medical': 'MED',
  'education-training': 'EDU',
  'construction-property': 'PROP',
  'import-export-logistics': 'EXIM',
  'tourism-entertainment': 'TOUR',
  'agriculture-rural': 'AGRI',
  'citizen-certificates': 'CERT',
  'other-licences': 'MISC',
};

export const AssistanceCaseModal: React.FC<AssistanceCaseModalProps> = ({
  isOpen,
  onClose,
  selectedLicence,
  allLicences,
  onCaseCreated,
  onStartVerification,
}) => {
  // Current active licence in the modal
  const [currentLicence, setCurrentLicence] = useState<LicenceRecord | null>(selectedLicence);
  const [createdCaseRecord, setCreatedCaseRecord] = useState<AssistanceCase | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [stateCode, setStateCode] = useState<string>('KA');
  const [district, setDistrict] = useState<string>('Bengaluru Urban');
  const [pincode, setPincode] = useState<string>('');
  const [applicationKind, setApplicationKind] = useState<
    'New' | 'Renewal' | 'Modification' | 'Correction' | 'Duplicate'
  >('New');
  const [applicantType, setApplicantType] = useState<ApplicantType>('Individual');
  const [notes, setNotes] = useState<string>('');

  // Wizard Stage: 'intake' | 'checkpoint' | 'success'
  const [stage, setStage] = useState<'intake' | 'checkpoint' | 'success'>('intake');
  const [generatedCaseId, setGeneratedCaseId] = useState<string>('');
  const [copiedCaseId, setCopiedCaseId] = useState<boolean>(false);

  // Checkpoint Verification Checks (Mandatory double-check)
  const [checkNameMatchesId, setCheckNameMatchesId] = useState<boolean>(false);
  const [checkPhoneActive, setCheckPhoneActive] = useState<boolean>(false);
  const [checkGovtAuthorityNotice, setCheckGovtAuthorityNotice] = useState<boolean>(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedLicence) {
      setCurrentLicence(selectedLicence);
    }
  }, [selectedLicence]);

  useEffect(() => {
    if (isOpen) {
      // Reset state for new entry if not already set
      setStage('intake');
      setCheckNameMatchesId(false);
      setCheckPhoneActive(false);
      setCheckGovtAuthorityNotice(false);
      setErrors({});
      if (selectedLicence) {
        setCurrentLicence(selectedLicence);
      }
    }
  }, [isOpen, selectedLicence]);

  if (!isOpen || !currentLicence) return null;

  // Generate unique Case ID
  const generateNewCaseId = (licence: LicenceRecord, state: string): string => {
    const catCode = CATEGORY_CODE_MAP[licence.category] || 'GEN';
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `CASE-${state}-${catCode}-${year}-${randomSuffix}`;
  };

  // Validate Intake Stage
  const handleProceedToCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Full Legal Name is required (as per Government ID)';
    } else if (customerName.trim().length < 3) {
      newErrors.customerName = 'Please enter complete full legal name';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Mobile / WhatsApp number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const caseId = generateNewCaseId(currentLicence, stateCode);
    setGeneratedCaseId(caseId);
    setStage('checkpoint');
  };

  // Final confirmation after Checkpoint double-check
  const handleConfirmAndInitializeCase = () => {
    if (!checkNameMatchesId || !checkPhoneActive || !checkGovtAuthorityNotice) {
      return;
    }

    const currentStateObj = INDIAN_STATES.find((s) => s.code === stateCode);
    const stateName = currentStateObj?.name || 'Karnataka';

    // Build initial document slots from currentLicence.requiredDocuments
    const initialDocs: CaseDocumentItem[] = currentLicence.requiredDocuments.map((doc) => ({
      docRequirementId: doc.id,
      name: doc.name,
      isMandatory: doc.isMandatory,
      status: 'pending',
    }));

    const newCase: AssistanceCase = {
      id: generatedCaseId,
      licenceId: currentLicence.id,
      licenceName: currentLicence.name,
      licenceCategory: currentLicence.category,
      customerName: customerName.trim(),
      phone: phone.replace(/\D/g, ''),
      email: email.trim() || undefined,
      state: stateName,
      district: district.trim(),
      pincode: pincode.trim() || undefined,
      applicantType,
      applicationKind,
      status: 'initialized',
      statutoryGovtFeeEst: currentLicence.governmentFees.summary.split('.')[0] || 'Statutory Fee at Portal',
      estimatedDuration: currentLicence.processingTimeEstimate.split('(')[0].trim(),
      documents: initialDocs,
      notes: notes.trim() || undefined,
      confirmedCheckpoints: {
        nameMatchesAadhaar: checkNameMatchesId,
        acknowledgedGovtAuthority: checkGovtAuthorityNotice,
        contactConfirmed: checkPhoneActive,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store server-side if endpoint exists
    fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase),
    }).catch(() => {
      // Local fallback handled by state persistence
    });

    onCaseCreated(newCase);
    setCreatedCaseRecord(newCase);
    setStage('success');
  };

  const handleCopyCaseId = () => {
    navigator.clipboard.writeText(generatedCaseId);
    setCopiedCaseId(true);
    setTimeout(() => setCopiedCaseId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Request AI Agent Assistance</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded">
                  Managed Pilot
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Assisted filing, document pre-validation & coordinator assignment.
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

        {/* Progress Stepper */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                stage === 'intake'
                  ? 'bg-teal-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {stage === 'intake' ? '1' : <Check className="w-3 h-3" />}
            </span>
            <span className={stage === 'intake' ? 'font-bold text-slate-900' : 'text-slate-600'}>
              1. Case Intake
            </span>
          </div>

          <div className="w-8 h-0.5 bg-slate-300" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                stage === 'checkpoint'
                  ? 'bg-amber-600 text-white'
                  : stage === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {stage === 'success' ? <Check className="w-3 h-3" /> : '2'}
            </span>
            <span
              className={
                stage === 'checkpoint'
                  ? 'font-bold text-amber-900'
                  : stage === 'success'
                  ? 'text-slate-600'
                  : 'text-slate-400'
              }
            >
              2. Checkpoint Verification
            </span>
          </div>

          <div className="w-8 h-0.5 bg-slate-300" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                stage === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </span>
            <span className={stage === 'success' ? 'font-bold text-emerald-900' : 'text-slate-400'}>
              3. Initialized
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* ================= STAGE 1: INTAKE ================= */}
          {stage === 'intake' && (
            <form onSubmit={handleProceedToCheckpoint} className="space-y-5">
              
              {/* Selected Licence Context Box */}
              <div className="p-3.5 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-teal-800">
                    <span className="bg-teal-100 px-1.5 py-0.5 rounded font-mono">
                      #{currentLicence.serialNo}
                    </span>
                    <span>{currentLicence.categoryLabel}</span>
                    <span>·</span>
                    <span>{currentLicence.serviceType}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentLicence.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                      <span>Govt Fee: {currentLicence.governmentFees.summary.split('.')[0]}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Time: {currentLicence.processingTimeEstimate.split('(')[0].trim()}</span>
                    </span>
                  </div>
                </div>

                {/* Change Licence Dropdown */}
                <select
                  value={currentLicence.id}
                  onChange={(e) => {
                    const found = allLicences.find((l) => l.id === e.target.value);
                    if (found) setCurrentLicence(found);
                  }}
                  className="text-xs bg-white border border-teal-300 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 shrink-0"
                >
                  {allLicences.map((l) => (
                    <option key={l.id} value={l.id}>
                      #{l.serialNo} {l.name.slice(0, 32)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Full Legal Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Applicant Legal Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.customerName) setErrors({ ...errors, customerName: '' });
                    }}
                    placeholder="Enter full name as printed on Aadhaar / Official ID"
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      errors.customerName
                        ? 'border-red-300 ring-red-100'
                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'
                    }`}
                  />
                </div>
                {errors.customerName ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.customerName}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Spelling must match your primary government identity document.
                  </p>
                )}
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    WhatsApp / Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="98765 43210"
                      className={`w-full pl-11 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 font-mono ${
                        errors.phone
                          ? 'border-red-300 ring-red-100'
                          : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* State & District Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    State / Jurisdiction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stateCode}
                    onChange={(e) => {
                      setStateCode(e.target.value);
                      if (e.target.value === 'KA') {
                        setDistrict('Bengaluru Urban');
                      }
                    }}
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name} ({s.code}) {s.code === 'KA' ? '★ Pilot State' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    District / City <span className="text-red-500">*</span>
                  </label>
                  {stateCode === 'KA' ? (
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
                    >
                      {KARNATAKA_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Enter district or city"
                      className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  )}
                </div>
              </div>

              {/* Application Kind & Applicant Entity Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Application Type
                  </label>
                  <select
                    value={applicationKind}
                    onChange={(e) => setApplicationKind(e.target.value as any)}
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
                  >
                    <option value="New">New Application (Fresh)</option>
                    <option value="Renewal">Renewal of Existing Licence</option>
                    <option value="Modification">Modification / Upgradation</option>
                    <option value="Correction">Name / Address Correction</option>
                    <option value="Duplicate">Duplicate / Replacement Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Applicant Entity
                  </label>
                  <select
                    value={applicantType}
                    onChange={(e) => setApplicantType(e.target.value as any)}
                    className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 bg-white"
                  >
                    <option value="Individual">Individual Citizen</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership Firm</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="Private Limited">Private Limited Company</option>
                    <option value="Farmer">Farmer / Agriculturalist</option>
                  </select>
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Special Notes or Queries <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Need vehicle class LMV and MCWG; already have medical certificate."
                  className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              {/* Submit to Checkpoint */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  <span>Proceed to Checkpoint Verification</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </form>
          )}

          {/* ================= STAGE 2: CHECKPOINT (DOUBLE CHECK) ================= */}
          {stage === 'checkpoint' && (
            <div className="space-y-6">
              
              {/* Checkpoint Banner */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Verification Checkpoint · Double-Check Before Initialization
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Official government records require exact identity matching. Please verify all details below before the AI Agent initializes your case dossier.
                  </p>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Assigned Case ID (Pending)</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {generatedCaseId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Full Legal Name</span>
                    <span className="font-bold text-slate-900 text-sm">{customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">WhatsApp Updates Contact</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">+91 {phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Requested Licence</span>
                    <span className="font-bold text-slate-900">{currentLicence.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Location / Jurisdiction</span>
                    <span className="font-bold text-slate-900">
                      {district}, {INDIAN_STATES.find((s) => s.code === stateCode)?.name || stateCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Application Kind</span>
                    <span className="font-bold text-slate-900">{applicationKind} Application</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Estimated Govt Fee</span>
                    <span className="font-bold text-emerald-800">
                      {currentLicence.governmentFees.summary.split('.')[0]}
                    </span>
                  </div>
                </div>

                {/* Next Step Preview */}
                <div className="pt-2 border-t border-slate-200 text-slate-600">
                  <span className="font-semibold text-slate-800">Upcoming Step 2 Checklist:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {currentLicence.requiredDocuments.slice(0, 4).map((d) => (
                      <span
                        key={d.id}
                        className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-medium text-slate-700"
                      >
                        {d.isMandatory ? '★ ' : ''}{d.name}
                      </span>
                    ))}
                    {currentLicence.requiredDocuments.length > 4 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{currentLicence.requiredDocuments.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3 Checkpoint Checkboxes (Must all be checked) */}
              <div className="space-y-3 p-4 bg-white border border-slate-200 rounded-xl">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Confirm the following 3 checkpoints:
                </h5>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkNameMatchesId}
                    onChange={(e) => setCheckNameMatchesId(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 mt-0.5 focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong className="text-slate-900">Name Accuracy:</strong> I confirm that{' '}
                    <span className="underline decoration-teal-500 font-semibold">{customerName}</span>{' '}
                    exactly matches my official government photo ID (Aadhaar / Voter ID / PAN).
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkPhoneActive}
                    onChange={(e) => setCheckPhoneActive(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 mt-0.5 focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong className="text-slate-900">Active Communication:</strong> I confirm that{' '}
                    <span className="font-mono font-semibold">+91 {phone}</span> is active on WhatsApp for
                    receiving document upload links, verification alerts, and appointment schedules.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checkGovtAuthorityNotice}
                    onChange={(e) => setCheckGovtAuthorityNotice(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 mt-0.5 focus:ring-teal-500"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong className="text-slate-900">Statutory Notice:</strong> I understand that Licence
                    Holding provides managed assistance and document pre-verification. Final licence
                    approval is issued strictly by the relevant Government Authority ({currentLicence.issuingAuthority}).
                  </span>
                </label>
              </div>

              {/* Checkpoint Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStage('intake')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAndInitializeCase}
                  disabled={!checkNameMatchesId || !checkPhoneActive || !checkGovtAuthorityNotice}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                    checkNameMatchesId && checkPhoneActive && checkGovtAuthorityNotice
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Double-Check Confirmed · Initialize Case</span>
                </button>
              </div>

            </div>
          )}

          {/* ================= STAGE 3: SUCCESS ================= */}
          {stage === 'success' && (
            <div className="text-center py-6 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Assistance Case Initialized!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your assisted application case has been registered. The checkpoint verification has passed and your case record is active.
                </p>
              </div>

              {/* Case Reference Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-center space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Case Reference Number
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-extrabold text-lg text-slate-900 tracking-wider">
                    {generatedCaseId}
                  </span>
                  <button
                    onClick={handleCopyCaseId}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Copy Case ID"
                  >
                    {copiedCaseId ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="text-[11px] text-teal-800 font-medium">
                  Status: Initialized · Ready for Step 2 Document Upload
                </div>
              </div>

              {/* Next Steps Teaser (Step 2) */}
              <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Next Action (Step 2): AI Document Verification</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Prepare your {currentLicence.requiredDocuments[0]?.name || 'identity card'} and proof documents. The AI Vision Agent will scan them for legibility, name spelling, and official compliance.
                </p>
              </div>

              {/* Actions: Start Step 2 or Go to Dashboard */}
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                {onStartVerification && createdCaseRecord && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartVerification(createdCaseRecord);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Upload Documents & Verify with AI (Step 2)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  View Case in My Dashboard
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
