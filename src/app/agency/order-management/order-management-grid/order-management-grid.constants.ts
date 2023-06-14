import { GridColumn } from '@shared/models/grid-column.model';
import { ExportColumn } from '@shared/models/export.model';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64,
};

export const myAgencyColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderId' },
  { text: 'Status', column: 'OrderStatus' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Organization', column: 'Organization' },
  { text: '# of Positions ', column: 'NumberOfPositions' },
  { text: 'Candidates', column: 'CandidatesCount' },
  { text: 'Bill Rate', column: 'BillRate' },
  { text: 'Skill', column: 'OrderSkill' },
  { text: 'Region', column: 'Region'},
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Type', column: 'OrderType' },
  { text: 'Start Date', column: 'StartDate' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'ShiftName', column: 'ShiftName' },
  { text: 'Shift Start Time', column: 'ShiftStartTime' },
  { text: 'Shift End Time', column: 'ShiftEndTime' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
];

export const myAgencyChildColumnsToExport: ExportColumn[] = [
  { text: 'Position ID', column: 'PositionId' },
  { text: 'Candidate Name', column: 'CandidateName' },
  { text: 'Position Status', column: 'ChildOrderStatus' },
  { text: 'Candidate Status', column: 'CandidateStatus' },
  { text: 'Candidate Skill', column: 'ChildOrderSkill' },
  { text: 'Candidate Bill Rate', column: 'CandidateBillRate' },
  { text: 'Submission %', column: 'SubmissionsPercentage' },
  { text: 'Onboard %', column: 'OnboardedPercentage' },
];

export const reOrdersColumnsToExport: ExportColumn[] = [
  { text: 'Re-Order ID', column: 'ReOrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Region', column: 'Region' },
  { text: '# of Positions', column: 'CountOfPosition' },
  { text: 'Location', column: 'Location' },
  { text: 'Department', column: 'Department' },
  { text: 'Candidates', column: 'Candidates' },
  { text: 'Bill Rate', column: 'BillRate' },
  { text: 'Re-Order Date', column: 'ReOrderDate' },
  { text: 'ShiftName', column: 'ShiftName' },
  { text: 'Shift Start Time', column: 'ShiftStartTime' },
  { text: 'Shift End Time', column: 'ShiftEndTime' },
  { text: 'Shift', column: 'Shift' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
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

export const perDiemColumnsToExport: ExportColumn[] = [
  { text: 'Order ID', column: 'OrderId' },
  { text: 'Status', column: 'Status' },
  { text: 'Job Title', column: 'JobTitle' },
  { text: 'Organization', column: 'OrganizationName' },
  { text: 'Candidates', column: 'CandidatesCount' },
  { text: 'Skill', column: 'Skill' },
  { text: 'Region', column: 'Region' },
  { text: 'Location', column: 'LocationName' },
  { text: 'Department', column: 'DepartmentName' },
  { text: '# of Shifts Next 90 Days', column: 'NumberOfShiftsNext90Days' },
  { text: 'End Date', column: 'EndDate' },
  { text: 'Creation Date', column: 'CreationDate' },
  { text: 'Distributed On', column: 'DistributedOn' },
  { text: 'Special Project Category', column: 'SpecialProjectCategory' },
  { text: 'Special Project Name', column: 'SpecialProjectName' },
  { text: 'PO #', column: 'PONumber' },
  { text: 'Offered Date', column: 'OfferedDate' },
  { text: 'ShiftName', column: 'ShiftName' },
  { text: 'Shift Start Time', column: 'ShiftStartTime' },
  { text: 'Shift End Time', column: 'ShiftEndTime' },
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

export const ReOrdersColumnsConfig: GridColumn[] = [
  {
    fieldName: 'reOrderId',
    visible: true,
  },
  {
    fieldName: 'jobStartDate',
    visible: true,
  },
  {
    fieldName: 'endDate',
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
    fieldName: 'orderId',
    visible: false,
  },
  {
    fieldName: 'orderType',
    visible: false,
  },
  {
    fieldName: 'organizationName',
    visible: false,
  },
  {
    fieldName: 'shiftsNext90Days',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeFrom',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeTo',
    visible: false,
  },
  {
    fieldName: 'billRate',
    visible: true,
  },
];

export const MyAgencyOrdersColumnsConfig: GridColumn[] = [
  {
    fieldName: 'orderId',
    visible: true,
  },
  {
    fieldName: 'orderType',
    visible: true,
  },
  {
    fieldName: 'jobStartDate',
    visible: true,
  },
  {
    fieldName: 'endDate',
    visible: true,
  },
  {
    fieldName: 'organizationName',
    visible: true,
  },
  {
    fieldName: 'numberOfPositions',
    visible: true,
  },
  {
    fieldName: 'reOrderId',
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
    fieldName: 'shiftsNext90Days',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeFrom',
    visible: false,
  },
  {
    fieldName: 'annualSalaryRangeTo',
    visible: false,
  },
  {
    fieldName: 'billRate',
    visible: true,
  },
];

export const PerDiemColumnsConfig = [
  {
    fieldName: 'orderId',
    visible: true,
  },
  {
    fieldName: 'orderType',
    visible: false,
  },
  {
    fieldName: 'jobStartDate',
    visible: false,
  },
  {
    fieldName: 'endDate',
    visible: false,
  },
  {
    fieldName: 'reOrderId',
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
    fieldName: 'numberOfPositions',
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
    fieldName: 'orderId',
    visible: true,
  },
  {
    fieldName: 'orderType',
    visible: false,
  },
  {
    fieldName: 'jobStartDate',
    visible: true,
  },
  {
    fieldName: 'endDate',
    visible: false,
  },
  {
    fieldName: 'reOrderId',
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
    fieldName: 'numberOfPositions',
    visible: true,
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
    fieldName: 'organizationName',
    visible: false,
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
