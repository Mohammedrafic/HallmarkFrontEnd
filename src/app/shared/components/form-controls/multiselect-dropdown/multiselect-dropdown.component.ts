import type { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiselectDropdownComponent<T> extends BaseFormControlDirective {
  @Input() public dataSource: T[] | null | undefined;
  @Input() public fields: FieldSettingsModel;
}
