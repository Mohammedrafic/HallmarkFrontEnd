import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { DoNotReturn } from '@admin/store/donotreturn.actions';

import { AbstractImport } from '@shared/classes/abstract-import';

const importConfig = {
  importTemplate: DoNotReturn.GetDoNotReturnImportTemplate,
  importError: DoNotReturn.GetDoNotReturnImportErrors,
  uploadFile: DoNotReturn.UploadDoNotReturnFile,
  saveImportResult: DoNotReturn.SaveDoNotReturnImportResult,
  uploadFileSucceeded: { instance: DoNotReturn.UploadDoNotReturnsFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: DoNotReturn.GetDoNotReturnImportTemplateSucceeded, fileName: 'departments.xlsx' },
  importErrorsSucceeded: { instance: DoNotReturn.GetDoNotReturnImportErrorsSucceeded, fileName: 'departments_errors.xlsx' },
  saveImportResultSucceeded: { instance: DoNotReturn.SaveDoNotReturnImportResultSucceeded, message: 'Departments were imported' },
};

@Component({
  selector: 'app-import-dnr',
  templateUrl: './import-dnr.component.html',
  styleUrls: ['./import-dnr.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDnrComponent  extends AbstractImport implements OnInit {

  public titleImport: string = 'Import DNR';

  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef
  ) {
    super(actions$, store, importConfig, cdr);
  }

  override ngOnInit(): void {
    
  }

}
