import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";

@Injectable()
export class RolesFilterService {

  generateFiltersForm(): FormGroup {
    return new FormGroup({
      permissionsIds: new FormControl([]),
    });
  }
}
