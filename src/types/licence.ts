export type LicenceCategory =
  | 'driving-transport'
  | 'business-company'
  | 'food-restaurant'
  | 'factory-industrial'
  | 'healthcare-medical'
  | 'education-training'
  | 'construction-property'
  | 'import-export-logistics'
  | 'tourism-entertainment'
  | 'agriculture-rural'
  | 'citizen-certificates'
  | 'other-licences';

export type ServiceType =
  | 'Licence'
  | 'Registration'
  | 'Certificate'
  | 'Permission'
  | 'Renewal / Update';

export type ApplicantType =
  | 'Individual'
  | 'Sole Proprietorship'
  | 'Partnership'
  | 'LLP'
  | 'Private Limited'
  | 'Public Limited'
  | 'Farmer'
  | 'Co-operative / NGO';

export type JurisdictionLevel = 'Central' | 'State' | 'Municipal / Local';

export type VerificationStatus = 'Verified' | 'Needs review' | 'Outdated' | 'Draft' | 'Unavailable';

export type ApplicationMode = 'Online' | 'Offline' | 'Online & Offline (Hybrid)';

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  conditionalNote?: string;
  acceptedFormats?: string[];
  maxSizeMb?: number;
  validityFreshness?: string;
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  description: string;
  officialPortalUrl?: string;
  actionHint?: string;
  estimatedDuration?: string;
}

export interface FeeItem {
  particular: string;
  amount: string;
  notes?: string;
}

export interface SourceReference {
  name: string;
  url: string;
  type: 'Application Portal' | 'Department Website' | 'Official Gazette / Act' | 'Information Guide';
  department: string;
  lastCheckedDate: string;
  isOfficialGovDomain: boolean;
}

export interface LicenceFAQ {
  question: string;
  answer: string;
}

export interface LicenceRecord {
  id: string;
  serialNo: number;
  slug: string;
  name: string;
  serviceType: ServiceType;
  aliases: string[];
  category: LicenceCategory;
  categoryLabel: string;
  tagline: string;
  overview: string;
  whatItAllows: string[];
  whoNeedsIt: string[];
  whoIsExempt: string[];
  eligibilityCriteria: string[];
  applicantTypes: ApplicantType[];
  activitiesCovered: string[];
  jurisdiction: JurisdictionLevel;
  state?: string;
  municipality?: string;
  issuingAuthority: string;
  governingMinistry: string;
  relevantLegislation: string;
  applicationMode: ApplicationMode;
  officialApplicationUrl: string;
  officialInfoUrl: string;
  governmentFees: {
    summary: string;
    items: FeeItem[];
    professionalFeeNote?: string;
  };
  processingTimeEstimate: string;
  validityPeriod: string;
  renewalRequirements: {
    leadTime: string;
    procedure: string;
    gracePeriod?: string;
    penaltyForDelay?: string;
  };
  inspectionRequirements: string;
  modificationAndTransfer: string;
  commonRejectionReasons: string[];
  requiredDocuments: DocumentRequirement[];
  steps: ApplicationStep[];
  sources: SourceReference[];
  faqs: LicenceFAQ[];
  relatedLicenceIds: string[];
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  lastVerifiedDate: string;
  isPopular?: boolean;
}

export interface OfficialSourceEntry {
  id: string;
  name: string;
  domain: string;
  url: string;
  department: string;
  jurisdiction: JurisdictionLevel;
  supportedCategories: LicenceCategory[];
  linkType: 'Application Portal' | 'Informational Service' | 'Verification Utility';
  status: 'Active & Verified' | 'Needs Review' | 'Maintenance';
  lastCheckedDate: string;
  description: string;
}

export interface DiscoveryState {
  applicantType?: ApplicantType;
  activitySector?: string;
  specificActivity?: string;
  state?: string;
  city?: string;
  applicationKind?: 'New' | 'Renewal' | 'Modification' | 'Replacement';
  annualTurnover?: string;
  hasExistingGst?: boolean;
  hasExistingUdyam?: boolean;
}

