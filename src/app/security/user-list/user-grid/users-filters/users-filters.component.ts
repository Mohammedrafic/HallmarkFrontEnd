import { Component, Input } from '@angular/core';
import { FormGroup } from "@angular/forms";

import { FilterColumnsModel } from "@shared/models/filter.model";

@Component({
  selector: 'app-users-filters',
  templateUrl: './users-filters.component.html',
  styleUrls: ['./users-filters.component.scss']
})
export class UsersFiltersComponent {
  @Input() public form: FormGroup;
  @Input() public filterColumns: FilterColumnsModel;

  public rolesFields = {
    text: 'name',
    value: 'id',
  };

  public statusFields = {
    text: 'name',
    value: 'value',
  };
}
