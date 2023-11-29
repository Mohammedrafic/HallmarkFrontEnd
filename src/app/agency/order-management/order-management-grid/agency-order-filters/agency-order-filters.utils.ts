import { AgencyOrganizationRegion, OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';

export const getRegionsFromOrganizationStructure = (structure: OrganizationStructure[]): OrganizationRegion[] => {
  let res: OrganizationRegion[] = [];
  structure.forEach(({ organizationName, regions }) => {
    const regionsWithOrgName = regions.map((region) => ({ ...region, orgName: organizationName }));
    res = [...res, ...regionsWithOrgName];
  });
  return res;
};

export const getLocationsFromRegions = (regions: OrganizationRegion[]): OrganizationLocation[] => {
  let locationsWithName: OrganizationLocation[] = [];
  regions.forEach(({ name, orgName, locations }) => {
    if (locations) {
      const data: OrganizationLocation[] = locations.map((location) => ({
        ...location,
        regionName: `${orgName} / ${name}`,
      }));
      locationsWithName = [...locationsWithName, ...data];
    }
  });
  return locationsWithName;
};

export const getAgencyLocationsFromRegions = (regions: AgencyOrganizationRegion[]): OrganizationLocation[] => {
  let locationsWithName: OrganizationLocation[] = [];
  regions.forEach(({ name, organisationName, locations }) => {
    if (locations) {
      const data: OrganizationLocation[] = locations.map((location) => ({
        ...location,
        regionName: `${organisationName} / ${name}`,
      }));
      locationsWithName = [...locationsWithName, ...data];
    }
  });
  return locationsWithName;
};

export const getDepartmentFromLocations = (locations: OrganizationLocation[]): OrganizationDepartment[] => {
  let departmentWithName: OrganizationDepartment[] = [];
  locations.forEach(({ name, regionName, departments }) => {
    if (departments) {
      const data: OrganizationDepartment[] = departments.map((location) => ({
        ...location,
        locationName: `${regionName} / ${name}`,
      }));
      departmentWithName = [...departmentWithName, ...data];
    }
  });
  return departmentWithName;
};

