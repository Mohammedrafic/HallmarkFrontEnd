import { Component, Input } from '@angular/core';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FormGroup } from '@angular/forms';
import { FilterColumnsModel } from '@shared/components/candidate-details/models/candidate.model';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent {
  @Input() public filterColumns: FilterColumnsModel;
  @Input() public filtersForm: FormGroup;

  public typeFields: FieldSettingsModel = { text: 'name', value: 'id' };
}
