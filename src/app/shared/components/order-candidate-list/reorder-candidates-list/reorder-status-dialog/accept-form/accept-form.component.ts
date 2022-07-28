import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-accept-form',
  templateUrl: './accept-form.component.html',
  styleUrls: ['./accept-form.component.scss'],
})
export class AcceptFormComponent {
  @Input() formGroup: FormGroup;
  @Input() isBillRatePending: boolean;

  static generateFormGroup(): FormGroup {
    return new FormGroup({
      jobId: new FormControl({ value: '', disabled: true }),
      offeredBillRate: new FormControl({ value: '', disabled: true }),
      candidateBillRate: new FormControl({ value: '', disabled: true }),
      locationName: new FormControl({ value: '', disabled: true }),
      departmentName: new FormControl({ value: '', disabled: true }),
      skillName: new FormControl({ value: '', disabled: true }),
      orderOpenDate: new FormControl({ value: '', disabled: true }),
      shiftStartTime: new FormControl({ value: '', disabled: true }),
      shiftEndTime: new FormControl({ value: '', disabled: true }),
      openPositions: new FormControl({ value: '', disabled: true }),
      hourlyRate: new FormControl({ value: '', disabled: false }),
    });
  }
}
