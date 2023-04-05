import { BusinessUnitType } from '../enums/business-unit-type';

interface MenuItemConfigurationModel {
  icon: string;
  route: string;
}

const reportsMenuItemConfiguration: MenuItemConfigurationModel = { icon: 'trello', route: 'reports' };

export const MENU_CONFIG: any = {
  [BusinessUnitType.Hallmark]: {
    1: {
      // Dashboard
      icon: 'home',
      route: '/admin/dashboard',
    },
    2: {
      // Organization
      icon: 'file-text',
      route: '/admin/client-management',
    },
    3: {
      // Agency
      icon: 'clock',
      route: 'agency/agency-list',
    },
    4: {
      // MSP
      icon: 'package',
      route: '',
    },
    5: reportsMenuItemConfiguration,
    6: {
      // Security
      icon: 'lock',
      route: 'security/roles-and-permissions',
    },
    7: {
      // Financial Module
      icon: 'dollar-sign',
      route: '',
    },
    8: {
      // Master Data
      icon: 'user',
      route: '/admin/master-data',
    },

    11: {
      // Organization List
      icon: '',
      route: '/admin/client-management',
    },
    12: {
      // Associated Agencies
      icon: 'clock',
      route: '/client/associate-list',
    },
    13: {
      // Order Management
      icon: 'file-text',
      route: '/client/order-management',
    },
    14: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    38: {
      // Scheduling
      icon: '',
      route: 'client/scheduling',
    },
    15: {
      // Timesheets
      icon: 'clock',
      route: 'client/timesheets',
    },
    16: {
      // Invoices
      icon: 'dollar-sign',
      route: 'client/invoices',
    },
    17: reportsMenuItemConfiguration,
    18: {
      // Settings
      icon: 'user',
      route: '/admin/organization-management',
    },
    19: {
      icon: '',
      route: '',
    },
    20: {
      // Agency List
      icon: '',
      route: 'agency/agency-list',
    },
    21: {
      // Associated Organizations
      icon: 'file-text',
      route: '',
    },
    22: {
      // Order Management
      icon: 'file-text',
      route: 'agency/order-management',
    },
    23: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    24: {
      // Timesheets
      icon: 'clock',
      route: 'agency/timesheets',
    },
    25: {
      // Invoices
      icon: 'dollar-sign',
      route: 'agency/invoices',
    },
    26: reportsMenuItemConfiguration,
    28: {
      // Associated Organizations
      icon: 'clock',
      route: 'agency/associate-list',
    },
    27: {
      // Settings
      icon: '',
      route: '',
    },
    29: {
      // MSP List
      icon: '',
      route: '',
    },
    30: {
      // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions',
    },
    31: {
      // User List
      icon: '',
      route: 'security/user-list',
    },
    34: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    36: {
      // Candidates
      icon: 'file-text',
      route: 'client/candidates',
    },
    35: {
      // Candidate Details
      icon: '',
      route: 'agency/candidate-details',
    },
    86: {
      // DNR Details
      icon: 'user-X',
      route: 'client/dnr-details',
    },
    37: {
      // Candidate Details
      icon: 'users',
      route: 'client/candidate-details',
    },
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics/financial-time-sheet-report',
    },
    41: {
      // Accrual Report
      icon: '',
      route: '/analytics/financial-time-sheet-report',
    },
    42: {
      // Invoice Summary
      icon: '',
      route: '/analytics/invoice-summary',
    },
    43: {
      // Aging Details
      icon: '',
      route: '/analytics/aging-details',
    },
    48: {
      // Client Finance Report
      icon: '',
      route: '/analytics/client-finance-report',
    },
    49: {
      // Credential Expiry
      icon: '',
      route: '/analytics/credential-expiry',
    },
    50: {
      // Timesheet Report
      icon: '',
      route: '/analytics/timesheet-report',
    },
    51: {
      // VMS Invoice Report
      icon: '',
      route: '/analytics/vms-invoice-report',
    },
    52: {
      // Finance Report
      icon: '',
      route: '/analytics/finance-report',
    },
    53: {
      // Fill Rate
      icon: '',
      route: '/analytics/candidate-journey',
    },
    54: {
      // YTD Summary
      icon: '',
      route: '/analytics/ytd-summary',
    },
    55: {
      // Missing Credentials
      icon: '',
      route: '/analytics/missing-credentials',
    },
    56: {
      // Head Count
      icon: '',
      route: '/analytics/head-count',
    },
    57: {
      // Candidate Agency Status Report
      icon: '',
      route: '/analytics/candidate-agency-status-report',
    },
    58: {
      // Candidate List
      icon: '',
      route: '/analytics/candidate-list',
    },
    59: {
      // Vendor Scorecard
      icon: '',
      route: '/analytics/vendor-scorecard',
    },
    60: {
      // Job Event
      icon: '',
      route: '/analytics/job-event',
    },
    61: {
      // General Comments
      icon: '',
      route: '/analytics/general-comments',
    },
    62: {
      // YTD Report
      icon: '',
      route: '/analytics/ytd-report',
    },
    63: {
      // Agency & Department Spent Hours
      icon: '',
      route: '/analytics/agency-department-spent-hours',
    },
    64: {
      // Staffing Summary
      icon: '',
      route: '/analytics/staffing-summary',
    },
    65: {
      // Predicted Contract Labor Spent
      icon: '',
      route: '/analytics/predicted-contract-labor-spent',
    },
    66: {
      // Job Summary
      icon: '',
      route: '/analytics/job-summary',
    },
    67: {
      // Event Log
      icon: '',
      route: '/analytics/event-log',
    },
    68: {
      // Missing Kronos ID's
      icon: '',
      route: '/analytics/missing-kronos-ids',
    },
    69: {
      // Benchmarking Rate By State
      icon: '',
      route: '/analytics/benchmarking-rate-by-state',
    },
    70: {
      // Organization Invoice
      icon: '',
      route: '/analytics/organization-invoice',
    },
    71: {
      // Job - Compliance
      icon: '',
      route: '/analytics/job-compliance',
    },
    72: {
      // Job - Fill Ratio
      icon: '',
      route: '/analytics/job-fill-ratio',
    },
    73: {
      // Job - Job Details
      icon: '',
      route: '/analytics/job-details',
    },
    74: {
      // Job - Job Details Summary
      icon: '',
      route: '/analytics/credential-summary',
    },
    75: {
      // Labor Utilization
      icon: '',
      route: '/analytics/labor-utilization',
    },
    76: {
      // Message History
      icon: '',
      route: '/analytics/message-history',
    },
    77: {
      // Order Check
      icon: '',
      route: '/analytics/order-check',
    },
    78: {
      // Overall Status
      icon: '',
      route: '/analytics/overall-status',
    },
    79: {
      // Overtime
      icon: '',
      route: '/analytics/overtime',
    },
    45: {
      // Alerts
      icon: 'alert-circle',
      route: '/alerts/user-subscription',
    },
    46: {
      // User Subscription
      icon: '',
      route: '/alerts/user-subscription',
    },
    80:
    {
        // group-email
        icon: '',
        route: '/alerts/group-email',
    },
    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
    },
    81: {
      // Document Management
      icon: 'file',
      route: '/documents/document-library',
    },
    82: {
      // New Accrual Report
      icon: '',
      route: '/analytics/accrual-report',
    },
    83: {
      // New Accrual Report
      icon: '',
      route: '/analytics/daily-order',
    },
    84: {
      // Candidate Status Report
      icon: '',
      route: '/analytics/candidate-status',
    },
    85: {
      // Vendor Activity Report
      icon: '',
      route: '/analytics/vendor-activity',
    },
    87: {
      // Staff Schedule By Shift Report
      icon: '',
      route: '/analytics/staffschedulebyshift-irp',
    },
    89: {
      // Finance Medicare Wage Report
      icon: '',
      route: '/analytics/finance-medicare-wage-report',
    },

    91: {
      // Staff List Report
      icon: '',
      route: '/analytics/staff-list',
    },
    90: {
      // Grant Report
      icon: '',
      route: '/analytics/grant-report',
    },
  },

  [BusinessUnitType.MSP]: {
    1: {
      // Dashboard
      icon: 'home',
      route: '/admin/dashboard',
    },
    2: {
      // Organization
      icon: 'file-text',
      route: '/admin/client-management',
    },
    3: {
      // Agency
      icon: 'clock',
      route: 'agency/agency-list',
    },
    4: {
      // MSP
      icon: 'package',
      route: '',
    },
    5: reportsMenuItemConfiguration,
    6: {
      // Security
      icon: 'lock',
      route: 'security/roles-and-permissions',
    },
    7: {
      // Financial Module
      icon: 'dollar-sign',
      route: '',
    },
    8: {
      // Master Data
      icon: 'user',
      route: '/admin/master-data',
    },

    11: {
      // Organization List
      icon: '',
      route: '/admin/client-management',
    },
    12: {
      // Associated Agencies
      icon: 'clock',
      route: '/client/associate-list',
    },
    13: {
      // Order Management
      icon: 'file-text',
      route: '/client/order-management',
    },
    15: {
      // Timesheets
      icon: 'clock',
      route: 'client/timesheets',
    },
    16: {
      // Invoices
      icon: 'dollar-sign',
      route: 'client/invoices',
    },
    17: reportsMenuItemConfiguration,
    18: {
      // Settings
      icon: 'user',
      route: '/admin/organization-management',
    },
    19: {
      icon: '',
      route: '',
    },
    20: {
      // Agency List
      icon: '',
      route: 'agency/agency-list',
    },
    21: {
      // Associated Organizations
      icon: 'file-text',
      route: '',
    },
    22: {
      // Order Management
      icon: 'file-text',
      route: 'agency/order-management',
    },
    24: {
      // Timesheets
      icon: 'clock',
      route: 'agency/timesheets',
    },
    25: {
      // Invoices
      icon: 'dollar-sign',
      route: 'agency/invoices',
    },
    26: reportsMenuItemConfiguration,
    27: {
      // Settings
      icon: '',
      route: '',
    },
    28: {
      // Associated Organizations
      icon: 'clock',
      route: 'agency/associate-list',
    },
    29: {
      // MSP List
      icon: '',
      route: '',
    },
    30: {
      // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions',
    },
    31: {
      // User List
      icon: '',
      route: 'security/user-list',
    },
    34: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    35: {
      // Candidate Details
      icon: 'users',
      route: 'agency/candidate-details',
    },
    36: {
      // Candidates
      icon: 'file-text',
      route: 'client/candidates',
    },
    37: {
      // Candidate Details
      icon: 'users',
      route: 'agency/candidate-details',
    },
    45: {
      // Alerts
      icon: 'alert-circle',
      route: '/alerts/user-subscription',
    },
    46: {
      // User Subscription
      icon: '',
      route: '/alerts/user-subscription',
    },
    80:
    {
        // group-email
        icon: '',
        route: '/alerts/group-email',
    },
    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
    },
    51: {
      // VMS Invoice Report
      icon: '',
      route: '/analytics/vms-invoice-report',
    },
    81: {
      // Document Management
      icon: 'file',
      route: '/documents/document-library',
    },
    82: {
      // New Accrual Report
      icon: '',
      route: '/analytics/accrual-report',
    },
    84: {
      // Candidate Status Report
      icon: '',
      route: '/analytics/candidate-status',
    },
    85: {
      // Vendor Activity Report
      icon: '',
      route: '/analytics/vendor-activity',
    },
    87: {
      // Staff Schedule By Shift Report
      icon: '',
      route: '/analytics/staffschedulebyshift-irp',
    },
    91: {
      // Staff List Report
      icon: '',
      route: '/analytics/staff-list',
    },
  },

  [BusinessUnitType.Organization]: {
    1: {
      // Dashboard
      icon: 'home',
      route: '/client/dashboard',
    },
    2: {
      // Organization
      icon: 'file-text',
      route: '',
    },
    3: {
      // Agency
      icon: 'clock',
      route: 'agency/agency-list',
    },
    4: {
      // MSP
      icon: 'package',
      route: '',
    },
    5: reportsMenuItemConfiguration,
    6: {
      // Security
      icon: 'lock',
      route: 'security/roles-and-permissions',
    },
    7: {
      // Financial Module
      icon: 'dollar-sign',
      route: '',
    },
    8: {
      // Master Data
      icon: 'user',
      route: '',
    },

    11: {
      // Organization List
      icon: '',
      route: '',
    },
    12: {
      // Associated Agencies
      icon: 'clock',
      route: '/client/associate-list',
    },
    38: {
      // Scheduling
      icon: 'file-text',
      route: 'client/scheduling',
    },
    13: {
      // Order Management
      icon: 'file-text',
      route: 'client/order-management',
    },
    14: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    15: {
      // Timesheets
      icon: 'clock',
      route: 'client/timesheets',
    },
    16: {
      // Invoices
      icon: 'dollar-sign',
      route: 'client/invoices',
    },
    17: reportsMenuItemConfiguration,
    18: {
      // Settings
      icon: 'user',
      route: 'client/organization-management',
    },
    19: {
      // User Management
      icon: 'lock',
      route: '',
    },
    20: {
      // Agency List
      icon: '',
      route: 'agency/agency-list',
    },
    21: {
      // Associated Organizations
      icon: 'file-text',
      route: '',
    },
    22: {
      // Order Management
      icon: 'file-text',
      route: '',
    },
    23: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    24: {
      // Timesheets
      icon: 'clock',
      route: '',
    },
    25: {
      // Invoices
      icon: 'dollar-sign',
      route: '',
    },
    26: reportsMenuItemConfiguration,
    27: {
      // Settings
      icon: '',
      route: '',
    },
    29: {
      // MSP List
      icon: '',
      route: '',
    },
    30: {
      // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions',
    },
    31: {
      // User List
      icon: '',
      route: 'security/user-list',
    },
    36: {
      // Candidates
      icon: 'file-text',
      route: 'client/candidates',
    },
    37: {
      // Candidate Details
      icon: 'users',
      route: 'client/candidate-details',
    },
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics/financial-time-sheet-report',
    },
    41: {
      // Accrual Report
      icon: '',
      route: '/analytics/financial-time-sheet-report',
    },
    42: {
      // Invoice Summary
      icon: '',
      route: '/analytics/invoice-summary',
    },
    43: {
      // Aging Details
      icon: '',
      route: '/analytics/aging-details',
    },
    48: {
      // Client Finance Rreport
      icon: '',
      route: '/analytics/client-finance-report',
    },
    49: {
      // Credential Expiry
      icon: '',
      route: '/analytics/credential-expiry',
    },
    50: {
      // Timesheet Report
      icon: '',
      route: '/analytics/timesheet-report',
    },
    51: {
      // VMS Invoice Report
      icon: '',
      route: '/analytics/vms-invoice-report',
    },
    53: {
      // Fill Rate
      icon: '',
      route: '/analytics/candidate-journey',
    },
    54: {
      // YTD Summary
      icon: '',
      route: '/analytics/ytd-summary',
    },
    55:{
      // Missing Credentials
      icon: '',
      route: '/analytics/missing-credentials',
    },
    56: {
      // Head Count
      icon: '',
      route: '/analytics/head-count',
    },
    58: {
      // Candidate List
      icon: '',
      route: '/analytics/candidate-list',
    },
    59: {
      // Vendor Scorecard
      icon: '',
      route: '/analytics/vendor-scorecard',
    },
    60: {
      // Job Event
      icon: '',
      route: '/analytics/job-event',
    },
    61: {
      // General Comments
      icon: '',
      route: '/analytics/general-comments',
    },
    62: {
      // YTD Report
      icon: '',
      route: '/analytics/ytd-report',
    },
    63: {
      // Agency & Department Spent Hours
      icon: '',
      route: '/analytics/agency-department-spent-hours',
    },
    64: {
      // Staffing Summary
      icon: '',
      route: '/analytics/staffing-summary',
    },
    65: {
      // Predicted Contract Labor Spent
      icon: '',
      route: '/analytics/predicted-contract-labor-spent',
    },
    66: {
      // Job Summary
      icon: '',
      route: '/analytics/job-summary',
    },
    67: {
      // Event Log
      icon: '',
      route: '/analytics/event-log',
    },
    68: {
      // Missing Kronos ID's
      icon: '',
      route: '/analytics/missing-kronos-ids',
    },
    69: {
      // Benchmarking Rate By State
      icon: '',
      route: '/analytics/benchmarking-rate-by-state',
    },
    70: {
      // Organization Invoice
      icon: '',
      route: '/analytics/organization-invoice',
    },
    71: {
      // Job - Compliance
      icon: '',
      route: '/analytics/job-compliance',
    },
    72: {
      // Job - Fill Ratio
      icon: '',
      route: '/analytics/job-fill-ratio',
    },
    73: {
      // Job - Job Details
      icon: '',
      route: '/analytics/job-details',
    },
    74: {
      // Job - Job Details Summary
      icon: '',
      route: '/analytics/credential-summary',
    },
    75: {
      // Labor Utilization
      icon: '',
      route: '/analytics/labor-utilization',
    },
    76: {
      // Message History
      icon: '',
      route: '/analytics/message-history',
    },
    78: {
      // Overall Status
      icon: '',
      route: '/analytics/overall-status',
    },
    79: {
      // Overtime
      icon: '',
      route: '/analytics/overtime',
    },
    44: {
      // Organization Profile
      icon: 'user',
      route: '/admin/profile',
    },
    45: {
      // Alerts
      icon: 'alert-circle',
      route: '/alerts/user-subscription',
    },
    46: {
      // User Subscription
      icon: '',
      route: '/alerts/user-subscription',
    },
    80:
    {
        // group-email
        icon: '',
        route: '/alerts/group-email',
    },
    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
    },
    81: {
      // Document Management
      icon: 'file',
      route: '/documents/document-library',
    },
    82: {
      // New Accrual Report
      icon: '',
      route: '/analytics/accrual-report',
    },
    84: {
      // Candidate Status Report
      icon: '',
      route: '/analytics/candidate-status',
    },
    85: {
      // Vendor Activity Report
      icon: '',
      route: '/analytics/vendor-activity',
    },
    86: {
      // DNR Details
      icon: 'users',
      route: 'client/dnr-details',
    },
    87: {
      // Staff Schedule By Shift Report
      icon: '',
      route: '/analytics/staffschedulebyshift-irp',
    },  
    89: {
      // Finance Medicare Wage Report
      icon: '',
      route: '/analytics/finance-medicare-wage-report',
    },
    91: {
      // Staff List Report
      icon: '',
      route: '/analytics/staff-list',
    },
    90: {
      // Grant Report
      icon: '',
      route: '/analytics/grant-report',
    },
  },

  [BusinessUnitType.Agency]: {
    1: {
      // Dashboard
      icon: 'home',
      route: '/agency/dashboard',
    },
    2: {
      // Organization
      icon: 'file-text',
      route: '',
    },
    3: {
      // Agency
      icon: 'clock',
      route: 'agency/agency-list',
    },
    4: {
      // MSP
      icon: 'package',
      route: '',
    },
    5: reportsMenuItemConfiguration,
    6: {
      // Security
      icon: 'lock',
      route: 'security/roles-and-permissions',
    },
    7: {
      // Financial Module
      icon: 'dollar-sign',
      route: '',
    },
    8: {
      // Master Data
      icon: 'user',
      route: '',
    },

    11: {
      // Organization List
      icon: '',
      route: '',
    },
    12: {
      // Associated Agencies
      icon: 'clock',
      route: '',
    },
    13: {
      // Order Management
      icon: 'file-text',
      route: '',
    },
    14: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    15: {
      // Timesheets
      icon: 'clock',
      route: 'agency/timesheets',
    },
    16: {
      // Invoices
      icon: 'dollar-sign',
      route: 'agency/invoices',
    },
    17: reportsMenuItemConfiguration,
    18: {
      // Settings
      icon: 'user',
      route: '',
    },
    19: {
      // User Management
      icon: 'lock',
      route: '',
    },
    20: {
      // Agency List
      icon: '',
      route: 'agency/agency-list',
    },
    21: {
      // Associated Organizations
      icon: 'file-text',
      route: 'agency/profile',
    },
    22: {
      // Order Management
      icon: 'file-text',
      route: 'agency/order-management',
    },
    23: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    24: {
      // Timesheets
      icon: 'clock',
      route: 'agency/timesheets',
    },
    25: {
      // Invoices
      icon: 'dollar-sign',
      route: 'agency/invoices',
    },
    26: reportsMenuItemConfiguration,
    27: {
      // Settings
      icon: 'user',
      route: '',
    },
    28: {
      // Associated Organizations
      icon: 'clock',
      route: 'agency/associate-list',
    },
    29: {
      // MSP List
      icon: '',
      route: '',
    },
    30: {
      // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions',
    },
    31: {
      // User List
      icon: '',
      route: 'security/user-list',
    },
    34: {
      // Candidates
      icon: 'file-text',
      route: 'agency/candidates',
    },
    35: {
      // Candidate Details
      icon: 'users',
      route: 'agency/candidate-details',
    },
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics/invoice-summary',
    },
    42: {
      // Invoice Summary
      icon: '',
      route: '/analytics/invoice-summary',
    },
    50: {
      // Timesheet Report
      icon: '',
      route: '/analytics/timesheet-report',
    },
    51: {
      // VMS Invoice Report
      icon: '',
      route: '/analytics/vms-invoice-report',
    },
    53: {
      // Fill Rate
      icon: '',
      route: '/analytics/candidate-journey',
    },
    55: {
      // Missing Credentials
      icon: '',
      route: '/analytics/missing-credentials',
    },
    58: {
      // Candidate List
      icon: '',
      route: '/analytics/candidate-list',
    },
    61: {
      // General Comments
      icon: '',
      route: '/analytics/general-comments',
    },
    76: {
      // Message History
      icon: '',
      route: '/analytics/message-history',
    },
    77: {
      // Order Check
      icon: '',
      route: '/analytics/order-check',
    },
    45: {
      // Alerts
      icon: 'alert-circle',
      route: '/alerts/user-subscription',
    },
    46: {
      // User Subscription
      icon: '',
      route: '/alerts/user-subscription',
    },
    80:
    {
        // group-email
        icon: '',
        route: '/alerts/group-email',
    },

    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
    },
    81: {
      // Document Management
      icon: 'file',
      route: '/documents/document-library',
    }
  },
};

export const AnalyticsMenuId: number = 40;
