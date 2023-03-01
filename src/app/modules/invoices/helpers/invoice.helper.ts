import { DataSourceItem } from '@core/interface';
import { VendorFee } from '../enums';
import { InvoiceDetail, InvoiceDetailDto, InvoiceSummaryItem } from '../interfaces';

export const CreateInvoiceReasonList = (reasons: DataSourceItem[]): DataSourceItem[] => {
  return reasons ? reasons.map((value: DataSourceItem) => ({
    ...value,
    name: value.reason,
  })) as DataSourceItem[] : [];
};

export const CreateVendorFeeList = (): DataSourceItem[] => {
  return [VendorFee.All, VendorFee.Yes, VendorFee.No].map((value: VendorFee) => ({
    name: VendorFee[value],
    text: VendorFee[value],
    id: value,
    value,
  }));
};

export const CreateInvoiceData = (invoiceDto: InvoiceDetailDto): InvoiceDetail => {
  const summary: InvoiceSummaryItem[] = invoiceDto.summary.flatMap((summaryData) => {
    return summaryData.items.map((item) => {
      item.locationName = summaryData.locationName;
      return item;
    });
  });

  return ({
    meta: invoiceDto.meta,
    invoiceRecords: invoiceDto.invoiceRecords,
    totals: invoiceDto.totals,
    summary: summary,
  });
};
