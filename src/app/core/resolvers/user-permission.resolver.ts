import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";

import { Store } from "@ngxs/store";
import { first, map, Observable, switchMap } from "rxjs";

import { UserPermissionsService } from "@core/services";
import { SetUserPermissions } from "../../store/user.actions";
import { PermissionsAdapter } from "@core/helpers/adapters";
import { Permission } from "@core/interface";

@Injectable()
export class UserPermissionResolver implements Resolve<void | Permission> {
  constructor(
    private store: Store,
    private userPermissionService: UserPermissionsService
  ) {}

  resolve(): void | Observable<Permission> {
    return this.userPermissionService.getUserPermissions()
      .pipe(
        first(),
        map((permissions: number[]) => PermissionsAdapter.adaptUserPermissions(permissions)),
        switchMap((permissions: Permission) => this.store.dispatch(new SetUserPermissions(permissions)))
      )
  }
}
