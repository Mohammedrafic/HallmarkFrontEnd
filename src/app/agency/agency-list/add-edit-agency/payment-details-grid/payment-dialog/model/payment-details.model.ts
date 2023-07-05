import { Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';

export interface PaymentDetailsInterface {
  paymentDetailsForm: FormGroup;
  formValue: PaymentDetails | ElectronicPaymentDetails;
  saveEvent: Subject<number>;
  paymentsList: PaymentDetails[] | ElectronicPaymentDetails[];
  mode: number;

  createPaymentDetailsForm(): void;
}

export interface PaymentDetails {
  mode: number;
  bankAddress1: string;
  bankCity: string;
  bankZipCode: number;
  payee: string;
  startDate: Date;
  id?: number;
  agencyId?: number;
}

export interface ElectronicPaymentDetails extends PaymentDetails {
  accountHolderAddress1: string;
  accountHolderAddress2: string;
  accountHolderCity: string;
  accountHolderCountry: number;
  accountHolderName: string;
  accountHolderNumber: string;
  accountHolderPhone: string;
  accountHolderState: string;
  accountHolderZipCode: string;
  accountNumber: string;
  bankAddress2: string;
  bankCountry: number;
  bankName: string;
  bankState: string;
  endDate: Date;
  fee: string;
  routingNumber: string;
  swiftCode: string;
  netSuiteId?: number;
}
