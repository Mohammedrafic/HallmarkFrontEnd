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
  [BusinessUnitType.Agency]: 'https://eiiahelp.einsteinii.org/Topics_Agency/',
  [BusinessUnitType.Organization]: 'https://eiiohelp.einsteinii.org/Topics_Org/',
  [BusinessUnitType.Candidates]: 'https://eiiohelp.einsteinii.org/Topics_Org/',
  [BusinessUnitType.Employee]: 'https://eiiohelp.einsteinii.org/Topics_Org/',
  [BusinessUnitType.Hallmark]: 'https://eiiohelp.einsteinii.org/Topics_Org/',
  [BusinessUnitType.MSP]: 'https://eiiohelp.einsteinii.org/Topics_Org/',
  orgFallbackUrl: 'https://eiiohelp.einsteinii.org',
  agencyFallbackUrl: 'https://eiiahelp.einsteinii.org',
};

export const HelpNavigationLinks = (isAgency: boolean) => {
  if (!isAgency) {
    return ({
      irpLinks: {
    
      },
      vmsLinks: {
        'dashboard': 'Dashboard.html',
        'order-management': 'Order_management.html',
        'add': {
          'order-management': 'Create_order.html',
        },
        'edit': {
          'order-management': 'Create_order.html',
          'candidates': 'Candidate_assignment.html',
        },
        'candidate-details': 'Candidate_assignment.html',
        'candidates': 'Candidate_assignment.html',
        'associate-list': 'Associated_agencies.html',
        'timesheets': 'Timesheets.html',
        'invoices': 'Invoices.html',
        'user-list': 'User_List.html',
        'security': 'Administration.html',
        'group-email': 'Group_Email.html',
        'profile': 'Organization_Profile.html',
        'document-library': 'Document_Library.html',
        'analytics': 'Analytics.html',
      },
    });
  }

  return ({
    irpLinks: {
  
    },
    vmsLinks: {
      'dashboard': 'Dashboard.html',
      'order-management': 'Order_management.html',
      'add': {
        'candidates': 'Add_Candidate.html',
      },
      'edit': {
        'order-management': 'Create_order.html',
        'candidates': 'Candidate_assignment.html',
        'agency-list': 'Profile.html',
      },
      'candidate-details': 'Candidate_assignment.html',
      'candidates': 'Candidates.html',
      'associate-list': 'Associated_Organizations.html',
      'timesheets': 'Timesheets.html',
      'invoices': 'Invoices.html',
      'user-list': 'User_List.html',
      'document-library': 'Document_Library.html',
    },
  });
};

