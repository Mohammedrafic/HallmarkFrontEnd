import { Component, Input } from '@angular/core';
import { FormGroup } from "@angular/forms";

import { FilterColumnsModel } from "@shared/models/filter.model";

@Component({
  selector: 'app-agency-list-filters',
  templateUrl: './agency-list-filters.component.html',
  styleUrls: ['./agency-list-filters.component.scss']
})
export class AgencyListFiltersComponent {
  @Input() public form: FormGroup;
  @Input() public filterColumns: FilterColumnsModel;

  public optionFields = {
    text: 'text',
    value: 'id',
  };
}
