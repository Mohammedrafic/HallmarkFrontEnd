import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import {
  HrCompanyCodes,
  HrInternalTransfersRecruitments,
  OrientationConfigurations
} from '@client/candidates/candidate-profile/candidate-profile.constants';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import { CandidateProfileService } from '@client/candidates/candidate-profile/candidate-profile.service';

@Component({
  selector: 'app-hr-info',
  templateUrl: './hr-info.component.html',
  styleUrls: ['./hr-info.component.scss']
})
export class HrInfoComponent extends AbstractContactDetails implements OnInit {
  public readonly hrInternalTransfersRecruitments = HrInternalTransfersRecruitments;
  public readonly orientationConfigurations = OrientationConfigurations;
  public readonly hrCompanyCodes = HrCompanyCodes;

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileService: CandidateProfileService
  ) {
    super(cdr, candidateProfileService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
  }

  public listenContractChanges({ checked }: ChangeEventArgs): void {
    this.candidateForm.get('isContract')?.setValue(checked);
    this.candidateForm.get('contractStartDate')?.[checked ? 'enable' : 'disable']();
    this.candidateForm.get('contractEndDate')?.[checked ? 'enable' : 'disable']();
  }

}
