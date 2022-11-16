import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

import { ExportColumn } from "@shared/models/export.model";
import { IrpShiftExportColumns } from "./shifts.constants";

@Injectable()
export class ShiftsService {

  constructor(private fb: FormBuilder) {}

  public getShiftForm(isIrpFlagEnabled: boolean): FormGroup {
    return this.fb.group({
      id: new FormControl(0, [ Validators.required ]),
      name: new FormControl(null, [ Validators.required ]),
      shortName: new FormControl(null, isIrpFlagEnabled ? [] : [ Validators.required ]),
      startTime: new FormControl(null, [ Validators.required ]),
      endTime: new FormControl(null, [ Validators.required ]),
    });
  }

  public getShiftExportColumns(isIrpFlagEnabled: boolean): ExportColumn[] {
    if (isIrpFlagEnabled) {
      return IrpShiftExportColumns;
    } else {
      return [
        { text: 'Shift Short Name', column: 'ShortName' },
        ...IrpShiftExportColumns,
      ];
    }
  }
}
