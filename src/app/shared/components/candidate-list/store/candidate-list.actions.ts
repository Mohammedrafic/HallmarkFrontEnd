import { ImportResult } from '@shared/models/import.model';
import { CandidateListExport, CandidateListRequest, CandidateListTableState } from '../types/candidate-list.model';
import { CandidateStatus } from '@shared/enums/status';
import { EmployeeImportDto, ImportedEmployee } from '@shared/models/imported-employee';

export class GetCandidatesByPage {
  static readonly type = '[candidate-list] Get Candidates List';
  constructor(public payload: CandidateListRequest) {}
}

export class GetIRPCandidatesByPage {
  static readonly type = '[candidate-list] Get IRP Candidates List';
  constructor(public payload: CandidateListRequest) {}
}

export class ExportIRPCandidateList {
  static readonly type = '[candidate list] Export IRP Candidate (Employee) List';
  constructor(public payload: CandidateListExport) {}
}

export class GetAllSkills {
  static readonly type = '[candidate-list] Get All Skills';
}

export class ChangeCandidateProfileStatus {
  static readonly type = '[candidate-list] Change Candidate Profile Status';
  constructor(public candidateProfileId: number, public profileStatus: CandidateStatus) {}
}

export class ExportCandidateList {
  static readonly type = '[candidate list] Export Candidate List';
  constructor(public payload: CandidateListExport) {}
}

export class GetRegionList {
  static readonly type = '[candidate list] Get Region List';
}

export class DeleteIRPCandidate {
  static readonly type = '[candidate list] Delete IRP Candidate';
  constructor(public id: number) {}

}

export class SetTableState {
  static readonly type = '[candidate list] Set candidates table state';

  constructor(public readonly candidatesTableState: CandidateListTableState) {}
}

export class ClearTableState {
  static readonly type = '[candidate list] Clear candidates table state';
}


export class GetEmployeeImportTemplate {
  static readonly type = '[candidate list] Get Employee Import Template';
  constructor(public payload: EmployeeImportDto[]) {}
}

export class GetEmployeeImportTemplateSucceeded {
  static readonly type = '[candidate list] Get Employee Import Template Succeeded';
  constructor(public payload: Blob) {}
}

export class GetEmployeeImportErrors {
  static readonly type = '[candidate list] Get Employee Import Errors';
  constructor(public errorpayload: EmployeeImportDto[]) {}
}

export class GetEmployeeImportErrorsSucceeded {
  static readonly type = '[candidate list] Get Employee Import Errors Succeeded';
  constructor(public payload: Blob) {}
}

export class UploadEmployeeFile {
  static readonly type = '[candidate list] Upload Employee File';
  constructor(public payload: Blob) {}
}

export class UploadEmployeeFileSucceeded {
  static readonly type = '[candidate list] Upload Employee File Succeeded';
  constructor(public payload: ImportResult<any>) {}
}

export class SaveEmployeeImportResult {
  static readonly type = '[candidate list] Save Employee Import Result';
  constructor(public payload: any) {}
}

export class SaveEmployeeImportResultSucceeded {
  static readonly type = '[candidate list] Save Employee Import Result Succeeded';
  constructor(public payload: ImportResult<any>) {}
}

export class SaveEmployeeImportResultFailAndSucceeded {
  static readonly type = '[candidate list] Upload Employee Import Result Fail And Success';
  constructor(public payload: ImportResult<any>) {}
}
export class GetCredentialsTypeList {
  static readonly type = '[candidate list] Get Credential Types List';
}

export class SourceConfig{
  static readonly type ='[candidate list] Get Sourcing Config';
}
