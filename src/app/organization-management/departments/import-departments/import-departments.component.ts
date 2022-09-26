import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Actions, ofActionSuccessful, Store } from '@ngxs/store';

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
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { MessageTypes } from '@shared/enums/message-types';
import { ImportedDepartment } from '@shared/models/department.model';
import { ImportResult } from '@shared/models/import.model';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { Subject, takeUntil } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';

@Component({
  selector: 'app-import-departments',
  templateUrl: './import-departments.component.html',
  styleUrls: ['./import-departments.component.scss'],
})
export class ImportDepartmentsComponent extends DestroyableDirective implements OnInit {
  @Input() public dialogEvent: Subject<boolean>;

  @Output() public reloadItemsList: EventEmitter<void> = new EventEmitter<void>();

  public selectErrorsTab: Subject<void> = new Subject<void>();
  public importResponse: ImportResult<ImportedDepartment> | null;
  public titleImport: string = 'Import Departments';

  constructor(private actions$: Actions, private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnFileActions();
  }

  public downloadTemplate(): void {
    this.store.dispatch(new GetDepartmentsImportTemplate([]));
  }

  public downloadErrors(value: ImportedDepartment[]): void {
    this.store.dispatch(new GetDepartmentsImportErrors(value));
  }

  public saveImportResult(value: ImportedDepartment[]): void {
    this.store.dispatch(new SaveDepartmentsImportResult(value));
  }

  public uploadImportFile(file: Blob): void {
    this.store.dispatch(new UploadDepartmentsFile(file));
  }

  private subscribeOnFileActions(): void {
    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(UploadDepartmentsFileSucceeded))
      .subscribe((result: { payload: ImportResult<ImportedDepartment> }) => {
        if (result.payload.succesfullRecords.length || result.payload.errorRecords.length) {
          this.importResponse = result.payload;
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Error, 'There are no records in the file'));
        }
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(GetDepartmentsImportTemplateSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'departments.xlsx');
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(GetDepartmentsImportErrorsSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'departments_errors.xlsx');
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(SaveDepartmentsImportResultSucceeded))
      .subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, 'Departments were imported'));
        this.reloadItemsList.next();
        if (this.importResponse?.errorRecords.length) {
          this.selectErrorsTab.next();
        } else {
          this.dialogEvent.next(false);
        }
      });
  }
}
