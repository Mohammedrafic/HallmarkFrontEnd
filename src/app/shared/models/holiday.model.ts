import { PageOfCollections } from "./page.model";

export class Holiday {
  id: number;
  holidayName: number;
  startDateTime: string;
  endDateTime: string;

  constructor(holiday: Holiday) {
    this.id = holiday.id;
    this.holidayName = holiday.holidayName;
    this.startDateTime = holiday.startDateTime;
    this.endDateTime = holiday.endDateTime;
  }
}

export type HolidaysPage = PageOfCollections<Holiday>;
