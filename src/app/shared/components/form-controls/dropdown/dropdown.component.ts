import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PopupEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DropdownComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DropdownComponent), multi: true },
  ],
})
export class DropdownComponent extends BaseFormControlDirective {
  @Input() public dataSource: unknown | null | undefined;
  @Input() public fields: FieldSettingsModel;
  @Input() public hideBorder = true;
  @Input() public allowFiltering = true;
  @Input() public sortOrder: SortOrder = SortOrder.NONE;

  @Output() public openDropdown: EventEmitter<PopupEventArgs> = new EventEmitter();
}
