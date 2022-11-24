import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';

import { ColDef } from '@ag-grid-community/core';
import { merge, Observable } from 'rxjs';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

import { DropdownOption } from '@core/interface';
import { TimesheetRecordsDto, RecordValue } from './../interface';
import { RecordFields, RecordsMode, RecordStatus } from '../enums';
import { DropdownEditorComponent } from '../components/cell-editors/dropdown-editor/dropdown-editor.component';

@Injectable()
export class TimesheetRecordsService {
  constructor(
    private fb: FormBuilder,
  ) {}

  public setCostOptions(defs: ColDef[], options: DropdownOption[]): void {
    const idx = defs.findIndex((item) => item.field === 'costCenter');
    defs[idx].cellRendererParams.options = options;
  }

  public setBillRatesOptions(defs: ColDef[], options: DropdownOption[]): void {
    const idx = defs.findIndex((item) => item.field === 'billRateType');
    defs[idx].cellRendererParams.options = options;
  }

  public createEditForm(
    records: TimesheetRecordsDto,
    currentTab: RecordFields,
    colDefs: ColDef[],
    ): Record<string, FormGroup> {
    const formGroups: Record<string, FormGroup> = {};

    records[currentTab][RecordsMode.Edit].forEach((record) => {
      const config = colDefs.filter((item) => item.cellRendererParams?.editMode);
      const controls: Record<string, string[] | number[] | Validators[]> = {};

      config.forEach((column) => {
        const field = column.field as keyof RecordValue;
        const value = record[field];

        controls[field] = [value as string | number | boolean, Validators.required];
      });

      controls['billRateConfigId'] = [record['billRateConfigId'], Validators.required];
      controls['timeOut'] = [record['timeOut'] || ''];
      controls['timeIn'] = [record['timeIn'] || ''];
      controls['isTimeInNull'] = [record['isTimeInNull'] || false];

      formGroups[record.id] = this.fb.group(controls);
    });

    return formGroups;
  }

  public findDiffs(
    data: RecordValue[], forms: Record<string, FormGroup>, defs: ColDef[],
    ): RecordValue[] {
    const diffs: Record<string, string | number  | boolean>[] = [];
    const filedsToCompare = defs.filter((def) => def.cellRendererParams?.editMode).map((def) => def.field);

    data.forEach((dataItem) => {
      const values: RecordValue = forms[dataItem.id].getRawValue() as RecordValue;
      const diffValues: Record<string, string | number  | boolean> = {};


      Object.keys(dataItem).filter((key) => filedsToCompare.includes(key))
      .forEach((key) => {
        if (key !== 'id') {
          const keyValue = key as keyof RecordValue;

          if (dataItem[keyValue] !== values[keyValue]) {
            diffValues[keyValue] = values[keyValue] as string | number | boolean;
          }

        }
      });

      if (Object.keys(diffValues).length) {
        diffs.push({
          ...dataItem,
          ...diffValues,
        });

      }
    });

    return diffs as unknown as RecordValue[];
  }

  public watchFormChanges(controls: Record<string, FormGroup>): Observable<unknown> {
    return merge(
      ...Object.keys(controls).map((key) => controls[key].valueChanges)
    )
  }

  public checkIfFormTouched(controls: Record<string, FormGroup>): boolean {
    return Object.keys(controls).some((key) => controls[key].touched)
  }

  public getCurrentTabName(idx: number): RecordFields {
    if (idx === 1) {
      return  RecordFields.Miles;
    }
    if (idx === 2) {
      return RecordFields.Expenses;
    }

    return RecordFields.Time;
  }

  public controlTabsVisibility(billRates: DropdownOption[], tabs: TabComponent, records: TimesheetRecordsDto): void {
    const isMilageAvaliable = billRates.some((rate) => rate.text.includes('Mileage'));
    const isExpensesAvaliable = !!records.expenses.viewMode.length;

    tabs.hideTab(1, !isMilageAvaliable);
    tabs.hideTab(2, !isExpensesAvaliable);
  }

  public checkForStatus(data: RecordValue[]): boolean {
    return data.some((record) => {
      return record.stateText === RecordStatus.Deleted || record.stateText === RecordStatus.New;
    });
  }

  public createEditColDef(
    editOn: boolean,
    currentTab: RecordFields,
    formControls: Record<string, FormGroup>,
    colDefs: ColDef[]): ColDef[] {


    return colDefs.map((def) => {
      if (editOn && def.field === 'hadLunchBreak') {
        def.cellRendererParams.disabled = false;
      } else if (def.field === 'hadLunchBreak') {
        def.cellRendererParams.disabled = true;
      }

      if (editOn && def.field === 'billRateConfigName'
      && currentTab === RecordFields.Time) {
        const editData = {
          cellRenderer: DropdownEditorComponent,
          cellRendererParams: {
            editMode: true,
            isEditable: true,
            options: [],
            storeField: 'billRateTypes',
          }
        }
        def.field = 'billRateConfigId';
        def = {
          ...def,
          ...editData,
        };
      } else if (!editOn && def.field === 'billRateConfigId' && currentTab === RecordFields.Time) {
        def.field = 'billRateConfigName';
        delete def.cellRenderer;
        delete def.cellRendererParams;
      }

      if ((def.field === 'billRate' || def.field === 'total') && currentTab !== RecordFields.Expenses) {
        def.hide = editOn;
      }

      if (def.cellRendererParams && def.cellRendererParams.editMode) {
        def.cellRendererParams.isEditable = editOn;
        def.cellRendererParams.formGroup = formControls;
      }
      return def;
    });
  }
}