export interface DiscoveryRecommendation {
  licenceId: string;
  tier: 'Mandatory' | 'Conditional' | 'Recommended';
  reason: string;
  actionNeeded: string;
}

export interface RenewalReminder {
  id: string;
  licenceId: string;
  licenceName: string;
  registrationNumber?: string;
  issueDate: string;
  expiryDate: string;
  reminderLeadDays: number;
  notes?: string;
  createdAt: string;
}

export interface UserCorrectionReport {
  id: string;
  licenceId: string;
  licenceName: string;
  issueType: 'Outdated Fee' | 'Broken Link' | 'Document Requirement Changed' | 'Procedure Changed' | 'Other';
  details: string;
  submittedByEmail?: string;
  submittedAt: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
}

export type CaseStatus =
  | 'initialized'           // Case created, checkpoint verified
  | 'documents_pending'     // Waiting for user to upload documents
  | 'documents_uploaded'    // Documents uploaded, AI verification in progress
  | 'documents_verified'    // All mandatory docs verified by AI
  | 'quoted'                // Itemized quote issued
  | 'quote_accepted'        // Customer accepted quote
  | 'assigned'              // Assigned to human field agent / operator
  | 'in_progress'           // Processing on official government portal
  | 'completed';            // Licence delivered / closed

export interface DocumentVerificationReport {
  verdict: 'VERIFIED' | 'ACTION_REQUIRED' | 'REJECTED';
  isAccepted: boolean;
  confidenceScore: number;
  detectedDocumentType: string;
  extractedName: string;
  nameMatchScore: number;
  nameMatchNotes?: string;
  maskedDocumentNumber?: string | null;
  legibilityRating: 'High' | 'Medium' | 'Low';
  issues?: string[];
  actionableAdvice?: string;
  extractedDetails?: {
    dobOrAge?: string | null;
    addressOrDistrict?: string | null;
    documentDate?: string | null;
  };
}

export interface CaseDocumentItem {
  docRequirementId: string;
  name: string;
  isMandatory: boolean;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  fileName?: string;
  fileData?: string; // base64 or preview url
  mimeType?: string;
  rejectionReason?: string;
  verificationDetails?: DocumentVerificationReport;
}

export interface CaseQuote {
  quoteId: string;
  statutoryGovtFee: number;
  statutoryFeeBreakdown: { particular: string; amount: number }[];
  assistanceFee: number;
  taxes: number; // 18% GST on assistance fee
  totalPayable: number;
  currency: string;
  scopeIncluded: string[];
  scopeExcluded: string[];
  status: 'pending' | 'accepted' | 'paid';
  paymentReference?: string;
  issuedAt: string;
  acceptedAt?: string;
}

export interface ApplicationDossier {
  dossierId: string;
  caseId: string;
  generatedAt: string;
  targetPortal: string;
  targetPortalUrl: string;
  applicantSummary: {
    legalName: string;
    contactNumber: string;
    email?: string;
    state: string;
    district: string;
    entityType: string;
    applicationKind: string;
  };
  verifiedDocuments: {
    docName: string;
    detectedType: string;
    maskedId: string;
    matchScore: number;
    verifiedAt: string;
  }[];
  portalFormPayload: Record<string, string | number>;
  filingChecklist: string[];
  operatorInstructions: string;
}

export interface AssistanceCase {
  id: string; // e.g. "CASE-KA-DL-1042"
  licenceId: string;
  licenceName: string;
  licenceCategory: LicenceCategory;
  customerName: string;
  phone: string;
  email?: string;
  state: string; // e.g. "Karnataka"
  district: string; // e.g. "Bengaluru Urban"
  pincode?: string;
  applicantType: ApplicantType;
  applicationKind: 'New' | 'Renewal' | 'Modification' | 'Correction' | 'Duplicate';
  status: CaseStatus;
  statutoryGovtFeeEst: string;
  estimatedDuration: string;
  documents: CaseDocumentItem[];
  notes?: string;
  quote?: CaseQuote;
  dossier?: ApplicationDossier;
  confirmedCheckpoints: {
    nameMatchesAadhaar: boolean;
    acknowledgedGovtAuthority: boolean;
    contactConfirmed: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

