export class Menu {
  menuItems: MenuItem[];
}

export class MenuItem {
  children: MenuItem[] | ChildMenuItem[];
  id: number;
  title: string;

  // Additional fields for mapping menu item with component
  route?: string;
  icon?: string;
  count?: number;
}

export class ChildMenuItem {
  title: string;

  // Additional fields for mapping menu item with component
  route?: string;
  icon?: string;
  count?: number;
}
