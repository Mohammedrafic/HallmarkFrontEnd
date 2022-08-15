import { CandidateListExport, CandidateListRequest } from '../types/candidate-list.model';
import { CandidateStatus } from '../../../enums/status';
import { ExportPayload } from '../../../models/export.model';

export class GetCandidatesByPage {
  static readonly type = '[candidate-list] Get Candidates List';
  constructor(public payload: CandidateListRequest) {}
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
