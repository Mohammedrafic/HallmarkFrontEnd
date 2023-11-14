export class Menu {
  menuItems: MenuItem[];
}

export class MenuItem {
  children: MenuItem[] | ChildMenuItem[];
  id: number;
  title: string;
  anch: string;

  // Additional fields for mapping menu item with component
  route?: string;
  icon?: string;
  count?: number;
  custom?: boolean;
}

export class ChildMenuItem {
  title: string;
  anch: string;

  // Additional fields for mapping menu item with component
  route?: string;
  icon?: string;
  count?: number;
  id?: any;
  children?: MenuItem[] | ChildMenuItem[];
}
export class overallMenuItems{
  id: any;
  title: string;
}
