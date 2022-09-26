import { GridHelper } from '@shared/helpers/grid.helper';
import { GridStatusRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-status-renderer/grid-status-renderer.component';
import { JobClassification } from '@shared/enums/job-classification';
import { GridNameRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-name-renderer/grid-name-renderer.component';
import { GridPositionRendererComponent } from '@shared/components/candidate-details/candidate-grid/grid-position-renderer/grid-position-renderer.component';
import { CandidatesDetailsModel } from '@shared/components/candidate-details/models/candidate.model';

const valueHelper = new GridHelper();

export const CandidatesColumnsDefinition = (isAgency: boolean) => {
  return [
    {
      field: 'lastName',
      headerName: 'NAME',
      width: 160,
      cellRenderer: GridNameRendererComponent,
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 160,
      cellRenderer: GridStatusRendererComponent,
      sortable: true,
    },
    {
      field: 'classification',
      headerName: 'CLASSIFICATION',
      width: 170,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${JobClassification[params.data.classification] ?? ''}`,
      sortable: true,
    },
    {
      field: 'startDate',
      headerName: 'START DATE',
      width: 150,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.startDate, 'MM/dd/yyyy')}`,
      sortable: true,
    },
    {
      field: 'endDate',
      headerName: 'END DATE',
      width: 140,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.endDate, 'MM/dd/yyyy')}`,
      sortable: true,
    },
    {
      field: 'scheduledDate',
      headerName: 'SCHEDULED DATE',
      width: 180,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.scheduledDate, 'MM/dd/yyyy')}`,
      sortable: true,
    },
    {
      field: 'region',
      headerName: 'REGION',
      width: 140,
      sortable: true,
    },
    {
      field: 'location',
      headerName: 'LOCATION/DEPARTMENT',
      width: 220,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${params.data.location}, ${params.data.department}`,
      sortable: true,
    },
    {
      field: 'initialRate',
      headerName: 'INITIAL RATE',
      width: 150,
      sortable: true,
    },
    {
      field: 'billRate',
      headerName: 'BILL RATE',
      width: 140,
      sortable: true,
    },
    {
      field: 'positionId',
      headerName: 'POSITION ID',
      width: 150,
      cellRenderer: GridPositionRendererComponent,
      sortable: true,
    },
    {
      field: 'assignment',
      headerName: 'ASSIGNMENT',
      width: 160,
      sortable: true,
    },
    {
      field: 'businessUnitName',
      width: 170,
      headerValueGetter: () => (!isAgency ? 'AGENCY NAME' : 'ORGANIZATION NAME'),
      sortable: true,
    },
    {
      field: 'skill',
      headerName: 'SKILL',
      width: 160,
      sortable: true,
    },
  ];
};
