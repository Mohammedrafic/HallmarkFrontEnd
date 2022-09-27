import { valuesOnly } from '@shared/utils/enum.utils';
import { Country } from '@shared/enums/states';

export const ADD_PAYMENT = 'Add Payment Details';
export const EDIT_PAYMENT = 'Edit Payment Details';
export const BANK_COUNTRY = 'bankCountry';
export const FORMAT_INPUT = 'MM/dd/yyyy';
export const PLACEHOLDER = 'MM/DD/YYYY';
export const ZIP_CODE_MASK = '00000||000000';
export const PHONE_MASK = '000-000-0000';

export enum PaymentDetailMode {
  Manual,
  Electronic,
}

export const OPTION_FIELDS = {
  text: 'text',
  value: 'id',
};

export const PAYMENT_MODE = Object.values(PaymentDetailMode)
  .filter(valuesOnly)
  .map((text, id: number) => ({ text, id }));

export const COUNTRIES = [
  { id: Country.USA, text: Country[0] },
  { id: Country.Canada, text: Country[1] },
];
