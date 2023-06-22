import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrganizationStructure } from '@shared/models/organization.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Select, Store } from '@ngxs/store';
import { SetIsDirtyQuickOrderForm } from '@client/store/order-managment-content.actions';
import { DashboardState } from '../../store/dashboard.state';
import { ToggleQuickOrderDialog } from '../../store/dashboard.actions';

@Component({
  selector: 'app-quick-order',
  templateUrl: './quick-order.component.html',
  styleUrls: ['./quick-order.component.scss'],
})
export class QuickOrderComponent extends DestroyableDirective implements OnInit {
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public organizationStructure: OrganizationStructure;
  @Input() public isMobile: boolean;

  @ViewChild('sideDialog', { static: true }) public sideDialog: DialogComponent;

  @Select(OrderManagementContentState.isDirtyQuickOrderForm)
  private isFormDirty$: Observable<boolean>;

  @Select(DashboardState.toggleQuickOrderDialog) private readonly toggleQuickOrderDialog$: Observable<boolean>;

  public submitQuickOrder$ = new Subject<boolean>();

  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');

  private isFormDirty: boolean;

  public isFormShown: boolean = false;

  constructor(private confirmService: ConfirmService, private store: Store) {
    super();
  }

  public ngOnInit(): void {
    this.onOpenEvent();
    this.subscribeOnFormDirty();
  }

  private onOpenEvent(): void {
    this.toggleQuickOrderDialog$.pipe(takeUntil(this.destroy$)).subscribe((isOpen) => {
      this.isFormShown = isOpen;
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  public onClose(): void {
    if (this.isFormDirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => confirm),
          take(1),
        ).subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public onSubmitQuickOrder(): void {
    this.submitQuickOrder$.next(true);
  }

  private closeDialog(): void {
    this.store.dispatch(new ToggleQuickOrderDialog(false));
    this.store.dispatch(new SetIsDirtyQuickOrderForm(false));
  }

  private subscribeOnFormDirty(): void {
    this.isFormDirty$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.isFormDirty = value;
    });
  }
}
