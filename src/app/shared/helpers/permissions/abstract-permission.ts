import { Permission, PermissionGrid } from "@core/interface";
import { UserPermissions } from "@core/enums";
import { REQUIRED_PERMISSIONS } from "@shared/constants";
import { Store } from "@ngxs/store";
import { UserState } from "../../../store/user.state";
import { Directive, OnInit } from "@angular/core";
import { DestroyableDirective } from "@shared/directives/destroyable.directive";

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
}
