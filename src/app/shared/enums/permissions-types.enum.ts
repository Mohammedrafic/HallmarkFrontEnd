export enum PermissionTypes {
  CanCreateDeleteOrganization = 102,
  CanOrganizationEditOrders = 1801,

  // Order
  CanCreateOrder = 1830,
  CanCloseOrder = 1870,
  CanShortlistCandidate = 1850,
  CanInterviewCandidate = 1853,
  CanOfferCandidate = 1855,
  CanOnBoardCandidate = 1860,
  CanRejectCandidate = 1865,
  CanCloseCandidate = 1870,

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
  CanManageNotificationsForOtherUsers = 3400,
  CanManageNotificationTemplates = 3401,
  WidgetLTAOrderEnding = 3403,
  OpenAndInProgressPositionsWidget = 6100,

  // Credentials
  ManageOrganizationCredential= 401,
  ManuallyAddCredential = 402,

  //View Order Journey
  ViewOrderJourney = 8001,

  //Organization Configuration
  ViewOrganizationConfigurations = 1500,
  ManageOrganizationConfigurations = 1501,
  ViewDepartmentSkillRequired = 8105,
  ManageDepartmentSkillRequired = 8106,
}
