import { PositionByTypeDto } from "./positions-by-type-response.model";

export interface BillRateResponse {
  data: BillRate[]
}

export interface BillRate {
  key: string,
  value: PositionByTypeDto[]
}

export function SkillCategoryName(key: any) {
  switch (key) {
    case "Interim_Management": return "Interim Management";
    case "Non_Clinical": return "Non-Clinical";
    default:
      return key;
  }
}