import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { filter, map, Observable, takeUntil } from 'rxjs';

import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { UserState } from '../../store/user.state';

export interface PermissionsModel {
  canCreateOrder: boolean;
  canCloseOrder: boolean;
  canManageOrganizationConfigurations: boolean;
  canOrderJourney:boolean;
}

export type CustomPermissionModel = { [key: string]: PermissionTypes  };
export type CustomPermissionObject = { [key: string]: boolean  };

@Injectable({
  providedIn: 'root',
})
export class PermissionService extends DestroyableDirective {
  @Select(UserState.currentUserPermissionsIds) private currentUserPermissions$: Observable<number[]>;

  constructor(private store: Store) {
    super();
  }

  public getPermissions(): Observable<PermissionsModel> {
    return this.currentUserPermissions$.pipe(
      filter((permissionIds: number[]) => !!permissionIds?.length),
      takeUntil(this.destroy$),
      map((permissionIds: number[]) => {
        return {
          canCreateOrder: permissionIds.includes(PermissionTypes.CanCreateOrder),
          canCloseOrder: permissionIds.includes(PermissionTypes.CanCloseOrder),
          canManageOrganizationConfigurations: permissionIds.includes(PermissionTypes.ManageOrganizationConfigurations),
          canOrderJourney: permissionIds.includes(PermissionTypes.ViewOrderJourney)
        };
      })
    );
  }

  public checkPermisionFor<T>(model: CustomPermissionModel): Observable<T> {
    return this.currentUserPermissions$.pipe(
      filter((permissionIds: number[]) => !!permissionIds?.length),
      takeUntil(this.destroy$),
      map((permissionIds: number[]) => {
        const permissionObject: any = {};
        Object.entries(model).forEach(([key, permission]) => permissionObject[key] = permissionIds.includes(permission))
        return permissionObject as T;
      })
    );
  }

  public checkPermisionSnapshot(typeId: PermissionTypes): boolean {
    const permissionIds = this.store.selectSnapshot(UserState.currentUserPermissionsIds);
    return !!permissionIds.find((perm) => perm === typeId);
  }
}
