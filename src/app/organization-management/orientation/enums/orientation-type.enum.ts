export enum OrientationType {
  Organization = 0,
  Region = 1,
  Location = 2,
  Department = 3
}

export const OrientationTypeDataSource = [
  { id: OrientationType.Organization, text: 'Organization' },
  { id: OrientationType.Region, text: 'Region' },
  { id: OrientationType.Location, text: 'Location' },
  { id: OrientationType.Department, text: 'Department' },
];

export enum OrientationTab {
  Setup,
  HistoricalData
}
