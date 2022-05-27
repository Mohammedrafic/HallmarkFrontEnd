import { AgencyState } from '@agency/store/agency.state';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable, takeWhile } from 'rxjs';

import {
  FeeSettingsClassification,
  JobDistributionInitialData,
  JobDistributionOrderType,
  PartnershipSettings,
} from '@shared/models/associate-organizations.model';
import { valuesOnly } from '@shared/utils/enum.utils';
import { DistributionLevels, PartnershipStatus, SubmissionPercentageOverrideRestriction } from '@shared/enums/partnership-settings';

@Component({
  selector: 'app-partnership-settings',
  templateUrl: './partnership-settings.component.html',
  styleUrls: ['./partnership-settings.component.scss'],
})
export class PartnershipSettingsComponent implements OnInit, OnDestroy {
  @Input() partnershipForm: FormGroup;

  @Select(AgencyState.partnershipSettings)
  public partnershipSettings$: Observable<PartnershipSettings>;

  @Select(AgencyState.jobDistributionInitialData)
  public jobDistributionInitialData$: Observable<JobDistributionInitialData>;

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
  public partnershipStatus = Object.values(PartnershipStatus)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));
  public agencyCategoryTier = Object.values(DistributionLevels)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));
  public submission = Object.values(SubmissionPercentageOverrideRestriction)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));

  private isAlive = true;

  ngOnInit(): void {
    this.partnershipSettings$.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.partnershipForm.reset();
      this.partnershipForm.patchValue({ ...value });
    });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  static createForm(): FormGroup {
    return new FormGroup({
      status: new FormControl(0),

      agencyCategory: new FormControl(),

      regionIds: new FormControl([], [Validators.required]),
      orderTypes: new FormControl([], [Validators.required]),
      classifications: new FormControl([], [Validators.required]),
      skillCategoryIds: new FormControl([], [Validators.required]),

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
}
