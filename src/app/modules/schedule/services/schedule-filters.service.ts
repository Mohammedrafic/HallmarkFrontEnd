import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Injectable()
export class ScheduleFiltersService {
  constructor(private readonly fb: FormBuilder) {}

  public createScheduleFilterForm(): FormGroup {
    return this.fb.group({
      regionIds: ['', Validators.required],
      locationIds: ['', Validators.required],
      departmentsIds: [],
      skillIds: [],
    });
  }
}
