import { CredentialStatus } from '@shared/enums/status';
import { CandidateImportRecord, CandidateImportResult } from '@shared/models/candidate-profile-import.model';
import { BulkVerifyCandidateCredential, CandidateCredential, CredentialRequestParams } from '@shared/models/candidate-credential.model';
import { Candidate, OrderManagementPagerState } from 'src/app/shared/models/candidate.model';
import { Education } from 'src/app/shared/models/education.model';
import { Experience } from 'src/app/shared/models/experience.model';

export class GetCandidatesByPage {
  static readonly type = '[candidate] Get Candidates by Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}

export class GetCandidateById {
  static readonly type = '[candidate] Get Candidate by ID';
  constructor(public payload: number) {}
}

export class GetCandidateByIdSucceeded {
  static readonly type = '[candidate] Get Candidate by ID Succeeded';
  constructor(public payload: Candidate) {}
}

export class SaveCandidate {
  static readonly type = '[candidate] Save Candidate';
  constructor(public payload: Candidate) {}
}

export class SaveCandidateSucceeded {
  static readonly type = '[candidate] Save Candidate Succeeded';
  constructor(public payload: Candidate) {}
}

export class RemoveCandidateFromStore {
  static readonly type = '[candidate] Remove Candidate From Store';
}

export class GetAllSkills {
  static readonly type = '[candidate] Get All Skills';
}

export class GetExperienceByCandidateId {
  static readonly type = '[candidate] Get Experience By Candidate Id';
}

export class SaveExperience {
  static readonly type = '[candidate] Save Experience';
  constructor(public payload: Experience) {}
}

export class SaveExperienceSucceeded {
  static readonly type = '[candidate] Save Experience Succeeded';
  constructor(public payload: Experience) {}
}

export class RemoveExperience {
  static readonly type = '[candidate] Remove Experience';
  constructor(public payload: Experience) {}
}

export class RemoveExperienceSucceeded {
  static readonly type = '[candidate] Remove Experience Succeeded';
}

export class GetEducationByCandidateId {
  static readonly type = '[candidate] Get Education By Candidate Id';
}

export class SaveEducation {
  static readonly type = '[candidate] Save Education';
  constructor(public payload: Education) {}
}

export class SaveEducationSucceeded {
  static readonly type = '[candidate] Save Education Succeeded';
  constructor(public payload: Education) {}
}

export class RemoveEducation {
  static readonly type = '[candidate] Remove Education';
  constructor(public payload: Education) {}
}

export class RemoveEducationSucceeded {
  static readonly type = '[candidate] Remove Education Succeeded';
}

export class UploadCandidatePhoto {
  static readonly type = '[candidate] Upload Candidate Photo';
  constructor(public file: Blob, public candidateProfileId: number, public isInitialUpload: boolean) {}
}

export class GetCandidatePhoto {
  static readonly type = '[candidate] Get Candidate Photo';
  constructor(public payload: number) {}
}

export class RemoveCandidatePhoto {
  static readonly type = '[candidate] Remove Candidate Photo';
  constructor(public payload: number) {}
}

export class GetCandidatePhotoSucceeded {
  static readonly type = '[candidate] Get Candidate Photo Succeeded';
  constructor(public payload: Blob) {}
}

export class GetCandidatesCredentialByPage {
  static readonly type = '[candidate] Get Candidates Credential by Page';
  constructor(public credentialRequestParams: CredentialRequestParams, public candidateProfileId: number) {}
}

export class ClearCandidatesCredentials {
  static readonly type = '[candidate] Clear Candidates Credentials';
  constructor() {}
}

export class GetMasterCredentials {
  static readonly type = '[candidate] Get Master Credentials by searchTerm and credentialTypeId';
  constructor(
    public searchTerm: string,
    public credentialTypeId: number | string,
    public orderId: number | null,
    public isIRP?: boolean,
  ) {}
}

export class GetCredentialStatuses {
  static readonly type = '[candidate] Get Credential Statuses';
  constructor(
    public readonly isOrganization: boolean,
    public readonly orderId: number | null,
    public readonly credentialStatus: CredentialStatus | null = null,
    public readonly credentialId: number | null = null,
  ) {}
}

export class GetCredentialStatusesSucceeded {
  static readonly type = '[candidate] Get Credential Statuses Succeeded';
  constructor(public statuses: CredentialStatus[]) {}
}

export class SaveCandidatesCredential {
  static readonly type = '[candidate] Save Candidates Credential';
  constructor(public payload: CandidateCredential) {}
}
export class VerifyCandidatesCredentials {
  static readonly type = '[candidate] Verify Candidates Credentials';
  constructor(public payload: BulkVerifyCandidateCredential) {}
}

export class SaveCandidatesCredentialSucceeded {
  static readonly type = '[candidate] Save Candidates Credential Succeeded';
  constructor(public payload: CandidateCredential) {}
}

export class SaveCandidatesCredentialFailed {
  static readonly type = '[candidate] Save Candidates Credential Failed';
}
export class VerifyCandidatesCredentialsSucceeded {
  static readonly type = '[candidate] Verify Candidates Credentials Succeeded';
  constructor(public payload: CandidateCredential[]) {}
}

export class VerifyCandidatesCredentialsFailed {
  static readonly type = '[candidate] Verify Candidates Credentials Failed';
}

export class RemoveCandidatesCredential {
  static readonly type = '[candidate] Remove Candidates Credential';
  constructor(public payload: CandidateCredential) {}
}

export class RemoveCandidatesCredentialSucceeded {
  static readonly type = '[candidate] Remove Candidates Credential Succeeded';
}

export class GetCredentialTypes {
  static readonly type = '[candidate] Get Credential Types';
}

export class UploadCredentialFiles {
  static readonly type = '[candidate] Upload Credential Files';
  constructor(public files: Blob[], public candidateCredentialId: number) {}
}

export class GetCredentialFiles {
  static readonly type = '[candidate] Get Credential Files';
  constructor(public payload: number) {}
}

export class GetCredentialPdfFiles {
  static readonly type = '[candidate] Get Credential PDF Files';
  constructor(public payload: number) {}
}

export class GetCredentialFilesSucceeded {
  static readonly type = '[candidate] Get Credential Files Succeeded';
  constructor(public payload: Blob) {}
}

export class GetCredentialPdfFilesSucceeded {
  static readonly type = '[candidate] Get Credential PDF Files Succeeded';
  constructor(public payload: Blob) {}
}

export class GetGroupedCredentialsFiles {
  static readonly type = '[candidate] Get Grouped Credentials Files';
  constructor(public candidateId: number) {}

}

export class UploadCredentialFilesSucceeded {
  static readonly type = '[candidate] Upload Credential Files Succeeded';
}

export class GetCandidateProfileTemplate {
  static readonly type = '[candidate] Get Candidate Profile Template';
}

export class GetCandidateProfileTemplateSucceeded {
  static readonly type = '[candidate] Get Candidate Profile Template Succeeded';
  constructor(public payload: Blob) {}
}

export class GetCandidateProfileErrors {
  static readonly type = '[candidate] Get Candidate Profile Errors';
  constructor(public payload: CandidateImportRecord[]) {}
}

export class GetCandidateProfileErrorsSucceeded {
  static readonly type = '[candidate] Get Candidate Profile Errors Succeeded';
  constructor(public payload: Blob) {}
}

export class UploadCandidateProfileFile {
  static readonly type = '[candidate] Upload Candidate Profile File';
  constructor(public payload: Blob) {}
}

export class UploadCandidateProfileFileSucceeded {
  static readonly type = '[candidate] Upload Candidate Profile File Succeeded';
  constructor(public payload: CandidateImportResult) {}
}

export class SaveCandidateImportResult {
  static readonly type = '[candidate] Save Candidate Import Result';
  constructor(public payload: CandidateImportRecord[]) {}
}

export class SaveCandidateImportResultSucceeded {
  static readonly type = '[candidate] Save Candidate Import Result Succeeded';
  constructor(public payload: CandidateImportResult) {}
}

export class DownloadCredentialFiles {
  static readonly type = '[candidate] Download Credential Files';
  constructor(public candidateProfileId: number, public candidateCredentialFileIds: number[], public candidateName?: string) {}
}

export class DownloadCredentialFilesSucceeded {
  static readonly type = '[candidate] Download Credential Files Succeeded';
  constructor(public file: Blob, public candidateName: string) {}
}

export class SetOrderManagementPagerState {
  static readonly type = '[candidate] Set Order Management Grid State';
  constructor(public state: OrderManagementPagerState | null) {}
}
