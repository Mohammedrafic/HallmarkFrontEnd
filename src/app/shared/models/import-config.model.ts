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
import { GetEmployeeImportErrors, GetEmployeeImportTemplate, SaveEmployeeImportLogResult, SaveEmployeeImportResult, SaveEmployeeImportResultSucceeded, UploadEmployeeFile } from '@shared/components/candidate-list/store/candidate-list.actions';
import { GetEmployeeGeneralNoteImportErrors, GetEmployeeGeneralNoteImportTemplate, SaveEmployeeGeneralNoteImportLogResult, UploadEmployeeGeneralNoteFile } from '@client/candidates/candidate-profile/general-notes/general-notes.action';

type ImportTemplates =
  | typeof GetLocationsImportTemplate
  | typeof GetDepartmentsImportTemplate
  | typeof GetBillRatesImportTemplate
  | typeof GetOrderImportTemplate
  | typeof DoNotReturn.GetDoNotReturnImportTemplate
  | typeof GetEmployeeImportTemplate
  |typeof GetEmployeeGeneralNoteImportTemplate;
type ImportErrors =
  | typeof GetLocationsImportErrors
  | typeof GetDepartmentsImportErrors
  | typeof GetBillRatesImportErrors
  | typeof GetOrderImportErrors
  | typeof DoNotReturn.GetDoNotReturnImportErrors
  | typeof GetEmployeeImportErrors
  | typeof GetEmployeeGeneralNoteImportErrors;
type SaveImportResult =
  | typeof SaveLocationsImportResult
  | typeof SaveDepartmentsImportResult
  | typeof SaveBillRatesImportResult
  | typeof SaveOrderImportResult
  | typeof DoNotReturn.SaveDoNotReturnImportResult
  | typeof SaveEmployeeImportLogResult
  |typeof SaveEmployeeGeneralNoteImportLogResult;
type UploadFile =
  | typeof UploadLocationsFile
  | typeof UploadDepartmentsFile
  | typeof UploadBillRatesFile
  | typeof UploadOrderImportFile
  | typeof DoNotReturn.UploadDoNotReturnFile
  | typeof UploadEmployeeFile
  | typeof UploadEmployeeGeneralNoteFile;
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
