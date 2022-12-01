import { PaymentMode } from '../enums';

export interface InvoicePayment {
  id: number;
  invoiceId: number;
  checkId: number;
  organizationId: number;
  checkNumber: string;
  checkDate: string;
  checkAmount: number;
  burnRate: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  isRefund: boolean;
}

export interface InvoicePaymentGetParams {
  InvoiceId: number;
  OrganizationId?: number;
  AgencySuffix?: number;
}

export interface PaymentMeta {
  invoiceNumber: string | null,
  amount: number | null,
}

export interface PaymentDto {
  id?: number;
  invoiceId: number;
  checkId?: number;
  agencySuffix?: number;
  paymentDate: string;
  payment: number;
  organizationId: number;
  amountToPay?: number;
  formattedInvoiceId?: string;
}

export interface PaymentCreationDto {
  check: {
    id?: number;
    checkNumber: string;
    initialAmount: number;
    checkDate: string;
    paymentMode: PaymentMode;
    isRefund: boolean;
  },
  payments: PaymentDto[];
}