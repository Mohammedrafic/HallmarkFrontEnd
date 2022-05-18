export type Permissions = number[];

export type PermissionsTreeItem = {
  id: number;
  parentId: number;
  name: string;
  hasChild: boolean;
  isAssignable: boolean;
  isAvailable: boolean;
};

export type PermissionsTree = PermissionsTreeItem[];
