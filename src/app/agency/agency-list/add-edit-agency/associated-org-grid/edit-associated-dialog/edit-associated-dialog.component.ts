import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, takeWhile } from 'rxjs';
import { Actions, Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

import {
  AssociateOrganizations,
  FeeExceptionsPage,
  FeeSettingsClassification,
  JobDistribution,
  JobDistributionInitialData,
  JobDistributionOrderType,
} from 'src/app/shared/models/associate-organizations.model';
import { FeeSettingsComponent } from './fee-settings/fee-settings.component';
import {
  GetFeeExceptionsInitialData,
  GetJobDistributionId,
  GetJobDistributionInitialData,
  SaveBaseFee,
  SaveJobDistribution,
} from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { valuesOnly } from 'src/app/shared/utils/enum.utils';

enum Tabs {
  FeeSettings,
  JobDistribution
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

  @Select(AgencyState.jobDistributionInitialData)
  public jobDistributionInitialData$: Observable<JobDistributionInitialData>;

  @Select(AgencyState.jobDistribution)
  public jobDistribution$: Observable<JobDistribution>;

  @Select(AgencyState.feeExceptionsPage)
  public feeExceptionsPage$: Observable<FeeExceptionsPage>;

  @Select(AgencyState.baseFee)
  public baseFee$: Observable<number>;

  public targetElement: HTMLElement = document.body;
  public editOrg: AssociateOrganizations;
  public width: string;
  public feeSettingsForm: FormGroup;
  public jobDistributionForm: FormGroup;
  public optionFields = {
    text: 'name',
    value: 'id',
  };

  public classification = Object.values(FeeSettingsClassification)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));
  public orderType = Object.values(JobDistributionOrderType)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));

  get isSaveActive(): boolean {
    return this.editOrgTab?.selectedItem === 0 ? this.feeSettingsForm.dirty : this.jobDistributionForm.dirty;
  }

  private isAlive = true;

  constructor(private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.onOpenEvent();
    this.width = `${window.innerWidth / 2}px`;
    this.feeSettingsForm = FeeSettingsComponent.createFormGroup();
    this.onBaseFeeChanged();
    this.onFeeExceptionsPageChanged();

    this.jobDistributionForm = this.generateJobDistributionForm();

    this.jobDistribution$.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.jobDistributionForm.reset();
      this.jobDistributionForm.patchValue({ ...value });
    });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.sideDialog.hide();
  }

  public onCancel(): void {
    this.sideDialog.hide();
    this.editEndEvent.emit();
  }

  public onSave(): void {
    switch (this.editOrgTab.selectedItem) {
      case Tabs.JobDistribution:
        this.jobDistributionForm.markAllAsTouched();
        if (this.jobDistributionForm.valid) {
          const jobDistributionFormValue = this.jobDistributionForm.getRawValue();
          this.store.dispatch(
            new SaveJobDistribution({ ...jobDistributionFormValue, associateOrganizationId: this.editOrg.organizationId })
          );
        }
        break;
      case Tabs.FeeSettings:
        this.feeSettingsForm.markAllAsTouched();
        if (this.feeSettingsForm.valid && this.editOrg.organizationId) {
          const { baseFee } = this.feeSettingsForm.getRawValue();
          this.store.dispatch(new SaveBaseFee(this.editOrg.organizationId, baseFee));
        }
        break;
      default:
        break;
    }
  }

  private generateJobDistributionForm(): FormGroup {
    return new FormGroup({
      regionIds: new FormControl([], [Validators.required]),
      orderTypes: new FormControl([], [Validators.required]),
      classifications: new FormControl([], [Validators.required]),
      skillCategoryIds: new FormControl([], [Validators.required]),
    });
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeWhile(() => this.isAlive)).subscribe((org) => {
      if (org) {
        this.editOrg = org;
        this.sideDialog.show();

        if (org.organizationId) {
          this.feeSettingsForm.patchValue({ id: org.organizationId });
          this.store.dispatch(new GetFeeExceptionsInitialData(org.organizationId));
          this.store.dispatch(new GetJobDistributionInitialData(org.organizationId));
          this.store.dispatch(new GetJobDistributionId(org.organizationId));
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
}
