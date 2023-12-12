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

export class MenuFunctions {
  public static flattenMenuItems(menuItems: MenuItem[] | ChildMenuItem[]): number[] {
    if (!menuItems) {
      return [];
    }

    return menuItems.flatMap(item => {
      const ids = [];

      // Check if 'id' is present and add it to the array
      if (item && 'id' in item && item.id !== undefined && item.id !== null) {
        ids.push(item.id);
      }

      // Recursively process children if they exist
      if (item && item.children && Array.isArray(item.children)) {
        ids.push(...this.flattenMenuItems(item.children));
      }

      return ids;
    });
  }

  public static hasItem(menuItems: MenuItem[] | ChildMenuItem[], id: number): boolean {
    return this.flattenMenuItems(menuItems).includes(id);
   }
}
