/* eslint-disable max-len */
import { ColDef } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';

import { Actions, Store, ofActionSuccessful } from '@ngxs/store';

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
import { DepartmentsColumns } from './departments-grid.constants';
import { AppState } from '../../../store/app.state';
import { takeUntil } from 'rxjs';
import { ImportResult } from '@shared/models/import.model';
import { ImportedLocation } from '@shared/models/location.model';
import { ImportedDepartment } from '@shared/models/department.model';
import { ImportedOrder } from '@shared/models/imported-order.model';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { N_FAILED_RECORDS, N_SUCCESS_RECORDS } from '@shared/constants';
import { DepartmentService } from '../services/department.service';

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
export class ImportDepartmentsComponent extends AbstractImport implements OnChanges {
  @Input() isOrgUseIRPAndVMS = false;
  @Input() isInvoiceDepartmentIdFieldShow = false;

  public columnDefs: ColDef[];
  public titleImport: string = 'Import Departments';

  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef,
    private departmentsService: DepartmentService,
  ) {
    super(actions$, store, importConfig, cdr);
  }

  override ngOnInit(): void {
    this.subscribeOnFileActions();
  }

  ngOnChanges(): void {
    this.columnDefs = DepartmentsColumns(
      this.store.selectSnapshot(AppState.isIrpFlagEnabled) && this.isOrgUseIRPAndVMS,
      this.isInvoiceDepartmentIdFieldShow,
      null,
    );
  }

  override subscribeOnFileActions(): void {
    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(this.action.uploadFileSucceeded.instance))
      .subscribe((result: { payload: ImportResult<ImportedLocation & ImportedDepartment & ImportedOrder> }) => {
        if (result.payload.succesfullRecords.length || result.payload.errorRecords.length) {
          this.columnDefs = DepartmentsColumns(
            this.store.selectSnapshot(AppState.isIrpFlagEnabled) && this.isOrgUseIRPAndVMS,
            this.isInvoiceDepartmentIdFieldShow,
            result.payload,
          );

          this.importResponse = this.departmentsService.prepareImportRecordsWithSkills(result.payload);
          this.cdr.markForCheck();
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Error, this.action.uploadFileSucceeded.message));
        }
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(this.action.importTemplateSucceeded.instance))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, this.action.importTemplateSucceeded.fileName);
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(this.action.importErrorsSucceeded.instance))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, this.action.importErrorsSucceeded.fileName);
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(this.action.saveImportResultSucceeded.instance))
      .subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, this.action.saveImportResultSucceeded.message));
        this.reloadItemsList.next();
        if (this.importResponse?.errorRecords.length) {
          this.selectErrorsTab.next();
        } else {
          this.dialogEvent.next(false);
        }
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(this.action?.saveImportResultFailAndSucess ? this.action?.saveImportResultFailAndSucess?.instance : this.action.saveImportResultSucceeded.instance))
      .subscribe((result: { payload: ImportResult<any> }) => {
        if ((result.payload.succesfullRecords.length || result.payload.errorRecords.length) && this.action?.saveImportResultFailAndSucess?.instance) {
          if (result.payload?.succesfullRecords.length > 0 && result.payload?.errorRecords.length > 0) {
            let message = this.action?.saveImportResultFailAndSucess ? this.action?.saveImportResultFailAndSucess?.message : '';
            message = message.replace('<sn>', result.payload?.succesfullRecords.length.toString());
            message = message.replace('<fn>', result.payload?.errorRecords.length.toString())
            this.store.dispatch(new ShowToast(MessageTypes.Error, message));
            this.reloadItemsList.next();
          } else if (result.payload?.succesfullRecords.length) {
            this.store.dispatch(new ShowToast(MessageTypes.Success, N_SUCCESS_RECORDS(result.payload?.succesfullRecords.length)));
            this.reloadItemsList.next();
          } else {
            this.store.dispatch(new ShowToast(MessageTypes.Error, N_FAILED_RECORDS(result.payload?.errorRecords.length)));
          }
          if (result.payload?.errorRecords.length) {
            this.selectErrorsTab.next();
          } else {
            this.dialogEvent.next(false);
          }
        }
      });
  }
}
