import { HttpErrorResponse } from '@angular/common/http';

import { DropdownOption } from '@core/interface';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { OrganizationStructure } from '@shared/models/organization.model';

import { HourOccupationType } from '../enums';
import { OverlapErrorMessageDetails, TimesheetStatisticsDetails } from '../interface';

export function getEmptyHoursOccupationData(name: string): TimesheetStatisticsDetails {
  return {
    billRateConfigName: name as HourOccupationType,
    cumulativeHours: 0,
    weekHours: 0,
    billRateConfigId: Math.random(),
  };
}

export const CreateOverlapErrorData = (err: HttpErrorResponse): OverlapErrorMessageDetails => {
  return ({
    title: err.error['detail'].split(':')[0],
    message: err.error['detail'].split(':')[1].trim(),
  });
};

export const GetDropdownOptions = (items: { name: string, id: number }[]): DropdownOption[] => {
  const options = items.map((item) => {
    return {
      text: item.name,
      value: item.id,
    };
  });

  return sortByField(options, 'text');
};

export const GetCostCenterOptions = (
  organizationStructure: OrganizationStructure,
  regionId: number,
  locationId: number
): DropdownOption[] => {
  const locations = organizationStructure?.regions.find((region) => region.id === regionId)?.locations || [];
  const departments = locations.find((location) => location.id === locationId)?.departments || [];

  return GetDropdownOptions(departments);
};
