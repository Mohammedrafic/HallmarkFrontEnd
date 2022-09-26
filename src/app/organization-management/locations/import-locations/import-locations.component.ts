import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';

import {
  GetLocationsImportErrors,
  GetLocationsImportErrorsSucceeded,
  GetLocationsImportTemplate,
  GetLocationsImportTemplateSucceeded,
  SaveLocationsImportResult,
  SaveLocationsImportResultSucceeded,
  UploadLocationsFile,
  UploadLocationsFileSucceeded,
} from '@organization-management/store/organization-management.actions';
import { ImportResult } from '@shared/models/import.model';
import { ImportedLocation } from '@shared/models/location.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { MessageTypes } from '@shared/enums/message-types';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { ShowToast } from 'src/app/store/app.actions';

@Component({
  selector: 'app-import-locations',
  templateUrl: './import-locations.component.html',
  styleUrls: ['./import-locations.component.scss'],
})
export class ImportLocationsComponent extends DestroyableDirective implements OnInit {
  @Input() public dialogEvent: Subject<boolean>;

  @Output() public reloadItemsList: EventEmitter<void> = new EventEmitter<void>();

  public selectErrorsTab: Subject<void> = new Subject<void>();
  public importResponse: ImportResult<ImportedLocation> | null;
  public titleImport: string = 'Import Locations';

  constructor(private actions$: Actions, private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnFileActions();
  }

  public downloadTemplate(): void {
    this.store.dispatch(new GetLocationsImportTemplate([]));
  }

  public downloadErrors(value: ImportedLocation[]): void {
    this.store.dispatch(new GetLocationsImportErrors(value));
  }

  public saveImportResult(value: ImportedLocation[]): void {
    this.store.dispatch(new SaveLocationsImportResult(value));
  }

  public uploadImportFile(file: Blob): void {
    this.store.dispatch(new UploadLocationsFile(file));
  }

  private subscribeOnFileActions(): void {
    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(UploadLocationsFileSucceeded))
      .subscribe((result: { payload: ImportResult<ImportedLocation> }) => {
        if (result.payload.succesfullRecords.length || result.payload.errorRecords.length) {
          this.importResponse = result.payload;
        } else {
          this.store.dispatch(new ShowToast(MessageTypes.Error, 'There are no records in the file'));
        }
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(GetLocationsImportTemplateSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'locations.xlsx');
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(GetLocationsImportErrorsSucceeded))
      .subscribe((file: { payload: Blob }) => {
        downloadBlobFile(file.payload, 'locations_errors.xlsx');
      });

    this.actions$
      .pipe(takeUntil(this.destroy$), ofActionSuccessful(SaveLocationsImportResultSucceeded))
      .subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, 'Locations were imported'));
        this.reloadItemsList.next();
        if (this.importResponse?.errorRecords.length) {
          this.selectErrorsTab.next();
        } else {
          this.dialogEvent.next(false);
        }
      });
  }
}
