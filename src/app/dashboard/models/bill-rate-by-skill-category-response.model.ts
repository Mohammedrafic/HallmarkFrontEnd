import { PositionByTypeDto } from "./positions-by-type-response.model";

  export interface BillRateResponse {
    data: BillRate[]   
  }

  export interface BillRate {
    key:string,
    value:PositionByTypeDto[]   
  }
