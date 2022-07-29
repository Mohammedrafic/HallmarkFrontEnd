import { Component, forwardRef, Input } from '@angular/core';

import { BaseFormControlDirective } from '@shared/components/form-controls/base-form-control.directive';
import { FormatObject } from '@syncfusion/ej2-calendars/src/datepicker/datepicker';
import { MaskPlaceholderModel } from '@syncfusion/ej2-calendars/src/common/maskplaceholder-model';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

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
  @Input() format: string | FormatObject;
  @Input() enableMask: boolean;
  @Input() maskPlaceholder: MaskPlaceholderModel;
  @Input() min: Date | null;
}
