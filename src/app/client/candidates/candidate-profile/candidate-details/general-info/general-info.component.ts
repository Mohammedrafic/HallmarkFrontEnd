import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';

import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import {
  ProfileStatuses,
  ProfileStatusesEnum,
  TerminationReasons,
} from '@client/candidates/candidate-profile/candidate-profile.constants';
import { JobClassifications } from '@client/order-management/constants';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { ListOfSkills } from '@shared/models/skill.model';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { RejectReasonPage } from '@shared/models/reject-reason.model';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { GetTerminationReasons } from '@organization-management/store/reject-reason.actions';
import { DateTimeHelper } from '@core/helpers';

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoComponent extends AbstractContactDetails implements OnInit, OnDestroy {
  public isOnHoldSelected: boolean;
  public isTerminatedSelected: boolean;
  fieldsSettingsTeminated: FieldSettingsModel = { text: 'reason', value: 'id' };
  currentPage = 1;
  pageSize = 100;
  @Select(RejectReasonState.terminationReasons)
  public reasons$: Observable<RejectReasonPage>;
  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  public skills$: Observable<ListOfSkills[]>;
  public primarySkillsDataSource: ListOfSkills[] = [];
  public secondarySkillsDataSource: ListOfSkills[] = [];

  public readonly classifications = JobClassifications;
  public readonly profileStatuses = ProfileStatuses;
  public readonly companyCodes = ProfileStatuses;
  public readonly terminationReason = TerminationReasons;
  public readonly today = new Date();

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileFormService: CandidateProfileFormService,
    private store: Store
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.listenProfileStatusChanges();
    this.listenSkillsChanges();
    this.subscribeOnSkills();
    this.store.dispatch(new GetTerminationReasons( this.currentPage ,this.pageSize));
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.reset();
  }

  private subscribeOnSkills(): void {
    this.skills$.pipe(takeUntil(this.destroy$)).subscribe((skills) => {
      const primarySkillId = this.candidateForm.controls['primarySkillId'].value;
      this.primarySkillsDataSource = skills;
      this.secondarySkillsDataSource = primarySkillId
        ? this.candidateProfileFormService.getSecondarySkillsDataSource(this.primarySkillsDataSource, primarySkillId)
        : skills;
      this.cdr.markForCheck();
    });
  }

  private listenSkillsChanges(): void {
    const secondarySkillsField = this.candidateForm.controls['secondarySkills'];
    this.candidateForm.controls['primarySkillId'].valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.candidateProfileFormService.primarySkillHandler(secondarySkillsField, value);
        this.secondarySkillsDataSource = this.candidateProfileFormService.getSecondarySkillsDataSource(
          this.primarySkillsDataSource,
          value
        );
        this.cdr.markForCheck();
      });
  }

  private listenProfileStatusChanges(): void {
    this.candidateForm
      .get('profileStatus')
      ?.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((profileStatus: ProfileStatusesEnum) => {
        const handlers = {
          [ProfileStatusesEnum.OnHold]: () => this.handleOnHoldProfileStatus(),
          [ProfileStatusesEnum.Terminated]: () => this.handleTerminatedProfileStatus(),
          [ProfileStatusesEnum.Active]: () => this.reset(),
          [ProfileStatusesEnum.Inactive]: () => this.reset(),
        };

        handlers[profileStatus]();
        this.candidateForm.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  private handleOnHoldProfileStatus(): void {
    this.isOnHoldSelected = true;
    this.isTerminatedSelected = false;
    this.candidateForm.get('holdStartDate')?.setValidators(Validators.required);
    this.removeValidatorsAndReset(['terminationDate', 'terminationReasonId']);
  }

  private handleTerminatedProfileStatus(): void {
    this.isTerminatedSelected = true;
    this.isOnHoldSelected = false;
    this.candidateForm.get('terminationDate')?.setValue(new Date());
    this.candidateForm.get('terminationDate')?.setValidators(Validators.required);
    this.candidateForm.get('terminationReasonId')?.setValidators(Validators.required);
    this.removeValidatorsAndReset(['holdStartDate', 'holdEndDate']);
  }

  private removeValidatorsAndReset(controlNames: string | string[]): void {
    const controls = Array.isArray(controlNames) ? controlNames : [controlNames];

    controls.forEach((name: string) => {
      this.candidateForm.get(name)?.removeValidators(Validators.required);
      this.candidateForm.get(name)?.reset();
    });
  }

  private reset(): void {
    this.isTerminatedSelected = false;
    this.isOnHoldSelected = false;
    this.removeValidatorsAndReset(['holdStartDate', 'terminationDate', 'terminationReasonId', 'holdEndDate']);
  }
}
