import { Directive, OnInit } from "@angular/core";

import { Permission, PermissionGrid } from "@core/interface";
import { UserPermissions } from "@core/enums";
import { REQUIRED_PERMISSIONS } from "@shared/constants";
import { Store } from "@ngxs/store";
import { UserState } from "../../../store/user.state";
import { MenuSettings } from '@shared/models';
import { filter, Observable, takeUntil } from 'rxjs';
import { Destroyable } from '@core/helpers';

@Directive()
export abstract class AbstractPermission extends Destroyable implements OnInit, PermissionGrid {
  public userPermission: Permission = {};
  public readonly userPermissions = UserPermissions;
  public readonly toolTipMessage = REQUIRED_PERMISSIONS;

  protected constructor(protected readonly store: Store) {
    super();
  }

  ngOnInit(): void {
    this.getPermission();
  }

  private getPermission(): void {
    this.getPermissionStream()
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((permissions: Permission) => {
        this.userPermission = permissions;
    });
  }

  protected checkValidPermissions(settings: MenuSettings[]): MenuSettings[] {
    return settings.filter((setting: MenuSettings) => {
      if (setting.permissionKeys?.length) {
        return setting.permissionKeys.some((key, index, array) => {
          let x = this.userPermission[this.userPermissions[array[index] as unknown as number]];
          return this.userPermission[this.userPermissions[array[index] as unknown as number]];
        });
      } else {
        return true;
      }
    });
  }

  protected getPermissionStream(): Observable<Permission> {
   return this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length),

    );
  }
}
