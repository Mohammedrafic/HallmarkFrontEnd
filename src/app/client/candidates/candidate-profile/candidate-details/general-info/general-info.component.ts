import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { distinctUntilChanged, Observable, Subscription, takeUntil } from 'rxjs';

import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import {
  ProfileStatuses,
  ProfileStatusesEnum,
  InactivationReasons,
} from '@client/candidates/candidate-profile/candidate-profile.constants';
import { JobClassifications } from '@client/order-management/constants';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { ListOfSkills } from '@shared/models/skill.model';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { RejectReasonPage } from '@shared/models/reject-reason.model';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { GetSourcingReasons, GetInactivationReasons } from '@organization-management/store/reject-reason.actions';
import { endDateValidator, endTimeValidator, startDateValidator } from '@shared/validators/date.validator';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { DateTimeHelper } from '@core/helpers';

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoComponent extends AbstractContactDetails implements OnInit, OnDestroy {
  public isOnHoldSelected: boolean;
  public isInactivatedSelected: boolean;
  public minEndDate = new Date(new Date().setHours(0, 0, 0, 0));
  fieldsSettingsTeminated: FieldSettingsModel = { text: 'reason', value: 'id' };
  currentPage = 1;
  pageSize = 100;
  @Select(RejectReasonState.inactivationReasons)
  public reasons$: Observable<RejectReasonPage>;


  @Select(RejectReasonState.sourcingReasons)
  public sourcing$: Observable<any>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  public skills$: Observable<ListOfSkills[]>;
  public primarySkillsDataSource: ListOfSkills[] = [];
  public secondarySkillsDataSource: ListOfSkills[] = [];

  public readonly classifications = JobClassifications;
  public profileStatuses = ProfileStatuses;
  public recruitContent: any;
  public sourceContent: any;
  public readonly companyCodes = ProfileStatuses;
  public readonly inactivationReason = InactivationReasons;
  public readonly today = new Date();
  public isSourceValidated = false;
  public isSourceConfig = false;
  public sourceIdUpdateListener$: Subscription | undefined;

  public employeeIdRequired = true;

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileFormService: CandidateProfileFormService,
    private store: Store,
    private candidatesService: CandidatesService,
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    let Status =[ProfileStatusesEnum.Sourcing,ProfileStatusesEnum.Prospect,ProfileStatusesEnum.Onboarding,ProfileStatusesEnum.ClearedForOrientation,
      ProfileStatusesEnum.OrientationScheduled,ProfileStatusesEnum.DoNotHire,ProfileStatusesEnum.FallOffOnboarding,ProfileStatusesEnum.VerbalOfferMade]
    this.profileStatuses = this.profileStatuses.filter(f => !Status.includes(f.id));
    this.profileStatuses =this.profileStatuses.sort((a, b) => a.name.localeCompare(b.name))
    super.ngOnInit();
    this.listenProfileStatusChanges();
    this.listenSkillsChanges();
    this.subscribeOnSkills();
    this.subscribeOnHoldDates();
    this.store.dispatch(new GetInactivationReasons(this.currentPage, this.pageSize));
    this.store.dispatch(new GetSourcingReasons());

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
    this.sourcing$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data != null) {
        this.recruitContent = data.recruiter
        this.sourceContent = data.sourcing
        this.isSourceValidated = data.issourcing
      }

      if (this.isSourceValidated) {
        this.profileStatuses = ProfileStatuses
        this.profileStatuses =this.profileStatuses.sort((a, b) => a.name.localeCompare(b.name))
      }

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
        this.isSourceConfig = false;
        this.isInactivatedSelected = false;
        this.isOnHoldSelected = false;
        const handlers = {
          [ProfileStatusesEnum.OnHold]: () => this.handleOnHoldProfileStatus(),
          [ProfileStatusesEnum.Active]: () => this.reset(),
          [ProfileStatusesEnum.Inactive]: () => this.handleInactivationProfileStatus(),
          [ProfileStatusesEnum.Sourcing]: () => this.handleSourceStatus(),
          [ProfileStatusesEnum.Prospect]: () => this.handleSourceStatus(),
          [ProfileStatusesEnum.VerbalOfferMade]: () => this.handleSourceStatus(),
          [ProfileStatusesEnum.Onboarding]: () => this.handleSourceStatus(),
          [ProfileStatusesEnum.ClearedForOrientation]: () => this.handleSourceStatus(),
          [ProfileStatusesEnum.OrientationScheduled]: () => this.handleSourceStatus(),
          [ProfileStatusesEnum.DoNotHire]: () => this.handleSourceStatus(),
          [ProfileStatusesEnum.FallOffOnboarding]: () => this.handleInactivationProfileStatus(),
        };

        handlers[profileStatus]();
        this.candidateForm.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  private handleSourceStatus(): void {
    this.candidateForm.get('employeeId')?.setValue(this.candidateForm.get('employeeSourceId')?.value);
    this.candidateForm.get('employeeId')?.disable();
    this.candidateForm.get('employeeId')?.removeValidators(Validators.required);
    this.employeeIdRequired = false;

    this.candidateForm.get('employeeSourceId')?.setValidators(Validators.required);
    this.candidateForm.get('employeeSourceId')?.updateValueAndValidity();

    this.candidateForm.get('hireDate')?.removeValidators(Validators.required);
    //Set hire date 7 dats from today
    const hireDateValue = this.candidateForm.get('hireDate')?.value;
    if (!hireDateValue) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7);
      this.candidateForm.get('hireDate')?.setValue(currentDate);
    }

    this.sourceIdUpdateListener$ =
    this.candidateForm.get('employeeSourceId')?.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value: string) => {
      this.candidateForm.get('employeeId')?.setValue(value);
    });
    this.isSourceConfig = true;
    this.removeValidatorsAndReset(['inactivationDate', 'inactivationReasonId','holdStartDate', 'holdEndDate']);
  }

  private handleOnHoldProfileStatus(): void {
    const profileData = this.candidatesService.getProfileData();
    const startDate = profileData?.holdStartDate
      ? DateTimeHelper.setCurrentTimeZone(profileData.holdStartDate as string)
      : this.today;
    const endDate = profileData?.holdEndDate
      ? DateTimeHelper.setCurrentTimeZone(profileData.holdEndDate as string)
      : null;

    this.isOnHoldSelected = true;
    this.isInactivatedSelected = false;
    this.candidateForm.get('holdStartDate')?.setValue(startDate);
    this.candidateForm.get('holdStartDate')?.setValidators([
      Validators.required,
      startDateValidator(this.candidateForm, 'holdEndDate'),
      endTimeValidator(this.candidateForm, 'hireDate'),
    ]);
    this.candidateForm.get('holdEndDate')?.setValue(endDate);
    this.candidateForm.get('holdEndDate')?.setValidators(endDateValidator(this.candidateForm, 'holdStartDate'));
    this.removeValidatorsAndReset(['inactivationDate', 'inactivationReasonId']);
  }

  private handleInactivationProfileStatus(): void {
    this.candidateForm.get('employeeId')?.enable();
    this.candidateForm.get('employeeId')?.addValidators(Validators.required);
    this.candidateForm.get('hireDate')?.addValidators(Validators.required);
    this.candidateForm.get('employeeSourceId')?.removeValidators(Validators.required);
    this.employeeIdRequired = true;

    this.sourceIdUpdateListener$?.unsubscribe();
    const profileData = this.candidatesService.getProfileData();
    const startDate = profileData?.inactivationDate
      ? DateTimeHelper.setCurrentTimeZone(profileData.inactivationDate)
      : this.today;

    this.isInactivatedSelected = true;
    this.isOnHoldSelected = false;
    this.candidateForm.get('inactivationDate')?.setValue(startDate);
    this.candidateForm.get('inactivationDate')?.setValidators([
      Validators.required,
      endTimeValidator(this.candidateForm, 'hireDate'),
    ]);
    this.candidateForm.get('inactivationReasonId')?.setValue(profileData?.inactivationReasonId);
    this.candidateForm.get('inactivationReasonId')?.setValidators(Validators.required);
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
    this.candidateForm.get('employeeId')?.enable();
    this.candidateForm.get('employeeId')?.addValidators(Validators.required);
    this.candidateForm.get('hireDate')?.addValidators(Validators.required);
    this.candidateForm.get('employeeSourceId')?.removeValidators(Validators.required);
    this.candidateForm.get('employeeId')?.updateValueAndValidity();
    this.candidateForm.get('employeeSourceId')?.updateValueAndValidity();
    this.employeeIdRequired = true;
    this.sourceIdUpdateListener$?.unsubscribe();
    this.isInactivatedSelected = false;
    this.isOnHoldSelected = false;

    this.removeValidatorsAndReset(['holdStartDate', 'inactivationDate', 'inactivationReasonId', 'holdEndDate']);
  }

  private subscribeOnHoldDates(): void {
    const holdStartDateControl = this.candidateForm.get('holdStartDate');
    const holdEndDateControl = this.candidateForm.get('holdEndDate');

    holdStartDateControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        holdEndDateControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.cdr.markForCheck();
      });

    holdEndDateControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        holdStartDateControl?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        this.cdr.markForCheck();
      });
  }
}
