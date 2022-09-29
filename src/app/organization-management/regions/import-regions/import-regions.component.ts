import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';

import {

  GetRegionsImportErrors,
  GetRegionsImportErrorsSucceeded,
  GetRegionsImportTemplate,
  GetRegionsImportTemplateSucceeded,
  SaveRegionsImportResult,
  SaveRegionsImportResultSucceeded,
  UploadRegionsFile,
  UploadRegionsFileSucceeded,
} from '@organization-management/store/organization-management.actions';
import { ImportResult } from '@shared/models/import.model';
import { ImportedRegion } from '@shared/models/region.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { MessageTypes } from '@shared/enums/message-types';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { ShowToast } from 'src/app/store/app.actions';

@Component({
  selector: 'app-import-regions',
  templateUrl: './import-regions.component.html',
  styleUrls: ['./import-regions.component.scss']
})
export class ImportRegionsComponent extends DestroyableDirective implements OnInit {
  @Input() public dialogEvent: Subject<boolean>;

  @Output() public reloadItemsList: EventEmitter<void> = new EventEmitter<void>();

  public selectErrorsTab: Subject<void> = new Subject<void>();
  public importResponse: ImportResult<ImportedRegion> | null;
  public titleImport: string = 'Import Region';

  constructor(private actions$: Actions, private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnFileActions();
  }

  public downloadTemplate(): void {
    this.store.dispatch(new GetRegionsImportTemplate([]));
  }

  public downloadErrors(value: ImportedRegion[]): void {
    this.store.dispatch(new GetRegionsImportErrors(value));
  }

  public saveImportResult(value: ImportedRegion[]): void {
    this.store.dispatch(new SaveRegionsImportResult(value));
  }

  public uploadImportFile(file: Blob): void {
    this.store.dispatch(new UploadRegionsFile(file));
  }

  private subscribeOnFileActions(): void {
    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(UploadRegionsFileSucceeded))
      .subscribe((result: { payload: ImportResult<ImportedRegion> }) => {
        if (result.payload.succesfullRecords.length || result.payload.errorRecords.length) {
          this.importResponse = result.payload;
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Error, 'There are no records in the file'));
        }
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(GetRegionsImportTemplateSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'Region.xlsx');
      });

    this.actions$ 
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(GetRegionsImportErrorsSucceeded))  
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'Regions_errors.xlsx');
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(SaveRegionsImportResultSucceeded))
      .subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, 'Regions were imported'));
        this.reloadItemsList.next();
        if (this.importResponse?.errorRecords.length) {
          this.selectErrorsTab.next();
        } else {
          this.dialogEvent.next(false);
        }
      });
  }
}
