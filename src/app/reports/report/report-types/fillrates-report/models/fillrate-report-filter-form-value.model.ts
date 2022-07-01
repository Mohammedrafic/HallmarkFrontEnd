import { OrderType } from '@shared/enums/order-type';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

export interface FillrateReportFilterFormValueModel {
  agencies: number[];
  candidatesStatuses: ApplicantStatus[];
  departments: number[];
  locations: number[];
  orderTypes: OrderType[];
  regions: number[];
  skills: number[];
}
