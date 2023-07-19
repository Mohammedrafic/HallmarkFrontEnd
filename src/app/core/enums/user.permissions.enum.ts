export enum UserPermissions {
  Infrastructure = 9,
  InfrastructureAdministration = 10,
  OrganizationMasterSettings = 97,
  OrganizationManagement = 98,
  OrganizationProfile = 99,
  CanViewOrganizationalHierarchy = 100,
  CanEditOrganizationalHierarchy = 101,
  CanCreateDeleteOrganization = 102,
  ManageUsers = 199,
  CanViewUsers = 200,
  CanEditUsers = 201,
  Roles = 299,
  CanViewRolesPermissions = 300,
  CanEditRolesPermissions = 301,
  CanAssignPermissions = 302,
  CanAssignRoles = 303,
  OrganizationCredentials = 399,
  CanViewCredentials = 400,
  CanEditCredentials = 401,
  CanManuallyAddCredentials = 402,
  CanViewMasterCredentials = 500,
  CanEditMasterCredentials = 501,
  MasterSkills = 596,
  AssignedSkills = 597,
  MasterSkillsCategories = 598,
  SkillsAndSkillCategories = 599,
  CanViewMasterSkills = 600,
  CanEditMasterSkills = 601,
  Shifts = 699,
  CanViewShifts = 700,
  CanEditShifts = 701,
  PartnershipSettings = 794,
  FeeException = 795,
  AssociatedOrganizations = 796,
  AgencyList = 797,
  AgencyProfile = 798,
  AgencyManagement = 799,
  CanViewAgencyHierarchy = 800,
  CanEditAgencyProfile = 801,
  CanCreateDeleteAgency = 802,
  CanViewAgencyProfile = 803,
  CanViewAssociatedOrganizations = 810,
  CanEditAssociatedOrganizations = 811,
  CanViewFeeExceptions = 812,
  CanEditFeeExceptions = 813,
  CanViewPartnershipSettings = 814,
  CanEditPartnershipSettings = 815,
  AgencyOrderManagement = 819,
  CanAgencyMatchOrders = 820,
  CanAgencyViewOrders = 821,
  CandidateCredentials = 895,
  Education = 896,
  Experience = 897,
  CandidateProfile = 898,
  Candidate = 899,
  CanViewCandidateProfile = 900,
  CanEditCandidateProfile = 901,
  IrpCandidates = 910,
  CanViewIrpCandidateProfile = 911,
  ManageIrpCandidateProfile = 912,
  CanViewExperience = 1000,
  CanEditExperience = 1001,
  CanViewEducation = 1100,
  CanEditEducation = 1101,
  CanEditCandidateCredentials = 1150,
  CanViewCandidateCredentials = 1151,
  CanViewAssignedSkills = 1200,
  CanEditAssignedSkills = 1201,
  CanViewSkillCategories = 1300,
  CanEditSkillCategories = 1301,
  OrganizationHolidays = 1397,
  MasterHolidays = 1398,
  Holidays = 1399,
  CanViewMasterHolidays = 1400,
  CanEditMasterHolidays = 1401,
  OrganizationSettings = 1499,
  CanViewOrganizationSettings = 1500,
  CanEditOrganizationSettings = 1501,
  Workflow = 1599,
  CanViewWorkflows = 1600,
  CanEditWorkflows = 1601,
  CanViewOrganizationHolidays = 1700,
  CanEditOrganizationHolidays = 1701,
  OrganizationOrderManagement = 1799,
  CanOrganizationViewOrders = 1800,
  CanOrganizationEditOrders = 1801,
  CanCreateOrders = 1830,
  CanShortlistCandidate = 1850,
  CanInterviewCandidate = 1853,
  CanOfferCandidate = 1855,
  CanOnboardCandidate = 1860,
  CanRejectCandidate = 1865,
  CanCloseOrders = 1870,
  CanEditOrderBillRate = 1875,
  CanEnterJoiningCompletionBonus = 1880,
  SettingsBillRates = 1899,
  CanViewSettingsBillRates = 1900,
  CanEditSettingsBillRates = 1901,
  CanDeleteSettingsBillRates = 1902,
  CanViewOrganizationTiers = 1950,
  CanEditOrganizationTiers = 1951,
  DashboardWidgets = 2000,
  WidgetApplicantsByRegion = 2010,
  WidgetCandidatesByStatus = 2020,
  WidgetPositionsCounters = 2030,
  WidgetPositionsAllStatuses = 2040,
  WidgetOpenOnboardCloseJobs = 2050,
  WidgetChat = 2060,
  WidgetTasks = 2070,
  WidgetTrendsFilled = 2080,
  WidgetInvoicesStatuses = 2090,
  ExternalBillRates = 2499,
  CanViewExternalBillRates = 2500,
  CanManageExternalBillRates = 2501,
  OrganizationTimesheets = 2600,
  CanOrganizationViewTimesheets = 2601,
  CanOrganizationApproveRejectTimesheets = 2602,
  CanOrganizationAddEditDeleteTimesheetRecords = 2603,
  CanOrganizationApproveRejectMileages = 2604,
  AgencyTimesheets = 2700,
  CanAgencyViewTimesheets = 2701,
  CanAgencyAddEditDeleteTimesheetRecords = 2703,
  WidgetApplicantsByPositions = 2704,
  WidgetTrendsOpen = 2705,
  WidgetTrendsInProgress = 2706,
  OrderClosureReasons = 2799,
  CanViewOrderClosureReasons = 2800,
  CanManageOrderClosureReasons = 2801,
  SpecialProjects = 2999,
  CanViewSpecialProjects = 3000,
  CanManageSpecialProjects = 3001,
  CanAgencyPayInvoice = 3201,
  Notifications = 3296,
  Templates = 3297,
  UserSubscription = 3298,
  Alerts = 3299,
  CanEditAlert = 3300,
  CanDeleteAlert = 3301,
  CanCreateAppAlert = 3302,
  CanEditUserSubscription = 3303,
  CanDeleteUserSubscription = 3304,
  CanEditTemplate = 3305,
  CanDeleteTemplate = 3306,
  CanManageNotificationsForOtherUsers = 3400,
  CanManageNotificationTemplates = 3401,
  CanViewMasterRegions = 3402,
  WidgetLTAOrderEnding = 3403,
  ViewUnavailabilityReasons = 2811,
  CanEditUnavailabilityReasons = 2812,

  // Order management
  CanUpdateBillRates = 8101,

  //Timesheets
  CanRecalculateTimesheets = 8102,

  // Organization Invoices
  OrganizationInvoices = 3500,
  CanOrganizationViewInvoices = 3501,
  CanOrganizationGenerateInvoices = 3502,
  CanOrganizationCreateManualInvoices = 3503,
  CanOrganizationApproveInvoices = 3504,
  CanOrganizationSetInvoiceStatusToPaid = 3505,

  // Agency Invoices
  AgencyInvoices = 3600,
  CanAgencyViewInvoices = 3601,
  CanAgencyCreateManualInvoices = 3602,
  CanAgencySetInvoiceStatusToPaid = 3603,
  ManageAssignSkills = 4040,

  // Manage Credentials
  ManageCredentialWithinOrderScope = 4110,

  // Manage Work Commitments
  WorkCommitments = 4150,
  CanViewMasterWorkCommitmentData = 4151,
  CanManageMasterWorkCommitmentData = 4152,
  CanViewWorkCommitmentData = 4153,
  CanManageWorkCommitmentData = 4154,
  MasterWorkCommitments = 4155,
  OrganizationWorkCommitments = 4156,

  // Schedule
  Schedule = 4200,
  CanViewSchedule = 4201,
  CanAddAvailability = 4202,
  CanAddUnavailability = 4203,
  CanAddShift = 4204,

  //Group email permission
  CanViewGroupEmail = 5101,
  CanSendGroupEmail = 5102,
  CanseeGroupEmailSentbyotherusers = 8111,

  //Orientation
  CanViewOrientation = 5201,
  CanEditOrientation = 5202,
  CanBulkHourlyRateUpdate = 5105,

  // Pay rate
  CanViewPayRates= 6403,
  CanEditPayRates = 6404,
  //AgencyReports
  AgencyReports=7000,
  CanViewAgencyFinancialTimesheet = 7001,
  CanViewAgencyInvoiceSummary = 7002,
  //View Order Journey
  ViewOrderJourney = 8001,

  //Order Management IRP
  OrganizationOrderManagementIRP = 6405,
  //DoNotReturn
  CanViewDoNotReturnList = 6003,
  CanAddEditDoNotReturn = 6004,
  CanOrganizationViewOrdersIRP = 6406,
  CanOrganizationEditOrdersIRP = 6407,
  CanCreateOrdersIRP = 6408,
  CanOnboardCandidateIRP = 6409,
  CanRejectCandidateIRP = 6410,
  CanEditOrderBillRateIRP = 6411,
  CanCloseOrdersIRP = 6412,

  //Agency setup
  EditAgencyNetsuitePaymentId = 8110,
  
  //Candidate Assignment
  CandidateAssigment=850,
  CanViewCandidateAssigment=851,
}
