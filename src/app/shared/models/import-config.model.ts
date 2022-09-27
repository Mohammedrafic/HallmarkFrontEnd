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
  UploadLocationsFile,
} from '@organization-management/store/organization-management.actions';
import { ActionType } from '@ngxs/store';

type ImportTemplates =
  | typeof GetLocationsImportTemplate
  | typeof GetDepartmentsImportTemplate
  | typeof GetBillRatesImportTemplate;
type ImportErrors =
  | typeof GetLocationsImportErrors
  | typeof GetDepartmentsImportErrors
  | typeof GetBillRatesImportErrors;
type SaveImportResult =
  | typeof SaveLocationsImportResult
  | typeof SaveDepartmentsImportResult
  | typeof SaveBillRatesImportResult;
type UploadFile = typeof UploadLocationsFile | typeof UploadDepartmentsFile | typeof UploadBillRatesFile;
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
