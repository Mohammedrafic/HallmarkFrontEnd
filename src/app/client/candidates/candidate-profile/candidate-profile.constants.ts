export enum ProfileStatusesEnum {
  Inactive,
  Active,
  OnHold,
  Terminated
}

export const ProfileStatuses = [
  { id: ProfileStatusesEnum.Active, name: 'Active' },
  { id: ProfileStatusesEnum.Inactive, name: 'Inactive' },
  { id: ProfileStatusesEnum.OnHold, name: 'On Hold' },
  { id: ProfileStatusesEnum.Terminated, name: 'Terminated' }
];

export const HrInternalTransfersRecruitments = [
  { id: 0, name: 'New external hire' },
  { id: 1, name: 'Hire from MP' },
  { id: 2, name: 'Agency Conversion' },
  { id: 3, name: 'Rehire' },
  { id: 4, name: 'Transfer In' }
];

export const OrientationConfigurations = [
  { id: 0, name: 'Organization' },
  { id: 1, name: 'Region' },
  { id: 2, name: 'Location' },
  { id: 3, name: 'Department' }
];

export const HrCompanyCodes = [
  { id: 0, name: '0001' },
  { id: 1, name: '0002' },
  { id: 2, name: '0003' },
  { id: 3, name: '0004' }
];


export const TerminationReasons = [
  { id: 0, name: 'Termination reason 1' },
  { id: 1, name: 'Termination reason 2' },
  { id: 2, name: 'Termination reason 3' },
  { id: 3, name: 'Termination reason 4' }
];
