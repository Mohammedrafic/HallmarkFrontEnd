import { JobDistributionOption, OrderTypes } from '@client/order-management/interfaces';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import { IrpOrderType } from '@shared/enums/order-type';

export const OrderTypeList: OrderTypes[] = [
  { id: IrpOrderType.LongTermAssignment, name: 'Long Term Assignment' },
  { id: IrpOrderType.PerDiem, name: 'Per Diem' },
];
export const DateFormat = 'MM/dd/yyyy';
export const DateMask = { month: 'MM', day: 'DD', year: 'YYYY' };
export const TimeMask = { hour: 'HH', minute: 'MM' };
export const Incomplete = 'Incomplete';
export const TitleField = 'title';
export const GeneralInformationForm = 'generalInformationForm';
export const JobDescriptionForm = 'jobDescriptionForm';
export const JobDistributionForm = 'jobDistributionForm';
export const SpecialProjectForm = 'specialProjectForm';
export const WorkLocationList = 'workLocationList';
export const ContactDetailsList = 'contactDetailsList';
export const InternalDistributionError = 'Please select only one internal job distribution option';
export const ExternalDistributionError = 'Please select only one external job distribution option';
export const InternalTieringError = 'Change cannot be saved. Order was distributed to all eligible employees';
export const ChangeInternalDistributionSuccess = 'Record has been modified. Order was distributed to all eligible employees';
export const InternalNotSelectedError = 'Please select at least one internal job distribution option';
export const AllInternalJob = { id: IrpOrderJobDistribution.AllInternal, name: 'All Internal' };
export const TierInternal = { id: IrpOrderJobDistribution.TieringLogicInternal, name: 'Tiering logic Internal' };

export const JobDistributionIrpOnly = (tieringEnabled: boolean) => {
  if (tieringEnabled) {
    return [AllInternalJob, TierInternal];
  }

  return [AllInternalJob];
};

export const JobDistributionIrpVms = (tieringEnabled: boolean): JobDistributionOption[] => {
  if (tieringEnabled) {
    return [
      AllInternalJob,
      TierInternal,
      { id: IrpOrderJobDistribution.AllExternal, name: 'All External' },
      { id: IrpOrderJobDistribution.TieringLogicExternal, name: 'Tiering logic External' },
      { id: IrpOrderJobDistribution.SelectedExternal, name: 'Selected External' },
    ];
  }

  return [
    AllInternalJob,
    { id: IrpOrderJobDistribution.AllExternal, name: 'All External' },
    { id: IrpOrderJobDistribution.TieringLogicExternal, name: 'Tiering logic External' },
    { id: IrpOrderJobDistribution.SelectedExternal, name: 'Selected External' },
  ];
};

export const EditablePerDiemFields = [
  'regionId',
  'locationId',
  'departmentId',
  'skillId',
  'shift',
  'shiftStartTime',
  'shiftEndTime',
];
