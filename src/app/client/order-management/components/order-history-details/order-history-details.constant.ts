import { ICellRendererParams } from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { OrderAuditHistoryTableColumns, OrderBillRateAuditHistoryTableColumns, OrderClassificationAuditHistoryTableColumns, OrderContactAuditHistoryTableColumns, OrderCredentialAuditHistoryTableColumns, OrderJobDistributionAuditHistoryTableColumns, OrderWorkLocationAuditHistoryTableColumns } from './order-history-details.enum';
import { GridValuesHelper } from '@core/helpers';


export const OrderAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: OrderAuditHistoryTableColumns.orderId,
      field: 'orderId',
      minWidth: 100,
      maxWidth:120,
      filter: true,
      sortable: true,
      resizable: true
    },    
    {
      headerName: 'TYPE',
      field: 'orderType',
      minWidth: 100,
      maxWidth:120,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'STATUS',
      field: 'orderStatus',
      minWidth: 120, 
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'TITLE',
      field: 'title',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'REGION',
      field: 'regionName',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'LOCATION',
      field: 'locationName',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'DEPARTMENT',
      field: 'departmentName',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'SKILL',
      field: 'skill',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'HOURLY RATE',
      field: 'hourlyRate',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'OPEN POSITIONS',
      field: 'openPositions',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'DURATION',
      field: 'duration',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'START DATE',
      field: 'jobStartDate',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = cellValue;
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.data.jobStartDate;
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'END DATE',
      field: 'jobEndDate',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = cellValue;
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = params.data.jobEndDate;
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'SHIFT START TIME',
      field: 'shiftStartTime',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'SHIFT END TIME',
      field: 'shiftEndTime',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'CHANGE TYPE',
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
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'MODIFIED BY',
      field: 'modifiedBy',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }
    
  ];
};

export const OrderCredentialAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: OrderCredentialAuditHistoryTableColumns.credentialType,
      field: 'credentialType',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true      
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.credentialName,
      field: 'credentialName',
      minWidth: 100,
      maxWidth:200,
      filter: true,
      sortable: true,
      resizable: true
    },  
      
    {
      headerName: OrderCredentialAuditHistoryTableColumns.reqForSubmission,
      field: 'reqForSubmission',
      minWidth: 120,      
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.reqForOnboard,
      field: 'reqForOnboard',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: OrderCredentialAuditHistoryTableColumns.optional,
      field: 'optional',
      minWidth: 100,
      maxWidth: 120,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: OrderCredentialAuditHistoryTableColumns.comment,
      field: 'comment',
      minWidth: 100,
      maxWidth:200,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.changeType,
      field: 'changeType',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedOn,
      field: 'modifiedOn',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedBy,
      field: 'modifiedBy',
      minWidth: 100,
      maxWidth:250,
      filter: true,
      sortable: true,
      resizable: true
    }
    
  ];
};

export const OrderBillRatesAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: OrderBillRateAuditHistoryTableColumns.bIllRateTitle,
      field: 'bIllRateTitle',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true      
    },  
    {
      headerName: OrderBillRateAuditHistoryTableColumns.billRateCategory,
      field: 'billRateCategory',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true
    },        
    {
      headerName: OrderBillRateAuditHistoryTableColumns.payRateType,
      field: 'payRateType',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderBillRateAuditHistoryTableColumns.rateHour,
      field: 'rateHour',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    }, 
   {
      headerName: OrderBillRateAuditHistoryTableColumns.effectiveDate,
      field: 'effectiveDate',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.effectiveDate, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderBillRateAuditHistoryTableColumns.dailyOtEnabled,
      field: 'dailyOtEnabled',
      minWidth: 120,      
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderBillRateAuditHistoryTableColumns.seventhDayOtEnabled,
      field: 'seventhDayOtEnabled',
      minWidth: 120,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: OrderBillRateAuditHistoryTableColumns.weeklyOtEnabled,
      field: 'weeklyOtEnabled',
      minWidth: 120,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: OrderBillRateAuditHistoryTableColumns.isPredefined,
      field: 'isPredefined',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: OrderBillRateAuditHistoryTableColumns.changeType,
      field: 'changeType',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderBillRateAuditHistoryTableColumns.modifiedOn,
      field: 'modifiedOn',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderBillRateAuditHistoryTableColumns.modifiedBy,
      field: 'modifiedBy',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }
    
  ];
};

export const OrderContactAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: OrderContactAuditHistoryTableColumns.name,
      field: 'name',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true      
    },  
    {
      headerName: OrderContactAuditHistoryTableColumns.title,
      field: 'title',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: OrderContactAuditHistoryTableColumns.email,
      field: 'email',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderContactAuditHistoryTableColumns.mobilePhone,
      field: 'mobilePhone',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },   
    {
      headerName: OrderContactAuditHistoryTableColumns.isPrimaryContact,
      field: 'isPrimaryContact',
      minWidth: 120,
      filter: true,
      sortable: true,
      resizable: true
    },   
    {
      headerName: OrderCredentialAuditHistoryTableColumns.changeType,
      field: 'changeType',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedOn,
      field: 'modifiedOn',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedBy,
      field: 'modifiedBy',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }
    
  ];
};

export const OrderWorkLocationAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: OrderWorkLocationAuditHistoryTableColumns.address,
      field: 'address',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true      
    },  
    {
      headerName: OrderWorkLocationAuditHistoryTableColumns.state,
      field: 'state',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: OrderWorkLocationAuditHistoryTableColumns.city,
      field: 'city',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderCredentialAuditHistoryTableColumns.changeType,
      field: 'changeType',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedOn,
      field: 'modifiedOn',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedBy,
      field: 'modifiedBy',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }
    
  ];
};

export const OrderJobDistributionAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: OrderJobDistributionAuditHistoryTableColumns.jobDistributionOption,
      field: 'jobDistributionOption',
      minWidth: 250,     
      filter: true,
      sortable: true,
      resizable: true      
    },  
    {
      headerName: OrderJobDistributionAuditHistoryTableColumns.agency,
      field: 'agency',
      minWidth: 100,
      maxWidth:180,
      filter: true,
      sortable: true,
      resizable: true
    },        
    {
      headerName: OrderCredentialAuditHistoryTableColumns.changeType,
      field: 'changeType',
      minWidth: 100,
      maxWidth:150,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedOn,
      field: 'modifiedOn',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedBy,
      field: 'modifiedBy',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }    
  ];
};

export const OrderClassificationAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: OrderClassificationAuditHistoryTableColumns.classification,
      field: 'classification',
      minWidth: 100,     
      filter: true,
      sortable: true,
      resizable: true      
    },             
    {
      headerName: OrderCredentialAuditHistoryTableColumns.changeType,
      field: 'changeType',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },  
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedOn,
      field: 'modifiedOn',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: OrderCredentialAuditHistoryTableColumns.modifiedBy,
      field: 'modifiedBy',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }
    
  ];
};