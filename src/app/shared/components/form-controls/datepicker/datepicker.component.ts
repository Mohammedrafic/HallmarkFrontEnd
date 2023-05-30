import { Component, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { ChangedEventArgs, DatePickerComponent } from '@syncfusion/ej2-angular-calendars';
import { FormatObject } from '@syncfusion/ej2-calendars/src/datepicker/datepicker';
import { MaskPlaceholderModel } from '@syncfusion/ej2-calendars/src/common/maskplaceholder-model';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { datepickerMask } from '@shared/constants';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DatepickerComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatepickerComponent), multi: true },
  ],
})
export class DatepickerComponent extends BaseFormControlDirective {
  @ViewChild('datepicker') datepicker: DatePickerComponent;
  @Input() format: string | FormatObject = 'MM/dd/yyyy';
  @Input() enableMask: boolean = true;
  @Input() maskPlaceholder: MaskPlaceholderModel = datepickerMask;
  @Input() min: Date | null | undefined;
  @Input() max: Date | null | undefined;
  @Input() public override placeholder = 'MM/DD/YYYY';
  @Input() public strictMode: boolean = false;

  @Output() valueChange: EventEmitter<Date> = new EventEmitter();
  @Output() change: EventEmitter<ChangedEventArgs> = new EventEmitter();
}
