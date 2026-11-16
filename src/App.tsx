import React, { useState, useEffect } from 'react';
import { LICENCES } from './data/licences';
import { LicenceRecord, LicenceCategory, RenewalReminder, VerificationStatus, AssistanceCase } from './types/licence';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Hero } from './components/Hero';
import { PopularLicences } from './components/PopularLicences';
import { CategoryBrowser } from './components/CategoryBrowser';
import { StateExplorer } from './components/StateExplorer';
import { DiscoveryWizard } from './components/DiscoveryWizard';
import { SearchAndFilter } from './components/SearchAndFilter';
import { LicenceDetail } from './components/LicenceDetail';
import { AIMitraModal } from './components/AIMitraModal';
import { UserDashboard } from './components/UserDashboard';
import { OfficialSourceDirectoryView } from './components/OfficialSourceDirectoryView';
import { AdminPanel } from './components/AdminPanel';
import { ReportErrorModal } from './components/ReportErrorModal';
import { AssistanceCaseModal } from './components/AssistanceCaseModal';
import { DocumentVerificationModal } from './components/DocumentVerificationModal';
import { QuotationAndDossierModal } from './components/QuotationAndDossierModal';
import { HowItWorks } from './components/HowItWorks';
import { RecentUpdates } from './components/RecentUpdates';
import { Footer } from './components/Footer';
import { 
  Sparkles, 
  ArrowRight, 
  User, 
  Briefcase, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck 
} from 'lucide-react';

