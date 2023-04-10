import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AvailabilityFilterColumns } from '../enums/availability-filter-columns.enum';

@Injectable()
export class AvailabilityHelperService {
  
  public createAvailabilityForm(): FormGroup {
    return new FormGroup({
      [AvailabilityFilterColumns.START_DAY]: new FormControl(null),
      [AvailabilityFilterColumns.END_DAY]: new FormControl(null),
      [AvailabilityFilterColumns.START_TIME]: new FormControl(null),
      [AvailabilityFilterColumns.END_TIME]: new FormControl(null),
    });
  }
}
