import { FormGroup } from '@angular/forms';
import { FieldType } from '@core/enums';
import { DropdownOption } from '@core/interface';
import { PaymentMode } from './invoice-add-payment.enum';

export interface PaymentFormConfig {
  title: string;
  field: string;
  type: FieldType;
  required?: boolean;
  options?: DropdownOption[],
}

export interface CheckForm {
  date: string;
  checkNumber: string;
  checkDate: string;
  initialAmount: number;
  paymentMode: PaymentMode;
  isRefund: boolean;
}

export interface PaymentsTableData {
  id: number;
  invoiceNumber: string;
  amount: number;
  payment: number;
  balance: number;
  group: FormGroup;
}

export interface PaymentForm {
  amount: number;
  balance: number;
}
