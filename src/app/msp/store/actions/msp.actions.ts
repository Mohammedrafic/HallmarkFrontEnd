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