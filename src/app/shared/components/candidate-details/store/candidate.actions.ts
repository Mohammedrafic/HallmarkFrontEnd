import { FiltersModal, FiltersPageModal } from '@shared/components/candidate-details/models/candidate.model';
import { DoNotReturnActionsTypesEnum } from '@shared/enums/DoNotReturnActionsTypesEnum';
import { DoNotReturnCandidateSearchFilter } from '@shared/models/donotreturn.model';
import { ExportPayload } from '@shared/models/export.model';

export class GetCandidateDetailsPage {
  static readonly type = '[candidate details] Get Candidate Details by Page';
  constructor(public payload: FiltersPageModal) {}
}

export class SelectNavigation {
  static readonly type = '[candidate details] Select Navigation Tab';
  constructor(public pending: number | null, public active?: number | null, public isRedirect?: boolean) {}
}


export class ExportCandidateAssignment {
  static readonly type = '[Candidate assignment] Export Candidate Assignment list';
  constructor(public payload: ExportPayload)  {}
}

export class SetPageNumber {
  static readonly type = '[candidate details] Set Page Number';
  constructor(public pageNumber: number) {}
}

export class SetPageSize {
  static readonly type = '[candidate details] Set Page Size';
  constructor(public pageSize: number) {}
}

export class GetCandidateRegions {
  static readonly type = '[candidate details] Get Candidate Regions';
  constructor() {}
}
export class Getcandidatesearchbytext {
  static readonly type ='[candidate details] Get Candidate Search';
  constructor(public filter: DoNotReturnCandidateSearchFilter) { }
}

export class SetNavigation {
  static readonly type = '[candidate details] Set Navigation';
  constructor(public isNavigate: boolean) {}
}

export class GetCandidateSkills {
  static readonly type = '[candidate details] Get Candidate Skills';
  constructor() {}
}
