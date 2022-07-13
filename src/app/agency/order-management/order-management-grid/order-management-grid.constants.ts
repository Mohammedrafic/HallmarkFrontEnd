import { OrderType } from '@shared/enums/order-type';
import { AgencyOrderManagement } from '@shared/models/order-management.model';
import { GridColumn } from '@shared/models/grid-column.model';
import { ExportColumn } from '@shared/models/export.model';

export const ROW_HEIGHT = {
  SCALE_UP_HEIGHT: 140,
  SCALE_DOWN_HEIGHT: 64,
};

export const typeValueAccess = (_: string, { orderType }: AgencyOrderManagement) => {
  return OrderType[orderType];
};

export const myAgencyColumnsToExport: ExportColumn[] = [
  { text:'Order ID', column: 'OrderId'},
  { text:'Status', column: 'Status'},
  { text:'Job Title', column: 'JobTitle'},
  { text:'Organization', column: 'OrganizationName' },
  { text:'# of Positions', column: 'NumberOfPositions'},
  { text:'Candidates', column: 'CandidatesCount'},
  { text:'Bill Rate', column: 'BillRate'},
  { text:'Skill', column: 'Skill'},
  { text:'Location', column: 'LocationName'},
  { text:'Department', column: 'DepartmentName'},
  { text:'Type', column: 'Type'},
  { text:'Start Date', column: 'JobStartDate'},
];

export const reOrdersColumnsToExport: ExportColumn[] = [
  { text:'Re-Order ID', column: 'ReOrderId'},
  { text:'Status', column: 'Status'},
  { text:'Job Title', column: 'JobTitle'},
  { text:'# of Positions', column: 'NumberOfPositions' },
  { text:'Candidates', column: 'CandidatesCount'},
  { text:'Bill Rate', column: 'BillRate'},
  { text:'Skill', column: 'Skill'},
  { text:'Location', column: 'LocationName'},
  { text:'Department', column: 'DepartmentName'},
  { text:'Re-Order Date', column: 'ReOrderDate'},
  { text:'Shift', column: 'Shift'},
  { text:'Agency', column: 'AgencyName'},
];

export const ReOrdersColumnsConfig: GridColumn[] = [
  {
    fieldName: 'reOrderId',
    visible: true
  },
  {
    fieldName: 'reOrderDate',
    visible: true
  },
  {
    fieldName: 'shift',
    visible: true
  },
  {
    fieldName: 'agencyName',
    visible: true
  },
  {
    fieldName: 'orderId',
    visible: false
  },
  {
    fieldName: 'type',
    visible: false
  },
  {
    fieldName: 'jobStartDate',
    visible: false
  },
  {
    fieldName: 'organizationName',
    visible: false
  }
];

export const MyAgencyOrdersColumnsConfig: GridColumn[] = [
  {
    fieldName: 'orderId',
    visible: true
  },
  {
    fieldName: 'type',
    visible: true
  },
  {
    fieldName: 'jobStartDate',
    visible: true
  },
  {
    fieldName: 'organizationName',
    visible: true
  },
  {
    fieldName: 'reOrderId',
    visible: false
  },
  {
    fieldName: 'reOrderDate',
    visible: false
  },
  {
    fieldName: 'shift',
    visible: false
  },
  {
    fieldName: 'agencyName',
    visible: false
  },
];

export const PerDiemColumnsConfig = [
  {
    fieldName: 'orderId',
    visible: true
  },
  {
    fieldName: 'type',
    visible: false
  },
  {
    fieldName: 'jobStartDate',
    visible: false
  },
  {
    fieldName: 'reOrderId',
    visible: false
  },
  {
    fieldName: 'reOrderDate',
    visible: false
  },
  {
    fieldName: 'shift',
    visible: false
  },
  {
    fieldName: 'agencyName',
    visible: false
  },
  {
    fieldName: 'numberOfPositions',
    visible: false
  },
  {
    fieldName: 'billRate',
    visible: false
  },
  {
    fieldName: 'shiftCount',
    visible: true
  },
];
