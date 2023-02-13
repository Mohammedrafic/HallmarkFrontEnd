/* eslint-disable max-len */
import { InvoicesAggregationType } from '../enums';

const groupInvoicesByHintsMap: Record<InvoicesAggregationType | number, string> = {
  [InvoicesAggregationType.Agency]: 'Generate as many invoices as different unique Agencies in the chosen timesheets list.',
  [InvoicesAggregationType.Candidate]: 'Generate as many invoices as different unique Candidates in the chosen timesheets list.',
  [InvoicesAggregationType.CostCenter]: 'Generate as many invoices as different unique Cost Centers in the chosen timesheets list.',
  [InvoicesAggregationType.Location]: 'Generate as many invoices as different unique Locations in the chosen timesheets list.',
  [InvoicesAggregationType.Region]: 'Generate as many invoices as different unique Regions in the chosen timesheets list.',
  [InvoicesAggregationType.Organization]: 'Generate one single invoice',
};


export interface GroupInvoicesOption {
  text: string;
  id: InvoicesAggregationType;
  tooltip: string;
  // [key: string]: Object;
}

export const GroupInvoicesOptions: GroupInvoicesOption[] = [
  {
    id: InvoicesAggregationType.Agency,
    text: 'Agency (Location - Agency)',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Agency],
  },
  {
    id: InvoicesAggregationType.Candidate,
    text: 'Candidate (Location - Candidate)',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Candidate],
  },
  {
    id: InvoicesAggregationType.CostCenter,
    text: 'Cost Center (Location-Department)',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.CostCenter],
  },
  {
    id: InvoicesAggregationType.Organization,
    text: 'Organization',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Organization],
  },
  {
    id: InvoicesAggregationType.Region,
    text:  'Region',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Region],
  },
  {
    id: InvoicesAggregationType.Location,
    text: 'Location',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Location],
  },
];

export const SettingsGroupInvoicesOptions: GroupInvoicesOption[] = [
  {
    id: InvoicesAggregationType.CostCenter,
    text: 'Cost Center (Location-Department)',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.CostCenter],
  },
  {
    id: InvoicesAggregationType.Organization,
    text: 'Organization',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Organization],
  },
  {
    id: InvoicesAggregationType.Region,
    text:  'Region',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Region],
  },
  {
    id: InvoicesAggregationType.Location,
    text: 'Location',
    tooltip: groupInvoicesByHintsMap[InvoicesAggregationType.Location],
  },
];

export const defaultGroupInvoicesOption: GroupInvoicesOption = GroupInvoicesOptions[0];
