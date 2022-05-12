import { BusinessUnitType } from "../enums/business-unit-type"

export const MENU_CONFIG: any = {
  [BusinessUnitType.Hallmark] : {
    1: { // Dashboard
      icon: 'home',
      route: '/admin/dashboard'
    },
    2: { // Organizations
      icon: 'file-text',
      route: '/admin/client-management'
    },
    3: { // Agency
      icon: 'clock',
      route: ''
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
    8: { // Configuration and Setting
      icon: 'user',
      route: '/admin/master-data'
    },
    9: { // Education materials
      icon: 'book-open',
      route: ''
    },
    10: { // FAQ
      icon: 'info',
      route: ''
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
      route: ''
    },
    14: { // Candidates
      icon: 'file-text',
      route: ''
    },
    15: { // Timesheets
      icon: 'clock',
      route: '' 
    },
    16: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Configuration and Setting
      icon: 'user',
      route: '/admin/organization-management'
    },
    19: {
      icon: '',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: ''
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
      route: ''
    },
    24: { // Timesheets
      icon: 'clock',
      route: ''
    },
    25: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Configuration and Setting
      icon: '',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: ''
    }
  },

  [BusinessUnitType.MSP] : {
    1: { // Dashboard
      icon: 'home',
      route: '/admin/dashboard'
    },
    2: { // Organizations
      icon: 'file-text',
      route: '/admin/client-management'
    },
    3: { // Agency
      icon: 'clock',
      route: ''
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
    8: { // Configuration and Setting
      icon: 'user',
      route: '/admin/master-data'
    },
    9: { // Education materials
      icon: 'book-open',
      route: ''
    },
    10: { // FAQ
      icon: 'info',
      route: ''
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
      route: ''
    },
    14: { // Candidates
      icon: 'file-text',
      route: ''
    },
    15: { // Timesheets
      icon: 'clock',
      route: '' 
    },
    16: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Configuration and Setting
      icon: 'user',
      route: '/admin/organization-management'
    },
    19: {
      icon: '',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: ''
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
      route: ''
    },
    24: { // Timesheets
      icon: 'clock',
      route: ''
    },
    25: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Configuration and Setting
      icon: '',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: ''
    }
  },

  [BusinessUnitType.Organization] : {
    1: { // Dashboard
      icon: 'home',
      route: '/client/dashboard'
    },
    2: { // Organizations
      icon: 'file-text',
      route: ''
    },
    3: { // Agency
      icon: 'clock',
      route: ''
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
    8: { // Configuration and Setting
      icon: 'user',
      route: ''
    },
    9: { // Education materials
      icon: 'book-open',
      route: ''
    },
    10: { // FAQ
      icon: 'info',
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
      route: 'client/order-management/all'
    },
    14: { // Candidates
      icon: 'file-text',
      route: ''
    },
    15: { // Timesheets
      icon: 'clock',
      route: '' 
    },
    16: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Configuration and Setting (Master Data)
      icon: 'user',
      route: ''
    },
    19: { // User Management
      icon: 'lock',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: ''
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
      route: ''
    },
    24: { // Timesheets
      icon: 'clock',
      route: ''
    },
    25: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Configuration and Setting
      icon: '',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: ''
    }
  },

  [BusinessUnitType.Agency] : {
    1: { // Dashboard
      icon: 'home',
      route: '/agency/dashboard'
    },
    2: { // Organizations
      icon: 'file-text',
      route: ''
    },
    3: { // Agency
      icon: 'clock',
      route: ''
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
    8: { // Configuration and Setting
      icon: 'user',
      route: ''
    },
    9: { // Education materials
      icon: 'book-open',
      route: ''
    },
    10: { // FAQ
      icon: 'info',
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
      route: ''
    },
    15: { // Timesheets
      icon: 'clock',
      route: '' 
    },
    16: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    17: { // Reports
      icon: 'trello',
      route: ''
    },
    18: { // Configuration and Setting (Master Data)
      icon: 'user',
      route: ''
    },
    19: { // User Management
      icon: 'lock',
      route: ''
    },
    20: { // Agency List
      icon: '',
      route: ''
    },
    21: { // Associated Organizations
      icon: 'file-text',
      route: 'agency/agency-list'
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
    25: { // Invoice
      icon: 'dollar-sign',
      route: ''
    },
    26: { // Reports
      icon: 'trello',
      route: ''
    },
    27: { // Configuration and Setting
      icon: 'user',
      route: ''
    },
    28: { // User Management
      icon: 'lock',
      route: ''
    },
    30: { // Roles & Permissions
      icon: '',
      route: 'security/roles-and-permissions'
    },
    31: { // User List
      icon: '',
      route: ''
    }
  },
}
