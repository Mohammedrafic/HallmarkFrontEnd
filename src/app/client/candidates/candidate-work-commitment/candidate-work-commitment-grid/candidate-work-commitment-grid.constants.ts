import { ValueFormatterParams } from '@ag-grid-community/core';
import { formatDate } from '@angular/common';
import { CandidateWorkCommitment } from '../models/candidate-work-commitment.model';
import { CandidateCommitmentGridActionRendererComponent } from './grid-action-renderer/grid-action-renderer.component';
import { formatDate as formatDateString } from '@shared/constants/format-date';

export const CandidateWorkCommitmentColumnDef = (
    editCallback: (value: CandidateWorkCommitment) => void,
    deleteCallback: (value: CandidateWorkCommitment) => void,
    today: Date
  ) => ([
    {
      field: '',
      headerName: '',
      cellRenderer: CandidateCommitmentGridActionRendererComponent,
      maxWidth: 100,
      cellRendererParams: {
        today: today,
        edit: (value: CandidateWorkCommitment) => {
          editCallback(value);
        },
        delete: (value: CandidateWorkCommitment) => {
          deleteCallback(value);
        }
      }
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      valueFormatter: (params: ValueFormatterParams) =>
        formatDate(params.value, formatDateString, 'en-US', 'UTC'),
      maxWidth: 140,
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      valueFormatter: (params: ValueFormatterParams) =>
        params.value && formatDate(params.value, formatDateString, 'en-US', 'UTC'),
      minWidth: 140,
    },
    {
      field: 'name',
      headerName: 'Work Commitment',
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
      valueFormatter: (params: ValueFormatterParams) =>
        params.value && parseFloat(params.value).toFixed(2),
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'minWorkExperience',
      headerName: 'Min. Work Experience',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'availRequirement',
      headerName: 'Avail. Requirement (hours)',
      flex: 1,
      minWidth: 230,
    },
    {
      field: 'schedulePeriod',
      headerName: 'Schedule Period (weeks)',
      flex: 1,
      minWidth: 220,
    },
    {
      field: 'criticalOrder',
      headerName: 'Critical Order',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'holiday',
      headerName: 'Holiday',
      flex: 1,
      minWidth: 140,
    },
    {
      field: 'created',
      headerName: 'Created',
      valueFormatter: (params: ValueFormatterParams) =>
        params.value && formatDate(params.value, formatDateString, 'en-US', 'UTC'),
      flex: 1,
      minWidth: 140,
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 1,
      minWidth: 185,
    },
  ]);
