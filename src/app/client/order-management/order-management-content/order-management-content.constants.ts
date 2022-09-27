import { ExportColumn } from '@shared/models/export.model';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64,
};

export enum MoreMenuType {
  'Edit',
  'Duplicate',
  'Close',
  'Delete',
  'Re-Open',
}

export const allOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: '# of Positions', column: 'NumberOfPositions' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Type', column: 'OrderType' },
  { text: 'Bill Rate', column: 'BillRate' },
  { text: 'Candidates', column: 'CandidatesCount' },
  { text: 'Start Date', column: 'JobStartDate' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Distributed To', column: 'DistributedTo' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
  { text: 'Agency', column: 'Agency' },
  { text: 'Candidate Agency', column: 'CandidateAgency' },
];

export const perDiemColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Candidates', column: 'Candidates' },
  { text: '# of Shifts Next 90 Days', column: 'NumberOfShiftsNext90Days' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Distributed To', column: 'DistributedTo' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
  { text: 'Agency', column: 'Agency' },
  { text: 'Candidate Agency', column: 'CandidateAgency' },
];

export const reOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Re-Order ID', column: 'ReOrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: '# of Positions', column: 'CountOfPosition' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Candidates', column: 'Candidates' },
  { text: 'Bill Rate', column: 'BillRate' },
  { text: 'Re-Order Date', column: 'ReOrderDate' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Agency', column: 'Agency' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Distributed To', column: 'DistributedTo' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
  { text: 'Candidate Agency', column: 'CandidateAgency' },
];

export const reOrdersChildColumnToExport: ExportColumn[] = [
  { text: 'Position ID', column: 'PositionID' },
  { text: 'Position Status', column: 'PositionStatus' },
  { text: 'Candidate Name', column: 'CandidateName' },
  { text: 'Candidate Status', column: 'CandidateStatus' },
  { text: 'Candidate Bill Rate', column: 'CandidateBillRate' },
  { text: 'Submission', column: 'Submission' },
  { text: 'Onboarded', column: 'Onboarded' },
];

export const allOrdersChildColumnsToExport: ExportColumn[] = [
  { text: 'Position ID', column: 'PositionID' },
  { text: 'Candidate Name', column: 'CandidateName' },
  { text: 'Position Status', column: 'PositionStatus' },
  { text: 'Candidate Status', column: 'CandidateStatus' },
  { text: 'Candidate Bill Rate', column: 'CandidateBillRate' },
  { text: 'Submission %', column: 'Submission' },
  { text: 'Onboard %', column: 'Onboard' },
];

export const perDiemChildColumnsToExport: ExportColumn[] = [
  { text: 'Re-Order ID', column: 'ReOrders.Id' },
  { text: 'Re-Order Status', column: 'ReOrders.Status' },
  { text: 'Open Positions', column: 'ReOrders.OpenPositions' },
  { text: 'Agencies', column: 'ReOrders.Agencies' },
  { text: 'Re-Order Bill Rate', column: 'ReOrders.BillRate' },
  { text: 'Re-Order Date', column: 'ReOrders.StartDate' },
  { text: 'Re-Order Shift Start Time', column: 'ReOrders.ShiftStartTime' },
  { text: 'Re-Order Shift End Time', column: 'ReOrders.ShiftEndTime' },
  { text: 'Candidates', column: 'ReOrders.Candidates' },
];

export const ReOrdersColumnsConfig = [
  {
    fieldName: 'reOrderFromId',
    visible: true,
  },
  {
    fieldName: 'shift',
    visible: true,
  },
  {
    fieldName: 'agencies',
    visible: true,
  },
  {
    fieldName: 'id',
    visible: false,
  },
  {
    fieldName: 'orderType',
    visible: false,
  },
  {
    fieldName: 'startDate',
    visible: true,
  },
  {
    fieldName: 'endDate',
    visible: false,
  },
  {
    fieldName: 'shiftsNext90Days',
    visible: false,
  },
  {
    fieldName: 'templateTitle',
    visible: false,
  },
  {
    fieldName: 'statusText',
    visible: true,
  },
  {
    fieldName: 'jobTitle',
    visible: true,
  },
  {
    fieldName: 'openPositions',
    visible: true,
  },
  {
    fieldName: 'billRate',
    visible: true,
  },
  {
    fieldName: 'candidates',
    visible: true,
  },
  {
    fieldName: 'annualSalaryRangeFrom',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeTo',
    visible: false,
  },
];

