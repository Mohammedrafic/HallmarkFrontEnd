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
