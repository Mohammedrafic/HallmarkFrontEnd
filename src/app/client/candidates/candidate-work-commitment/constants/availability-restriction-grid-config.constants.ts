import { formatDate } from "@angular/common";

import { ValueFormatterParams } from "@ag-grid-community/core";

import { CandidateCommitmentGridActionRendererComponent } from
  "../components/candidate-work-commitment-grid/grid-action-renderer/grid-action-renderer.component";
import { formatDate as formatDateString } from '@shared/constants/format-date';

export const AvailabilityRestrictionColumnDef = (
  editCallback: (value: unknown) => void,
  deleteCallback: (value: unknown) => void,
) => ([
  {
    field: '',
    headerName: '',
    cellRenderer: CandidateCommitmentGridActionRendererComponent,
    maxWidth: 100,
    cellRendererParams: {
      edit: (value: unknown) => {
        editCallback(value);
      },
      delete: (value: unknown) => {
        deleteCallback(value);
      },
    },
  },
  {
    field: 'startDay',
    headerName: 'Start Day',
    maxWidth: 140,
  },
  {
    field: 'startTime',
    headerName: 'Start Time',
    maxWidth: 140,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value && formatDate(params.value, formatDateString, 'en-US', 'UTC'),
  },
  {
    field: 'endDay',
    headerName: 'End Day',
    maxWidth: 140,
  },

  {
    field: 'endTime',
    headerName: 'End Time',
    maxWidth: 140,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value && formatDate(params.value, formatDateString, 'en-US', 'UTC'),
  },
]);