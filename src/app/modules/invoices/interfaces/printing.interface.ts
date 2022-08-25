export interface InvoicePrintRecord {
  weekDate: string;
  timeIn: string;
  timeOut: string;
  billRateConfigName: string;
  costCenterName: string;
  jobId: string;
  candidateFirstName: string;
  candidateLastName: string;
  agencyName: string;
  skillName: string;
  value: number;
  rate: number;
  total: number;
};

export interface InvoicePrintSummaryRecord {
  departmentName: string;
  skillName: string;
  value: number;
  total: number;
  details: string;
}

export interface PrintInvoiceMeta {
  invoiceNum: string;
  invoiceDate: string;
  paymentTerms: number;
  dueDate: string;
  unitName: string;
  unitAddress: string;
  remitAddress: string;
}

export interface GroupedPrintSummary {
  locationName: string;
  items: InvoicePrintSummaryRecord[];
}

export interface PrintInvoiceData {
  meta: PrintInvoiceMeta,
  totals: {
    total: number;
    totalValue: number;
    adjustments: number;
    amount: number;
  };
  invoiceRecords: InvoicePrintRecord[];
  summary: GroupedPrintSummary[];
}

export interface PrintingPostDto {
  organizationId: number;
  invoiceIds: number[];
}
