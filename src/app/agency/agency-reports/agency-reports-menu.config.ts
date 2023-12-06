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
  {
    text: 'Missing Credentials',
    id: 3,
    route: './missing-credentials-agency',
    permissionKeys: ['CanViewAgencymissingcredentials'],
  },
  {
    text: 'Credential Expiry',
    id: 4,
    route: './credentials-expiry-agency',
    permissionKeys: ['CanViewAgencyCredentialExpire'],
  },
  {
    text: 'User Activity Report',
    id: 5,
    route: './useractivity',
    permissionKeys: ['CanViewAgencyUserActivity'],

  },
  {
    text: 'Candidate Eligibility',
    id: 6,
    route: './candidate-eligibility-agency',
    permissionKeys: ['CanViewAgencyCandidateEligibility'],

  },
  
];
