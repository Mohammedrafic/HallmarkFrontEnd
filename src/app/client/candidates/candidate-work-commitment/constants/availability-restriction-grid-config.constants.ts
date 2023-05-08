import { formatDate } from "@angular/common";

import { ValueFormatterParams } from "@ag-grid-community/core";

import { CandidateCommitmentGridActionRendererComponent } from
  "../components/candidate-work-commitment-grid/grid-action-renderer/grid-action-renderer.component";
import { formatTime } from '@shared/constants/format-date';
import { AvailabilityRestriction } from "../interfaces";
import { AvailabilityFilterColumns } from "../enums";
import { daysOfWeek } from "@core/constants/days-week.constant";

export const AvailabilityRestrictionColumnDef = (
  editCallback: (value: AvailabilityRestriction) => void,
  deleteCallback: (value: number) => void,
) => ([
  {
    field: '',
    headerName: '',
    cellRenderer: CandidateCommitmentGridActionRendererComponent,
    maxWidth: 100,
    cellRendererParams: {
      edit: (value: AvailabilityRestriction) => {
        editCallback(value);
      },
      delete: (value: AvailabilityRestriction) => {
        if (value.id) {
          deleteCallback(value.id);
        }
      },
    },
  },
  {
    field: AvailabilityFilterColumns.START_DAY,
    headerName: 'Start Day',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => daysOfWeek[params.value],
  },
  {
    field: AvailabilityFilterColumns.START_TIME,
    headerName: 'Start Time',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value && formatDate(params.value, formatTime, 'en-US', 'UTC'),
  },
  {
    field: AvailabilityFilterColumns.END_DAY,
    headerName: 'End Day',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => daysOfWeek[params.value],
  },

  {
    field: AvailabilityFilterColumns.END_TIME,
    headerName: 'End Time',
    flex: 1,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value && formatDate(params.value, formatTime, 'en-US', 'UTC'),
  },
]);