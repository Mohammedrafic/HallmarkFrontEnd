import { MenuSettings } from '@shared/models';

export const AGENCYREPORTS_SETTINGS: MenuSettings[] = [
  {
    text: 'Financial Timesheet',
    id: 1,
    route: './financial-timesheet-report',
    permissionKeys: ['CanViewAgencyFinancialTimesheet'],
  },
  {
    text: 'Invoice Summary',
    id: 2,
    route: './invoice-summary-report',
    permissionKeys: ['CanViewAgencyInvoiceSummary'],
  },
  
];
