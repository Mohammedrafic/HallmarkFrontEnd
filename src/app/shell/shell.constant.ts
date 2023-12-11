import { ProfileMenuItem } from './shell.enum';
import { BusinessUnitType } from '@shared/enums/business-unit-type';

export const MenuItemNames = {
  [ProfileMenuItem.my_profile]: 'My Profile',
  [ProfileMenuItem.theme]: 'Theme',
  [ProfileMenuItem.log_out]: 'LogOut',
  [ProfileMenuItem.light_theme]: 'Light',
  [ProfileMenuItem.dark_theme]: 'Dark',
  [ProfileMenuItem.manage_notifications]: 'Manage Notifications',
  [ProfileMenuItem.contact_us]: 'Contact Us',
};

export const GetProfileMenuItems = (isDarkTheme: boolean, isEmployee = false) => {
  let menuItems = [
    {
      text: MenuItemNames[ProfileMenuItem.manage_notifications],
      id: ProfileMenuItem.manage_notifications.toString(),
      iconCss: 'e-settings e-icons',
    },
    {
      text: MenuItemNames[ProfileMenuItem.theme],
      id: ProfileMenuItem.theme.toString(),
      iconCss: isDarkTheme ? 'e-theme-dark e-icons' : 'e-theme-light e-icons',
      items: [
        {
          text: MenuItemNames[ProfileMenuItem.light_theme],
          id: ProfileMenuItem.light_theme.toString(),
        },
        {
          text: MenuItemNames[ProfileMenuItem.dark_theme],
          id: ProfileMenuItem.dark_theme.toString(),
        },
      ],
    },
    {
      text: MenuItemNames[ProfileMenuItem.contact_us],
      id: ProfileMenuItem.contact_us.toString(),
      iconCss: 'e-menu-icon e-comment-2 e-icons',
    },
    {
      text: MenuItemNames[ProfileMenuItem.my_profile],
      id: ProfileMenuItem.my_profile.toString(),
      iconCss: 'e-ddb-icons e-profile',
    },
    {
      text: MenuItemNames[ProfileMenuItem.log_out],
      id: ProfileMenuItem.log_out.toString(),
      iconCss: 'e-ddb-icons e-logout',
    },
  ];

  if (!isEmployee) {
    menuItems = menuItems.filter((item) => item.id !== ProfileMenuItem.my_profile.toString());
  }

  return menuItems;
};

export const AllBusinessTypeRoles: BusinessUnitType[] = [
  BusinessUnitType.Hallmark,
  BusinessUnitType.Agency,
  BusinessUnitType.MSP,
  BusinessUnitType.Organization,
];

export const HelpDomain: Record<keyof BusinessUnitType | string, string> = {
  [BusinessUnitType.Agency]: 'https://eiiahelp.einsteinii.org',
  agencyFallbackUrl: 'https://eiiahelp.einsteinii.org',
};

// eslint-disable-next-line max-lines-per-function
export const HelpNavigationLinks = (
  isAgency: boolean,
  isIrp: boolean,
  isVms: boolean,
  isIrpHelp: boolean
): Record<string, string | Record<string, string>> => {
  if (!isAgency && isIrp && !isVms) {
    return {
      'dashboard': 'Topics_IRP/Getting_Started_IRP.html',
      'candidates': 'Topics_IRP/Employees.html',
      'add': {
        'candidates': 'Topics_IRP/Employees.html',
        'order-management': 'Topics_IRP/Create_order.html',
      },
      'edit': {
        'candidates': 'Topics_IRP/Employees.html',
        'order-management': 'Topics_IRP/Order_Management_IRP.html',
      },
      'scheduling': 'Topics_IRP/Scheduling.html',
      'order-management': 'Topics_IRP/Order_Management_IRP.html',
      'analytics': 'Topics_IRP/Analytics.html',
      'security': 'Topics_IRP/Administration_IRP.html',
      'user-list': 'Topics_IRP/User_List_IRP.html',
      'alerts': 'Topics_IRP/Communication.html',
      'group-email': 'Topics_IRP/Group_Email_IRP.html',
      'profile': 'Topics_IRP/Organization_Profile_IRP.html',
    };
  }

  if (!isAgency && !isIrp && isVms) {
    return ({
      'dashboard': '/Topics_Org/Dashboard.html',
      'order-management': '/Topics_Org/Order_management.html',
      'add': {
        'order-management': '/Topics_Org/Create_order.html',
      },
      'edit': {
        'order-management': '/Topics_Org/Create_order.html',
        'candidates': '/Topics_Org/Candidate_assignment.html',
      },
      'candidate-details': '/Topics_Org/Candidate_assignment.html',
      'candidates': '/Topics_Org/Candidate_assignment.html',
      'associate-list': '/Topics_Org/Associated_agencies.html',
      'timesheets': '/Topics_Org/Timesheets.html',
      'invoices': '/Topics_Org/Invoices.html',
      'user-list': '/Topics_Org/User_List.html',
      'security': '/Topics_Org/Administration.html',
      'group-email': '/Topics_Org/Group_Email.html',
      'profile': '/Topics_Org/Organization_Profile.html',
      'document-library': '/Topics_Org/Document_Library.html',
      'analytics': '/Topics_Org/Analytics.html',
      'alerts': 'Topics_Org/Communication.html',
    });
  }

  if (!isAgency && isIrp && isVms) {
    if (isIrpHelp) {
      return ({
        'candidates': 'Topics_IRP/Employees.html',
        'add': {
          'candidates': 'Topics_IRP/Employees.html',
          'order-management': 'Topics_IRP/Create_order.html',
        },
        'edit': {
          'candidates': 'Topics_IRP/Employees.html',
          'order-management': 'Topics_IRP/Order_Management_IRP.html',
        },
        'scheduling': 'Topics_IRP/Scheduling.html',
        'order-management': 'Topics_IRP/Order_Management_IRP.html',
      });
    }

    return ({
      'order-management': '/Topics_Org/Order_management.html',
      'add': {
        'order-management': '/Topics_Org/Create_order.html',
      },
      'edit': {
        'order-management': '/Topics_Org/Create_order.html',
        'candidates': '/Topics_Org/Candidate_assignment.html',
      },
      'candidate-details': '/Topics_Org/Candidate_assignment.html',
      'associate-list': '/Topics_Org/Associated_agencies.html',
      'timesheets': '/Topics_Org/Timesheets.html',
      'scheduling': 'Topics_IRP/Scheduling.html',
      'invoices': '/Topics_Org/Invoices.html',
    });
  }

  if (!isAgency && !isIrp && !isVms) {
    return ({});
  }

  return ({
    'dashboard': '/Topics_Agency/Dashboard.html',
    'order-management': '/Topics_Agency/Order_management.html',
    'add': {
      'candidates': '/Topics_Agency/Add_Candidate.html',
    },
    'edit': {
      'order-management': '/Topics_Agency/Create_order.html',
      'candidates': '/Topics_Agency/Candidate_assignment.html',
      'agency-list': '/Topics_Agency/Profile.html',
    },
    'candidate-details': '/Topics_Agency/Candidate_assignment.html',
    'candidates': '/Topics_Agency/Candidates.html',
    'associate-list': '/Topics_Agency/Associated_Organizations.html',
    'timesheets': '/Topics_Agency/Timesheets.html',
    'invoices': '/Topics_Agency/Invoices.html',
    'user-list': '/Topics_Agency/User_List.html',
    'document-library': '/Topics_Agency/Document_Library.html',
  });
};

