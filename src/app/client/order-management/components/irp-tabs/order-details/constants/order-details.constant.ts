import { OrderTypes } from '@client/order-management/interfaces';
import { IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';

export const OrderTypeList: OrderTypes[] = [
  { id: IrpOrderType.LongTermAssignment, name: 'Long Term Assignment (LTA)' },
  { id: IrpOrderType.PerDiem, name: 'Per Diem (PO)' },
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
export const IrpTiersLogic = [
  { id: IrpOrderJobDistribution.TieringLogicInternal, name: 'Tiering logic Internal' },
  { id: IrpOrderJobDistribution.TieringLogicExternal, name: 'Tiering logic External' },
];
export const IrpJobDistribution = [
  { id: IrpOrderJobDistribution.AllInternal, name: 'All Internal' },
  { id: IrpOrderJobDistribution.AllExternal, name: 'All External'},
  { id: IrpOrderJobDistribution.SelectedExternal, name: 'Selected External' },
];
