// Company Workspace strings. English is the canonical set; other locales
// override selectively and fall back to English for missing keys.

export type WsDict = {
  workspace: string;
  workspaces: string;
  companyWorkspace: string;
  createWorkspace: string;
  noWorkspaces: string;
  noWorkspacesDesc: string;
  companyName: string;
  companySlug: string;
  companyDescription: string;
  legalName: string;
  overview: string;
  companyCard: string;
  brand: string;
  employees: string;
  departments: string;
  templates: string;
  fields: string;
  analytics: string;
  branches: string;
  settings: string;
  save: string;
  saved: string;
  cancel: string;
  delete: string;
  add: string;
  edit: string;
  invite: string;
  inviteEmployee: string;
  sendInvitation: string;
  invitationLink: string;
  invitationCreated: string;
  copyLink: string;
  copied: string;
  pendingInvites: string;
  noInvites: string;
  employeeName: string;
  corporateEmail: string;
  jobTitle: string;
  department: string;
  phone: string;
  role: string;
  status: string;
  roleOwner: string;
  roleAdmin: string;
  roleManager: string;
  roleEmployee: string;
  roleViewer: string;
  statusActive: string;
  statusInactive: string;
  statusSuspended: string;
  statusFormer: string;
  deactivate: string;
  activate: string;
  remove: string;
  brandIdentity: string;
  brandIdentityDesc: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  cover: string;
  headingFont: string;
  bodyFont: string;
  defaultTemplate: string;
  applyToAll: string;
  applyToAllDesc: string;
  brandApplied: string;
  verified: string;
  verifiedCompany: string;
  publicPage: string;
  viewPublicPage: string;
  website: string;
  email: string;
  address: string;
  services: string;
  branchName: string;
  city: string;
  country: string;
  addBranch: string;
  addDepartment: string;
  departmentName: string;
  noDepartments: string;
  approvedTemplates: string;
  approvedTemplatesDesc: string;
  addTemplate: string;
  templateName: string;
  customFields: string;
  customFieldsDesc: string;
  fieldLabel: string;
  fieldKey: string;
  fieldRequired: string;
  permission: string;
  companyLocked: string;
  employeeEditable: string;
  visibility: string;
  visPublic: string;
  visPrivate: string;
  visCompany: string;
  totalEmployees: string;
  activeCards: string;
  inactiveCards: string;
  totalViews: string;
  qrScans: string;
  contactSaves: string;
  topEmployees: string;
  noAnalytics: string;
  bulkImport: string;
  bulkImportDesc: string;
  importCsv: string;
  imported: string;
  createCompanyCard: string;
  createEmployeeCard: string;
  employeeCard: string;
  personalCard: string;
  cardTypeCompany: string;
  cardType: string;
  lockedByCompany: string;
  lockedByCompanyDesc: string;
  emailSignature: string;
  copySignature: string;
  signatureCopied: string;
  joinTitle: string;
  joinDesc: string;
  acceptInvitation: string;
  accepting: string;
  invitationAccepted: string;
  invitationInvalid: string;
  auditLog: string;
  noEmployees: string;
  ourTeam: string;
  contactCompany: string;
  loading: string;
  companyNotFound: string;
  mediaLibrary: string;
  qrManager: string;
  nfcManager: string;
  seo: string;
  permissions: string;
  groupManage: string;
  groupIdentity: string;
  groupReach: string;
  groupAdmin: string;
  personalAccount: string;
  personalAccountDesc: string;
  companyAccount: string;
  companyAccountDesc: string;
  chooseAccount: string;
  chooseAccountDesc: string;
  switchAccount: string;
  continueLabel: string;
  myCompanies: string;
  employeeSpace: string;
  myCard: string;
  comingSoon: string;
  comingSoonDesc: string;
  legacyAdmin: string;
  backToPersonal: string;
  enterWorkspace: string;
  noAccessTitle: string;
  noAccessDesc: string;
  onboardTitle: string;
  onboardDesc: string;
  stepIdentity: string;
  stepBrand: string;
  stepContact: string;
  stepLegal: string;
  stepStructure: string;
  stepReview: string;
  next: string;
  back: string;
  finish: string;
  creating: string;
  workspaceReady: string;
  industry: string;
  companySize: string;
  tagline: string;
  foundedYear: string;
  contactPerson: string;
  registrationNumber: string;
  taxNumber: string;
  legalAddress: string;
  optional: string;
  slugHint: string;
  slugTaken: string;
  brandPreview: string;
  defaultDepartments: string;
  defaultDepartmentsDesc: string;
  reviewDesc: string;
  size1: string;
  size2: string;
  size3: string;
  size4: string;
  size5: string;
  verificationStatus: string;
  unverified: string;
};

