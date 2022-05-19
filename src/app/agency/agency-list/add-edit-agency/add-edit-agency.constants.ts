import { BusinessUnitType } from '@shared/enums/business-unit-type';

export const CREATE_UNDER_VALUE = [
  {
    text: 'Hallmark',
    id: BusinessUnitType.Hallmark,
  },
  {
    text: 'MSP',
    id: BusinessUnitType.MSP,
  },
];

export const OPRION_FIELDS = {
  text: 'text',
  value: 'id',
};

export const DISABLED_BUSINESS_TYPES = [BusinessUnitType.Agency, BusinessUnitType.Organization];
