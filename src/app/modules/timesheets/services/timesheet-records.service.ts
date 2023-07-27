import { FormGroup, Validators, FormBuilder, AbstractControlOptions } from '@angular/forms';
import { Injectable } from '@angular/core';

import { ColDef } from '@ag-grid-community/core';
import { merge, Observable } from 'rxjs';
import { TabComponent } from '@syncfusion/ej2-angular-navigations';

import { DropdownOption } from '@core/interface';
import { AllTimesheetTimeSet, DateTimeHelper } from '@core/helpers';
import { TimesheetRecordsDto, RecordValue } from '../interface';
import { RecordFields, RecordsMode, RecordStatus, TableTabIndex } from '../enums';
import { DropdownEditorComponent } from '../components/cell-editors/dropdown-editor';

@Injectable()
export class TimesheetRecordsService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createEditForm(
    records: TimesheetRecordsDto,
    currentTab: RecordFields,
    colDefs: ColDef[],
    ): Record<string, FormGroup> {
    const formGroups: Record<string, FormGroup> = {};

    records[currentTab][RecordsMode.Edit].forEach((record) => {
      const config = colDefs.filter((item) => item.cellRendererParams?.editMode);
      const controls: Record<string, | string[] | number[] | Validators[] | null[]> = {};
      const formValidator = currentTab === RecordFields.Time ? [AllTimesheetTimeSet] : [];

      config.forEach((column) => {
        const field = column.field as keyof RecordValue;
        const value = record[field];

        controls[field] = [value as string | number | boolean, Validators.required];
      });
      const timeInValue = record['isTimeInNull'] ? null : record['timeIn'];

      controls['billRateConfigId'] = [record['billRateConfigId'], Validators.required];
      controls['timeOut'] = [record['timeOut'] as string];
      controls['timeIn'] = [timeInValue] as string[] | null[];
      controls['isTimeInNull'] = [record['isTimeInNull'] || false];

      formGroups[record.id] = this.fb.group(controls, { validators: formValidator } as AbstractControlOptions);
    });

    return formGroups;
  }

  findDiffs(
    data: RecordValue[], forms: Record<string, FormGroup>, defs: ColDef[],
    ): RecordValue[] {
    const diffs: Record<string, string | number  | boolean | null>[] = [];
    const fieldsToCompare = defs.filter((def) => def.cellRendererParams?.editMode)
      .map((def) => def.field);

    data.forEach((dataItem) => {
      const values: RecordValue = forms[dataItem.id].getRawValue() as RecordValue;
      const diffValues: Record<string, string | number  | boolean> = {};

      Object.keys(dataItem).filter((key) => fieldsToCompare.includes(key))
      .forEach((key) => {
        if (key !== 'id') {
          const keyValue = key as keyof RecordValue;
          const initialTimeInNull = !!dataItem.isTimeInNull;
          const timeInKey = keyValue === 'timeIn';
          const timeOutKey = keyValue === 'timeOut';

          if (dataItem[keyValue] !== values[keyValue] && !timeInKey && !timeOutKey) {
            diffValues[keyValue] = values[keyValue] as string | number | boolean;
          }

          // Time out value may be in another format, thus values must be unified.
          if (timeOutKey && !!dataItem[keyValue]) {
            const dataTime = DateTimeHelper.setUtcTimeZone(dataItem[keyValue] as string);
            const formTime = DateTimeHelper.setUtcTimeZone(values[keyValue] as string);

            if (dataTime !== formTime) {
              diffValues[keyValue] = values[keyValue] as string;
            }
          } else if (timeOutKey && dataItem[keyValue] !== values[keyValue]) {
            diffValues[keyValue] = values[keyValue] as string;
          }

          // Need to check isTimeInNull
          if (timeInKey && initialTimeInNull && values[keyValue] !== null) {
            diffValues[keyValue] = values[keyValue] as string | number | boolean;
          } else if (timeInKey && !initialTimeInNull && DateTimeHelper.setUtcTimeZone(dataItem[keyValue] as string)
          !== DateTimeHelper.setUtcTimeZone(values[keyValue] as string)) {
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

  watchFormChanges(controls: Record<string, FormGroup>): Observable<unknown> {
    return merge(
      ...Object.keys(controls).map((key) => controls[key].valueChanges)
    );
  }

  checkIfFormTouched(controls: Record<string, FormGroup>): boolean {
    return Object.keys(controls).some((key) => controls[key].touched);
  }

  getCurrentTabName(idx: TableTabIndex): RecordFields {
    switch (idx) {
      case TableTabIndex.HistoricalData:
        return RecordFields.HistoricalData;
      case TableTabIndex.Miles:
        return RecordFields.Miles;
      case TableTabIndex.Expenses:
        return RecordFields.Expenses;
      default:
        return RecordFields.Time;
    }
  }

  controlTabsVisibility(billRates: DropdownOption[], tabs: TabComponent, records: TimesheetRecordsDto): void {
    const isMileageAvailable = billRates.some((rate) => rate.text.includes('Mileage'));
    const isExpensesAvailable = !!records.expenses.viewMode.length;

    tabs.hideTab(TableTabIndex.Miles, !isMileageAvailable);
    tabs.hideTab(TableTabIndex.Expenses, !isExpensesAvailable);
  }

  checkForStatus(data: RecordValue[]): boolean {
    return data.some((record) => {
      return record.stateText === RecordStatus.Deleted || record.stateText === RecordStatus.New;
    });
  }

  createEditColDef(
    editOn: boolean,
    currentTab: RecordFields,
    formControls: Record<string, FormGroup>,
    colDefs: ColDef[]): ColDef[] {
    return colDefs.map((def) => {
      let definition: ColDef = def;

      if (editOn && def.field === 'hadLunchBreak') {
        definition.cellRendererParams.disabled = false;
      } else if (def.field === 'hadLunchBreak') {
        definition.cellRendererParams.disabled = true;
      }

      if (editOn && def.field === 'billRateConfigName' && currentTab === RecordFields.Time) {
        const editData = {
          cellRenderer: DropdownEditorComponent,
          cellRendererParams: {
            editMode: true,
            isEditable: true,
            options: [],
            storeField: 'billRateTypes',
          },
        };
        definition.field = 'billRateConfigId';

        definition = {
          ...def,
          ...editData,
        };
      } else if (!editOn && def.field === 'billRateConfigId' && currentTab === RecordFields.Time) {
        definition.field = 'billRateConfigName';
        delete definition.cellRenderer;
        delete definition.cellRendererParams;
      }

      if (definition.cellRendererParams && definition.cellRendererParams.editMode) {
        definition.cellRendererParams.isEditable = editOn;
        definition.cellRendererParams.formGroup = formControls;
      }

      return definition;
    });
  }

  checkFormsValidation(forms:  Record<string, FormGroup>): boolean {
    Object.keys(forms).forEach((key) => {
      forms[key].updateValueAndValidity();
      forms[key].markAllAsTouched();
    });

    return Object.keys(forms).every((key) => {
      return forms[key].valid;
    });
  }
}
