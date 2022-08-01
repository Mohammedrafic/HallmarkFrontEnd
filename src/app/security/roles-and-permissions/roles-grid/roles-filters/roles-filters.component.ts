import { Component, Input } from '@angular/core';
import { FormGroup } from "@angular/forms";

import { FilterColumnsModel } from "@shared/models/filter.model";

@Component({
  selector: 'app-roles-filters',
  templateUrl: './roles-filters.component.html',
  styleUrls: ['./roles-filters.component.scss']
})
export class RolesFiltersComponent {
  @Input() public form: FormGroup;
  @Input() public filterColumns: FilterColumnsModel;

  public optionFields = {
    text: 'name',
    value: 'id',
  };
}
