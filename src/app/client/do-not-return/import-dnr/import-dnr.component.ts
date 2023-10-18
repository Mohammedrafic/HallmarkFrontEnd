import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges } from '@angular/core';
import { Actions, Store } from '@ngxs/store';


import { DoNotReturn} from '@admin/store/donotreturn.actions';

import { AbstractImport } from '@shared/classes/abstract-import';
import { ColDef } from '@ag-grid-community/core';
import { GridErroredCellComponent } from '@shared/components/import-dialog-content/grid-errored-cell/grid-errored-cell.component';
import { GridErroredCellListComponent } from '@shared/components/import-dialog-content/grid-errored-cell-list/grid-errored-cell-list.component';

const importConfig = {
  importTemplate: DoNotReturn.GetDoNotReturnImportTemplate,
  importError: DoNotReturn.GetDoNotReturnImportErrors,
  uploadFile: DoNotReturn.UploadDoNotReturnFile,
  saveImportResult: DoNotReturn.SaveDoNotReturnImportResult,
  uploadFileSucceeded: { instance: DoNotReturn.UploadDoNotReturnFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: DoNotReturn.GetDoNotReturnImportTemplateSucceeded, fileName: 'donotreturn.xlsx' },
  importErrorsSucceeded: { instance: DoNotReturn.GetDoNotReturnImportErrorsSucceeded, fileName: 'donotreturn_errors.xlsx' },
  saveImportResultSucceeded: { instance: DoNotReturn.SaveDoNotReturnImportResultSucceeded, message: '<n> records successfully processed.' },
  saveImportResultFailAndSucess : { instance: DoNotReturn.SaveDoNotReturnImportResultFailAndSucceeded, message: '<sn> records successfully processed. <fn> failed to process.' }
};

@Component({
  selector: 'app-import-dnr',
  templateUrl: './import-dnr.component.html',
  styleUrls: ['./import-dnr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDnrComponent  extends AbstractImport implements OnChanges {

  public titleImport: string = 'Import DNR';
  public successColumnDefs: ColDef[] = [
    {
      field: 'orgName',
      width: 150,
      headerName: 'Organization Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'firstName',
      width: 150,
      headerName: 'First Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'middleName',
      width: 150,
      headerName: 'Middle Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'lastName',
      width: 200,
      headerName: 'Last Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'dateOfBirth',
      width: 150,
      headerName: 'Date Of Birth',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'maskedssn',
      width: 200,
      headerName: 'SSN',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'email',
      width: 150,
      headerName: 'Email',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'region',
      width: 200,
      headerName: 'Blocked Region Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'location',
      width: 200,
      headerName: 'Blocked Location Name',
      cellRenderer: GridErroredCellComponent,
    },
  ]

  public errorColumnDefs: ColDef[] = [
    {
      field: 'orgName',
      width: 150,
      headerName: 'Organization Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'firstName',
      width: 150,
      headerName: 'First Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'middleName',
      width: 150,
      headerName: 'Middle Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'lastName',
      width: 200,
      headerName: 'Last Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'dateOfBirth',
      width: 150,
      headerName: 'Date Of Birth',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'maskedssn',
      width: 200,
      headerName: 'SSN',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'email',
      width: 150,
      headerName: 'Email',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'region',
      width: 200,
      headerName: 'Blocked Region Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'location',
      width: 200,
      headerName: 'Blocked Location Name',
      cellRenderer: GridErroredCellComponent,
    },
    {
      field: 'errorDescriptions',
      resizable: true,
      autoHeight:true,
      suppressSizeToFit:true,
      headerName: 'Error Description',
      cellRenderer: GridErroredCellListComponent,
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
