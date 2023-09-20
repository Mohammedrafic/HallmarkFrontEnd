import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { delay, Observable, takeUntil } from 'rxjs';
import {
  FeeSettingsClassification,
  JobDistributionInitialData,
  JobDistributionOrderType,
  PartnershipSettings,
} from '@shared/models/associate-organizations.model';
import { valuesOnly } from '@shared/utils/enum.utils';
import {
  PartnershipStatus,
  SubmissionPercentageOverrideRestriction,
} from '@shared/enums/partnership-settings';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import {
  REGION_OPTION,
} from '@shared/components/associate-list/associate-grid/edit-associate-dialog/fee-settings/add-new-fee-dialog/fee-dialog.constant';
import { Tabs } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/associate-settings.constant';
import { OPTION_FIELDS } from '@shared/components/associate-list/constant';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-partnership-settings',
  templateUrl: './partnership-settings.component.html',
  styleUrls: ['./partnership-settings.component.scss'],
})
export class PartnershipSettingsComponent extends Destroyable implements OnInit {
  @Input() partnershipForm: FormGroup;

  @Input() set activeTab(tab: number | string) {
    if (tab === Tabs.JobDistribution || tab === Tabs[Tabs.JobDistribution]) {
      this.partnershipForm.reset();
      this.partnershipForm.patchValue({ ...this.partnershipSettings });
    }
  }

  @Input() isAgency: boolean;

  @Select(AssociateListState.partnershipSettings)
  public partnershipSettings$: Observable<PartnershipSettings>;

  @Select(AssociateListState.jobDistributionInitialData)
  public jobDistributionInitialData$: Observable<JobDistributionInitialData>;

  public optionFields = OPTION_FIELDS;
  public optionRegions = REGION_OPTION;
  public partnerStatuses = PartnershipStatus;
  public minDate = new Date(new Date().setHours(0, 0, 0));

  public classification = Object.values(FeeSettingsClassification)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));
  public orderType = Object.values(JobDistributionOrderType)
    .filter(valuesOnly)
    .map((name) => ({ name, id: JobDistributionOrderType[name as JobDistributionOrderType] }));
  public partnershipStatus = Object.values(PartnershipStatus)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id })).sort((a, b) => (a.name as string).localeCompare(b.name as string));
  public submission = Object.values(SubmissionPercentageOverrideRestriction)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));

  private partnershipSettings: PartnershipSettings;

  ngOnInit(): void {
    this.subscribeOnPartnershipSettings();
    this.observePartnerStatus();
  }

  static createForm(): FormGroup {
    return new FormGroup({
      status: new FormControl(0),
      regionNames: new FormControl([]),
      orderTypes: new FormControl([]),
      classifications: new FormControl([]),
      skillCategoryIds: new FormControl([]),
      allowOnBoard: new FormControl(false),
      allowDeployCredentials: new FormControl(false),
      excludeExperience: new FormControl(false),
      sendCandidateDistributionEmail: new FormControl(false),
      updateBySelf: new FormControl(false),
      loadAgencyCandidateDetails: new FormControl(false),
      applyProhibited: new FormControl(false),
      submissionPercentageOverrideRestriction: new FormControl(),
      suspentionDate: new FormControl(),
    });
  }

  private subscribeOnPartnershipSettings(): void {
    this.partnershipSettings$.pipe(
      delay(300),
      takeUntil(this.componentDestroy()),
    ).subscribe((settings: PartnershipSettings) => {
      this.partnershipSettings = settings;
      this.partnershipForm.reset();
      this.partnershipForm.patchValue({ ...settings });

      if (this.isAgency && settings.status === PartnershipStatus.Suspended) {
        this.partnershipForm.get('status')?.disable();
        this.partnershipForm.get('suspentionDate')?.disable();
      }
    });
  }

  private observePartnerStatus(): void {
    this.partnershipForm.get('status')?.valueChanges
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((status) => {
      if (status === PartnershipStatus.Suspended) {
        this.partnershipForm.get('suspentionDate')?.addValidators(Validators.required);
      } else {
        const dateControl = this.partnershipForm.get('suspentionDate');
        dateControl?.removeValidators(Validators.required);
        dateControl?.patchValue(null);
      }
    });
  }
}
