import { formatDate } from "@angular/common";

import { ValueFormatterParams } from "@ag-grid-community/core";

import { formatDate as format } from "@shared/constants";
import { PayRateColumns } from "../enums/pay-rate-columns.enum";
import { PayRateHistory } from "../interfaces/pay-rate-history.interface";
import { GridActionsCellComponent, GridActionsCellConfig } from "@shared/components/grid/cell-renderers/grid-actions-cell";
import { DateTimeHelper } from "@core/helpers";

export const PayRateColumnDef = (deleteCallback: (value: number) => void, disabled: boolean) => ([
  {
    field: '',
    headerName: '',
    maxWidth: 100,
    cellRenderer: GridActionsCellComponent,
    cellRendererParams: (): GridActionsCellConfig => {
      return {
        actionsConfig: [
          {
            action: (value) => {
              const id = (value as PayRateHistory).id as number;
              if (id) {
                deleteCallback(id);
              }
            },
            iconName: 'trash-2',
            buttonClass: 'remove-button',
            disabled: disabled,
          },
        ],
      };
    },
  },
  {
    field: PayRateColumns.START_DATE,
    headerName: 'Start Date',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => {
      const timeZone = params.value ? DateTimeHelper.getISOTimeZone(params.value) : 'UTC';
      return params.value && formatDate(params.value, format, 'en-US', timeZone);
    },
  },
  {
    field: PayRateColumns.END_DATE,
    headerName: 'End Date',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => {
      const timeZone = params.value ? DateTimeHelper.getISOTimeZone(params.value) : 'UTC';
      return params.value && formatDate(params.value, format, 'en-US', timeZone);
    },
  },
  {
    field: PayRateColumns.PAY_RATE,
    headerName: 'Pay Rate',
    type: 'rightAligned',
    width: 160,
    valueFormatter: (params: ValueFormatterParams) => `$ ${params.value}`,
  },

  {
    field: PayRateColumns.WORC_COMMITMENT,
    headerName: 'Work Commitment',
    flex: 1,
  },
]);
