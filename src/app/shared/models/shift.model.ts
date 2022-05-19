import { getTime } from "@shared/utils/date-time.utils";
import { PageOfCollections } from "./page.model";

export class Shift {
  id: number;
  regionId: number;
  locationI: number;
  departmentId: number;
  name: string;
  shortName: string;
  startTime: string;
  endTime: string;
  standardStartTime?: string;
  standardEndTime?: string;

  constructor(shift: Shift) {
    this.id = shift.id;
    this.regionId = shift.regionId;
    this.departmentId = shift.departmentId;
    this.name = shift.name;
    this.shortName = shift.shortName;

    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);

    this.startTime = getTime(startTime);
    this.endTime = getTime(endTime);
  }
}

export type ShiftsPage = PageOfCollections<Shift>;
