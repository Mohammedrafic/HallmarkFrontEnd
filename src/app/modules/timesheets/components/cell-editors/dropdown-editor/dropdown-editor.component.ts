import { AbstractControl, FormGroup } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';

import { DropdownOption } from '@core/interface';
import { createUniqHashObj } from '@core/helpers/functions.helper';

@Component({
  selector: 'app-dropdown-editor',
  templateUrl: './dropdown-editor.component.html',
  styleUrls: ['./dropdown-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownEditorComponent implements ICellRendererAngularComp {
  public value: DropdownOption;

  public options: DropdownOption[] = [];

  public editable = false;
  
  public filterType: string = 'Contains';

  public control: AbstractControl;

  constructor(
    private store: Store,
    private cd: ChangeDetectorRef,
  ) {}

  public agInit(params: ICellRendererParams): void {
    this.setData(params);
    this.setFormControl(params);
  }

  public refresh(params: ICellRendererParams): boolean {
    this.setData(params);
    this.setFormControl(params);
    return true;
  }

  public itemChange(event: ChangeEventArgs):  void {
    this.control.markAsTouched();
    this.control.patchValue(event.itemData.value);
  }

  private setData(params: ICellRendererParams): void {
    const colDef = (params.colDef as ColDef);
    const storeField = colDef.cellRendererParams.storeField as string
    this.editable = colDef.cellRendererParams.isEditable;

    this.options = this.store.snapshot().timesheets[storeField];

    if (storeField === 'billRateTypes') {
      const ratesNotForSelect = ['Daily OT', 'Daily Premium OT', 'Mileage', 'OT'];
      const filteredOptions = this.options.filter((option) => {
        return !ratesNotForSelect.includes(option.text);
      });
      const uniqBillRatesHashObj = createUniqHashObj(
        filteredOptions,
        (el: DropdownOption) => el.value,
        (el: DropdownOption) => el,
      );

      this.options = Object.values(uniqBillRatesHashObj);
    }

    if (this.options && this.options.length) {
      this.value =
        this.options.find((item) => item.value === params.value) as DropdownOption ||
        { text: params.data?.costCenterFormattedName ?? 'N/A', value: 0 };
    }
    this.cd.markForCheck();
  }

  private setFormControl(params: ICellRendererParams): void {
    if (params.colDef?.cellRendererParams.formGroup?.[params.data.id]) {

      const group = params.colDef?.cellRendererParams.formGroup[params.data.id] as FormGroup;

      this.control = group.get((params.colDef as ColDef).field as string) as AbstractControl;
    }
  }
}
