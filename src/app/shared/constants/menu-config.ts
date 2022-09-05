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
    37: {
      // Candidate Details
      icon: 'users',
      route: 'client/candidate-details',
    },
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics/state-wise-skills',
    },
    41: {
      // state wise skills
      icon: '',
      route: '/analytics/state-wise-skills',
    },
    42: {
      // Candidate Statistics
      icon: '',
      route: '/analytics/candidate-stats',
    },
    43: {
      // Page Report
      icon: '',
      route: '/analytics/page-report',
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
    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
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
      route: '',
    },
    16: {
      // Invoices
      icon: 'dollar-sign',
      route: '',
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
    40: {
      // Custom Reports
      icon: 'pie-chart',
      route: '/analytics/dashboard-report',
    },
    41: {
      // state wise skills
      icon: '',
      route: '/analytics/state-wise-skills',
    },
    42: {
      // Candidate Statistics
      icon: '',
      route: '/analytics/candidate-stats',
    },
    43: {
      // Page Report
      icon: '',
      route: '/analytics/page-report',
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
    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
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
      route: '/analytics/state-wise-skills',
    },
    41: {
      // state wise skills
      icon: '',
      route: '/analytics/state-wise-skills',
    },
    42: {
      // Candidate Statistics
      icon: '',
      route: '/analytics/candidate-stats',
    },
    43: {
      // Page Report
      icon: '',
      route: '/analytics/page-report',
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
    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
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
      route: '/analytics/state-wise-skills',
    },
    41: {
      // state wise skills
      icon: '',
      route: '/analytics/state-wise-skills',
    },
    42: {
      // Candidate Statistics
      icon: '',
      route: '/analytics/candidate-stats',
    },
    43: {
      // Page Report
      icon: '',
      route: '/analytics/page-report',
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
    47: {
      // Alerts Template
      icon: '',
      route: '/alerts/alerts-template',
    },
  },
};
