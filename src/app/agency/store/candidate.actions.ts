import { CandidateCredential } from "@shared/models/candidate-credential.model";
import { Candidate } from "src/app/shared/models/candidate.model";
import { Education } from "src/app/shared/models/education.model";
import { Experience } from "src/app/shared/models/experience.model";

export class GetCandidatesByPage {
  static readonly type = '[candidate] Get Candidates by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class GetCandidateById {
  static readonly type = '[candidate] Get Candidate by ID';
  constructor(public payload: number) { }
}

export class GetCandidateByIdSucceeded {
  static readonly type = '[candidate] Get Candidate by ID Succeeded';
  constructor(public payload: Candidate) { }
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
  constructor() {}
}


export class GetAllSkills {
  static readonly type = '[candidate] Get All Skills';
  constructor() {}
}

export class GetExperienceByCandidateId {
  static readonly type = '[candidate] Get Experience By Candidate Id';
  constructor() {}
}

export class SaveExperience {
  static readonly type = '[candidate] Save Experience';
  constructor(public payload: Experience) { }
}

export class SaveExperienceSucceeded {
  static readonly type = '[candidate] Save Experience Succeeded';
  constructor(public payload: Experience) { }
}

export class RemoveExperience {
  static readonly type = '[candidate] Remove Experience';
  constructor(public payload: Experience) { }
}

export class RemoveExperienceSucceeded {
  static readonly type = '[candidate] Remove Experience Succeeded';
  constructor() { }
}

export class GetEducationByCandidateId {
  static readonly type = '[candidate] Get Education By Candidate Id';
  constructor() {}
}

export class SaveEducation {
  static readonly type = '[candidate] Save Education';
  constructor(public payload: Education) { }
}

export class SaveEducationSucceeded {
  static readonly type = '[candidate] Save Education Succeeded';
  constructor(public payload: Education) { }
}

export class RemoveEducation {
  static readonly type = '[candidate] Remove Education';
  constructor(public payload: Education) { }
}

export class RemoveEducationSucceeded {
  static readonly type = '[candidate] Remove Education Succeeded';
  constructor() { }
}

export class UploadCandidatePhoto {
  static readonly type = '[candidate] Upload Candidate Photo';
  constructor(public file: Blob, public candidateProfileId: number) { }
}

export class GetCandidatePhoto {
  static readonly type = '[candidate] Get Candidate Photo';
  constructor(public payload: number) { }
}

export class GetCandidatePhotoSucceeded {
  static readonly type = '[candidate] Get Candidate Photo Succeeded';
  constructor(public payload: Blob) { }
}

export class GetCandidatesCredentialByPage {
  static readonly type = '[candidate] Get Candidates Credential by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class GetMasterCredentials {
  static readonly type = '[candidate] Get Master Credentials by searchTerm and credentialTypeId';
  constructor(public searchTerm: string, public credentialTypeId: number | string) { }
}

export class SaveCandidatesCredential {
  static readonly type = '[candidate] Save Candidates Credential';
  constructor(public payload: CandidateCredential) { }
}

export class SaveCandidatesCredentialSucceeded {
  static readonly type = '[candidate] Save Candidates Credential Succeeded';
  constructor(public payload: CandidateCredential) { }
}

export class SaveCandidatesCredentialFailed {
  static readonly type = '[candidate] Save Candidates Credential Failed';
  constructor() { }
}

export class RemoveCandidatesCredential {
  static readonly type = '[candidate] Remove Candidates Credential';
  constructor(public payload: CandidateCredential) { }
}

export class RemoveCandidatesCredentialSucceeded {
  static readonly type = '[candidate] Remove Candidates Credential Succeeded';
  constructor() { }
}

export class GetCredentialTypes {
  static readonly type = '[candidate] Get Credential Types';
  constructor() { }
}

export class UploadCredentialFiles {
  static readonly type = '[candidate] Upload Credential Files';
  constructor(public files: Blob[], public candidateCredentialId: number) { }
}

export class GetCredentialFiles {
  static readonly type = '[candidate] Get Credential Files';
  constructor(public payload: number) { }
}

export class GetCredentialFilesSucceeded {
  static readonly type = '[candidate] Get Credential Files Succeeded';
  constructor(public payload: Blob) { }
}

export class UploadCredentialFilesSucceeded {
  static readonly type = '[candidate] Upload Credential Files Succeeded';
  constructor() { }
}
