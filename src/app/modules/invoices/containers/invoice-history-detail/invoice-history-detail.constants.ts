import { ValueFormatterParams } from "@ag-grid-community/core";
import { DateTimeHelper } from "@core/helpers";
import { ColumnDefinitionModel } from "@shared/components/grid/models";

import { PaymentMode } from "../../enums";
import { formatCurrency } from "@angular/common";


export const InvoiceAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
    return [


        {
            headerName: 'Organization',
            field: 'jsonData.organizationName',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'Entity Type',
            field: 'entityType',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'STATUS',
            field: 'jsonData.invoiceStateText',
            minWidth: 100,
            cellClass: 'status-cell',
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'AP Delivery',
            field: 'jsonData.apDeliveryText',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'Group By',
            field: 'jsonData.aggregateByTypeText',
            minWidth: 120,
            filter: true,
            sortable: true,
            resizable: true
        },

        {
            headerName: 'ISSUED DATE',
            field: 'jsonData.issuedDate',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY'),
            sortable: true,
            resizable: true
        },
        {
            headerName: 'DUE DATE',
            field: 'jsonData.dueDate',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY '),
            sortable: true,
            resizable: true
        },

        {
            headerName: 'Change Type',
            field: 'changeType',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },



        {
            headerName: 'MODIFIED DATE',
            field: 'modifiedOn',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
            sortable: true,
            resizable: true
        },

        {
            headerName: 'MODIFIED By',
            field: 'modifiedByName',
            minWidth: 100,
            sortable: true,
            resizable: true
        },


    ];
};


export const agencyInvoiceAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
    return [


        {
            headerName: 'Organization',
            field: 'jsonData.organizationName',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'Entity Type',
            field: 'entityType',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'STATUS',
            field: 'jsonData.invoiceStateText',
            minWidth: 100,
            cellClass: 'status-cell',
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'AP Delivery',
            field: 'jsonData.apDeliveryText',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'Group By',
            field: 'jsonData.aggregateByTypeText',
            minWidth: 120,
            filter: true,
            sortable: true,
            resizable: true
        },

        {
            headerName: 'ISSUED DATE',
            field: 'jsonData.issuedDate',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY'),
            sortable: true,
            resizable: true
        },
        {
            headerName: 'DUE DATE',
            field: 'jsonData.dueDate',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY '),
            sortable: true,
            resizable: true
        },

        {
            headerName: 'Change Type',
            field: 'changeType',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },



        {
            headerName: 'MODIFIED DATE',
            field: 'modifiedOn',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
            sortable: true,
            resizable: true
        },

        {
            headerName: 'MODIFIED By',
            field: 'modifiedByName',
            minWidth: 100,
            sortable: true,
            resizable: true
        },


    ];
};

export const paymentAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
    return [
   
        {
            headerName: 'PAYMENT DATE',
            field: 'jsonData.paymentDate',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY'),
            sortable: true,
            resizable: true
        },
        {
            headerName: 'PAYMENT',
            field: 'jsonData.payment',
            minWidth: 80,
            filter: true,
            sortable: true,
            resizable: true,
            valueFormatter: (params: ValueFormatterParams) => formatCurrency(params.value, 'en', '$'),

        },
        {
            headerName: 'is Deleted',
            field: 'jsonData.isDeleted',
            minWidth: 80,
            filter: true,
            sortable: true,
            resizable: true,
            valueFormatter: (params: ValueFormatterParams) => {
                if (params.value) {
                    return 'Yes';
                }
                return 'No';
            },
        },
        {
            headerName: 'Change Type',
            field: 'changeType',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'MODIFIED DATE',
            field: 'modifiedOn',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
            sortable: true,
            resizable: true
        },
        {
            headerName: 'MODIFIED By',
            field: 'modifiedByName',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },



    ];
};


export const checkAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
    return [


        {
            headerName: 'Check DATE',
            field: 'jsonData.date',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY'),
            sortable: true,
            resizable: true
        },

        {
            headerName: 'PAYMENT MODE',
            field: 'jsonData.paymentModeText',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
        },
        {
            headerName: 'Reference Number',
            field: 'jsonData.number',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'Is Refund',
            field: 'jsonData.isRefund',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
            valueFormatter: (params: ValueFormatterParams) => {
                if (params.value) {
                    return 'Yes';
                }
                return 'No';
            },
        },
        {
            headerName: 'Is Delete',
            field: 'jsonData.isDeleted',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
            valueFormatter: (params: ValueFormatterParams) => {
                if (params.value) {
                    return 'Yes';
                }
                return 'No';
            },
        },
        {
            headerName: 'Change Type',
            field: 'changeType',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },

        {
            headerName: 'MODIFIED DATE',
            field: 'modifiedOn',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
            sortable: true,
            resizable: true
        },
        {
            headerName: 'MODIFIED By',
            field: 'modifiedByName',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },



    ];
};