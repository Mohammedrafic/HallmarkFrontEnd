import { FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';

import { TabComponent, TabItemModel } from '@syncfusion/ej2-angular-navigations';
import { ColDef } from '@ag-grid-community/core';

import { DropdownOption, TimesheetRecordsDto, RecordValue } from './../interface/common.interface';

@Injectable()
export class TimesheetRecordsService {
  public createTabs(records: TimesheetRecordsDto, tabComp: TabComponent): void {
    const config: TabItemModel[] = [];
    if (records.timeRecords.length > 0) {
      config.push({
        header: {
          text: 'Timesheet',
        }
      });
    }

    if (records.miles.length > 0) {
      config.push({
        header: {
          text: 'Miles',
        }
      });
    }

    if (records.expenses.length > 0) {
      config.push({
        header: {
          text: 'Expenses',
        }
      });
    }

    tabComp.addTab(config);
  }

  public setCostOptions(defs: ColDef[], options: DropdownOption[]): void {
    const idx = defs.findIndex((item) => item.field === 'costCenter');
    defs[idx].cellRendererParams.options = options;
  }

  public setBillRatesOptions(defs: ColDef[], options: DropdownOption[]): void {
    const idx = defs.findIndex((item) => item.field === 'billRateType');
    defs[idx].cellRendererParams.options = options;
  }

  public findDiffs(
    data: RecordValue[], forms: Record<string, FormGroup>, defs: ColDef[],
    ): Record<string, string | number>[] {
    const diffs: Record<string, string | number>[] = [];
    const filedsToCompare = defs.filter((def) => def.cellRendererParams?.editMode).map((def) => def.field);

    data.forEach((dataItem) => {
      const values: RecordValue = forms[dataItem.id].getRawValue() as RecordValue;
      const diffValues: Record<string, string | number> = {};


      Object.keys(dataItem).filter((key) => filedsToCompare.includes(key))
      .forEach((key) => {
        if (key !== 'id') {
          const keyValue = key as keyof RecordValue;

          if (dataItem[keyValue] !== values[keyValue]) {
            diffValues[keyValue] = values[keyValue];
          }

        }
      });

      if (Object.keys(diffValues).length) {
        diffs.push({
          id: dataItem.id,
          ...diffValues,
        });

      }
    });

    return diffs;
  }
}
