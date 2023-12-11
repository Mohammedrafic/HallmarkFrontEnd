import { ValueFormatterParams } from "@ag-grid-community/core";
import { DateTimeHelper } from "@core/helpers";
import { ColumnDefinitionModel } from "@shared/components/grid/models";

import { PaymentMode } from "../../enums";


const paymentModeOptions = {
    [PaymentMode.Check]: 'check',
    [PaymentMode.Electronic]: 'electronic',
};
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

export const paymentAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
    return [
        {
            headerName: 'CHECK ID',
            field: 'checkId',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },

        {
            headerName: 'PAYMENT',
            field: 'payment',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },

        {
            headerName: 'Organization',
            field: 'organizationName',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },


        {
            headerName: 'PAYMENT DATE',
            field: 'paymentDate',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
            sortable: true,
            resizable: true
        },
        {
            headerName: 'MODIFIED DATE',
            field: 'lastModifiedAt',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
            sortable: true,
            resizable: true
        },



        {
            headerName: 'MODIFIED By',
            field: 'lastModifiedName',
            minWidth: 100,
            filter: true,
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

export const agencypaymentAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
    return [
        {
            headerName: 'CHECK ID',
            field: 'checkId',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },

        {
            headerName: 'PAYMENT',
            field: 'payment',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },
        {
            headerName: 'PAYMENT MODE',
            field: 'paymentMode',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true,
            valueFormatter: (params: ValueFormatterParams) => paymentModeOptions[params.value as PaymentMode],

        },
        {
            headerName: 'Refernce Number',
            field: 'referenceNumber',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },

        {
            headerName: 'Organization',
            field: 'organizationName',
            minWidth: 100,
            filter: true,
            sortable: true,
            resizable: true
        },


        {
            headerName: 'PAYMENT DATE',
            field: 'paymentDate',
            minWidth: 100,
            filter: 'agDateColumnFilter',
            valueFormatter: (params: ValueFormatterParams) => DateTimeHelper.formatDateUTC(params.value, 'MM/dd/YYYY HH:mm'),
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