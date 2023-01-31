import { Agency, AgencyListFilters } from 'src/app/shared/models/agency.model';
import { ExportPayload } from '@shared/models/export.model';
import { FormGroup } from '@angular/forms';

export class SaveAgency {
  static readonly type = '[agency] Save Agency';
  constructor(public payload: Agency) {}
}

export class SaveAgencySucceeded {
  static readonly type = '[agency] Save Agency Succeeded';
  constructor(public payload: Agency) {}
}

export class GetAgencyByPage {
  static readonly type = '[agency] Get Agency by Page';
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public orderBy: string,
    public filters: AgencyListFilters
  ) {}
}

export class GetAgencyById {
  static readonly type = '[agency] Get Agency by ID';
  constructor(public payload: number) {}
}

export class GetAgencyByIdSucceeded {
  static readonly type = '[agency] Get Agency by ID Succeeded';
  constructor(public payload: Agency) {}
}

export class UploadAgencyLogo {
  static readonly type = '[agency] Upload Agency Logo';
  constructor(public file: Blob, public businessUnitId: number) {}
}

export class GetAgencyLogo {
  static readonly type = '[agency] Get Agency Logo';
  constructor(public payload: number) {}
}

export class RemoveAgencyLogo {
  static readonly type = '[agency] Remove Agency Logo ';
  constructor(public payload: number) {}
}

export class GetAgencyLogoSucceeded {
  static readonly type = '[agency] Get Agency Logo Succeeded';
  constructor(public payload: Blob) {}
}

export class ClearAgencyEditStore {
  static readonly type = '[agency] Clear Agency Edit Store';
  constructor() {}
}

export class GetBusinessUnitList {
  static readonly type = '[agency] Get The List Of Business Units';
  constructor() {}
}

export class ExportAgencyList {
  static readonly type = '[agency] Export Agency List';
  constructor(public payload: ExportPayload) {}
}

export class GetAgencyFilteringOptions {
  static readonly type = '[agency] Get Agency Filtering Options';
  constructor() {}
}

export class SetPaymentDetailsForm {
  static readonly type = '[agency] Set Payment Details Form';
  constructor(public form: FormGroup) {}
}

export class GetAgencyRegionsSkills {
  static readonly type = '[agency] Get Skills/Regions for Agency';
  constructor() {}
}
