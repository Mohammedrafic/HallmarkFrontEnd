import { ColDef } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component } from '@angular/core';

import { Actions, Store } from '@ngxs/store';

import {
  GetDepartmentsImportErrors,
  GetDepartmentsImportErrorsSucceeded,
  GetDepartmentsImportTemplate,
  GetDepartmentsImportTemplateSucceeded,
  SaveDepartmentsImportResult,
  SaveDepartmentsImportResultSucceeded,
  UploadDepartmentsFile,
  UploadDepartmentsFileSucceeded,
} from '@organization-management/store/organization-management.actions';
import { AbstractImport } from '@shared/classes/abstract-import';
import { departmentsColumns } from './departments-grid.constants';

const importConfig = {
  importTemplate: GetDepartmentsImportTemplate,
  importError: GetDepartmentsImportErrors,
  uploadFile: UploadDepartmentsFile,
  saveImportResult: SaveDepartmentsImportResult,
  uploadFileSucceeded: { instance: UploadDepartmentsFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: GetDepartmentsImportTemplateSucceeded, fileName: 'departments.xlsx' },
  importErrorsSucceeded: { instance: GetDepartmentsImportErrorsSucceeded, fileName: 'departments_errors.xlsx' },
  saveImportResultSucceeded: { instance: SaveDepartmentsImportResultSucceeded, message: 'Departments were imported' },
};

@Component({
  selector: 'app-import-departments',
  templateUrl: './import-departments.component.html',
  styleUrls: ['./import-departments.component.scss'],
})
export class ImportDepartmentsComponent extends AbstractImport {
  public readonly columnDefs: ColDef[] = departmentsColumns;
  public titleImport: string = 'Import Departments';

  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef
  ) {
    super(actions$, store, importConfig, cdr);
  }
}
