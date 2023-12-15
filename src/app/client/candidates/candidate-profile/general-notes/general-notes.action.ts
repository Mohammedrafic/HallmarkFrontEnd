import { ExportPayload } from "@shared/models/export.model";
import { ImportResult } from "@shared/models/import.model";
import { EmployeeGeneralImportSaveResult, EmployeeGeneralNoteImportDto } from "@shared/models/imported-employee";

export class ExportGeneralNote {
    static readonly type = '[admin] Export General Note';
    constructor(public payload: ExportPayload) { }
  }

  export class GetEmployeeGeneralNoteImportTemplate {
    static readonly type = '[general note] Get Employee General Note Import Template';
    constructor(public payload: EmployeeGeneralNoteImportDto[]) {}
  }
  export class GetEmployeeGeneralNoteImportTemplateSucceeded {
    static readonly type = '[general note] Get Employee General Note Import Template Succeeded';
    constructor(public payload: Blob) {}
  }
  
  export class GetEmployeeGeneralNoteImportErrors {
    static readonly type = '[general note] Get Employee General Note Import Errors';
    constructor(public errorpayload: EmployeeGeneralNoteImportDto[]) {}
  }
  
  export class GetEmployeeGeneralNoteImportErrorsSucceeded {
    static readonly type = '[general note] Get Employee General Note Import Errors Succeeded';
    constructor(public payload: Blob) {}
  }
  
  export class UploadEmployeeGeneralNoteFile {
    static readonly type = '[general note] Upload Employee General Note File';
    constructor(public payload: Blob) {}
  }
  
  export class UploadEmployeeGeneralNoteFileSucceeded {
    static readonly type = '[general note] Upload Employee General Note File Succeeded';
    constructor(public payload: ImportResult<any>) {}
  }
  
  export class SaveEmployeeGeneralNoteImportResult {
    static readonly type = '[general note] Save Employee General Note Import Result';
    constructor(public payload: any) {}
  }
  
  export class SaveEmployeeGeneralNoteImportResultSucceeded {
    static readonly type = '[general note] Save Employee General Note Import Result Succeeded';
    constructor(public payload: ImportResult<any>) {}
  }
  
  export class SaveEmployeeGeneralNoteImportResultFailAndSucceeded {
    static readonly type = '[general note] Upload Employee General Note Import Result Fail And Success';
    constructor(public payload: ImportResult<any>) {}
  }
  export class SaveEmployeeGeneralNoteImportLogResult {
    static readonly type = '[general note] Save Employee General Note Import Result';
    constructor(public payload:EmployeeGeneralImportSaveResult) {}
  }