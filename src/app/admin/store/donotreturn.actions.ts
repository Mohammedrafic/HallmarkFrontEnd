import { ExportPayload } from "@shared/models/export.model";
import { DonoreturnAddedit, DonoreturnFilters, Donotreturn, DoNotReturnCandidateListSearchFilter, DoNotReturnCandidateSearchFilter } from "@shared/models/donotreturn.model";


export class DonotreturnByPage {
    static readonly type = '[donotreturn] Get Donotreturn by Page';
    constructor(public pageNumber: number, public pageSize: number,public filters :DonoreturnFilters) { }
  }

  export class GetDoNotReturnPage {
    static readonly type = '[donotreturn] Get The Do Nskillot Return Candidates Page List';
    constructor(public filter?: DonoreturnFilters) { }
  }

  
export class UpdateDoNotReturn {
  static readonly type = '[donotreturn] Update Do Not Return Candidate';
  constructor(public donotreturn: DonoreturnAddedit) {}
}



export class SaveDonotreturn {
  static readonly type = '[donotreturn] Add Do Not Return Candidate';
  constructor(public donotreturn: DonoreturnAddedit) {}
}
  export class GetMasterDoNotReturn {
    static readonly type = '[Donotreturn] Get The List Of Do Not Return Candidates';
    constructor() {}
  }


  
export class ExportDonotreturn {
  static readonly type = '[Donotreturn] Export Do Not Return Candidates list';
  constructor(public payload: ExportPayload) { }
}
  
export class GetAllOrganization {
  static readonly type = '[Donotreturn] Get All Organization list';
  constructor() { }
}

export class GetLocationByOrgId {
  static readonly type = '[Donotreturn] Get The List Of Locations by organizationId';
  constructor(public organizationId: number) {}
}

export class GetCandidatesByOrgId {
  static readonly type = '[Donotreturn] Get The List Of Locations by organizationId';
  constructor(public organizationId: number) {}
}
export class RemoveDonotReturn {
  static readonly type = '[donotreturn] Block donotreturn';
  constructor(public payload: DonoreturnAddedit) {}
}


export class RemoveDonotReturnSucceeded {
  static readonly type = '[donotreturn] Candidate Block Succeeded';
  constructor() { }
}

export class GetDoNotReturnCandidateSearch{
  static readonly type = '[Donotreturn] Get Common Candidate Search';
  constructor(public filter: DoNotReturnCandidateSearchFilter) { }
}

export class GetDoNotReturnCandidateListSearch{
  static readonly type = '[Donotreturn] Get Common Candidate List Search';
  constructor(public filter: DoNotReturnCandidateListSearchFilter) { }
}