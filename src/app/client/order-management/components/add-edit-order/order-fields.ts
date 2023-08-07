import { valuesOnly } from '@shared/utils/enum.utils';
import { OrderType } from '@shared/enums/order-type';

const enumToString = <T>(enumEntity: T) => Object.values(enumEntity).filter(valuesOnly);

enum CommonInfo {
  title,
  regionId,
  locationId,
  departmentId,
  skillId,
  credentials,
  canApprove,
  isTemplate,
  templateTitle,
  isSubmit,
  orderType,
  id,
  isQuickOrder,
  linkedId,
}

enum ContactToPermTravelerGeneralInfo {
  hourlyRate,
  openPositions,
  minYrsRequired,
  joiningBonus,
  compBonus,
  duration,
  jobStartDate,
  jobEndDate,
  shift,
  shiftStartTime,
  shiftEndTime,
  billRates,
}

enum PermPlacementGeneralInfo {
  openPositions,
  minYrsRequired,
  orderPlacementFee,
  annualSalaryRangeFrom,
  annualSalaryRangeTo,
  jobStartDate,
  shift,
  shiftStartTime,
  shiftEndTime,
}

enum JobDistributions {
  jobDistributions,
}

enum JobDescription {
  classifications,
  onCallRequired,
  asapStart,
  criticalOrder,
  jobDescription,
  unitDescription,
  orderRequisitionReasonId,
  orderRequisitionReasonName,
}

enum ContactDetails {
  contactDetails,
}

enum WorkLocations {
  workLocations,
}

enum SpecialProject {
  poNumberId,
  projectNameId,
  projectTypeId,
}

const contactToPerm: string[] = [
  ...enumToString(CommonInfo),
  ...enumToString(ContactToPermTravelerGeneralInfo),
  ...enumToString(JobDistributions),
  ...enumToString(JobDescription),
  ...enumToString(ContactDetails),
  ...enumToString(WorkLocations),
  ...enumToString(SpecialProject),
];

const openPerDiem: string[] = [
  ...enumToString(CommonInfo),
  ...enumToString(JobDistributions),
  ...enumToString(JobDescription),
  ...enumToString(ContactDetails),
  ...enumToString(WorkLocations),
  ...enumToString(SpecialProject),
];

const permPlacement: string[] = [
  ...enumToString(CommonInfo),
  ...enumToString(PermPlacementGeneralInfo),
  ...enumToString(JobDistributions),
  ...enumToString(JobDescription),
  ...enumToString(ContactDetails),
  ...enumToString(WorkLocations),
  ...enumToString(SpecialProject),
];

export const orderFieldsConfig = {
  [OrderType.ContractToPerm]: contactToPerm,
  [OrderType.OpenPerDiem]: openPerDiem,
  [OrderType.PermPlacement]: permPlacement,
  [OrderType.LongTermAssignment]: contactToPerm,
  [OrderType.ReOrder]: [] as string[],
};
