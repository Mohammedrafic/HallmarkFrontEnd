import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractImport } from '@shared/classes/abstract-import';
import { Actions, Store } from '@ngxs/store';
import {
  GetBillRatesImportErrors,
  GetBillRatesImportErrorsSucceeded,
  GetBillRatesImportTemplate,
  GetBillRatesImportTemplateSucceeded,
  SaveBillRatesImportResult,
  SaveBillRatesImportResultSucceeded,
  UploadBillRatesFile,
  UploadBillRatesFileSucceeded,
} from '@organization-management/store/organization-management.actions';
import { billRatesColumns } from '@organization-management/bill-rates/import-bill-rates/bill-rates-grid.constants';

const importConfig = {
  importTemplate: GetBillRatesImportTemplate,
  importError: GetBillRatesImportErrors,
  uploadFile: UploadBillRatesFile,
  saveImportResult: SaveBillRatesImportResult,
  uploadFileSucceeded: { instance: UploadBillRatesFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance: GetBillRatesImportTemplateSucceeded, fileName: 'bill_rates.xlsx' },
  importErrorsSucceeded: { instance: GetBillRatesImportErrorsSucceeded, fileName: 'bill_rates_errors.xlsx' },
  saveImportResultSucceeded: { instance: SaveBillRatesImportResultSucceeded, message: 'Bill rates were imported' },
};

@Component({
  selector: 'app-import-bill-rates',
  templateUrl: './import-bill-rates.component.html',
  styleUrls: ['./import-bill-rates.component.scss'],
})
export class ImportBillRatesComponent extends AbstractImport {
  public readonly columnDefs = billRatesColumns;

  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef
  ) {
    super(actions$, store, importConfig, cdr);
  }
}
