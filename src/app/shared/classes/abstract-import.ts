import { ChangeDetectorRef, Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ImportResult } from '@shared/models/import.model';
import { ImportedLocation } from '@shared/models/location.model';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ImportConfigModel } from '@shared/models/import-config.model';
import { ImportedDepartment } from '@shared/models/department.model';
import { ImportedBillRate } from '@shared/models';

@Directive()
export abstract class AbstractImport extends DestroyableDirective implements OnInit {
  @Input() public dialogEvent: Subject<boolean>;

  @Output() public reloadItemsList: EventEmitter<void> = new EventEmitter<void>();

  public selectErrorsTab: Subject<void> = new Subject<void>();

  public importResponse: ImportResult<ImportedLocation & ImportedDepartment> | null;

  protected constructor(
    protected actions$: Actions,
    protected store: Store,
    protected action: ImportConfigModel,
    protected cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnFileActions();
  }

  public downloadTemplate(): void {
    this.store.dispatch(new this.action.importTemplate([]));
  }

  public downloadErrors(value: ImportedLocation[] & ImportedDepartment[] & ImportedBillRate[]): void {
    this.store.dispatch(new this.action.importError(value));
  }

  public saveImportResult(value: ImportedLocation[] & ImportedDepartment[] & ImportedBillRate[]): void {
    this.store.dispatch(new this.action.saveImportResult(value));
  }

  public uploadImportFile(file: Blob): void {
    this.store.dispatch(new this.action.uploadFile(file));
  }

  private subscribeOnFileActions(): void {
    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(this.action.uploadFileSucceeded.instance))
      .subscribe((result: { payload: ImportResult<ImportedLocation & ImportedDepartment> }) => {
        if (result.payload.succesfullRecords.length || result.payload.errorRecords.length) {
          this.importResponse = result.payload;
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
  }
}
