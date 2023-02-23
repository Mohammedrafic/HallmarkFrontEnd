export enum OrientationType {
  OrganizationWise = 0,
  RegionWise = 1,
  LocationWise = 2,
  DepartmentWise = 3
}

export const OrientationTypeDataSource = [
  { id: OrientationType.OrganizationWise, text: 'Organization' },
  { id: OrientationType.RegionWise, text: 'Region' },
  { id: OrientationType.LocationWise, text: 'Location' },
  { id: OrientationType.DepartmentWise, text: 'Department' },
];
