export enum OrganizationOrderManagementTabs {
  AllOrders = 'All Orders',
  PerDiem = 'Per Diem',
  PermPlacement = 'Perm Placement',
  ReOrders = 'Re-Orders',
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
  PermPlacement = 'Perm Placement',
  ReOrders = 'Re-Orders',
}

export const orderLockList: { name: string; id: any }[] = [
  { name: 'All', id: 'all' },
  { name: 'Locked', id: 'true' },
  { name: 'Unlocked', id: 'false' }
];