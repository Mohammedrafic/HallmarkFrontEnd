import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { valuesOnly } from '@shared/utils/enum.utils';

export const BUSINESS_UNITS_VALUES = Object.values(BusinessUnitType)
  .filter(valuesOnly)
  .map((text, id) => ({ text, id: id + 1 }));

export const OPRION_FIELDS = {
  text: 'text',
  value: 'id',
};

export const DISABLED_GROUP = [BusinessUnitType.Agency, BusinessUnitType.Organization];
