import { InvoicesAggregationType } from '../enums';

const groupInvoicesByHintsMap: Record<InvoicesAggregationType | number, string> = {
  [InvoicesAggregationType.Agency]: 'Generate as many invoices as different unique Agencies in the chosen timesheets list.',
  [InvoicesAggregationType.Candidate]: 'Generate as many invoices as different unique Candidates in the chosen timesheets list.',
  [InvoicesAggregationType.CostCenter]: 'Generate as many invoices as different unique Cost Centers in the chosen timesheets list.',
  [InvoicesAggregationType.Location]: 'Generate as many invoices as different unique Locations in the chosen timesheets list.',
  [InvoicesAggregationType.Region]: 'Generate as many invoices as different unique Regions in the chosen timesheets list.',
};


export interface GroupInvoicesOption {
  text: string;
  id: InvoicesAggregationType;
  tooltip: string;
  [key: string]: Object,
}

export const groupInvoicesOptions: GroupInvoicesOption[] = [
  {
    id: InvoicesAggregationType.Region,
    text:  'Region',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Region],
  },
  {
    id: InvoicesAggregationType.Location,
    text:  'Location',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Location],
  },
  {
    id: InvoicesAggregationType.CostCenter,
    text:  'Cost Center',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.CostCenter],
  },
  {
    id: InvoicesAggregationType.Candidate,
    text:  'Candidate',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Candidate],
  },
  {
    id: InvoicesAggregationType.Agency,
    text:  'Agency',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Agency],
  }
];


export const defaultGroupInvoicesOption: GroupInvoicesOption = groupInvoicesOptions[0];
