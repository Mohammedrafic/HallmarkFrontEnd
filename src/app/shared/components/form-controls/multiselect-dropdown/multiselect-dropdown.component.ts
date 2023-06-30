import type { FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ISelectAllEventArgs } from '@syncfusion/ej2-angular-dropdowns';

import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { inputs } from '@syncfusion/ej2-angular-popups/src/dialog/dialog.component';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => MultiselectDropdownComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiselectDropdownComponent), multi: true },
  ],
})
export class MultiselectDropdownComponent extends BaseFormControlDirective {
  public defaultWidth:string ='200px';
  @ViewChild('selector') selector: MultiSelectComponent;
  @Input() public dataSource: unknown | null | undefined;
  @Input() public fields: FieldSettingsModel;
  @Input() public selectAllText: string;
  @Input() public showSelectAll: boolean;
  @Input() public sortOrder: SortOrder = SortOrder.NONE;
  @Input() showClearAll = true;
  @Input() allowFilter = true;
  @Input() public popupWidth : string | undefined;

  @Output() public selectAllEmitter: EventEmitter<ISelectAllEventArgs> = new EventEmitter<ISelectAllEventArgs>();
}
