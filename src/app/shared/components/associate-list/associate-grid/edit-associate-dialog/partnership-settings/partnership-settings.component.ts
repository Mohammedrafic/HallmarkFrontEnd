import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
  DistributionLevels,
  PartnershipStatus,
  SubmissionPercentageOverrideRestriction,
} from '@shared/enums/partnership-settings';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import {
  OPTION_FIELDS,
  REGION_OPTION,
} from '@shared/components/associate-list/associate-grid/edit-associate-dialog/fee-settings/add-new-fee-dialog/fee-dialog.constant';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Tabs } from '@shared/components/associate-list/associate-grid/edit-associate-dialog/associate-settings.constant';

@Component({
  selector: 'app-partnership-settings',
  templateUrl: './partnership-settings.component.html',
  styleUrls: ['./partnership-settings.component.scss'],
})
export class PartnershipSettingsComponent extends DestroyableDirective implements OnInit {
  @Input() partnershipForm: FormGroup;
  @Input() set activeTab(tab: number | string) {
    if (tab === Tabs.JobDistribution || tab === Tabs[Tabs.JobDistribution]) {
      this.partnershipForm.reset();
      this.partnershipForm.patchValue({ ...this.partnershipSettings });
    }
  }

  @Select(AssociateListState.partnershipSettings)
  public partnershipSettings$: Observable<PartnershipSettings>;
  @Select(AssociateListState.jobDistributionInitialData)
  public jobDistributionInitialData$: Observable<JobDistributionInitialData>;
  public optionFields = OPTION_FIELDS;
  public optionRegions = REGION_OPTION;
  public classification = Object.values(FeeSettingsClassification)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));
  public orderType = Object.values(JobDistributionOrderType)
    .filter(valuesOnly)
    .map((name) => ({ name, id: JobDistributionOrderType[name as JobDistributionOrderType] }));
  public partnershipStatus = Object.values(PartnershipStatus)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));
  public agencyCategoryTier = Object.values(DistributionLevels)
    .filter(valuesOnly)
    .map((name) => ({ name, id: DistributionLevels[name as DistributionLevels] }));
  public submission = Object.values(SubmissionPercentageOverrideRestriction)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));

  private partnershipSettings: PartnershipSettings;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnPartnershipSettings();
  }

  static createForm(): FormGroup {
    return new FormGroup({
      status: new FormControl(0),

      agencyCategory: new FormControl(),

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
    });
  }

  private subscribeOnPartnershipSettings(): void {
    this.partnershipSettings$.pipe(takeUntil(this.destroy$), delay(300)).subscribe((settings: PartnershipSettings) => {
      this.partnershipSettings = settings;
      this.partnershipForm.reset();
      console.log(settings, 'settings');
      this.partnershipForm.patchValue({ ...settings });
    });
  }
}
