import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import {
  HrCompanyCodes,
  HrInternalTransfersRecruitments,
  OrientationConfigurations
} from '@client/candidates/candidate-profile/candidate-profile.constants';
import { ChangeEventArgs } from '@syncfusion/ej2-buttons';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { GetInternalTransferReasons } from '@organization-management/store/reject-reason.actions';
import { Select, Store } from '@ngxs/store';
import { RejectReasonPage } from '@shared/models/reject-reason.model';
import { Observable } from 'rxjs/internal/Observable';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';

@Component({
  selector: 'app-hr-info',
  templateUrl: './hr-info.component.html',
  styleUrls: ['./hr-info.component.scss'],
})
export class HrInfoComponent extends AbstractContactDetails implements OnInit {
  public readonly hrInternalTransfersRecruitments = HrInternalTransfersRecruitments;
  public readonly orientationConfigurations = OrientationConfigurations;
  public readonly hrCompanyCodes = HrCompanyCodes;
  currentPage = 1;
  pageSize = 100;
  fieldsSettingsInternalTransfer: FieldSettingsModel = { text: 'reason', value: 'id' };
  @Select(RejectReasonState.internalTransfer)
  public reasons$: Observable<RejectReasonPage>;
  public get isContractValue(): boolean {
    return this.candidateForm.get('isContract')?.value;
  }

  constructor(
    protected override cdr: ChangeDetectorRef,
    protected override candidateProfileFormService: CandidateProfileFormService,
    private store: Store,
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    super.ngOnInit();

    this.listenContractChanges();
    this.store.dispatch(new GetInternalTransferReasons( this.currentPage ,this.pageSize));
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
