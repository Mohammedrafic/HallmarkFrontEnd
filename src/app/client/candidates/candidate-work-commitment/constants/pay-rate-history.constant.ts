import { formatDate } from "@angular/common";

import { ValueFormatterParams } from "@ag-grid-community/core";

import { formatDate as format } from "@shared/constants";
import { CandidateCommitmentGridActionRendererComponent } from 
  "../components/candidate-work-commitment-grid/grid-action-renderer/grid-action-renderer.component";
import { PayRateColumns } from "../enums/pay-rate-columns.enum";
import { PayRateHistory } from "../interfaces/pay-rate-history.interface";

export const PayRateColumnDef = (deleteCallback: (value: number) => void) =>  ([
  {
    field: '',
    headerName: '',
    cellRenderer: CandidateCommitmentGridActionRendererComponent,
    maxWidth: 100,
    cellRendererParams: {
      delete: (value: PayRateHistory) => {
        if (value.id) {
          deleteCallback(value.id);
        }
      },
    },
  },
  {
    field: PayRateColumns.START_DATE,
    headerName: 'Start Date',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value && formatDate(params.value, format, 'en-US', 'UTC'),
  },
  {
    field: PayRateColumns.END_DATE,
    headerName: 'End Date',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) =>
      params.value && formatDate(params.value, format, 'en-US', 'UTC'),
  },
  {
    field: PayRateColumns.PAY_RATE,
    headerName: 'Pay Rate',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => `$ ${params.value}`,
  },

  {
    field: PayRateColumns.WORC_COMMITMENT,
    headerName: 'Work Commitment',
    width: 160,
  },
]);
