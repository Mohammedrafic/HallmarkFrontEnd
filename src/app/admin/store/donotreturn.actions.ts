import { ExportPayload } from "@shared/models/export.model";
import { DonoreturnAddedit, DonoreturnFilters, DoNotReturnCandidateListSearchFilter, DoNotReturnCandidateSearchFilter } from "@shared/models/donotreturn.model";
import { DoNotReturnActionsTypesEnum } from "@shared/enums/DoNotReturnActionsTypesEnum";
import { ImportResult } from "@shared/models/import.model";

export namespace DoNotReturn {
  export class DonotreturnByPage {
    static readonly type = DoNotReturnActionsTypesEnum.DONOTRETURNBYPAGE;
    constructor(public businessUnitId: number, public pageNumber: number, public pageSize: number, public filters: DonoreturnFilters, public sortBy : number) { }
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

  export class GetDoNotReturnImportTemplate {
    static readonly type = '[donotreturn] Get DNR Import Template';
    constructor(public payload: any) {}
  }

  export class GetDoNotReturnImportTemplateSucceeded {
    static readonly type = '[donotreturn] Get DNR Import Template Succeeded';
    constructor(public payload: Blob) {}
  }

  export class GetDoNotReturnImportErrors {
    static readonly type = '[donotreturn] Get DNR Import Errors';
    constructor(public errorpayload: any) {}
  }
  
  export class GetDoNotReturnImportErrorsSucceeded {
    static readonly type = '[donotreturn] Get DNR Import Errors Succeeded';
    constructor(public payload: Blob) {}
  }
  
  export class UploadDoNotReturnFile {
    static readonly type = '[donotreturn] Upload DNR File';
    constructor(public payload: Blob) {}
  }
  
  export class UploadDoNotReturnFileSucceeded {
    static readonly type = '[donotreturn] Upload DNR File Succeeded';
    constructor(public payload: ImportResult<any>) {}
  }
  
  export class SaveDoNotReturnImportResult {
    static readonly type = '[donotreturn] Save DNR Import Result';
    constructor(public payload: any) {}
  }
  
  export class SaveDoNotReturnImportResultSucceeded {
    static readonly type = '[donotreturn] Save DNR Import Result Succeeded';
    constructor(public payload: ImportResult<any>) {}
  }

  export class SaveDoNotReturnImportResultFailAndSucceeded {
    static readonly type = '[donotreturn] Upload DNR Import Result Fail And Success';
    constructor(public payload: ImportResult<any>) {}
  }

}