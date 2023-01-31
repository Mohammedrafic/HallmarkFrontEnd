import { Component, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { PenaltiesMap } from "@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants";
import { CandidatStatus } from '@shared/enums/applicant-status.enum';
import { PenaltyCriteria } from "@shared/enums/candidate-cancellation";
import PriceUtils from '@shared/utils/price.utils';

const showHourlyRateForStatuses: CandidatStatus[] = [
  CandidatStatus.BillRatePending,
  CandidatStatus.OfferedBR,
  CandidatStatus.OnBoard,
];

@Component({
  selector: 'app-accept-form',
  templateUrl: './accept-form.component.html',
  styleUrls: ['./accept-form.component.scss'],
})
export class AcceptFormComponent implements OnChanges{
  @Input() formGroup: FormGroup;
  
  @Input() status: CandidatStatus;

  @Input() isAgency: boolean;

  @Input() isCandidatePayRateVisible: boolean;

  public priceUtils = PriceUtils;

  public isBlankStatus: boolean;

  get penaltyCriteriaControlValue(): string {
    return this.formGroup.get('penaltyCriteria')?.value;
  }

  get showHoursControl(): boolean {
    return this.penaltyCriteriaControlValue === PenaltiesMap[PenaltyCriteria.RateOfHours]
      || this.penaltyCriteriaControlValue === PenaltiesMap[PenaltyCriteria.FlatRateOfHours];
  }

  get showPercentage(): boolean {
    return this.penaltyCriteriaControlValue === PenaltiesMap[PenaltyCriteria.RateOfHours];
  }

  get showHourlyRate(): boolean {
    return showHourlyRateForStatuses.includes(this.status);
  }

  get isRejected(): boolean {
    return this.status === CandidatStatus.Rejected;
  }

  get isCancelled(): boolean {
    return this.status === CandidatStatus.Cancelled;
  }

  public ngOnChanges(): void {
      this.configureCandidatePayRateField();
  }

  private configureCandidatePayRateField(): void {
    this.isBlankStatus = this.status === CandidatStatus.Offered;

    const candidatePayRateControl = this.formGroup.get('candidatePayRate');
    
    if(this.isCandidatePayRateVisible && this.isBlankStatus) {
      candidatePayRateControl?.enable();
    } else {
      candidatePayRateControl?.disable();
    }
  }

  static generateFormGroup(): FormGroup {
    return new FormGroup({
      reOrderFromId: new FormControl({ value: '', disabled: true }),
      offeredBillRate: new FormControl({ value: '', disabled: true }),
      candidateBillRate: new FormControl({ value: '', disabled: true }, [Validators.required]),
      locationName: new FormControl({ value: '', disabled: true }),
      departmentName: new FormControl({ value: '', disabled: true }),
      skillName: new FormControl({ value: '', disabled: true }),
      orderOpenDate: new FormControl({ value: '', disabled: true }),
      shiftStartTime: new FormControl({ value: '', disabled: true }),
      shiftEndTime: new FormControl({ value: '', disabled: true }),
      openPositions: new FormControl({ value: '', disabled: true }),
      hourlyRate: new FormControl({ value: '', disabled: false }, [Validators.required]),
      rejectReason: new FormControl({ value: '', disabled: true }),
      jobCancellationReason: new FormControl({ value: '', disabled: true }),
      penaltyCriteria: new FormControl({ value: '', disabled: true }),
      rate: new FormControl({ value: '', disabled: true }),
      hours: new FormControl({ value: '', disabled: true }),
      candidatePayRate: new FormControl({ value: '', disabled: true }, [Validators.required]),
    });
  }
}
