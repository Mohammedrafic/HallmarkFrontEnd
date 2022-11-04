import { Directive, OnInit } from "@angular/core";

import { Permission, PermissionGrid } from "@core/interface";
import { UserPermissions } from "@core/enums";
import { REQUIRED_PERMISSIONS } from "@shared/constants";
import { Store } from "@ngxs/store";
import { UserState } from "../../../store/user.state";
import { DestroyableDirective } from "@shared/directives/destroyable.directive";
import { MenuSettings } from '@shared/models';

@Directive()
export abstract class AbstractPermission extends DestroyableDirective implements OnInit, PermissionGrid {
  public userPermission: Permission;
  public readonly userPermissions = UserPermissions;
  public readonly toolTipMessage = REQUIRED_PERMISSIONS;

  protected constructor(
    protected readonly store: Store,
  ) {
    super()
  }

  ngOnInit(): void {
    this.getPermission();
  }

  private getPermission(): void {
    this.userPermission = this.store.selectSnapshot(UserState.userPermission);
  }

  protected checkValidPermissions(settings: MenuSettings[]): MenuSettings[] {
    return settings.filter((setting: MenuSettings) => setting.permissionKey ?
      this.userPermission[this.userPermissions[setting.permissionKey as unknown as number]] : setting);
  }
}
