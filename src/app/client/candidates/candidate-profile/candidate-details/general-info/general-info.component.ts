import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { ProfileStatuses, ProfileStatusesEnum, TerminationReasons } from '@client/candidates/candidate-profile/candidate-profile.constants';
import { FormBuilder, Validators } from '@angular/forms';
import { JobClassifications } from '@client/order-management/constants';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { Select, Store } from '@ngxs/store';
import { ListOfSkills } from '@shared/models/skill.model';
import { Observable } from 'rxjs';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';

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
    this.store.dispatch(new GetAssignedSkillsByOrganization());
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
