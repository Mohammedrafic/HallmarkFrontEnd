export enum OrganizationOrderManagementTabs {
  AllOrders = 'All Orders',
  PerDiem = 'Per Diem',
  ReOrders = 'Re-Orders',
  PermPlacement = 'Perm Placement',
  Incomplete = 'Incomplete',
  OrderTemplates = 'Order Templates',
}

export enum OrderManagementIRPTabs {
  AllOrders = 'All',
  PerDiem = 'Per Diem',
  LTA = 'LTA',
  Incomplete = 'Incomplete',
  OrderTemplates = 'Order Templates',
}

export enum OrderManagementIRPTabsIndex {
  AllOrders,
  PerDiem,
  Lta,
  Incomplete,
  OrderTemplates
}

export enum OrderManagementIRPSystemId {
  All = 1,
  IRP,
  VMS,
  OrderJourney
}

export enum AgencyOrderManagementTabs {
  MyAgency = 'My Agency',
  OtherAgencies = 'Other Agencies',
  AllAgencies = 'All Agencies',
  PerDiem = 'Per Diem',
  ReOrders = 'Re-Orders',
  PermPlacement = 'Perm Placement',
}

export const orderLockList: { name: string; id: any }[] = [
  { name: 'All', id: 'all' },
  { name: 'Locked', id: 'true' },
  { name: 'Unlocked', id: 'false' }
];
export const clearedToStartList: { name: string; id: any }[] = [
  { name: 'Yes', id: 'yes' },
  { name: 'No', id: 'no' }
];
export const orderDistributionList: { name: string; id: any }[] = [
  { name: 'All', id: 0 },
  { name: 'VMS and IRP', id: 1 },
  { name: 'VMS only', id: 2 }
];
