import { ProfileMenuItem } from './shell.enum';

export const MenuItemNames = {
  // TODO: edit profile
  /* [profileMenuItem.edit_profile]: 'Edit Profile',*/
  [ProfileMenuItem.theme]: 'Theme',
  [ProfileMenuItem.help]: 'Help',
  [ProfileMenuItem.log_out]: 'LogOut',
  [ProfileMenuItem.light_theme]: 'Light',
  [ProfileMenuItem.dark_theme]: 'Dark',
  [ProfileMenuItem.manage_notifications]: 'Manage Notifications',
  [ProfileMenuItem.contact_us]: 'Contact Us',
};

export const GetProfileMenuItems = (isEmployee: boolean, isDarkTheme: boolean) => {
  const profileMenuItems = [
    // TODO: edit profile
    /*{ text: this.ProfileMenuItemNames[ProfileMenuItem.edit_profile], id: ProfileMenuItem.edit_profile.toString(), iconCss: 'e-ddb-icons e-settings' },*/
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
      text: MenuItemNames[ProfileMenuItem.help],
      id: ProfileMenuItem.help.toString(),
      iconCss: 'e-circle-info e-icons',
    },
    {
      text: MenuItemNames[ProfileMenuItem.contact_us],
      id: ProfileMenuItem.contact_us.toString(),
      iconCss: 'e-ddb-icons e-contactus',
    },
    {
      text: MenuItemNames[ProfileMenuItem.log_out],
      id: ProfileMenuItem.log_out.toString(),
      iconCss: 'e-ddb-icons e-logout',
    },
  ];

  if (isEmployee) {
    return profileMenuItems.filter((item) => item.id !== ProfileMenuItem.help.toString());
  } else {
    return profileMenuItems;
  }
};
