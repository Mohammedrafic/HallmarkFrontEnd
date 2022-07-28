import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";

@Injectable()
export class AgencyListFilterService {

  public generateFiltersForm(): FormGroup {
    return new FormGroup({
      searchTerm: new FormControl(null),
      businessUnitNames: new FormControl([]),
      statuses: new FormControl([]),
      cities: new FormControl([]),
      contacts: new FormControl([]),
    });
  }
}
