import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";

@Injectable()
export class UserSubscriptionFilterService {

  generateFiltersForm(): FormGroup {
    return new FormGroup({
      
    });
  }
}