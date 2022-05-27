import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { filter, Observable, Subject, takeWhile } from 'rxjs';
import { Actions, Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

import {
  AssociateOrganizations,
  FeeExceptionsPage,
} from 'src/app/shared/models/associate-organizations.model';
import { FeeSettingsComponent } from './fee-settings/fee-settings.component';
import {
  GetFeeExceptionsInitialData,
  GetJobDistributionInitialData,
  GetPartnershipSettings,
  SaveBaseFee,
  SavePartnershipSettings,
} from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { PartnershipSettingsComponent } from './partnership-settings/partnership-settings.component';

enum Tabs {
  FeeSettings,
  JobDistribution,
}

@Component({
  selector: 'app-edit-associated-dialog',
  templateUrl: './edit-associated-dialog.component.html',
  styleUrls: ['./edit-associated-dialog.component.scss'],
})
export class EditAssociatedDialogComponent implements OnInit, OnDestroy {
  @Input() openEvent: Subject<AssociateOrganizations>;
  @Output() editEndEvent = new EventEmitter<never>();

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('editOrgTab') editOrgTab: TabComponent;

  @Select(AgencyState.feeExceptionsPage)
  public feeExceptionsPage$: Observable<FeeExceptionsPage>;

  @Select(AgencyState.baseFee)
  public baseFee$: Observable<number>;

  public targetElement: HTMLElement = document.body;
  public editOrg: AssociateOrganizations;
  public width: string;
  public feeSettingsForm: FormGroup;
  public partnershipForm: FormGroup;

  public firstActive = true;

  get isSaveActive(): boolean {
    return this.editOrgTab?.selectedItem === 0
      ? this.feeSettingsForm.touched && this.feeSettingsForm.dirty
      : this.partnershipForm.touched && this.partnershipForm.dirty;
  }

  private isAlive = true;

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.width = this.getDialogWidth();
    this.feeSettingsForm = FeeSettingsComponent.createFormGroup();
    this.onBaseFeeChanged();
    this.onFeeExceptionsPageChanged();

    this.partnershipForm = PartnershipSettingsComponent.createForm();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.sideDialog.hide();
  }

  public onCancel(): void {
    if ((this.feeSettingsForm.dirty && this.feeSettingsForm.value.baseFee) || this.partnershipForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.feeSettingsForm.reset();
          this.partnershipForm.reset();
          this.sideDialog.hide();
          this.editEndEvent.emit();
        });
    } else {
      this.sideDialog.hide();
      this.editEndEvent.emit();
    }
  }

  public onSave(): void {
    switch (this.editOrgTab.selectedItem) {
      case Tabs.JobDistribution:
        this.partnershipForm.markAllAsTouched();
        if (this.partnershipForm.valid) {
          const jobDistributionFormValue = this.partnershipForm.getRawValue();
          this.store.dispatch(new SavePartnershipSettings({ ...jobDistributionFormValue, associateOrganizationId: this.editOrg.id }));
          this.partnershipForm.markAsUntouched();
        }
        break;
      case Tabs.FeeSettings:
        this.feeSettingsForm.markAllAsTouched();
        if (this.feeSettingsForm.valid && this.editOrg.id) {
          const { baseFee } = this.feeSettingsForm.getRawValue();
          this.store.dispatch(new SaveBaseFee(this.editOrg.id, baseFee));
          this.feeSettingsForm.markAsUntouched();
        }
        break;
      default:
        break;
    }
  }

  public onTabSelecting(): void {
    this.firstActive = false;
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((org) => {
      if (org) {
        this.editOrg = org;
        this.sideDialog.show();

        if (org.id && org.organizationId) {
          this.feeSettingsForm.patchValue({ id: org.id, baseFee: org.baseFee });
          this.store.dispatch(new GetFeeExceptionsInitialData(org.organizationId));
          this.store.dispatch(new GetJobDistributionInitialData(org.organizationId));
          this.store.dispatch(new GetPartnershipSettings(org.id));
        }
      }
    });
  }

  private onBaseFeeChanged(): void {
    this.baseFee$.pipe(takeWhile(() => this.isAlive)).subscribe((baseFee) => {
      this.feeSettingsForm.patchValue({ baseFee });
    });
  }

  private onFeeExceptionsPageChanged(): void {
    this.feeExceptionsPage$.pipe(takeWhile(() => this.isAlive)).subscribe((feeExceptions) => {
      this.updateFeeExceptions(feeExceptions);
    });
  }

  private updateFeeExceptions(feeExceptions: FeeExceptionsPage): void {
    const feeExceptionsControl = this.feeSettingsForm.get('feeExceptions') as FormArray;
    feeExceptionsControl.clear();
    feeExceptions?.items.forEach((fee) => {
      const control = FeeSettingsComponent.createFeeExceptionsForm();
      control.patchValue({ ...fee });
      feeExceptionsControl.push(control);
    });
  }

  private getDialogWidth(): string {
    const thirdPart = window.innerWidth / 3;
    return `${thirdPart * 2}px`
  }
}