export function App() {
  const [licences, setLicences] = useState<LicenceRecord[]>(LICENCES);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedLicence, setSelectedLicence] = useState<LicenceRecord | null>(null);

  // Search state passed to explore tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<LicenceCategory | 'all'>('all');

  // Modals state
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiContextLicence, setAiContextLicence] = useState<{ id?: string; name?: string }>({});
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isReportErrorOpen, setIsReportErrorOpen] = useState<boolean>(false);
  const [reportErrorLicence, setReportErrorLicence] = useState<LicenceRecord | null>(null);

  // Assistance Case Modal State (Step 1 Managed Flow)
  const [isAssistanceModalOpen, setIsAssistanceModalOpen] = useState<boolean>(false);
  const [assistanceLicence, setAssistanceLicence] = useState<LicenceRecord | null>(null);

  // Document Verification Workspace State (Step 2 AI Vision Agent)
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [verificationCase, setVerificationCase] = useState<AssistanceCase | null>(null);

  // Quotation & Application Dossier State (Step 3 Commercials & Copilot)
  const [isQuoteDossierOpen, setIsQuoteDossierOpen] = useState<boolean>(false);
  const [quoteDossierCase, setQuoteDossierCase] = useState<AssistanceCase | null>(null);

  // User Local Storage Persistence: Saved licences, Reminders & Active Cases
  const [activeCases, setActiveCases] = useState<AssistanceCase[]>(() => {
    try {
      const stored = localStorage.getItem('lh_active_cases');
      if (stored) return JSON.parse(stored);
      // Sample starter case for demonstration in Karnataka pilot
      return [
        {
          id: 'CASE-KA-DL-2026-1042',
          licenceId: 'learners-driving-licence',
          licenceName: "Learner's Driving Licence (LLR)",
          licenceCategory: 'driving-transport',
          customerName: 'Ananya Sharma',
          phone: '9845012345',
          email: 'ananya.s@example.com',
          state: 'Karnataka',
          district: 'Bengaluru Urban',
          pincode: '560034',
          applicantType: 'Individual',
          applicationKind: 'New',
          status: 'initialized',
          statutoryGovtFeeEst: '₹150 to ₹200 (Parivahan Sarathi)',
          estimatedDuration: '7 to 15 working days',
          documents: [
            { docRequirementId: 'aadhaar-card', name: 'Aadhaar Card with linked mobile', isMandatory: true, status: 'pending' },
            { docRequirementId: 'age-proof', name: 'Age Proof (Birth Certificate / 10th Marks Card)', isMandatory: true, status: 'pending' },
            { docRequirementId: 'form-1', name: 'Form 1 Self-Declaration of Physical Fitness', isMandatory: true, status: 'pending' }
          ],
          confirmedCheckpoints: {
            nameMatchesAadhaar: true,
            acknowledgedGovtAuthority: true,
            contactConfirmed: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [savedLicenceIds, setSavedLicenceIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lh_saved_licences');
      return stored ? JSON.parse(stored) : ['learners-driving-licence', 'fssai-basic-registration'];
    } catch {
      return ['learners-driving-licence', 'fssai-basic-registration'];
    }
  });

  const [reminders, setReminders] = useState<RenewalReminder[]>(() => {
    try {
      const stored = localStorage.getItem('lh_renewal_reminders');
      if (stored) return JSON.parse(stored);
      // Sample starter reminder for testing
      return [
        {
          id: 'rem-demo-1',
          licenceId: 'permanent-driving-licence',
          licenceName: 'Permanent Driving Licence (DL)',
          registrationNumber: 'KA01 20210049281',
          issueDate: '2021-04-10',
          expiryDate: '2031-04-10',
          reminderLeadDays: 30,
          notes: 'Personal car DL renewal reminder',
          createdAt: new Date().toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  // Homepage FAQ state
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Sync saved licences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lh_saved_licences', JSON.stringify(savedLicenceIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedLicenceIds]);

  // Sync reminders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lh_renewal_reminders', JSON.stringify(reminders));
    } catch (e) {
      console.error(e);
    }
  }, [reminders]);

  // Sync active cases to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lh_active_cases', JSON.stringify(activeCases));
    } catch (e) {
      console.error(e);
    }
  }, [activeCases]);

  const handleRequestAssistance = (licence: LicenceRecord) => {
    setAssistanceLicence(licence);
    setIsAssistanceModalOpen(true);
  };

  const handleCaseCreated = (newCase: AssistanceCase) => {
    setActiveCases((prev) => [newCase, ...prev]);
    setIsAssistanceModalOpen(false);
    setIsDashboardOpen(true);
  };

  const handleDeleteCase = (caseId: string) => {
    setActiveCases((prev) => prev.filter((c) => c.id !== caseId));
    fetch(`/api/cases/${caseId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleStartVerification = (caseItem: AssistanceCase) => {
    setVerificationCase(caseItem);
    setIsVerificationModalOpen(true);
  };

  const handleUpdateCase = (updatedCase: AssistanceCase) => {
    setActiveCases((prev) =>
      prev.map((c) => (c.id === updatedCase.id ? updatedCase : c))
    );
    if (verificationCase && verificationCase.id === updatedCase.id) {
      setVerificationCase(updatedCase);
    }
    if (quoteDossierCase && quoteDossierCase.id === updatedCase.id) {
      setQuoteDossierCase(updatedCase);
    }
  };

  const handleOpenQuoteAndDossier = (caseItem: AssistanceCase) => {
    setQuoteDossierCase(caseItem);
    setIsQuoteDossierOpen(true);
  };

  const handleToggleSave = (licenceId: string) => {
    setSavedLicenceIds((prev) =>
      prev.includes(licenceId) ? prev.filter((id) => id !== licenceId) : [...prev, licenceId]
    );
  };

  const handleAddReminder = (newReminder: Omit<RenewalReminder, 'id' | 'createdAt'>) => {
    const item: RenewalReminder = {
      ...newReminder,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [item, ...prev]);
    setIsDashboardOpen(true);
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  // Navigation handlers
  const handleSelectLicence = (licence: LicenceRecord) => {
    setSelectedLicence(licence);
    setCurrentTab('licence-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchFromHero = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('all');
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromBrowser = (catId: LicenceCategory) => {
    setSelectedCategory(catId);
    setSearchQuery('');
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAI = (licenceId?: string, licenceName?: string) => {
    setAiContextLicence({ id: licenceId, name: licenceName });
    setIsAIModalOpen(true);
  };

  const handleReportError = (licence?: LicenceRecord) => {
    setReportErrorLicence(licence || null);
    setIsReportErrorOpen(true);
  };

  const handleUpdateVerificationStatus = (
    licenceId: string,
    status: VerificationStatus,
    reviewer: string
  ) => {
    setLicences((prev) =>
      prev.map((l) =>
        l.id === licenceId
          ? {
              ...l,
              verificationStatus: status,
              verifiedBy: reviewer,
              lastVerifiedDate: new Date().toISOString().slice(0, 10),
            }
          : l
      )
    );
    if (selectedLicence && selectedLicence.id === licenceId) {
      setSelectedLicence((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: status,
              verifiedBy: reviewer,
              lastVerifiedDate: new Date().toISOString().slice(0, 10),
            }
          : null
      );
    }
  };

  // General FAQs for homepage
  const homepageFaqs = [
    {
      q: 'Is Licence Holding an official Indian government website?',
      a: 'No. Licence Holding is an independent public information platform created to guide citizens, entrepreneurs, and professionals through licensing procedures. When ready to apply, you are directed to the verified official government portal (e.g. Parivahan for DL, FoSCoS for FSSAI, GST Portal, Udyam).'
    },
    {
      q: 'Do I need to pay any government application fee on this website?',
      a: 'Never. Licence Holding does not collect any government application fees. Statutory fees must only be paid directly on the authorized government payment gateway (e.g. Bharatkosh, State Treasury, or GST Portal).'
    },
    {
      q: 'How do I know if my business needs a basic registration or a state licence?',
      a: 'Regulatory thresholds depend on business activity and turnover. For example, food businesses with annual turnover <= ₹12 Lakh require FSSAI Basic Registration (₹100/yr), while turnover between ₹12 Lakh and ₹20 Crore mandates an FSSAI State Licence. You can use our Discovery Wizard to find your exact tier.'
    },
    {
      q: 'Why do licensing requirements vary by state and city?',
      a: 'Under the Constitution of India, subjects such as municipal trade regulation, local public health, and shops and establishments fall under State and Municipal jurisdictions. Requirements in Karnataka (e.g. BBMP Trade Licence, e-Karmika) differ from Maharashtra or Delhi.'
    }
  ];

  const getLicenceCountForCategory = (catId: LicenceCategory) => {
    return licences.filter((l) => l.category === catId).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Public Advisory Banner */}
      <DisclaimerBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAI={() => handleOpenAI()}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        savedCount={savedLicenceIds.length}
        remindersCount={reminders.length}
        activeCasesCount={activeCases.length}
      />

      {/* 3. Main Content Router */}
      <main className="flex-1">
        
        {/* VIEW: HOMEPAGE */}
        {currentTab === 'home' && (
          <div>
            {/* Hero Section */}
            <Hero
              onSearch={handleSearchFromHero}
              onExploreAll={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setCurrentTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAI={() => handleOpenAI()}
            />

            {/* Popular Licences Section */}
            <PopularLicences
              licences={licences}
              onSelectLicence={handleSelectLicence}
              onExploreAll={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setCurrentTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Category Browser Section */}
            <CategoryBrowser
              onSelectCategory={handleSelectCategoryFromBrowser}
              getLicenceCountForCategory={getLicenceCountForCategory}
            />

            {/* Individual vs Business Curated Split */}
            <section className="py-12 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Card 1: Individuals & Citizens */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                        <User className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Driving Permits & Citizen Certificates
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-6">
                        Personal transport licences, vehicle RC transfers, civil birth/marriage certificates, revenue caste/income/domicile certificates, PCC, Passport, Aadhaar, and Voter ID services.
                      </p>
                      <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Learner&apos;s Licence, Permanent DL, RC & Permits (Items #1–#17)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Birth, Death, Marriage, Caste, Income, Domicile & EWS (#115–#127)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Police Clearance (PCC), Passport, Aadhaar & Voter Services (#128–#132)</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('citizen-certificates');
                        setCurrentTab('explore');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors"
                    >
                      <span>Browse Citizen Certificates</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Card 2: Businesses & Industry */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Business, Industry, RERA & Sectoral Clearances
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-6">
                        Commercial trade permits, FSSAI food safety clearances, GST & company incorporations, factory/SPCB approvals, healthcare, education, RERA construction, logistics/PESO, and IP.
                      </p>
                      <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Business, Food, Factory & SPCB Environmental Approvals (#18–#62)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Healthcare, Education, RERA Construction & PESO Logistics (#63–#98)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>Tourism, Agriculture, PSARA Security, EPR & IP Rights (#99–#141)</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentTab('wizard');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <span>Find Licences for Your Activity</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            </section>

            {/* State-wise Explorer Preview Banner */}
            <section className="py-12 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-2xl space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                      State & Municipal Guidance
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      Applying in Karnataka, Maharashtra, or Delhi?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Understand the difference between Central Ministries, State Labour Departments, and Local Municipal Corporations (like BBMP Bengaluru) so you never apply to the wrong portal.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('state-explorer');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 shadow-sm"
                  >
                    Open State & City Navigator
                  </button>
                </div>
              </div>
            </section>

            {/* Recently Updated Government Requirements */}
            <RecentUpdates
              onExploreTopic={(query) => {
                setSearchQuery(query);
                setCurrentTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* How It Works Section */}
            <HowItWorks
              onStartWizard={() => {
                setCurrentTab('wizard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAI={() => handleOpenAI()}
            />

            {/* AI Assistant Banner */}
            <section className="py-12 bg-white border-b border-slate-200">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="p-8 sm:p-10 rounded-3xl border border-teal-200 bg-teal-50/50 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Meet Licence Mitra — Your AI Advisory Companion
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed mb-6">
                    Have complex questions about business activities, shop square footage rules, food turnover categories, or driving test procedures? Ask Licence Mitra for simple, reliable answers citing official acts.
                  </p>
                  <button
                    onClick={() => handleOpenAI()}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Start Free Consultation with Mitra</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section className="py-14 bg-slate-50 border-b border-slate-200">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Everything you need to know about navigating licensing in India.
                  </p>
                </div>

                <div className="space-y-3">
                  {homepageFaqs.map((faq, idx) => {
                    const isOpen = faqOpenIndex === idx;
                    return (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <button
                          onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* VIEW: EXPLORE ALL LICENCES (SEARCH & FILTER) */}
        {currentTab === 'explore' && (
          <SearchAndFilter
            licences={licences}
            onSelectLicence={handleSelectLicence}
            initialQuery={searchQuery}
            initialCategory={selectedCategory}
          />
        )}

        {/* VIEW: CATEGORIES */}
        {currentTab === 'categories' && (
          <CategoryBrowser
            onSelectCategory={handleSelectCategoryFromBrowser}
            getLicenceCountForCategory={getLicenceCountForCategory}
          />
        )}

        {/* VIEW: STATE EXPLORER */}
        {currentTab === 'state-explorer' && (
          <StateExplorer
            licences={licences}
            onSelectLicence={handleSelectLicence}
            onOpenAI={() => handleOpenAI()}
          />
        )}

        {/* VIEW: DISCOVERY WIZARD */}
        {currentTab === 'wizard' && (
          <DiscoveryWizard
            licences={licences}
            onSelectLicence={handleSelectLicence}
            onOpenAI={() => handleOpenAI()}
          />
        )}

        {/* VIEW: OFFICIAL SOURCES REGISTRY */}
        {currentTab === 'sources' && (
          <OfficialSourceDirectoryView />
        )}

        {/* VIEW: DETAILED LICENCE PAGE */}
        {currentTab === 'licence-detail' && selectedLicence && (
          <LicenceDetail
            licence={selectedLicence}
            onBack={() => {
              setCurrentTab('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectRelated={handleSelectLicence}
            allLicences={licences}
            isSaved={savedLicenceIds.includes(selectedLicence.id)}
            onToggleSave={handleToggleSave}
            onAddReminder={(lic) => {
              setSelectedLicence(lic);
              setIsDashboardOpen(true);
            }}
            onOpenAIWithContext={(id) => handleOpenAI(id, selectedLicence.name)}
            onReportError={handleReportError}
            onRequestAssistance={handleRequestAssistance}
          />
        )}

      </main>

      {/* 4. Footer */}
      <Footer
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAI={() => handleOpenAI()}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onReportErrorGeneral={() => handleReportError()}
      />

      {/* MODAL 1: AI Assistant Licence Mitra */}
      <AIMitraModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        contextLicenceId={aiContextLicence.id}
        contextLicenceName={aiContextLicence.name}
      />

      {/* MODAL 2: User Dashboard, Cases & Reminders */}
      <UserDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        savedLicenceIds={savedLicenceIds}
        allLicences={licences}
        onSelectLicence={handleSelectLicence}
        onRemoveSaved={handleToggleSave}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onDeleteReminder={handleDeleteReminder}
        activeCases={activeCases}
        onDeleteCase={handleDeleteCase}
        onOpenAssistanceModal={(lic) => handleRequestAssistance(lic || selectedLicence || licences[0])}
        onStartVerification={handleStartVerification}
        onOpenQuoteAndDossier={handleOpenQuoteAndDossier}
      />

      {/* MODAL 3: Admin Review Panel */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        licences={licences}
        onUpdateVerificationStatus={handleUpdateVerificationStatus}
      />

      {/* MODAL 4: Report Error / Correction */}
      <ReportErrorModal
        isOpen={isReportErrorOpen}
        onClose={() => setIsReportErrorOpen(false)}
        licence={reportErrorLicence}
      />

      {/* MODAL 5: Assistance Case Modal (Step 1 Intake & Checkpoint) */}
      <AssistanceCaseModal
        isOpen={isAssistanceModalOpen}
        onClose={() => setIsAssistanceModalOpen(false)}
        selectedLicence={assistanceLicence}
        allLicences={licences}
        onCaseCreated={handleCaseCreated}
        onStartVerification={handleStartVerification}
      />

      {/* MODAL 6: AI Multi-Modal Document Verification Workspace (Step 2) */}
      <DocumentVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        caseItem={verificationCase}
        onUpdateCase={handleUpdateCase}
        onProceedToStep3={(c) => {
          setIsVerificationModalOpen(false);
          handleOpenQuoteAndDossier(c);
        }}
      />

      {/* MODAL 7: AI Quotation Engine & Official Portal Dossier (Step 3) */}
      <QuotationAndDossierModal
        isOpen={isQuoteDossierOpen}
        onClose={() => setIsQuoteDossierOpen(false)}
        caseItem={quoteDossierCase}
        onUpdateCase={handleUpdateCase}
      />

    </div>
  );
}

export default App;
