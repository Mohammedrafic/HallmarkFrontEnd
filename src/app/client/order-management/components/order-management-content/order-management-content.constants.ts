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
  { text: 'Region', column: 'Region' },
  { text: '# of Positions', column: 'Availablepos' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Type', column: 'OrderType' },
  { text: 'Bill Rate', column: 'BillRate' },
  { text: 'Candidates', column: 'CandidatesCount' },
  { text: 'Start Date', column: 'JobStartDate' },
  { text: 'Agency', column: 'Agency' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Actual Start date', column: 'ActualStartdate' },
  { text: 'Actual End date', column: 'ActualEnddate' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Job Distribution', column: 'JobDistribution' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
  { text: 'Candidate Agency', column: 'CandidateAgency' },
];

export const perDiemColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Region', column: 'Region'},
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Candidates', column: 'Candidates' },
  { text: '# of Shifts Next 90 Days', column: 'NumberOfShiftsNext90Days' },
  { text: 'Agency', column: 'Agency' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Start Date', column: 'StartDate' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Job Distribution', column: 'JobDistribution' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
  { text: 'Candidate Agency', column: 'CandidateAgency' },
];

export const reOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Re-Order ID', column: 'ReOrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Region', column: 'Region'},
  { text: '# of Positions', column: 'CountOfPosition' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Candidates', column: 'Candidates' },
  { text: 'Bill Rate', column: 'BillRate' },
  { text: 'Re-Order Date', column: 'ReOrderDate' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Agency', column: 'Agency' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Distributed To', column: 'DistributedTo' },
  { text: 'Actual Start date', column: 'ActualStartdate' },
  { text: 'Actual End date', column: 'ActualEnddate' },
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

export const permPlacementColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: '# of Positions', column: 'Availablepos' },
  { text: 'Region', column: 'Region'},
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Candidates', column: 'CandidatesCount' },
  { text: 'Start Date', column: 'JobStartDate' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Actual Start date', column: 'ActualStartdate' },
  { text: 'Actual End date', column: 'ActualEnddate' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
  { text: 'Agency', column: 'Agency' },
  { text: 'Job Distribution', column: 'JobDistribution' },
  { text: 'Candidate Agency', column: 'CandidateAgency' },
  { text: 'Annual Salary From', column: 'AnnualSalaryFrom' },
  { text: 'Annual Salary To', column: 'AnnualSalaryTo' },
];

export const irpAllOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderID' },
  { text: 'Status', column: 'Status' },
  { text: 'Critical', column: 'Critical' },
  { text: 'Type', column: 'Type' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Avail pos', column: 'AvailPos' },
  { text: 'Region', column: 'Region' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Start Date', column: 'StartDate' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Actual Start Date', column: 'ActualStartDate' },
  { text: 'Actual End Date', column: 'ActualEndDate' },
  { text: 'Position ID', column: 'PositionID' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Irp Candid', column: 'IRPCandid' },
  { text: 'VMS Candid', column: 'VMSCan' },
  { text: 'Creation date', column: 'CreationDate' },
];

export const irpPerDiemOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderID' },
  { text: 'Status', column: 'Status' },
  { text: 'Critical', column: 'Critical' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Avail pos', column: 'AvailPos' },
  { text: 'Region', column: 'Region' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Job Date', column: 'JobDate' },
  { text: 'Actual Start Date', column: 'ActualStartDate' },
  { text: 'Actual End Date', column: 'ActualEndDate' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Irp Candid', column: 'IRPCandid' },
  { text: 'VMS Candid', column: 'VMSCan' },
  { text: 'Creation date', column: 'CreationDate' },
];

export const irpLTAOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderID' },
  { text: 'Status', column: 'Status' },
  { text: 'Critical', column: 'Critical' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Avail pos', column: 'AvailPos' },
  { text: 'Region', column: 'Region' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Start Date', column: 'StartDate' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Actual Start Date', column: 'ActualStartDate' },
  { text: 'Actual End Date', column: 'ActualEndDate' },
  { text: 'Position ID', column: 'PositionID' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Irp Candid', column: 'IRPCandid' },
  { text: 'VMS Candid', column: 'VMSCan' },
  { text: 'Creation date', column: 'CreationDate' },
];

export const irpIncompleteOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderID' },
  { text: 'Status', column: 'Status' },
  { text: 'Critical', column: 'Critical' },
  { text: 'Type', column: 'Type' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Avail pos', column: 'AvailPos' },
  { text: 'Region', column: 'Region' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Start Date', column: 'StartDate' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Actual Start Date', column: 'ActualStartDate' },
  { text: 'Actual End Date', column: 'ActualEndDate' },
  { text: 'Position ID', column: 'PositionID' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Irp Candid', column: 'IRPCandid' },
  { text: 'VMS Candid', column: 'VMSCan' },
  { text: 'Creation date', column: 'CreationDate' },
];

export const orderJourneyColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderID' },
  { text: 'Status', column: 'Status' },
  { text: 'System', column: 'System' },
  { text: 'Type', column: 'Type' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Creation date', column: 'CreationDate' },
  { text: 'Published In IRP', column: 'PublishedInIRP' },
  { text: '#Of Days In IRP', column: 'NoOfDaysInIRP' },
  { text: 'Published In VMS', column: 'PublishedInVMS' },
  { text: '#Of Days In VMS', column: 'NoOfDaysInVMS' },
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
    fieldName: 'regionName',
    visible: true,
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
    fieldName: 'regionName',
    visible: true,
  },
  {
    fieldName: 'shiftStartTime',
    visible: true,
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
    fieldName: 'regionName',
    visible: true,
  },
  {
    fieldName: 'shiftStartTime',
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
    fieldName: 'shiftStartTime',
    visible: true,
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
    fieldName: 'regionName',
    visible: true,
  },
  {
    fieldName: 'shiftStartTime',
    visible: true,
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
