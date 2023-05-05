import { OrganizationRegion } from "./organization.model";
import { PageOfCollections } from "./page.model";
import { DateTimeHelper } from '@core/helpers';

export class Holiday {
  id: number;
  holidayName: string;
  startDateTime: string;
  endDateTime: string;

  constructor(holiday: Holiday) {
    this.id = holiday.id;
    this.holidayName = holiday.holidayName;
    this.startDateTime = DateTimeHelper.toUtcFormat(holiday.startDateTime);
    this.endDateTime = DateTimeHelper.toUtcFormat(holiday.endDateTime);
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
  foreignKey?: string;
  isOrganizationHoliday: boolean;
  includeInIRP? : boolean;
  includeInVMS? : boolean;

  constructor(holiday: OrganizationHoliday, selectedRegions?: OrganizationRegion[], allRegions?: boolean, allLocations?: boolean, isExist?: boolean) {
    this.id = holiday.id;
    this.masterHolidayId = holiday.masterHolidayId;
    this.holidayName = holiday.holidayName;
    this.startDateTime = DateTimeHelper.toUtcFormat(holiday.startDateTime);
    this.endDateTime = DateTimeHelper.toUtcFormat(holiday.endDateTime);
    this.regionId = holiday.regionId || null;
    this.locationId = holiday.locationId || null;
    this.includeInIRP = holiday.includeInIRP || false;
    this.includeInVMS = holiday.includeInVMS || false;

    if (isExist !== undefined) {
      this.toOverwrite = isExist;
    }

    if (selectedRegions) {
      const regions: OrganizationRegion[] = [];
      if (allRegions && allLocations) {
        regions.push({
          id: null,
          locations: null
        });
      } else {
        let selectedRegionsByLocations: any[] = [];
        selectedRegionsByLocations = selectedRegions.filter(region => region.locations?.find(location => holiday.locations?.includes(location.id))).map(region => region.id);
        selectedRegionsByLocations.forEach((regionId: number) => {
          const region = selectedRegions.find(region => region.id === regionId);
          const locations = region?.locations?.filter(location => holiday.locations?.includes(location.id)).map(location => location.id);
          if (region) {
            regions.push({
              id: region.id,
              locations: allLocations ? null : locations as []
            });
          }
        });
      }
      this.regions = regions;
    }
  }
}

export type HolidaysPage = PageOfCollections<Holiday>;

export type OrganizationHolidaysPage = PageOfCollections<OrganizationHoliday>;

export class HolidayFilters {
  holidayNames?: string[];
  years?: number[];
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  regionIds?: number[];
  locationIds?: number[];
  departmentsIds?: number[];
}
