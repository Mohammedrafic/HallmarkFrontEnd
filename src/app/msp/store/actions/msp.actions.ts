import { MSP } from "../model/msp.model";

export class GetMsps {
    static readonly type = '[msp-list] Get MSPList';
    constructor() { }
  }

  export class SaveMSP {
    static readonly type = '[admin] Save Msp';
    constructor(public payload: MSP) { }
  }
  export class SaveMSPSucceeded {
    static readonly type = '[admin] Save Organization Succeeded';
    constructor(public payload: MSP) { }
  }

  export class GetMspById {
    static readonly type = '[admin] Get Msp by ID';
    constructor(public payload: number) { }
  }
  
export class GetMSPByIdSucceeded {
  static readonly type = '[admin] Get Organization by ID Succeeded';
  constructor(public payload: MSP) { }
}

export class GetMspLogo {
  static readonly type = '[admin] Get Msp Logo';
  constructor(public payload: number) { }
}
export class GetMspLogoSucceeded {
  static readonly type = '[admin] Get Msp Logo Succeeded';
  constructor(public payload: Blob) { }
}

export class UploadMspLogo {
  static readonly type = '[admin] Upload Msp Logo';
  constructor(public file: Blob, public businessUnitId: number) { }
}


export class RemoveMspLogo {
  static readonly type = '[admin] Remove Msp Logo ';
  constructor(public payload: number) { }
}

export class RemoveMsp {
  static readonly type = '[admin] Remove Msp';
  constructor(public id: number){}
}

export class RemoveMspSucceeded {
  static readonly type = '[admin] Remove Msp Succeeded';
  constructor(public id: number) { }
}
