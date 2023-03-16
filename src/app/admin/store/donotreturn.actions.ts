import { ExportPayload } from "@shared/models/export.model";
import { DonoreturnAddedit, DonoreturnFilters, DoNotReturnCandidateListSearchFilter, DoNotReturnCandidateSearchFilter } from "@shared/models/donotreturn.model";
import { DoNotReturnActionsTypesEnum } from "@shared/enums/DoNotReturnActionsTypesEnum";

export namespace DoNotReturn {
  export class DonotreturnByPage {
    static readonly type = DoNotReturnActionsTypesEnum.DONOTRETURNBYPAGE;
    constructor(public pageNumber: number, public pageSize: number, public filters: DonoreturnFilters) { }
  }

  export class GetDoNotReturnPage {
    static readonly type = DoNotReturnActionsTypesEnum.GETDONOTRETURNPAGE;
    constructor(public filter?: DonoreturnFilters) { }
  }

  export class UpdateDoNotReturn {
    static readonly type = DoNotReturnActionsTypesEnum.UPDATEDONOTRETURN;
    constructor(public donotreturn: DonoreturnAddedit) { }
  }

  export class SaveDonotreturn {
    static readonly type = DoNotReturnActionsTypesEnum.SAVEDONOTRETURN;
    constructor(public donotreturn: DonoreturnAddedit) { }
  }

  export class ExportDonotreturn {
    static readonly type = DoNotReturnActionsTypesEnum.EXPORTDONOTRETURN;
    constructor(public payload: ExportPayload) { }
  }

  export class GetAllOrganization {
    static readonly type = DoNotReturnActionsTypesEnum.GETALLORGANIZATION;
    constructor() { }
  }

  export class GetLocationByOrgId {
    static readonly type = DoNotReturnActionsTypesEnum.GETLOCATIONBYORGID;
    constructor(public organizationId: number) { }
  }

  export class GetCandidatesByOrgId {
    static readonly type = DoNotReturnActionsTypesEnum.GETCANDIDATESBYORGID;
    constructor(public organizationId: number) { }
  }

  export class RemoveDonotReturn {
    static readonly type = DoNotReturnActionsTypesEnum.REMOVEDONOTRETURN;
    constructor(public payload: DonoreturnAddedit) { }
  }

  export class RemoveDonotReturnSucceeded {
    static readonly type = DoNotReturnActionsTypesEnum.REMOVEDONOTRETURNSUCCEEDED;
    constructor() { }
  }

  export class SaveDonotReturnSucceeded {
    static readonly type = DoNotReturnActionsTypesEnum.SAVEDONOTRETURNSUCCEEDED;
    constructor() { }
  }

  export class UpdateDonotReturnSucceeded {
    static readonly type = DoNotReturnActionsTypesEnum.UPDATEDONOTRETURNSUCCEEDED;
    constructor() { }
  }


  export class GetDoNotReturnCandidateSearch {
    static readonly type = DoNotReturnActionsTypesEnum.GETDONOTRETURNCANDIDATESEARCH;
    constructor(public filter: DoNotReturnCandidateSearchFilter) { }
  }

  export class GetDoNotReturnCandidateListSearch {
    static readonly type = DoNotReturnActionsTypesEnum.GETDONOTRETURNCANDIDATELISTSEARCH;
    constructor(public filter: DoNotReturnCandidateListSearchFilter) { }
  }
}