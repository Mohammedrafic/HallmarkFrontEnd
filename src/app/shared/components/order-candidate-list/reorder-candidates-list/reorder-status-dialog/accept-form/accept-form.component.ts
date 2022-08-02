import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { CandidatStatus } from '@shared/enums/applicant-status.enum';
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
export class AcceptFormComponent {
  @Input() formGroup: FormGroup;
  @Input() status: CandidatStatus;

  public priceUtils = PriceUtils;

  get showHourlyRate(): boolean {
    return showHourlyRateForStatuses.includes(this.status);
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
    });
  }
}
