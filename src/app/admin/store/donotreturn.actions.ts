import { ExportPayload } from "@shared/models/export.model";
import { DonoreturnAddedit, DonoreturnFilters, Donotreturn, DoNotReturnCandidateListSearchFilter, DoNotReturnCandidateSearchFilter } from "@shared/models/donotreturn.model";

export class DonotreturnByPage {
  static readonly type = '[donotreturn] Donotreturn by Page';
  constructor(public pageNumber: number, public pageSize: number, public filters: DonoreturnFilters) { }
}

export class GetDoNotReturnPage {
  static readonly type = '[donotreturn] Do Not Return Page';
  constructor(public filter?: DonoreturnFilters) { }
}

export class UpdateDoNotReturn {
  static readonly type = '[donotreturn] Update Do Not Return Candidate';
  constructor(public donotreturn: DonoreturnAddedit) { }
}

export class SaveDonotreturn {
  static readonly type = '[donotreturn] Add Do Not Return Candidate';
  constructor(public donotreturn: DonoreturnAddedit) { }
}

export class ExportDonotreturn {
  static readonly type = '[donotreturn] Export Do Not Return Candidates list';
  constructor(public payload: ExportPayload) { }
}

export class GetAllOrganization {
  static readonly type = '[donotreturn] Get All Organization list';
  constructor() { }
}

export class GetLocationByOrgId {
  static readonly type = '[donotreturn] Get The List Of Locations by organizationId';
  constructor(public organizationId: number) { }
}

export class GetCandidatesByOrgId {
  static readonly type = '[donotreturn] Get candidate by orgid';
  constructor(public organizationId: number) { }
}

export class RemoveDonotReturn {
  static readonly type = '[donotreturn] Block donotreturn';
  constructor(public payload: DonoreturnAddedit) { }
}

export class RemoveDonotReturnSucceeded {
  static readonly type = '[donotreturn] Candidate Block Succeeded';
  constructor() { }
}

export class GetDoNotReturnCandidateSearch {
  static readonly type = '[donotreturn] Get Candidate Search';
  constructor(public filter: DoNotReturnCandidateSearchFilter) { }
}

export class GetDoNotReturnCandidateListSearch {
  static readonly type = '[donotreturn] Get Candidate List';
  constructor(public filter: DoNotReturnCandidateListSearchFilter) { }
}