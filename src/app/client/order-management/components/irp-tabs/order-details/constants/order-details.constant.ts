import { OrderTypes } from '@client/order-management/interfaces';
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
export const InternalDistributionError = 'Please select at least one internal job distribution option';
export const ExternalDistributionError = 'Please select only one external job distribution option';
export const AllInternalJob = { id: IrpOrderJobDistribution.AllInternal, name: 'All Internal' };
export const TierExternalJob = { id: IrpOrderJobDistribution.TieringLogicExternal, name: 'Tiering logic External' };
export const JobDistributionIrpOnly = [
  AllInternalJob,
];
export const JobDistributionIrpVms = [
  AllInternalJob,
  { id: IrpOrderJobDistribution.AllExternal, name: 'All External' },
  { id: IrpOrderJobDistribution.SelectedExternal, name: 'Selected External' },
];

export const EditablePerDiemFields = ['regionId', 'locationId', 'departmentId', 'skillId', 'shift'];
