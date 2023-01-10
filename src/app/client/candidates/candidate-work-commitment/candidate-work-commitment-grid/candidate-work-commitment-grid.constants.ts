import { ValueFormatterParams } from "@ag-grid-community/core";
import { ColumnDefinitionModel } from "@shared/components/grid/models";
import { CandidateCommitmentGridActionRendererComponent } from "./grid-action-renderer/grid-action-renderer.component";

export const CandidateWorkCommitmentColumnDef: ColumnDefinitionModel[] = [
    {
      field: '',
      headerName: '',
      cellRenderer: CandidateCommitmentGridActionRendererComponent,
      maxWidth: 100,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      valueFormatter: (params: ValueFormatterParams) => params.value,
      maxWidth: 140,
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      minWidth: 185,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'regions',
      headerName: 'Region',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'locations',
      headerName: 'Location',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'jobCode',
      headerName: 'Job Code',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'payRate',
      headerName: 'Pay Rate',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'minWorkExperience',
      headerName: 'Min. Work Experience',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'availRequirement',
      headerName: 'Avail. Requirement (hours)',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'schedulePeriod',
      headerName: 'Schedule Period (weeks)',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'isCriticalOrder',
      headerName: 'Critical Order',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'holiday',
      headerName: 'Holiday',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 1,
      minWidth: 185,
    },
  ];
