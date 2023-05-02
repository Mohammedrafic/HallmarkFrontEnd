import { VendorScorePayload } from "@shared/models/vendorscorecard.model";

export class Filtervendorscorecard {
    
    static readonly type = '[admin] Export Orientation list';
    
    constructor(public payload: VendorScorePayload) {
    }
  }