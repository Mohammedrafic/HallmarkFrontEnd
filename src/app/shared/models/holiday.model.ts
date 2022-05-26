import { OrganizationRegion } from "./organization.model";
import { PageOfCollections } from "./page.model";

export class Holiday {
  id: number;
  holidayName: string;
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
  holidayName: string;
  startDateTime: string;
  endDateTime: string;
  regionId: number | null;
  locationId: number | null;
  regions?: any[];
  locations?: number[];
  locationName?: string;
  regionName?: string;
  organizationId?: number;
  toOverwrite?: boolean;

  constructor(holiday: OrganizationHoliday, selectedRegions?: OrganizationRegion[], allRegions?: boolean, isExist?: boolean) {
    this.id = holiday.id;
    this.masterHolidayId = holiday.masterHolidayId;
    this.holidayName = holiday.holidayName;
    this.startDateTime = holiday.startDateTime;
    this.endDateTime = holiday.endDateTime;
    this.regionId = holiday.regionId || null;
    this.locationId = holiday.locationId || null;

    if (isExist !== undefined) {
      this.toOverwrite = isExist;
    }

    if (selectedRegions) {
      const regions: OrganizationRegion[] = [];
      holiday.regions?.forEach((regionId: number) => {
        const region = selectedRegions.find(region => region.id === regionId);
        const locations = region?.locations?.filter(location => holiday.locations?.includes(location.id)).map(location => location.id);
        if (region) {
          regions.push({
            id: region.id,
            locations: locations as []
          });
        }
      });
      this.regions = regions;
    }
  }
}

export type HolidaysPage = PageOfCollections<Holiday>;

export type OrganizationHolidaysPage = PageOfCollections<OrganizationHoliday>;
