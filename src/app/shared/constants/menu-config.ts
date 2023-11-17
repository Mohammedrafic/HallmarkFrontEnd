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
      icon: 'organization',
      custom: true,
      route: '/admin/client-management',
    },
    3: {
      // Agency
      icon: 'briefcase',
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
      icon: 'server',
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
      icon: 'settings',
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
    26: {
      // Reports
      icon: 'pie-chart',
      route: 'agency/reports/financial-timesheet-report',
    },
    28: {
      // Associated Organizations
      icon: 'clock',
      route: 'agency/associate-list',
    },
    27: {
      // Settings
      icon: 'settings',
      route: 'agency/settings',
    },
    29: {
      // MSP List
      icon: '',
      route: 'msp/msp-list',
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
      icon: '',
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
      route: '/analytics',
    },
    41: {
      // Accrual Report
      icon: 'pie-chart',
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
    44: {
      // Organization Profile
      icon: 'organization',
      custom: true,
      route: '/admin/profile',
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
    92: {
      // Scheduled Hours Report
      icon: '',
      route: '/analytics/scheduled-hours',
    },
    93: {
      // Interface Logs
      icon: '',
      route: '/admin/loginterfaces',
    },
    94: {
      // Organization Interface
      icon: '',
      route: '/admin/orginterfaces',
    },
    95: {
      // VMS Invoice Report Beta
      icon: '',
      route: '/analytics/vms-invoice-report-beta',
    },
    96: {
      // Communication
      icon: 'twitch',
      route: '',
    },
    97: {
      // Unit profile Report
      icon: '',
      route: '/analytics/unit-profile',
    },
    98: {
      // Unit profile Report
      icon: '',
      route: '/analytics/hours-by-department',
    },
    99: {
      // staff availability Report
      icon: '',
      route: '/analytics/staff-availability',
    },
    100: {
      // custom-report
      icon: 'trending-up',
      route: '/reporting/custom-report',
    },
    101: {
      // shift-breakdown
      icon: '',
      route: '/analytics/shift-breakdown',
    },
    102: {
      // Position-Summary
      icon: '',
      route: '/analytics/Position-Summary',
    },
    103: {
      // Agency-Spend
      icon: '',
      route: '/analytics/agency-spend',
    },
    104: {
      // credential-expiry-irp
      icon: '',
      route: '/analytics/credential-expiry-irp',
    },
    112: {
      // financial-time-sheet-beta
      icon: 'pie-chart',
      route: '/analytics/financial-time-sheet-beta',
    },
    114: {
      // department-spend-and-hours-report
      icon: '',
      route: '/analytics/department-spend-and-hours-report',
    },
    116: {
      // Useractivity Log report
      icon: '',
      route: '/analytics/user-activity',
    },
    117: {
      // Order-Status-Summary
      icon: '',
      route: '/analytics/order-status-summary-report',
    },
    119:{
      // Interface log summary for IRP
      icon: '',
      route: '/admin/interfacelogirp', 
    },
    120: {
      // MSP List
      icon: '',
      route: 'msp/msp-associate-list',
    },
    121: {
      // VMS Reports
      icon: '',
      route: '/analytics',
    }, 122: {
      // IRP Reports
      icon: '',
      route: '/analytics',
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
      icon: 'briefcase',
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
      icon: 'server',
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
      icon: 'settings',
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
    26: {
      // Reports
      icon: 'pie-chart',
      route: 'agency/reports/financial-timesheet-report',
    },
    27: {
      // Settings
      icon: 'settings',
      route: 'agency/settings',
    },
    28: {
      // Associated Organizations
      icon: 'clock',
      route: 'agency/associate-list',
    },
    29: {
      // MSP List
      icon: '',
      route: 'msp/msp-list',
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
      route: 'client/candidate-details',
    },
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics',
    },
    41: {
      // Accrual Report
      icon: 'pie-chart',
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
    86: {
      // DNR Details
      icon: 'user-x',
      route: 'client/dnr-details',
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
    92: {
      // Scheduled Hours Report
      icon: '',
      route: '/analytics/scheduled-hours',
    },
    93: {
      // Interface Logs
      icon: '',
      route: '/admin/loginterfaces',
    },
    94: {
      // Organization Interface
      icon: '',
      route: '/admin/orginterfaces',
    },
    95: {
      // VMS Invoice Report Beta
      icon: '',
      route: '/analytics/vms-invoice-report-beta',
    },
    96: {
      // Communication
      icon: 'twitch',
      route: '',
    },
    97: {
      // Unit profile Report
      icon: '',
      route: '/analytics/unit-profile',
    },
    98: {
      // Unit profile Report
      icon: '',
      route: '/analytics/hours-by-department',
    },
    99: {
      // staff availability Report
      icon: '',
      route: '/analytics/staff-availability',
    },
    101: {
      // shift-breakdown
      icon: '',
      route: '/analytics/shift-breakdown',
    },
    103: {
      // Agency-Spend
      icon: '',
      route: '/analytics/agency-spend',
    },
    104: {
      // credential-expiry-irp
      icon: '',
      route: '/analytics/credential-expiry-irp',
    },
    117: {
      // Order-Status-Summary
      icon: 'pie-chart',
      route: '/analytics/order-status-summary-report',
    },
    116: {
      // Useractivity Log report
      icon: '',
      route: '/analytics/user-activity',
    },
    119:{
      // Interface log summary for IRP
      icon: '',
      route: '/admin/interfacelogirp', 
    },
    120: {
      // MSP List
      icon: '',
      route: 'msp/msp-associate-list',
    },
    121: {
      // VMS Reports
      icon: '',
      route: '/analytics',
    }, 122: {
      // IRP Reports
      icon: '',
      route: '/analytics',
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
      icon: 'briefcase',
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
      icon: 'briefcase',
      route: '/client/associate-list',
    },
    38: {
      // Scheduling for Org user
      icon: 'calendar',
      route: 'client/scheduling',
    },
    13: {
      // Order Management
      icon: 'file-text',
      route: 'client/order-management',
    },
    14: {
      // Candidates
      icon: 'users',
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
      icon: 'settings',
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
      icon: 'users',
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
    27: {
      // Settings
      icon: 'settings',
      route: 'agency/settings',
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
      icon: 'users',
      route: 'client/candidates',
    },
    37: {
      // Candidate Details
      icon: 'user',
      route: 'client/candidate-details',
    },
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics',
    },
    41: {
      // Accrual Report
      icon: 'pie-chart',
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
      icon: 'organization',
      custom: true,
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
    86: {
      // DNR Details
      icon: 'user-x',
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
    92: {
      // Scheduled Hours Report
      icon: '',
      route: '/analytics/scheduled-hours',
    },
    93: {
      // Interface Logs
      icon: '',
      route: '/admin/loginterfaces',
    },
    94: {
      // Organization Interface
      icon: '',
      route: '/admin/orginterfaces',
    },
    95: {
      // VMS Invoice Report Beta
      icon: '',
      route: '/analytics/vms-invoice-report-beta',
    },
    96: {
      // Communication
      icon: 'twitch',
      route: '',
    },
    97: {
      // Unit profile Report
      icon: '',
      route: '/analytics/unit-profile',
    },
    98: {
      // Unit profile Report
      icon: '',
      route: '/analytics/hours-by-department',
    },
    99: {
      // staff availability Report
      icon: '',
      route: '/analytics/staff-availability',
    },
    100: {
    // custom-report
      icon: 'trending-up',
      route: '/reporting/custom-report',
    },
    101: {
      // shift-breakdown
      icon: '',
      route: '/analytics/shift-breakdown',
    },
    102: {
      // Position-Summary
      icon: '',
      route: '/analytics/Position-Summary',
    },
    103: {
      // Agency-Spend
      icon: '',
      route: '/analytics/agency-spend',
    },
    104: {
      // credential-expiry-irp
      icon: '',
      route: '/analytics/credential-expiry-irp',
    },
    112: {
      // financial-time-sheet-beta
      icon: 'pie-chart',
      route: '/analytics/financial-time-sheet-beta',
    },
    114: {
      // department-spend-and-hours-report
      icon: '',
      route: '/analytics/department-spend-and-hours-report',
    },
    117: {
      // Order-Status-Summary
      icon: 'pie-chart',
      route: '/analytics/order-status-summary-report',
    },
    116: {
      // Useractivity Log report
      icon: '',
      route: '/analytics/user-activity',
    },
    119:{
      // Interface log summary for IRP
      icon: '',
      route: '/admin/interfacelogirp', 
   },
   121: {
    // VMS Reports
    icon: '',
    route: '/analytics',
  }, 122: {
    // IRP Reports
    icon: '',
    route: '/analytics',
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
      icon: 'users',
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
      // Profile
      icon: 'briefcase',
      route: 'agency/profile',
    },
    22: {
      // Order Management
      icon: 'file-text',
      route: 'agency/order-management',
    },
    23: {
      // Candidates
      icon: 'users',
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
    26: {
      // Reports
      icon: 'pie-chart',
      route: 'agency/reports/financial-timesheet-report',
    },
    27: {
      // Settings
      icon: 'settings',
      route: 'agency/settings',
    },
    28: {
      // Associated Organizations
      icon: 'organization',
      custom: true,
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
      icon: 'users',
      route: 'agency/candidates',
    },
    35: {
      // Candidate Details
      icon: 'user',
      route: 'agency/candidate-details',
    },
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics',
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
    },
    93: {
      // Interface Logs
      icon: '',
      route: '/admin/loginterfaces',
    },
    94: {
      // Organization Interface
      icon: '',
      route: '/admin/orginterfaces',
    },
    95: {
      // VMS Invoice Report Beta
      icon: '',
      route: '/analytics/vms-invoice-report-beta',
    },
    96: {
      // Communication
      icon: 'twitch',
      route: '',
    },
    116: {
      // Useractivity Log report
      icon: '',
      route: '/analytics/user-activity',
    },
    121: {
      // VMS Reports
      icon: '',
      route: '/analytics',
    }, 122: {
      // IRP Reports
      icon: '',
      route: '/analytics',
    },
  },

  [BusinessUnitType.Employee]: {
    110: {
      // Scheduling for Employee
      icon: 'calendar',
      route: 'employee/scheduling',
    },
    111: {
      // Open Jobs
      icon: 'briefcase',
      route: 'employee/open-jobs',
    },
    118: {
      // My Jobs
      icon: 'list',
      route: 'employee/my-jobs',
    },
  },
};

export const AnalyticsMenuId: number = 40;
export const VMSReportsMenuId: number = 121;
export const IRPReportsMenuId: number = 122;
