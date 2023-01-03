import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import {
  HrCompanyCodes,
  HrInternalTransfersRecruitments,
  OrientationConfigurations
} from '@client/candidates/candidate-profile/candidate-profile.constants';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';

@Component({
  selector: 'app-hr-info',
  templateUrl: './hr-info.component.html',
  styleUrls: ['./hr-info.component.scss'],
})
export class HrInfoComponent extends AbstractContactDetails implements OnInit {
  public readonly hrInternalTransfersRecruitments = HrInternalTransfersRecruitments;
  public readonly orientationConfigurations = OrientationConfigurations;
  public readonly hrCompanyCodes = HrCompanyCodes;

  public get isContractValue(): boolean {
    return this.candidateForm.get('isContract')?.value;
  }

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileFormService: CandidateProfileFormService
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.listenContractChanges();
  }

  public listenContractChanges(): void {
    this.candidateForm
      .get('isContract')
      ?.valueChanges
      .subscribe((checked: boolean) => {
        this.setStateForContractDates(checked);
      });
  }

  public onChange({ checked }: ChangeEventArgs): void {
    this.candidateForm.get('isContract')?.setValue(checked);
  }

  private setStateForContractDates(checked: boolean): void {
    this.candidateForm.get('contractStartDate')?.[checked ? 'enable' : 'disable']();
    this.candidateForm.get('contractEndDate')?.[checked ? 'enable' : 'disable']();
  }
}
