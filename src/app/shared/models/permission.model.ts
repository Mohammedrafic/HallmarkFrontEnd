export type Permissions = number[];

export type PermissionsTreeItem = {
  id: number;
  parentId: number;
  name: string;
  hasChild: boolean;
};

export type PermissionsTree = PermissionsTreeItem[];
