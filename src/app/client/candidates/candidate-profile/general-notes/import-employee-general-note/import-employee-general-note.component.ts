import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractImport } from '@shared/classes/abstract-import';
import { recordsListField, selectionSettings } from '@client/order-management/components/order-import/order-import.config';
import { Actions, Store} from '@ngxs/store';
import { FieldSettingsModel,  SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {  ListBoxItem, OrderGrid } from '@shared/models/imported-order.model';
import { ImportedEmployeeGeneralNoteGrid } from '@shared/models/imported-employee';
import { ColDef } from '@ag-grid-community/core';
import { EmployeesGeneralNoteColumnsConfig, EmployeesGeneralNoteErrorColumnsConfig } from './employee-general-note.constants';
import { GetEmployeeGeneralNoteImportErrors, GetEmployeeGeneralNoteImportErrorsSucceeded, GetEmployeeGeneralNoteImportTemplate, GetEmployeeGeneralNoteImportTemplateSucceeded, SaveEmployeeGeneralNoteImportLogResult, SaveEmployeeGeneralNoteImportResultFailAndSucceeded, SaveEmployeeGeneralNoteImportResultSucceeded, UploadEmployeeGeneralNoteFile, UploadEmployeeGeneralNoteFileSucceeded } from '../general-notes.action';
const employeeGeneralNoteImportConfig = {
  importTemplate: GetEmployeeGeneralNoteImportTemplate,
  importError: GetEmployeeGeneralNoteImportErrors,
  uploadFile: UploadEmployeeGeneralNoteFile,
  saveImportResult:SaveEmployeeGeneralNoteImportLogResult,
  uploadFileSucceeded: { instance: UploadEmployeeGeneralNoteFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance:GetEmployeeGeneralNoteImportTemplateSucceeded, fileName: 'EmployeeGeneralNote.xlsx' },
  importErrorsSucceeded: { instance: GetEmployeeGeneralNoteImportErrorsSucceeded, fileName: 'EmployeeGeneralNote_errors.xlsx' },
  saveImportResultSucceeded: { instance: SaveEmployeeGeneralNoteImportResultSucceeded, message: '<n> records successfully processed.' },
  saveImportResultFailAndSucess : { instance: SaveEmployeeGeneralNoteImportResultFailAndSucceeded, message: '<sn> records successfully processed. <fn> records failed to process.' }
};

@Component({
  selector: 'app-import-employee-general-note',
  templateUrl: './import-employee-general-note.component.html',
  styleUrls: ['./import-employee-general-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportEmployeeGeneralNoteComponent extends AbstractImport {


  public readonly titleImport = 'Import Employees General Note';
  public readonly recordsListField: FieldSettingsModel = recordsListField;
  public readonly selectionSettings: SelectionSettingsModel = selectionSettings;
  public successListBox: ListBoxItem[];
  public errorListBox: ListBoxItem[];
  public errorGridList: ImportedEmployeeGeneralNoteGrid[] = [];
  public successGridList: ImportedEmployeeGeneralNoteGrid[] = [];
  public selectedIndex = 0;
  public dataSource: ImportedEmployeeGeneralNoteGrid[] = [];
  public activeErrorTab: boolean;
  
  public columnDefs: ColDef[] = EmployeesGeneralNoteColumnsConfig;
  public errorColumnDefs: ColDef[] = EmployeesGeneralNoteErrorColumnsConfig;


  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef,
  ) {
    super(actions$, store,employeeGeneralNoteImportConfig,cdr);
  }

  
  public trackByErrorHandler(index: number, grid: OrderGrid): string {
    return `error${grid.gridName ?? ''}${index}`;
  }

  public trackBySuccessHandler(index: number, grid: OrderGrid): string {
    return `success${grid.gridName ?? ''}${index}`;
  }


}
