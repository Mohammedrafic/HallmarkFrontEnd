export type Permissions = number[];

export type PermissionsTreeItem = {
  id: number;
  parentId: number;
  name: string;
  hasChild: boolean;
  isAssignable: boolean;
  isAvailable: boolean;
  includeInIRP:boolean;
};

export type PermissionsTree = PermissionsTreeItem[];

export type CurrentUserPermission = {
  permissionId: number;
  name: string;
};
