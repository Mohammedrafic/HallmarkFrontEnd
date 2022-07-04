import { OrderType } from '@shared/enums/order-type';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';

export interface FillrateReportFilterFormValueModel {
  candidatesStatuses: ApplicantStatus[];
  departments: number[];
  locations: number[];
  orderTypes: OrderType[];
  regions: number[];
  skills: number[];
  orderEndDate: Date;
  orderStartDate: Date;
  excludeFcAgency: boolean;
}
