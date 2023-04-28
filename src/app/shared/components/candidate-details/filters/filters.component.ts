import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { FormGroup } from '@angular/forms';
import { FilterColumnsModel } from '@shared/components/candidate-details/models/candidate.model';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { ShowFilterDialog } from 'src/app/store/app.actions';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit {
  @Input() public filterColumns: FilterColumnsModel;
  @Input() public filtersForm: FormGroup;
  @Input() public isAgency: boolean;

  @ViewChild('regionDropdown') public readonly regionDropdown: MultiSelectComponent;

  public typeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public skillFields: FieldSettingsModel = { text: 'skillDescription', value: 'masterSkillId' };

  constructor(private actions$: Actions) {}

  ngOnInit(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowFilterDialog),
      debounceTime(300)
    ).subscribe(() => {
      this.regionDropdown.refresh();
    });
  }
}
