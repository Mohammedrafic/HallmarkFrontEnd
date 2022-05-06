import { Candidate } from "src/app/shared/models/candidate.model";
import { Education } from "src/app/shared/models/education.model";
import { Experience } from "src/app/shared/models/experience.model";

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
