import { Country } from "@shared/enums/states";
import { MSP, MSPAssociateOrganizationsAgency } from "../model/msp.model";

export class GetMsps {
    static readonly type = '[msp-list] Get MSPList';
    constructor() { }
  }

  export class SaveMSP {
    static readonly type = '[msp] Save Msp';
    constructor(public payload: MSP) { }
  }
  export class SaveMSPSucceeded {
    static readonly type = '[msp] Save Msp Succeeded';
    constructor(public payload: MSP) { }
  }

  export class GetMspById {
    static readonly type = '[msp] Get Msp by ID';
    constructor(public payload: number) { }
  }
  
export class GetMSPByIdSucceeded {
  static readonly type = '[msp] Get Msp by ID Succeeded';
  constructor(public payload: MSP) { }
}

export class GetMspLogo {
  static readonly type = '[msp] Get Msp Logo';
  constructor(public payload: number) { }
}
export class GetMspLogoSucceeded {
  static readonly type = '[msp] Get Msp Logo Succeeded';
  constructor(public payload: Blob) { }
}

export class UploadMspLogo {
  static readonly type = '[msp] Upload Msp Logo';
  constructor(public file: Blob, public businessUnitId: number) { }
}


export class RemoveMspLogo {
  static readonly type = '[msp] Remove Msp Logo ';
  constructor(public payload: number) { }
}

export class RemoveMsp {
  static readonly type = '[msp] Remove Msp';
  constructor(public id: number) {}
}

export class SetGeneralStatesByCountry {
  static readonly type = '[msp] Set General States By Country';
  constructor(public payload: Country) { }
}

export class SetDirtyState {
  static readonly type = '[msp] Set Dirty State Of The Form';
  constructor(public payload: boolean) { }
}

export class SetBillingStatesByCountry {
  static readonly type = '[msp] Set Billing States By Country';
  constructor(public payload: Country) { }
}
export class RemoveMspSucceeded {
  static readonly type = '[msp] Remove Msp Succeeded';
  constructor(public id: number) { }
}

export class GetMSPAssociateListPage {
  static readonly type = '[MSP] Get MSP Associate List by page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class DeleteMspAssociateOrganizationsAgencyById {
  static readonly type = '[MSP] Delete MSP Associate by Id';
  constructor(public id: number) { }
}

export class GetMspAssociateAgency {
  static readonly type = '[Msp] Get Agencies to associate';
  constructor() { }
}

export class AssociateAgencyToMsp {
  static readonly type = '[Msp] Associated Agency to MSP';
  constructor(public agencyIds: number[]) { }
}
export class AssociateAgencyToMspSucceeded {
  static readonly type = '[Msp] Associated Agency to MSP successfully';
  constructor(public payload: MSPAssociateOrganizationsAgency[]) { }
}