const en: WsDict = {
  workspace: "Workspace",
  workspaces: "Workspaces",
  companyWorkspace: "Company workspace",
  createWorkspace: "Create workspace",
  noWorkspaces: "No company workspace yet",
  noWorkspacesDesc: "Create a workspace to manage a company card, employee cards and one shared brand identity.",
  companyName: "Company name",
  companySlug: "Workspace URL",
  companyDescription: "Description",
  legalName: "Legal name",
  overview: "Overview",
  companyCard: "Company card",
  brand: "Brand",
  employees: "Employees",
  departments: "Departments",
  templates: "Templates",
  fields: "Fields",
  analytics: "Analytics",
  branches: "Branches",
  settings: "Settings",
  save: "Save changes",
  saved: "Saved",
  cancel: "Cancel",
  delete: "Delete",
  add: "Add",
  edit: "Edit",
  invite: "Invite",
  inviteEmployee: "Invite employee",
  sendInvitation: "Send invitation",
  invitationLink: "Invitation link",
  invitationCreated: "Invitation created — share the link",
  copyLink: "Copy link",
  copied: "Copied",
  pendingInvites: "Pending invitations",
  noInvites: "No pending invitations",
  employeeName: "Employee name",
  corporateEmail: "Corporate email",
  jobTitle: "Job title",
  department: "Department",
  phone: "Phone",
  role: "Role",
  status: "Status",
  roleOwner: "Owner",
  roleAdmin: "Admin",
  roleManager: "Manager",
  roleEmployee: "Employee",
  roleViewer: "Viewer",
  statusActive: "Active",
  statusInactive: "Inactive",
  statusSuspended: "Suspended",
  statusFormer: "Former employee",
  deactivate: "Deactivate",
  activate: "Activate",
  remove: "Remove",
  brandIdentity: "Brand identity",
  brandIdentityDesc: "One corporate design. Every employee card inherits it automatically.",
  primaryColor: "Primary color",
  secondaryColor: "Secondary color",
  logo: "Logo",
  cover: "Cover",
  headingFont: "Heading font",
  bodyFont: "Body font",
  defaultTemplate: "Default template",
  applyToAll: "Apply brand to all employee cards",
  applyToAllDesc: "Pushes colors and template to every employee card instantly.",
  brandApplied: "Brand applied to all employee cards",
  verified: "Verified",
  verifiedCompany: "Verified company",
  publicPage: "Public page",
  viewPublicPage: "View public page",
  website: "Website",
  email: "Email",
  address: "Address",
  services: "Services",
  branchName: "Branch name",
  city: "City",
  country: "Country",
  addBranch: "Add branch",
  addDepartment: "Add department",
  departmentName: "Department name",
  noDepartments: "No departments yet",
  approvedTemplates: "Approved templates",
  approvedTemplatesDesc: "Employees can only pick from templates you approve.",
  addTemplate: "Add template",
  templateName: "Template name",
  customFields: "Custom fields",
  customFieldsDesc: "Company-defined fields shown on employee cards.",
  fieldLabel: "Label",
  fieldKey: "Key",
  fieldRequired: "Required",
  permission: "Permission",
  companyLocked: "Company locked",
  employeeEditable: "Employee editable",
  visibility: "Visibility",
  visPublic: "Public",
  visPrivate: "Private",
  visCompany: "Company only",
  totalEmployees: "Employees",
  activeCards: "Active cards",
  inactiveCards: "Inactive cards",
  totalViews: "Card views",
  qrScans: "QR scans",
  contactSaves: "Contact saves",
  topEmployees: "Top performing cards",
  noAnalytics: "No activity yet",
  bulkImport: "Bulk import",
  bulkImportDesc: "Paste or upload a CSV: name, email, job title, department, phone.",
  importCsv: "Import CSV",
  imported: "Invitations created",
  createCompanyCard: "Create company card",
  createEmployeeCard: "Create card",
  employeeCard: "Employee card",
  personalCard: "Personal card",
  cardTypeCompany: "Company card",
  cardType: "Card type",
  lockedByCompany: "Locked by company",
  lockedByCompanyDesc: "Brand, template and company details are managed by your company.",
  emailSignature: "Email signature",
  copySignature: "Copy signature",
  signatureCopied: "Signature copied",
  joinTitle: "You're invited",
  joinDesc: "Accept to link your employee card to this company.",
  acceptInvitation: "Accept invitation",
  accepting: "Accepting…",
  invitationAccepted: "Welcome aboard",
  invitationInvalid: "This invitation is no longer valid.",
  auditLog: "Activity log",
  noEmployees: "No employees yet",
  ourTeam: "Our team",
  contactCompany: "Contact",
  loading: "Loading…",
  companyNotFound: "Company not found",
  mediaLibrary: "Media library",
  qrManager: "QR manager",
  nfcManager: "NFC manager",
  seo: "SEO",
  permissions: "Permissions",
  groupManage: "Manage",
  groupIdentity: "Identity",
  groupReach: "Reach",
  groupAdmin: "Administration",
  personalAccount: "Personal account",
  personalAccountDesc: "For freelancers and individuals. Your own cards, QR, NFC, analytics and saved contacts.",
  companyAccount: "Company account",
  companyAccountDesc: "A dedicated enterprise workspace: branding, employee cards, templates and permissions.",
  chooseAccount: "Choose your space",
  chooseAccountDesc: "Two independent experiences inside Cardixn. You can switch at any time.",
  switchAccount: "Switch space",
  continueLabel: "Continue",
  myCompanies: "My companies",
  employeeSpace: "My employee card",
  myCard: "My card",
  comingSoon: "In progress",
  comingSoonDesc: "This section is being built in the next phase of the new company workspace.",
  legacyAdmin: "Classic admin",
  backToPersonal: "Personal space",
  enterWorkspace: "Enter workspace",
  noAccessTitle: "No access",
  noAccessDesc: "You are not an active member of this company workspace.",
  onboardTitle: "Create your company workspace",
  onboardDesc: "A few details and your enterprise space is ready — branding, employees and templates included.",
  stepIdentity: "Identity",
  stepBrand: "Branding",
  stepContact: "Contact",
  stepLegal: "Legal",
  stepStructure: "Structure",
  stepReview: "Review",
  next: "Next",
  back: "Back",
  finish: "Create workspace",
  creating: "Creating…",
  workspaceReady: "Your workspace is ready",
  industry: "Industry",
  companySize: "Company size",
  tagline: "Tagline",
  foundedYear: "Founded year",
  contactPerson: "Primary contact",
  registrationNumber: "Registration number",
  taxNumber: "Tax number",
  legalAddress: "Legal address",
  optional: "Optional",
  slugHint: "Your public address: cardixn.com/company/",
  slugTaken: "This address is already taken",
  brandPreview: "Brand preview",
  defaultDepartments: "Starting departments",
  defaultDepartmentsDesc: "We will create these departments. You can edit them later.",
  reviewDesc: "Check everything before we create the workspace.",
  size1: "1–10",
  size2: "11–50",
  size3: "51–200",
  size4: "201–1000",
  size5: "1000+",
  verificationStatus: "Verification",
  unverified: "Unverified",
};

