import type { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { ISelectAllEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => MultiselectDropdownComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiselectDropdownComponent), multi: true },
  ],
})
export class MultiselectDropdownComponent<T> extends BaseFormControlDirective {
  @Input() public dataSource: T[] | null | undefined;
  @Input() public fields: FieldSettingsModel;
  @Input() public selectAllText: string;
  @Input() public showSelectAll: boolean;

  @Output() public selectAllEmitter: EventEmitter<ISelectAllEventArgs> = new EventEmitter<ISelectAllEventArgs>();
}
