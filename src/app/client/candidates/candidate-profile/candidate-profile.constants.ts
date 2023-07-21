export enum ProfileStatusesEnum {
  Inactive,
  Active,
  OnHold,
  Terminated,
  Sourcing,
  Prospect,
  VerbalOfferMade,
  Onboarding,
  ClearedForOrientation,
  OrientationScheduled,
  DoNotHire,
  FallOffOnboarding
}

export enum RecruitmentStatusEnum {
  Recruitment1,
  Recruitment2,
  Recruitment3
}

export enum SourceStatusEnum {
  Source1,
  Source2,
  Source3
}

export const ProfileStatuses = [
  { id: ProfileStatusesEnum.Active, name: 'Active' },
  { id: ProfileStatusesEnum.Inactive, name: 'Inactive' },
  { id: ProfileStatusesEnum.OnHold, name: 'On Hold' },
  { id: ProfileStatusesEnum.Terminated, name: 'Terminated' },
  { id: ProfileStatusesEnum.Sourcing, name: 'Sourcing' },
  { id: ProfileStatusesEnum.Prospect, name: 'Prospect' },
  { id: ProfileStatusesEnum.VerbalOfferMade, name: 'Verbal Offer Made' },
  { id: ProfileStatusesEnum.Onboarding, name: 'Onboarding' },
  { id: ProfileStatusesEnum.ClearedForOrientation, name: 'Cleared For Orientation' },
  { id: ProfileStatusesEnum.OrientationScheduled, name: 'Orientation Scheduled' },
  { id: ProfileStatusesEnum.DoNotHire, name: 'Do Not Hire' },
  { id: ProfileStatusesEnum.FallOffOnboarding, name: 'Fall Off Onboarding' }
];

export const recruitContent = [
  { id: RecruitmentStatusEnum.Recruitment1, name: 'Recruiter 1' },
  { id: RecruitmentStatusEnum.Recruitment2, name: 'Recruiter 2' },
  { id: RecruitmentStatusEnum.Recruitment2, name: 'Recruiter 3' },
]

export const sourceContent = [
  { id: SourceStatusEnum.Source1, name: 'Source 1' },
  { id: SourceStatusEnum.Source2, name: 'Source 2' },
  { id: SourceStatusEnum.Source2, name: 'Source 3' },
]

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
