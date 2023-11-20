import { ColDef } from '@ag-grid-community/core';
import {
  OrderManagementIrpCandidateSystem,
} from '@shared/components/grid/cell-renderers/order-management-irp-row-position/order-management-irp-row-position.enum';

export const PositionGridCell = {
  field: 'positionId',
  headerName: 'Position ID',
  width: 130,
};

export const DefaultOrderManagementSubGridCells: ColDef[] = [
  {
    field: 'system',
    headerName: 'System',
    width: 80,
  },
  {
    field: 'candidateName',
    headerName: 'Candidate Name',
    width: 140,
  },
  {
    field: 'candidateStatus',
    width: 140,
  },
];

export const OrderManagementIRPSubGridCells: ColDef[] = [
  PositionGridCell,
  {
    field: 'orderStatus',
    width: 220,
    cellClass: 'order-status',
  },
  ...DefaultOrderManagementSubGridCells,
  {
    field: 'primarySkillName',
    headerName: 'Primary Skill',
    width: 160,
  },
  {
    field: 'workCommitment',
    headerName: 'Work Commitment',
    width: 180,
  },
  {
    field: 'guaranteedWorkWeek',
    headerName: 'Expected Work Week',
    width: 140,
  },
];

export const OrderManagementVMSSubGridCells: ColDef[] = [
  PositionGridCell,
  {
    field: 'orderStatus',
    width: 220,
    cellClass: 'order-status',
  },
  ...DefaultOrderManagementSubGridCells,
  {
    field: 'agencyName',
    headerName: 'Agency',
    width: 160,
  },
  {
    field: 'candidateBillRate',
    headerName: 'Bill Rate $',
    width: 100,
  },
  {
    field: 'guaranteedWorkWeek',
    headerName: 'Expected Work Week',
    width: 140,
  },
  {
    field: 'actualStartDate',
    headerName: 'Actual start date',
    width: 140,
  },
  {
    field: 'actualEndDate',
    headerName: 'Actual end date',
    width: 140,
  },
];

export const OrderManagementSubGridCells = (candidateSystem: number) => {
  return candidateSystem === OrderManagementIrpCandidateSystem.IRP ?
    OrderManagementIRPSubGridCells : OrderManagementVMSSubGridCells;
};
