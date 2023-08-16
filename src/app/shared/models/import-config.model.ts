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
import { DoNotReturn } from '@admin/store/donotreturn.actions';
import { GetEmployeeImportErrors, GetEmployeeImportTemplate, SaveEmployeeImportResult, SaveEmployeeImportResultSucceeded, UploadEmployeeFile } from '@shared/components/candidate-list/store/candidate-list.actions';

type ImportTemplates =
  | typeof GetLocationsImportTemplate
  | typeof GetDepartmentsImportTemplate
  | typeof GetBillRatesImportTemplate
  | typeof GetOrderImportTemplate
  | typeof DoNotReturn.GetDoNotReturnImportTemplate
  | typeof GetEmployeeImportTemplate;
type ImportErrors =
  | typeof GetLocationsImportErrors
  | typeof GetDepartmentsImportErrors
  | typeof GetBillRatesImportErrors
  | typeof GetOrderImportErrors
  | typeof DoNotReturn.GetDoNotReturnImportErrors
  | typeof GetEmployeeImportErrors;
type SaveImportResult =
  | typeof SaveLocationsImportResult
  | typeof SaveDepartmentsImportResult
  | typeof SaveBillRatesImportResult
  | typeof SaveOrderImportResult
  | typeof DoNotReturn.SaveDoNotReturnImportResult
  | typeof SaveEmployeeImportResult;
type UploadFile =
  | typeof UploadLocationsFile
  | typeof UploadDepartmentsFile
  | typeof UploadBillRatesFile
  | typeof UploadOrderImportFile
  | typeof DoNotReturn.UploadDoNotReturnFile
  | typeof UploadEmployeeFile;
type UploadFileSucceeded = { instance: ActionType; message: string };
type ImportErrorsSucceeded = { instance: ActionType; fileName: string };
type ImportTemplatesSucceeded = ImportErrorsSucceeded;
type saveImportResultSucceeded = UploadFileSucceeded;
type saveImportResultFailAndSucess = { instance: ActionType; message: string };

export interface ImportConfigModel {
  importTemplate: ImportTemplates;
  importError: ImportErrors;
  saveImportResult: SaveImportResult;
  uploadFile: UploadFile;
  uploadFileSucceeded: UploadFileSucceeded;
  importTemplateSucceeded: ImportTemplatesSucceeded;
  importErrorsSucceeded: ImportErrorsSucceeded;
  saveImportResultSucceeded: saveImportResultSucceeded;
  saveImportResultFailAndSucess ?: saveImportResultFailAndSucess;
}
