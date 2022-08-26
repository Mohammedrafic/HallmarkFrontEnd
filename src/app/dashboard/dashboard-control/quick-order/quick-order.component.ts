import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OrganizationStructure } from '@shared/models/organization.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { filter, Subject, takeUntil } from 'rxjs';
import { AllOrganizationsSkill } from '../../models/all-organization-skill.model';
import { QuickOrderFormComponent } from './quick-order-form/quick-order-form.component';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-quick-order',
  templateUrl: './quick-order.component.html',
  styleUrls: ['./quick-order.component.scss'],
})
export class QuickOrderComponent extends DestroyableDirective implements OnInit {
  @Input() openEvent: Subject<boolean>;
  @Input() public allOrganizations: Organisation[];
  @Input() public userIsAdmin: boolean;
  @Input() public skills: AllOrganizationsSkill[];
  @Input() public organizationStructure: OrganizationStructure;

  @ViewChild('sideDialog', { static: true }) public sideDialog: DialogComponent;
  @ViewChild('quickOrderForm') public quickOrderForm: QuickOrderFormComponent;

  public readonly targetElement: HTMLElement = document.body;

  constructor(private confirmService: ConfirmService) {
    super();
  }

  public ngOnInit(): void {
    this.onOpenEvent();
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe((isOpen) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
        setTimeout(() => this.sideDialog.refresh(), 300);
      }
    });
  }

  public onClose(): void {
    if (this.quickOrderForm.isFormDirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => confirm))
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public onSubmitQuickOrder(): void {
    this.quickOrderForm.onSubmitQuickOrderForm();
  }

  private closeDialog(): void {
    this.openEvent.next(false);
  }
}
