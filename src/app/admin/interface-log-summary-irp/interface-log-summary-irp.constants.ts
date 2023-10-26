import { ColDef } from "@ag-grid-community/core";
import { GridErroredCellListComponent } from "@shared/components/import-dialog-content/grid-errored-cell-list/grid-errored-cell-list.component";


  export const InterfaceEmployeesWithErrorColumnsConfig: ColDef[] = [
    {
      field: 'employeeID',
      width: 100,
      headerName: 'Employee ID',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'firstName',
      width: 100,
      headerName: 'First Name',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'middleName',
     width: 100,
      headerName: 'Middle Name',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'lastName',
     width: 100,
      headerName: 'Last Name',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'dob',
      width: 70,
      headerName: 'DOB',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'primarySkill',
      width: 80,
      headerName: 'Primary Skill',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'secondarySkill',
      width: 80,
      headerName: 'Secondary Skill',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'classification',
      width: 90,
      headerName: 'Classification',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'hireDate',
      width: 70,
      headerName: 'Hire Date',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'fte',
      width: 100,
      headerName: 'FTE',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'hrCompanyCode',
      width: 80,
      headerName: 'Hr Company Code',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'internalTransferRecruitment',
     width: 100,
      headerName: 'Internal Transfer Recruitment',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'contract',
     width: 100,
      headerName: 'Contract',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'contractStartDate',
      width: 110,
      headerName: 'Contract Start Date',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'contractEndDate',
      width: 110,
      headerName: 'Contract End Date',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'address',
      width: 150,
      headerName: 'Address',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'country',
      width: 150,
      headerName: 'Country',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'state',
      width: 150,
      headerName: 'State',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'city',
      width: 120,
      headerName: 'City',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
      field: 'zipCode',
      width: 100,
      headerName: 'Zip Code',
      filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
        field: 'email',
        width: 100,
        headerName: 'Email',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
    },
    {
        field: 'workEmail',
        width: 100,
        headerName: 'Work Email',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'cellphone',
        width: 120,
        headerName: 'Cell phone',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'alternativePhone',
        width: 120,
        headerName: 'Alternative Phone',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'professionalSummary',
        width: 120,
        headerName: 'Professional Summary',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'profileStatus',
        width: 120,
        headerName: 'Profile Status',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'holdStartDate',
        width: 120,
        headerName: 'Hold Start Date',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'holdEndDate',
        width: 120,
        headerName: 'Hold End Date',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'terminationDate',
        width: 130,
        headerName: 'Termination Date',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'terminationReason',
        width: 130,
        headerName: 'Termination Reason',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'status',
        width: 130,
        headerName: 'Status',
        filter: 'agTextColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
      },
      sortable: true,
      resizable: true
      },
      {
        field: 'errorDescriptions',
        resizable: true,
        autoHeight:true,
        suppressSizeToFit:true,
        headerName: 'Error Description',
        cellRenderer: GridErroredCellListComponent,
      },
      
  ];

  export enum LogStatusEnum {
    OverAll = 0,
    Inserted = 1,
    Errored = 2,
    Updated = 3,
  }
  