export const AllOrdersColumnsConfig = [
  {
    fieldName: 'id',
    visible: true,
  },
  {
    fieldName: 'orderType',
    visible: true,
  },
  {
    fieldName: 'startDate',
    visible: true,
  },
  {
    fieldName: 'endDate',
    visible: true,
  },
  {
    fieldName: 'reOrderFromId',
    visible: false,
  },
  {
    fieldName: 'shift',
    visible: false,
  },
  {
    fieldName: 'agencies',
    visible: false,
  },
  {
    fieldName: 'shiftsNext90Days',
    visible: false,
  },
  {
    fieldName: 'templateTitle',
    visible: false,
  },
  {
    fieldName: 'actions',
    visible: true,
  },
  {
    fieldName: 'statusText',
    visible: true,
  },
  {
    fieldName: 'jobTitle',
    visible: true,
  },
  {
    fieldName: 'openPositions',
    visible: true,
  },
  {
    fieldName: 'billRate',
    visible: true,
  },
  {
    fieldName: 'candidates',
    visible: true,
  },
  {
    fieldName: 'annualSalaryRangeFrom',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeTo',
    visible: false,
  },
];

export const PerDiemColumnsConfig = [
  {
    fieldName: 'id',
    visible: true,
  },
  {
    fieldName: 'orderType',
    visible: false,
  },
  {
    fieldName: 'startDate',
    visible: false,
  },
  {
    fieldName: 'endDate',
    visible: false,
  },
  {
    fieldName: 'reOrderFromId',
    visible: false,
  },
  {
    fieldName: 'shift',
    visible: false,
  },
  {
    fieldName: 'agencies',
    visible: false,
  },
  {
    fieldName: 'openPositions',
    visible: false,
  },
  {
    fieldName: 'billRate',
    visible: false,
  },
  {
    fieldName: 'shiftsNext90Days',
    visible: true,
  },
  {
    fieldName: 'templateTitle',
    visible: false,
  },
  {
    fieldName: 'statusText',
    visible: true,
  },
  {
    fieldName: 'jobTitle',
    visible: true,
  },
  {
    fieldName: 'candidates',
    visible: true,
  },
  {
    fieldName: 'annualSalaryRangeFrom',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeTo',
    visible: false,
  },
];

export const orderTemplateColumnsConfig = [
  {
    fieldName: 'id',
    visible: true,
  },
  {
    fieldName: 'templateTitle',
    visible: true,
  },
  {
    fieldName: 'orderType',
    visible: true,
  },
  {
    fieldName: 'startDate',
    visible: false,
  },
  {
    fieldName: 'endDate',
    visible: true,
  },
  {
    fieldName: 'reOrderFromId',
    visible: false,
  },
  {
    fieldName: 'shift',
    visible: false,
  },
  {
    fieldName: 'agencies',
    visible: false,
  },
  {
    fieldName: 'openPositions',
    visible: false,
  },
  {
    fieldName: 'billRate',
    visible: false,
  },
  {
    fieldName: 'shiftsNext90Days',
    visible: false,
  },
  {
    fieldName: 'jobTitle',
    visible: false,
  },
  {
    fieldName: 'openPositions',
    visible: false,
  },
  {
    fieldName: 'statusText',
    visible: false,
  },
  {
    fieldName: 'candidates',
    visible: false,
  },
  {
    fieldName: 'regionName',
    visible: true,
  },
  {
    fieldName: 'annualSalaryRangeFrom',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeTo',
    visible: false,
  },
];

export const PermPlacementColumnsConfig = [
  {
    fieldName: 'id',
    visible: true,
  },
  {
    fieldName: 'orderType',
    visible: false,
  },
  {
    fieldName: 'startDate',
    visible: true,
  },
  {
    fieldName: 'endDate',
    visible: false,
  },
  {
    fieldName: 'reOrderFromId',
    visible: false,
  },
  {
    fieldName: 'shift',
    visible: false,
  },
  {
    fieldName: 'agencies',
    visible: false,
  },
  {
    fieldName: 'shiftsNext90Days',
    visible: false,
  },
  {
    fieldName: 'templateTitle',
    visible: false,
  },
  {
    fieldName: 'actions',
    visible: true,
  },
  {
    fieldName: 'statusText',
    visible: true,
  },
  {
    fieldName: 'jobTitle',
    visible: true,
  },
  {
    fieldName: 'openPositions',
    visible: true,
  },
  {
    fieldName: 'billRate',
    visible: false,
  },
  {
    fieldName: 'candidates',
    visible: true,
  },
  {
    fieldName: 'annualSalaryRangeFrom',
    visible: true,
  },
  {
    fieldName: 'annualSalaryRangeTo',
    visible: true,
  },
];
