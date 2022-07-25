import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-accept-form',
  templateUrl: './accept-form.component.html',
  styleUrls: ['./accept-form.component.scss']
})
export class AcceptFormComponent {
  @Input() formGroup: FormGroup;

  static generateFormGroup(): FormGroup {
    return  new FormGroup({
      jobId: new FormControl({value: '', disabled: true }),
      billRates: new FormControl({value: '', disabled: true }),
      candidateBillRates: new FormControl({value: '' }),
      location: new FormControl({value: '', disabled: true }),
      department: new FormControl({value: '', disabled: true }),
      skill: new FormControl({value: '', disabled: true }),
      reorderDate: new FormControl({value: '', disabled: true }),
      shiftStartTime: new FormControl({value: '', disabled: true }),
      shiftEndTime: new FormControl({value: '', disabled: true }),
      openPosition: new FormControl({value: '', disabled: true }),
    });
  }

}
