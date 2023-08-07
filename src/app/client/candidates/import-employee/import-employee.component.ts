import { Component, ChangeDetectionStrategy, ChangeDetectorRef,  OnChanges } from '@angular/core';
import { recordsListField, selectionSettings } from '@client/order-management/components/order-import/order-import.config';
import { Actions, Store} from '@ngxs/store';
import { AbstractImport } from '@shared/classes/abstract-import';
import { ImportedEmployeeGrid } from '@shared/models/imported-employee';
import {  ListBoxItem, OrderGrid } from '@shared/models/imported-order.model';
import { FieldSettingsModel,  SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GetEmployeeImportErrors, GetEmployeeImportErrorsSucceeded, GetEmployeeImportTemplate, GetEmployeeImportTemplateSucceeded, SaveEmployeeImportResult, SaveEmployeeImportResultFailAndSucceeded, SaveEmployeeImportResultSucceeded, UploadEmployeeFile, UploadEmployeeFileSucceeded } from '@shared/components/candidate-list/store/candidate-list.actions';
import { ColDef } from '@ag-grid-community/core';
import { EmployeesColumnsConfig } from './employee-grid.constants';

const employeeImportConfig = {
  importTemplate: GetEmployeeImportTemplate,
  importError: GetEmployeeImportErrors,
  uploadFile: UploadEmployeeFile,
  saveImportResult:SaveEmployeeImportResult,
  uploadFileSucceeded: { instance: UploadEmployeeFileSucceeded, message: 'There are no records in the file' },
  importTemplateSucceeded: { instance:GetEmployeeImportTemplateSucceeded, fileName: 'employee.xlsx' },
  importErrorsSucceeded: { instance: GetEmployeeImportErrorsSucceeded, fileName: 'employee_errors.xlsx' },
  saveImportResultSucceeded: { instance: SaveEmployeeImportResultSucceeded, message: '<n> records successfully processed.' },
  saveImportResultFailAndSucess : { instance: SaveEmployeeImportResultFailAndSucceeded, message: '<sn> records successfully processed. <fn> failed to process.' }
};

@Component({
  selector: 'app-import-employee',
  templateUrl: './import-employee.component.html',
  styleUrls: ['./import-employee.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportEmployeeComponent  extends AbstractImport  {

  public readonly titleImport = 'Import Employees';
  public readonly recordsListField: FieldSettingsModel = recordsListField;
  public readonly selectionSettings: SelectionSettingsModel = selectionSettings;
  public successListBox: ListBoxItem[];
  public errorListBox: ListBoxItem[];
  public errorGridList: ImportedEmployeeGrid[] = [];
  public successGridList: ImportedEmployeeGrid[] = [];
  public selectedIndex = 0;
  public dataSource: ImportedEmployeeGrid[] = [];
  public activeErrorTab: boolean;
  
  public columnDefs: ColDef[] = EmployeesColumnsConfig;


  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef,
  ) {
    super(actions$, store,employeeImportConfig,cdr);
  }

  
 

  public trackByErrorHandler(index: number, grid: OrderGrid): string {
    return `error${grid.gridName ?? ''}${index}`;
  }

  public trackBySuccessHandler(index: number, grid: OrderGrid): string {
    return `success${grid.gridName ?? ''}${index}`;
  }

 
}