import { Injectable } from '@angular/core';
import { CanDeactivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

export interface ComponentCanDeactivate {
  // @HostListener allows us to also guard against browser refresh, close, etc.
  // @HostListener('window:beforeunload') -- Add decorator to your method;
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  constructor(private confirmService: ConfirmService) {}

  canDeactivate(
    component: ComponentCanDeactivate
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return component.canDeactivate()
      ? true
      : this.confirmService.confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        });
  }
}