const ar: Partial<WsDict> = {
  workspace: "مساحة الشركة",
  workspaces: "مساحات العمل",
  companyWorkspace: "مساحة عمل الشركة",
  createWorkspace: "إنشاء مساحة عمل",
  noWorkspaces: "لا توجد مساحة عمل بعد",
  noWorkspacesDesc: "أنشئ مساحة عمل لإدارة بطاقة الشركة وبطاقات الموظفين وهوية بصرية موحّدة.",
  companyName: "اسم الشركة",
  companySlug: "رابط المساحة",
  companyDescription: "الوصف",
  legalName: "الاسم القانوني",
  overview: "نظرة عامة",
  companyCard: "بطاقة الشركة",
  brand: "الهوية",
  employees: "الموظفون",
  departments: "الأقسام",
  templates: "القوالب",
  fields: "الحقول",
  analytics: "الإحصائيات",
  branches: "الفروع",
  settings: "الإعدادات",
  save: "حفظ التغييرات",
  saved: "تم الحفظ",
  cancel: "إلغاء",
  delete: "حذف",
  add: "إضافة",
  edit: "تعديل",
  invite: "دعوة",
  inviteEmployee: "دعوة موظف",
  sendInvitation: "إرسال الدعوة",
  invitationLink: "رابط الدعوة",
  invitationCreated: "تم إنشاء الدعوة — شارك الرابط",
  copyLink: "نسخ الرابط",
  copied: "تم النسخ",
  pendingInvites: "دعوات معلّقة",
  noInvites: "لا توجد دعوات معلّقة",
  employeeName: "اسم الموظف",
  corporateEmail: "البريد المؤسسي",
  jobTitle: "المسمى الوظيفي",
  department: "القسم",
  phone: "الهاتف",
  role: "الصلاحية",
  status: "الحالة",
  roleOwner: "المالك",
  roleAdmin: "مدير النظام",
  roleManager: "مدير قسم",
  roleEmployee: "موظف",
  roleViewer: "مشاهد",
  statusActive: "نشط",
  statusInactive: "غير نشط",
  statusSuspended: "موقوف",
  statusFormer: "موظف سابق",
  deactivate: "إيقاف",
  activate: "تفعيل",
  remove: "إزالة",
  brandIdentity: "الهوية البصرية",
  brandIdentityDesc: "تصميم مؤسسي واحد ترثه كل بطاقات الموظفين تلقائيًا.",
  primaryColor: "اللون الأساسي",
  secondaryColor: "اللون الثانوي",
  logo: "الشعار",
  cover: "الغلاف",
  headingFont: "خط العناوين",
  bodyFont: "خط النصوص",
  defaultTemplate: "القالب الافتراضي",
  applyToAll: "تطبيق الهوية على كل بطاقات الموظفين",
  applyToAllDesc: "يُحدّث الألوان والقالب في كل البطاقات فورًا.",
  brandApplied: "تم تطبيق الهوية على كل البطاقات",
  verified: "موثّقة",
  verifiedCompany: "شركة موثّقة",
  publicPage: "الصفحة العامة",
  viewPublicPage: "عرض الصفحة العامة",
  website: "الموقع",
  email: "البريد",
  address: "العنوان",
  services: "الخدمات",
  branchName: "اسم الفرع",
  city: "المدينة",
  country: "الدولة",
  addBranch: "إضافة فرع",
  addDepartment: "إضافة قسم",
  departmentName: "اسم القسم",
  noDepartments: "لا توجد أقسام بعد",
  approvedTemplates: "القوالب المعتمدة",
  approvedTemplatesDesc: "يمكن للموظفين الاختيار من القوالب المعتمدة فقط.",
  addTemplate: "إضافة قالب",
  templateName: "اسم القالب",
  customFields: "حقول مخصّصة",
  customFieldsDesc: "حقول تحدّدها الشركة وتظهر في بطاقات الموظفين.",
  fieldLabel: "العنوان",
  fieldKey: "المفتاح",
  fieldRequired: "إلزامي",
  permission: "الصلاحية",
  companyLocked: "مقفل من الشركة",
  employeeEditable: "قابل للتعديل",
  visibility: "الظهور",
  visPublic: "عام",
  visPrivate: "خاص",
  visCompany: "داخل الشركة فقط",
  totalEmployees: "الموظفون",
  activeCards: "بطاقات نشطة",
  inactiveCards: "بطاقات موقوفة",
  totalViews: "مشاهدات البطاقات",
  qrScans: "مسح QR",
  contactSaves: "حفظ جهات الاتصال",
  topEmployees: "أفضل البطاقات أداءً",
  noAnalytics: "لا يوجد نشاط بعد",
  bulkImport: "استيراد جماعي",
  bulkImportDesc: "ألصق أو ارفع ملف CSV: الاسم، البريد، المسمى، القسم، الهاتف.",
  importCsv: "استيراد CSV",
  imported: "تم إنشاء الدعوات",
  createCompanyCard: "إنشاء بطاقة الشركة",
  createEmployeeCard: "إنشاء بطاقة",
  employeeCard: "بطاقة موظف",
  personalCard: "بطاقة شخصية",
  cardTypeCompany: "بطاقة شركة",
  cardType: "نوع البطاقة",
  lockedByCompany: "مقفل من الشركة",
  lockedByCompanyDesc: "الهوية والقالب وبيانات الشركة تديرها شركتك.",
  emailSignature: "توقيع البريد",
  copySignature: "نسخ التوقيع",
  signatureCopied: "تم نسخ التوقيع",
  joinTitle: "لديك دعوة",
  joinDesc: "اقبل الدعوة لربط بطاقتك بالشركة.",
  acceptInvitation: "قبول الدعوة",
  accepting: "جارٍ القبول…",
  invitationAccepted: "أهلًا بك في الفريق",
  invitationInvalid: "هذه الدعوة لم تعد صالحة.",
  auditLog: "سجل النشاط",
  noEmployees: "لا يوجد موظفون بعد",
  ourTeam: "فريقنا",
  contactCompany: "تواصل",
  loading: "جارٍ التحميل…",
  companyNotFound: "الشركة غير موجودة",
  mediaLibrary: "مكتبة الوسائط",
  qrManager: "إدارة QR",
  nfcManager: "إدارة NFC",
  seo: "تحسين الظهور",
  permissions: "الصلاحيات",
  groupManage: "الإدارة",
  groupIdentity: "الهوية",
  groupReach: "الانتشار",
  groupAdmin: "الإعدادات",
  personalAccount: "حساب شخصي",
  personalAccountDesc: "للأفراد وروّاد الأعمال. بطاقاتك الخاصة و QR و NFC والتحليلات وجهات الاتصال المحفوظة.",
  companyAccount: "حساب شركة",
  companyAccountDesc: "مساحة مؤسسية مستقلة: الهوية البصرية وبطاقات الموظفين والقوالب والصلاحيات.",
  chooseAccount: "اختر مساحتك",
  chooseAccountDesc: "تجربتان مستقلتان داخل Cardixn، ويمكنك التبديل بينهما في أي وقت.",
  switchAccount: "تبديل المساحة",
  continueLabel: "متابعة",
  myCompanies: "شركاتي",
  employeeSpace: "بطاقتي الوظيفية",
  myCard: "بطاقتي",
  comingSoon: "قيد التنفيذ",
  comingSoonDesc: "هذا القسم يتم بناؤه في المرحلة القادمة من مساحة الشركة الجديدة.",
  legacyAdmin: "الإدارة الكلاسيكية",
  backToPersonal: "المساحة الشخصية",
  enterWorkspace: "دخول المساحة",
  noAccessTitle: "لا تملك صلاحية",
  noAccessDesc: "لست عضوًا نشطًا في مساحة هذه الشركة.",
  onboardTitle: "أنشئ مساحة شركتك",
  onboardDesc: "بضع خطوات وتصبح مساحتك المؤسسية جاهزة — الهوية والموظفون والقوالب.",
  stepIdentity: "الهوية",
  stepBrand: "العلامة",
  stepContact: "التواصل",
  stepLegal: "البيانات القانونية",
  stepStructure: "الهيكل",
  stepReview: "المراجعة",
  next: "التالي",
  back: "السابق",
  finish: "إنشاء المساحة",
  creating: "جارٍ الإنشاء…",
  workspaceReady: "مساحتك جاهزة",
  industry: "المجال",
  companySize: "حجم الشركة",
  tagline: "الشعار النصي",
  foundedYear: "سنة التأسيس",
  contactPerson: "مسؤول التواصل",
  registrationNumber: "رقم السجل التجاري",
  taxNumber: "الرقم الضريبي",
  legalAddress: "العنوان القانوني",
  optional: "اختياري",
  slugHint: "عنوانك العام: cardixn.com/company/",
  slugTaken: "هذا العنوان مستخدم بالفعل",
  brandPreview: "معاينة الهوية",
  defaultDepartments: "الأقسام الابتدائية",
  defaultDepartmentsDesc: "سننشئ هذه الأقسام ويمكنك تعديلها لاحقًا.",
  reviewDesc: "راجع البيانات قبل إنشاء المساحة.",
  size1: "1–10",
  size2: "11–50",
  size3: "51–200",
  size4: "201–1000",
  size5: "1000+",
  verificationStatus: "التوثيق",
  unverified: "غير موثقة",
};

const OVERRIDES: Record<string, Partial<WsDict>> = { ar };

export function wsDict(lang: string): WsDict {
  return { ...en, ...(OVERRIDES[lang] ?? {}) };
}
