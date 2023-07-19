import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { EditFieldTypes } from '@core/enums';
import { Attachment, AttachmentsListParams } from '@shared/components/attachments';

import { RecordFields } from '../enums';
import { actionCol, amountColdef, attachmentsCol, billRateColDef, billRateTypeStatic, dayColDef,
  editableCostCenterDef, ExpensesRecordsColDef, recordStatusCell, TimesheetRecordsColdef, totalCol } from '../constants';
import { InputEditorComponent } from '../components/cell-editors/input-editor/input-editor.component';
import { Timesheets } from '../store/actions/timesheets.actions';

@Injectable()
export class TimesheetDetailsTableService {
  constructor(private store: Store) {
  }

  public getTableRecordsConfig():
    Record<string, ((isStatusAvaliable: boolean, organizationId?: number | null, disableActions?: boolean) => ColDef[])> {
    return {
      [RecordFields.Time]: TimesheetRecordsColdef,
      [RecordFields.Miles]: this.milesRecordsColDef.bind(this),
      [RecordFields.Expenses]: ExpensesRecordsColDef,
    };
  }

  public milesRecordsColDef(isStatusAvaliable = false,
      organizationId: number | null = null, disableActions = false): ColDef[] {
    return [
      dayColDef,
      ...(isStatusAvaliable ? [recordStatusCell] : []),
      {
        ...editableCostCenterDef,
        width: 220,
      },
      {
        ...billRateTypeStatic,
        width: 200,
      },
      {
        ...attachmentsCol,
        cellRendererParams: (params: ICellRendererParams) => {
          return {
            attachments: params.data.attachments,
            attachmentsListConfig: {
              download: (file: Attachment) => this.store.dispatch(new Timesheets.DownloadRecordAttachment(
                params.data.timesheetRecordId,
                organizationId,
                file
              )),
              preview: (file: Attachment) => this.store.dispatch(new Timesheets.PreviewAttachment(
                params.data.timesheetRecordId,
                organizationId,
                file
              )),
            },
          } as AttachmentsListParams;
        },
      },
      {
        ...amountColdef('Miles'),
        width: 200,
        cellRenderer: InputEditorComponent,
        cellRendererParams: {
          editMode: true,
          isEditable: false,
          type: EditFieldTypes.Text,
          validators: [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER), Validators.required],
        },
      },
      {
        ...billRateColDef,
        width: 150,
      },
      {
        ...totalCol,
        width: 200,
      },
      actionCol(true, disableActions),
    ];
  }
}
