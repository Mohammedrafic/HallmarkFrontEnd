import { CandidateListExport, CandidateListRequest } from '../types/candidate-list.model';
import { CandidateStatus } from '@shared/enums/status';

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
