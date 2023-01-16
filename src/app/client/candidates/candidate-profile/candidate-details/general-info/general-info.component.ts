import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { ProfileStatuses, ProfileStatusesEnum, TerminationReasons } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { FormBuilder, Validators } from '@angular/forms';
import { JobClassifications } from '@client/order-management/constants';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Select, Store } from '@ngxs/store';
import { ListOfSkills } from '@shared/models/skill.model';
import { distinctUntilChanged, Observable, takeUntil } from 'rxjs';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { SystemType } from '@shared/enums/system-type.enum';

@Component({
  selector: 'app-general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoComponent extends AbstractContactDetails implements OnInit {
  public isOnHoldSelected: boolean;
  public isTerminatedSelected: boolean;

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
    private formBuilder: FormBuilder,
    private store: Store,
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileFormService: CandidateProfileFormService
  ) {
    super(cdr, candidateProfileFormService);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.listenProfileStatusChanges();
    this.listenSkillsChanges();
    this.subscribeOnSkills();
    this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } }));
  }

  private subscribeOnSkills(): void {
    this.skills$.pipe(takeUntil(this.destroy$)).subscribe((skills) => {
      const primarySkillId = this.candidateForm.controls['primarySkillId'].value;
      this.primarySkillsDataSource = skills;
      this.secondarySkillsDataSource = primarySkillId ? this.candidateProfileFormService.getSecondarySkillsDataSource(this.primarySkillsDataSource, primarySkillId) : skills;
      this.cdr.markForCheck();
    });
  }

  private listenSkillsChanges(): void {
    const secondarySkillsField = this.candidateForm.controls['secondarySkills'];
    this.candidateForm.controls['primarySkillId'].valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((value) => {
      this.candidateProfileFormService.primarySkillHandler(secondarySkillsField, value);
      this.secondarySkillsDataSource = this.candidateProfileFormService.getSecondarySkillsDataSource(this.primarySkillsDataSource, value);
      this.cdr.markForCheck();
    });

  }

  private listenProfileStatusChanges(): void {
    this.candidateForm.get('profileStatus')?.valueChanges.subscribe((profileStatus: ProfileStatusesEnum) => {
      const handlers = {
        [ProfileStatusesEnum.OnHold]: () => this.handleOnHoldProfileStatus(),
        [ProfileStatusesEnum.Terminated]: () => this.handleTerminatedProfileStatus(),
        [ProfileStatusesEnum.Active]: () => this.removeValidators(),
        [ProfileStatusesEnum.Inactive]: () => this.removeValidators(),
      };

      handlers[profileStatus]();
      this.candidateForm.updateValueAndValidity();
      this.cdr.markForCheck();
    });
  }

  private handleOnHoldProfileStatus(): void {
    this.isOnHoldSelected = true;
    this.isTerminatedSelected = false;
    this.candidateForm.get('holdStartDate')?.setValidators([Validators.required]);
  }

  private handleTerminatedProfileStatus(): void {
    this.isTerminatedSelected = true;
    this.isOnHoldSelected = false;
    this.candidateForm.get('terminationDate')?.setValidators([Validators.required]);
    this.candidateForm.get('terminationReasonId')?.setValidators([Validators.required]);
  }

  private removeValidators(): void {
    this.isTerminatedSelected = false;
    this.isOnHoldSelected = false;
    const controls = ['holdStartDate', 'terminationDate', 'terminationReasonId'];

    controls.forEach(() => {
      this.candidateForm.removeValidators(Validators.required);
    });
  }
}
