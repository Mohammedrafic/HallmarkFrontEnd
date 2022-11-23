import { UserPermissions } from "@core/enums";

export interface Permission {
 [name: string]: boolean;
}

export interface PermissionGrid {
  userPermission: Permission;
  userPermissions: typeof UserPermissions;
  toolTipMessage: string;
}
