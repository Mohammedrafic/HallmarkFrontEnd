import { BusinessUnitType } from "../enums/business-unit-type"

export const MENU_CONFIG: any = {
  [BusinessUnitType.Hallmark] : {
    1: { // Dashboard
      icon: 'home',
      route: '/admin/dashboard'
    },
    2: { // Organization
      icon: 'file-text',
      route: '/admin/client-management'
    },
    3: { // Agency
      icon: 'clock',
      route: 'agency/agency-list'
    },
    4: { // MSP
      icon: 'package',
      route: ''
    },
    5: { // Reports
      icon: 'trello',
      route: ''
    },
    6: { // Security
      icon: 'lock',
      route: ''
    },
    7: { // Financial Module
      icon: 'dollar-sign',
      route: ''
    },
    8: { // Master Data
      icon: 'user',
      route: '/admin/master-data'
    },
    11: { // Organization List
      icon: '',
      route: '/admin/client-management'
    },
    12: { // Associated Agencies
      icon: 'clock',
      route: ''
    },
    13: { // Order Management
      icon: 'file-text',
      route: '/client/order-management'
    },
    14: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    15: { // Timesheets
      icon: 'clock',
      route: 'timesheets'
    },
    16: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Settings
      icon: 'user',
      route: '/admin/organization-management'
    },
    19: {
      icon: '',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: 'agency/agency-list'
    },
    21: { // Associated Organizations
      icon: 'file-text',
      route: ''
    },
    22: { // Order Management
      icon: 'file-text',
      route: 'agency/order-management'
    },
    23: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    24: { // Timesheets
      icon: 'clock',
      route: ''
    },
    25: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Settings
      icon: '',
      route: ''
    },
    29: { // MSP List
      icon: '',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: 'security/user-list'
    },
    32 : {

    }
  },

  [BusinessUnitType.MSP] : {
    1: { // Dashboard
      icon: 'home',
      route: '/admin/dashboard'
    },
    2: { // Organization
      icon: 'file-text',
      route: '/admin/client-management'
    },
    3: { // Agency
      icon: 'clock',
      route: 'agency/agency-list'
    },
    4: { // MSP
      icon: 'package',
      route: ''
    },
    5: { // Reports
      icon: 'trello',
      route: ''
    },
    6: { // Security
      icon: 'lock',
      route: ''
    },
    7: { // Financial Module
      icon: 'dollar-sign',
      route: ''
    },
    8: { // Master Data
      icon: 'user',
      route: '/admin/master-data'
    },
    11: { // Organization List
      icon: '',
      route: '/admin/client-management'
    },
    12: { // Associated Agencies
      icon: 'clock',
      route: ''
    },
    13: { // Order Management
      icon: 'file-text',
      route: '/client/order-management'
    },
    14: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    15: { // Timesheets
      icon: 'clock',
      route: 'agency/timesheets'
    },
    16: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Settings
      icon: 'user',
      route: '/admin/organization-management'
    },
    19: {
      icon: '',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: 'agency/agency-list'
    },
    21: { // Associated Organizations
      icon: 'file-text',
      route: ''
    },
    22: { // Order Management
      icon: 'file-text',
      route: 'agency/order-management'
    },
    23: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    24: { // Timesheets
      icon: 'clock',
      route: ''
    },
    25: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Settings
      icon: '',
      route: ''
    },
    29: { // MSP List
      icon: '',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: 'security/user-list'
    }
  },

  [BusinessUnitType.Organization] : {
    1: { // Dashboard
      icon: 'home',
      route: '/client/dashboard'
    },
    2: { // Organization
      icon: 'file-text',
      route: ''
    },
    3: { // Agency
      icon: 'clock',
      route: 'agency/agency-list'
    },
    4: { // MSP
      icon: 'package',
      route: ''
    },
    5: { // Reports
      icon: 'trello',
      route: ''
    },
    6: { // Security
      icon: 'lock',
      route: ''
    },
    7: { // Financial Module
      icon: 'dollar-sign',
      route: ''
    },
    8: { // Master Data
      icon: 'user',
      route: ''
    },
    11: { // Organization List
      icon: '',
      route: ''
    },
    12: { // Associated Agencies
      icon: 'clock',
      route: ''
    },
    13: { // Order Management
      icon: 'file-text',
      route: 'client/order-management'
    },
    14: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    15: { // Timesheets
      icon: 'clock',
      route: 'timesheets'
    },
    16: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Settings
      icon: 'user',
      route: 'client/organization-management'
    },
    19: { // User Management
      icon: 'lock',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: 'agency/agency-list'
    },
    21: { // Associated Organizations
      icon: 'file-text',
      route: ''
    },
    22: { // Order Management
      icon: 'file-text',
      route: ''
    },
    23: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    24: { // Timesheets
      icon: 'clock',
      route: ''
    },
    25: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Settings
      icon: '',
      route: ''
    },
    29: { // MSP List
      icon: '',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: 'security/user-list'
    }
  },

  [BusinessUnitType.Agency] : {
    1: { // Dashboard
      icon: 'home',
      route: '/agency/dashboard'
    },
    2: { // Organization
      icon: 'file-text',
      route: ''
    },
    3: { // Agency
      icon: 'clock',
      route: 'agency/agency-list'
    },
    4: { // MSP
      icon: 'package',
      route: ''
    },
    5: { // Reports
      icon: 'trello',
      route: ''
    },
    6: { // Security
      icon: 'lock',
      route: ''
    },
    7: { // Financial Module
      icon: 'dollar-sign',
      route: ''
    },
    8: { // Master Data
      icon: 'user',
      route: ''
    },
    11: { // Organization List
      icon: '',
      route: ''
    },
    12: { // Associated Agencies
      icon: 'clock',
      route: ''
    },
    13: { // Order Management
      icon: 'file-text',
      route: ''
    },
    14: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    15: { // Timesheets
      icon: 'clock',
      route: 'timesheets'
    },
    16: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Settings
      icon: 'user',
      route: ''
    },
    19: { // User Management
      icon: 'lock',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: 'agency/agency-list'
    },
    21: { // Associated Organizations
      icon: 'file-text',
      route: 'agency/profile'
    },
    22: { // Order Management
      icon: 'file-text',
      route: 'agency/order-management'
    },
    23: { // Candidates
      icon: 'file-text',
      route: 'agency/candidates'
    },
    24: { // Timesheets
      icon: 'clock',
      route: 'timesheets'
    },
    25: { // Invoices
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Settings
      icon: 'user',
      route: ''
    },
    28: { // User Management
      icon: 'lock',
      route: ''
    },
    29: { // MSP List
      icon: '',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: 'security/user-list'
    }
  },
}
