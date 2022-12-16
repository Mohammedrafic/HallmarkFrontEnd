import { Directive, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { datepickerMask } from '@shared/constants';

@Directive()
export abstract class AbstractContactDetails {
  @Input() public candidateForm: FormGroup;

  public readonly datepickerMask = datepickerMask;
  public readonly fieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
  public readonly skillOptionFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
}
