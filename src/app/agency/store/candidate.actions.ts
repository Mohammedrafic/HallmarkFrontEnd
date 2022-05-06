import { Candidate } from "src/app/shared/models/candidate.model";

export class SaveCandidate {
  static readonly type = '[candidate] Save Candidate';
  constructor(public payload: Candidate) {}
}

export class SaveCandidateSucceeded {
  static readonly type = '[candidate] Save Candidate Succeeded';
  constructor(public payload: Candidate) {}
}

export class GetAllSkills {
  static readonly type = '[candidate] Get All Skills';
  constructor() {}
}

export class UploadCandidatePhoto {
  static readonly type = '[candidate] Upload Candidate Photo';
  constructor(public file: Blob, public candidateProfileId: number) { }
}

export class GetCandidatePhoto {
  static readonly type = '[candidate] Get Candidate Photo';
  constructor(public payload: number) { }
}
