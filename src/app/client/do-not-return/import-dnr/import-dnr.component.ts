import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { Actions, Store } from '@ngxs/store';


import { DoNotReturn} from '@admin/store/donotreturn.actions';

import { AbstractImport } from '@shared/classes/abstract-import';
import { ColDef } from '@ag-grid-community/core';
import { GridErroredCellComponent } from '@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component';

const importConfig = {
  importTemplate: DoNotReturn.GetDoNotReturnImportTemplate,
  importError: DoNotReturn.GetDoNotReturnImportErrors,
  uploadFile: DoNotReturn.UploadDoNotReturnFile,
  saveImportResult: DoNotReturn.SaveDoNotReturnImportResult,
  uploadFileSucceeded: { instance: DoNotReturn.UploadDoNotReturnFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: DoNotReturn.GetDoNotReturnImportTemplateSucceeded, fileName: 'dnr.xlsx' },
  importErrorsSucceeded: { instance: DoNotReturn.GetDoNotReturnImportErrorsSucceeded, fileName: 'dnr_errors.xlsx' },
  saveImportResultSucceeded: { instance: DoNotReturn.SaveDoNotReturnImportResultSucceeded, message: 'DoNotReturn were imported' },
};

@Component({
  selector: 'app-import-dnr',
  templateUrl: './import-dnr.component.html',
  styleUrls: ['./import-dnr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDnrComponent  extends AbstractImport implements OnChanges {

  public titleImport: string = 'Import DNR';
  public columnDefs: ColDef[] = [
    {
      field: 'firstName',
      width: 150,
      headerName: 'FirstName',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'middleName',
      width: 150,
      headerName: 'MiddleName',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'lastName',
      width: 200,
      headerName: 'LastName',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'regionBlocked',
      width: 200,
      headerName: 'Region Blocked',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'locationBlocked',
      width: 200,
      headerName: 'Location Blocked',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'email',
      width: 150,
      headerName: 'Email',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'facilityEmail',
      width: 150,
      headerName: 'Department Email',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'ssn',
      width: 200,
      headerName: 'SSN',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'currentStatus',
      width: 150,
      headerName: 'Current Status',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'lastUpdatedDate',
      width: 150,
      headerName: 'Last Updated Date',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'lastBlockedDate',
      width: 150,
      headerName: 'Last Blocked Date',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'lastUnBlockedDate',
      width: 150,
      headerName: 'Last UnBlocked Date',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'comment',
      width: 150,
      headerName: 'Comment',
      cellRenderer: GridErroredCellComponent,
    },
  ]


  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef
  ) {
    super(actions$, store, importConfig, cdr);
  }

  ngOnChanges(): void {
    
  }

}
