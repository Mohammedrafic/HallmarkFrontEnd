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
      field: 'name',
      headerName: 'NAME',
      width: 160,
      cellRenderer: GridNameRendererComponent,
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 160,
      cellRenderer: GridStatusRendererComponent,
    },
    {
      field: 'classification',
      headerName: 'CLASSIFICATION',
      width: 150,
      valueFormatter: (params: { data: CandidatesDetailsModel }) => `${JobClassification[params.data.classification]}`,
    },
    {
      field: 'startDate',
      headerName: 'START DATE',
      width: 140,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.startDate, 'MM/dd/yyyy')}`,
    },
    {
      field: 'endDate',
      headerName: 'END DATE',
      width: 140,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.endDate, 'MM/dd/yyyy')}`,
    },
    {
      field: 'scheduledDate',
      headerName: 'SCHEDULED DATE',
      width: 160,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${valueHelper.formatDate(params.data.scheduledDate, 'MM/dd/yyyy')}`,
    },
    {
      field: 'region',
      headerName: 'REGION',
      width: 140,
    },
    {
      field: 'locationDepartment',
      headerName: 'LOCATION/DEPARTMENT',
      width: 200,
      valueFormatter: (params: { data: CandidatesDetailsModel }) =>
        `${params.data.location}, ${params.data.department}`,
    },
    {
      field: 'initialRate',
      headerName: 'INITIAL RATE',
      width: 130,
    },
    {
      field: 'billRate',
      headerName: 'BILL RATE',
      width: 120,
    },
    {
      field: 'positionId',
      headerName: 'POSITION ID',
      width: 130,
      cellRenderer: GridPositionRendererComponent,
    },
    {
      field: 'assignment',
      headerName: 'ASSIGNMENT',
      width: 160,
    },
    {
      field: 'businessUnitName',
      width: 160,
      headerValueGetter: () => (isAgency ? 'AGENCY NAME' : 'ORGANIZATION NAME'),
    },
  ];
};
