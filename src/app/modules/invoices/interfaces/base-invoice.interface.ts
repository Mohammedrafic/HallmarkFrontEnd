import { PendingInvoiceStatus } from '../enums/invoice-status.enum';

export interface BaseInvoice {
  id: number;
  agencyId: number;
  agencyName: string;

  candidateId: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateMiddleName: string | null;

  departmentId: number;
  departmentName: string;

  locationId: number;
  locationName: string;

  orderId: number;
  formattedOrderIdFull: string;
  organizationId: number;
  organizationName: string;

  regionId: number;
  regionName: string;

  status: PendingInvoiceStatus;
  statusText: string;

  skillId: number;
  skillName: string;
  skillAbbr: string;
}
