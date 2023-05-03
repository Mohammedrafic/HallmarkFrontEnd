import { valuesOnly } from '@shared/utils/enum.utils';

export interface BusinessUnitModel {
  [key: number]: string;
}

export enum BusinessUnitType {
  Hallmark = 1,
  MSP = 2,
  Organization = 3,
  Agency = 4,
  Candidates = 7
}

export const businessUnitValues = Object.values(BusinessUnitType)
  .filter(valuesOnly)
  .reduce((acc, text, id) => ({ ...acc, [id + 1]: text }), {});
