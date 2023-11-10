import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Injectable()
export class ShiftsService {

  constructor(private fb: FormBuilder) {}

  public getShiftForm(): FormGroup {
    return this.fb.group({
      id: new FormControl(0, [ Validators.required ]),
      name: new FormControl(null, [ Validators.required ]),
      startTime: new FormControl(null, [ Validators.required ]),
      endTime: new FormControl(null, [ Validators.required ]),
      onCall: new FormControl(false),
      inactiveDate:new FormControl('')
    });
  }
}
