import { Injectable, Injector } from '@angular/core';
import { filter, Observable, of } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { Router } from '@angular/router';
import { NavigationConfigurationModel } from '@shared/models/navigation-configuration.model';

@Injectable({
  providedIn: 'root'
})
export class NavigationWrapperService {
  public areUnsavedChanges: () => boolean = () => false;
  public saveHandler: () => Observable<unknown> = () => of(true);

  private userAllowedNavigation = false;

  constructor(
    private confirmService: ConfirmService,
    readonly injector: Injector) {
  }

  public canNavigate(configuration: NavigationConfigurationModel): boolean {
    const hasUnsavedChanges = this.areUnsavedChanges ? this.areUnsavedChanges() : false;
    const canNavigate = !hasUnsavedChanges || this.userAllowedNavigation;

    !canNavigate && this.showConfirmModal(configuration);

    return canNavigate;
  }

  private showConfirmModal({ route }: NavigationConfigurationModel): void {
    this.confirmService
      .confirm(DELETE_CONFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      })
      .pipe(filter(Boolean)).subscribe(() => {
      this.userAllowedNavigation = true;
      const router = <Router>this.injector.get(Router);
      router.navigateByUrl(route).then(() => this.userAllowedNavigation = false);
    });
  }
}
