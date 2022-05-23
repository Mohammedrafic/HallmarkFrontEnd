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

export class OrganizationHoliday {
  id: number;
  masterHolidayId: number;
  holidayName: number;
  startDateTime: string;
  endDateTime: string;
  regionId: number;
  locationId: number;

  constructor(holiday: OrganizationHoliday) {
    this.id = holiday.id;
    this.masterHolidayId = holiday.masterHolidayId;
    this.holidayName = holiday.holidayName;
    this.startDateTime = holiday.startDateTime;
    this.endDateTime = holiday.endDateTime;
    this.regionId = holiday.regionId;
    this.locationId = holiday.locationId;
  }
}

export type HolidaysPage = PageOfCollections<Holiday>;

export type OrganizationHolidaysPage = PageOfCollections<OrganizationHoliday>;
