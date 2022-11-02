import { Permission } from "@core/interface";

export class PermissionsAdapter {
  static adaptUserPermissions(permissions: number[]): Permission {
    return permissions.reduce((acc: Permission, current: number) => ({ ...acc, [current]: true }), {})
  }
}
