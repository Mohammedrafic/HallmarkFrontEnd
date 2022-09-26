import { ColDef } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component } from '@angular/core';

import { Actions, Store } from '@ngxs/store';

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
import { AbstractImport } from '@shared/classes/abstract-import';
import { locationsColumns } from './location-grid.constants';

const importConfig = {
  importTemplate: GetLocationsImportTemplate,
  importError: GetLocationsImportErrors,
  uploadFile: UploadLocationsFile,
  saveImportResult: SaveLocationsImportResult,
  uploadFileSucceeded: { instance: UploadLocationsFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: GetLocationsImportTemplateSucceeded, fileName: 'locations.xlsx' },
  importErrorsSucceeded: { instance: GetLocationsImportErrorsSucceeded, fileName: 'locations_errors.xlsx' },
  saveImportResultSucceeded: { instance: SaveLocationsImportResultSucceeded, message: 'Locations were imported' },
};

@Component({
  selector: 'app-import-locations',
  templateUrl: './import-locations.component.html',
  styleUrls: ['./import-locations.component.scss'],
})
export class ImportLocationsComponent extends AbstractImport {
  public readonly columnDefs: ColDef[] = locationsColumns;
  public titleImport: string = 'Import Locations';

  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef
  ) {
    super(actions$, store, importConfig, cdr);
  }
}
