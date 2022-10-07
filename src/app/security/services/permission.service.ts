import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState } from '../../store/user.state';
import { filter, map, Observable, takeUntil } from 'rxjs';
import { CurrentUserPermission } from '@shared/models/permission.model';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

export interface PermissionsModel {
  canCreateOrder: boolean;
  canCloseOrder: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService extends DestroyableDirective {
  @Select(UserState.currentUserPermissions) private currentUserPermissions$: Observable<CurrentUserPermission[]>;

  constructor() {
    super();
  }

  public getPermissions(): Observable<PermissionsModel> {
    return this.currentUserPermissions$.pipe(
      filter((permissions: CurrentUserPermission[]) => !!permissions?.length),
      takeUntil(this.destroy$),
      map((permissions: CurrentUserPermission[]) => {
        const permissionIds = permissions.map(({ permissionId }: CurrentUserPermission) => permissionId);

        return {
          canCreateOrder: permissionIds.includes(PermissionTypes.CanCreateOrder),
          canCloseOrder: permissionIds.includes(PermissionTypes.CanCloseOrder),
        };
      })
    );
  }
}
