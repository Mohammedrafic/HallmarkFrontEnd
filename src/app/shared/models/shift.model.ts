import { getTime } from "@shared/utils/date-time.utils";
import { PageOfCollections } from "./page.model";
import { DateTime } from "@syncfusion/ej2-angular-charts";

export class Shift {
  id: number;
  regionId: number;
  locationI: number;
  departmentId: number;
  name: string;
  startTime: string;
  endTime: string;
  standardStartTime?: string;
  standardEndTime?: string;
  onCall: boolean;
  inactiveDate?:string | null;

  constructor(shift: Shift) {
    this.id = shift.id;
    this.regionId = shift.regionId;
    this.departmentId = shift.departmentId;
    this.name = shift.name;
    this.onCall = shift.onCall || false;

    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);

    this.startTime = getTime(startTime);
    this.endTime = getTime(endTime);
    this.inactiveDate=shift.inactiveDate ===''?null:shift.inactiveDate;
  }
}

export type ShiftsPage = PageOfCollections<Shift>;
