import { DataSourceItem } from '@core/interface';
import { VendorFee } from '../enums';

export const CreateInvoiceReasonList = (reasons: DataSourceItem[]): DataSourceItem[] => {
  return reasons ? reasons.map((value: DataSourceItem) => ({
    ...value,
    name: value.reason,
  })) as DataSourceItem[] : [];
};

export const CreateVendorFeeList = (): DataSourceItem[] => {
  return [VendorFee.All, VendorFee.Yes, VendorFee.No].map((value: VendorFee) => ({
    name: VendorFee[value],
    id: value,
  }));
};
