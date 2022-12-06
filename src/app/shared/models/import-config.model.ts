import {
  GetBillRatesImportErrors,
  GetBillRatesImportTemplate,
  GetDepartmentsImportErrors,
  GetDepartmentsImportTemplate,
  GetLocationsImportErrors,
  GetLocationsImportTemplate,
  SaveBillRatesImportResult,
  SaveDepartmentsImportResult,
  SaveLocationsImportResult,
  UploadBillRatesFile,
  UploadDepartmentsFile,
  UploadLocationsFile
} from '@organization-management/store/organization-management.actions';
import { ActionType } from '@ngxs/store';
import {
  GetOrderImportErrors,
  GetOrderImportTemplate,
  SaveOrderImportResult,
  UploadOrderImportFile
} from '@client/store/order-managment-content.actions';

type ImportTemplates =
  | typeof GetLocationsImportTemplate
  | typeof GetDepartmentsImportTemplate
  | typeof GetBillRatesImportTemplate
  | typeof GetOrderImportTemplate;
type ImportErrors =
  | typeof GetLocationsImportErrors
  | typeof GetDepartmentsImportErrors
  | typeof GetBillRatesImportErrors
  | typeof GetOrderImportErrors;
type SaveImportResult =
  | typeof SaveLocationsImportResult
  | typeof SaveDepartmentsImportResult
  | typeof SaveBillRatesImportResult
  | typeof SaveOrderImportResult;
type UploadFile =
  | typeof UploadLocationsFile
  | typeof UploadDepartmentsFile
  | typeof UploadBillRatesFile
  | typeof UploadOrderImportFile;
type UploadFileSucceeded = { instance: ActionType; message: string };
type ImportErrorsSucceeded = { instance: ActionType; fileName: string };
type ImportTemplatesSucceeded = ImportErrorsSucceeded;
type saveImportResultSucceeded = UploadFileSucceeded;

export interface ImportConfigModel {
  importTemplate: ImportTemplates;
  importError: ImportErrors;
  saveImportResult: SaveImportResult;
  uploadFile: UploadFile;
  uploadFileSucceeded: UploadFileSucceeded;
  importTemplateSucceeded: ImportTemplatesSucceeded;
  importErrorsSucceeded: ImportErrorsSucceeded;
  saveImportResultSucceeded: saveImportResultSucceeded;
}
