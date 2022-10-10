import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { FeeSettingsClassification, JobDistributionOrderType } from '@shared/models/associate-organizations.model';
import { valuesOnly } from '@shared/utils/enum.utils';

export const OPRION_FIELDS = {
  text: 'name',
  value: 'id',
};

export const REGION_OPTION = {
  text: 'name',
  value: 'name',
};

export const ORDER_TYPE = Object.values(JobDistributionOrderType)
  .filter(valuesOnly)
  .map((name) => ({ name, id: JobDistributionOrderType[name as JobDistributionOrderType] }));

export const CLASSIFICATION = Object.values(FeeSettingsClassification)
  .filter(valuesOnly)
  .map((name, id) => ({ name, id }));

export const DISABLED_BUSINESS_TYPES = [BusinessUnitType.Agency, BusinessUnitType.Organization, BusinessUnitType.MSP];
