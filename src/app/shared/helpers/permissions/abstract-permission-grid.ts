import { Directive, OnInit } from "@angular/core";

import { Permission, PermissionGrid } from "@core/interface";
import { UserPermissions } from "@core/enums";
import { REQUIRED_PERMISSIONS } from "@shared/constants";
import { Store } from "@ngxs/store";
import { UserState } from "src/app/store/user.state";
import { AbstractGridConfigurationComponent } from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { filter, Observable, take } from 'rxjs';

@Directive()
export abstract class AbstractPermissionGrid extends AbstractGridConfigurationComponent implements OnInit, PermissionGrid {
  public userPermission: Permission = {};
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
    this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length),
      take(1)
    ).subscribe((permissions: Permission) => this.userPermission = permissions);
  }

  protected getPermissionStream(): Observable<Permission> {
    return this.store.select(UserState.userPermission)
      .pipe(filter((permissions: Permission) => !!Object.keys(permissions).length));
  }
}
