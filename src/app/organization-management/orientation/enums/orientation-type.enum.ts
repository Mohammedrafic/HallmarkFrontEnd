export enum OrientationType {
  OrganizationWise = 0,
  RegionWise = 1,
  LocationWise = 2,
  DepartmentWise = 3
}

export const OrientationTypeDataSource = [
  { id: OrientationType.OrganizationWise, text: 'Organization Wise' },
  { id: OrientationType.RegionWise, text: 'Region Wise' },
  { id: OrientationType.LocationWise, text: 'Location Wise' },
  { id: OrientationType.DepartmentWise, text: 'Department Wise' },
];
