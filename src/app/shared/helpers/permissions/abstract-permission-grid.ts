import { Permission, PermissionGrid } from "@core/interface";
import { UserPermissions } from "@core/enums";
import { REQUIRED_PERMISSIONS } from "@shared/constants";
import { Store } from "@ngxs/store";
import { UserState } from "../../../store/user.state";
import { Directive, OnInit } from "@angular/core";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";

@Directive()
export abstract class AbstractPermissionGrid extends AbstractGridConfigurationComponent implements OnInit, PermissionGrid {
  public userPermission: Permission;
  public readonly userPermissions = UserPermissions;
  public readonly toolTipMessage = REQUIRED_PERMISSIONS;

  protected constructor(
    protected readonly store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getPermission();
  }

  private getPermission(): void {
    this.userPermission = this.store.selectSnapshot(UserState.userPermission);
  }
}
