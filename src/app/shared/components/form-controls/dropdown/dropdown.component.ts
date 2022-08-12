import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent<T> extends BaseFormControlDirective {
  @Input() public dataSource: T[] | null | undefined;
  @Input() public fields: FieldSettingsModel;
  @Input() public hideBorder: boolean = true;
}
