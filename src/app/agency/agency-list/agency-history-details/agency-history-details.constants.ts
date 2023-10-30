import { ICellRendererParams } from '@ag-grid-community/core';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { GridValuesHelper } from '@core/helpers';
import { BusinessUnitAuditHistoryTableColumns } from './agency-history-details.enums';
import { Agency } from '../../../shared/models/agency.model';


export const AgencyAuditHistoryTableColumnsDefinition = (): ColumnDefinitionModel[] => {
  return [
    {
      headerName: BusinessUnitAuditHistoryTableColumns.changeType,
      field: 'changeType',
      minWidth: 120,
      maxWidth: 140,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.modifiedOn,
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
      headerName: BusinessUnitAuditHistoryTableColumns.modifiedBy,
      field: 'modifiedBy',
      minWidth: 120,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.businessUnitId,
      field: 'businessUnitId',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.businessUnitType,
      field: 'businessUnitType',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.businessUnitName,
      field: 'businessUnitName',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.parentUnitId,
      field: 'parentUnitId',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.logoId,
      field: 'logoId',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.businessUnitCreatedAt,
      field: 'businessUnitCreatedAt',
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
      headerName: BusinessUnitAuditHistoryTableColumns.businessUnitCreatedBy,
      field: 'businessUnitCreatedBy',
      minWidth: 100,
      maxWidth: 180,
      filter: true,
      sortable: true,
      resizable: true
    }, 
    {
      headerName: BusinessUnitAuditHistoryTableColumns.isMspSource,
      field: 'isMspSource',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.netSuiteId,
      field: 'netSuiteId',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    //{
    //  headerName: BusinessUnitAuditHistoryTableColumns.businessUnitLastModifiedAt,
    //  field: 'businessUnitLastModifiedAt',
    //  minWidth: 100,
    //  filter: 'agDateColumnFilter',
    //  filterParams: {
    //    buttons: ['reset'],
    //    debounceMs: 1000,
    //    suppressAndOrCondition: true,
    //    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    //      if (cellValue == null) {
    //        return 0;
    //      }
    //      const dateAsString = GridValuesHelper.formatDate(cellValue, 'MM/dd/yyyy') as string
    //      const dateParts = dateAsString.split('/');
    //      const year = Number(dateParts[2]);
    //      const month = Number(dateParts[0]) - 1;
    //      const day = Number(dateParts[1]);

    //      const cellDate = new Date(year, month, day);
    //      if (cellDate < filterLocalDateAtMidnight) {
    //        return -1;
    //      } else if (cellDate > filterLocalDateAtMidnight) {
    //        return 1;
    //      }
    //      return 0;
    //    },
    //    inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
    //  },
    //  cellRenderer: (params: ICellRendererParams) => {
    //    const str = GridValuesHelper.formatDate(params.data.modifiedOn, 'MM/dd/yyyy') as string
    //    return str?.length > 0 ? str : "";
    //  },
    //  sortable: true,
    //  resizable: true
    //},
    //{
    //  headerName: BusinessUnitAuditHistoryTableColumns.businessUnitLastModifiedBy,
    //  field: 'businessUnitLastModifiedBy',
    //  minWidth: 100,
    //  filter: true,
    //  sortable: true,
    //  resizable: true
    //},
    {
      headerName: BusinessUnitAuditHistoryTableColumns.dbConnectionName,
      field: 'dbConnectionName',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.organizationPrefix,
      field: 'organizationPrefix',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.isIRPEnabled,
      field: 'isIRPEnabled',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.isVMSEnabled,
      field: 'isVMSEnabled',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: BusinessUnitAuditHistoryTableColumns.netSuiteEnabled,
      field: 'netSuiteEnabled',
      minWidth: 100,
      filter: true,
      sortable: true,
      resizable: true
    }
  ];
};

export const EmptyAgency: Agency = {
  parentBusinessUnitId: null,
  agencyDetails: {
    id: undefined,
    externalId: null,
    taxId: '',
    name: '',
    addressLine1: '',
    addressLine2: '',
    state: '',
    country: 0,
    city: '',
    zipCode: '',
    phone1Ext: '',
    phone2Ext: '',
    fax: '',
    website: '',
    status: 0,
    netSuiteId: undefined
  },
  agencyBillingDetails: {
    id: undefined,
    sameAsAgency: false,
    name: '',
    address: '',
    country: 0,
    state: '',
    city: '',
    zipCode: '',
    phone1: '',
    phone2: '',
    ext: '',
    fax: ''
  },
  agencyContactDetails: [],
  agencyPaymentDetails: [],
  agencyJobDistribution: {
    regionNames: [],
    regions: [],
    skillCategories: []
  }
}
