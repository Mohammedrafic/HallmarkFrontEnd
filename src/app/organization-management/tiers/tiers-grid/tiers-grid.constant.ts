import { GridActionRendererComponent } from "@organization-management/tiers/tiers-grid/grid-action-renderer/grid-action-renderer.component";
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';
import { getCorrectFieldValue, skillgridValue, workcommitgridValue } from '@organization-management/tiers/helpres';

export const TiersColumnsDefinition = ( editCallback: (tier: TierDetails) => void ) => (
  [
    {
      headerName: '',
      width: 160,
      minWidth: 160,
      sortable: true,
      cellRenderer: GridActionRendererComponent,
      rowDrag: true,
      cellRendererParams: {
        edit: (tier: TierDetails) => {
          editCallback(tier);
        }
      }
    },
    {
      field: 'name',
      headerName: 'TIER NAME',
      sortable: true,
    },
    {
      field: 'priority',
      headerName: 'PRIORITY',
      sortable: true,
    },
    {
      field: 'hours',
      headerName: 'NUMBER OF HOURS',
      sortable: true,
    },
    {
      field: 'skills',
      headerName: 'Skills',
      sortable: true,
      valueGetter: (params: {data: any}) => skillgridValue(params.data.skills)
    },
    {
      field: 'workCommitments',
      headerName: 'Work Commitment',
      sortable: true,
      valueGetter: (params: {data: any}) => workcommitgridValue(params.data.workCommitments)
    },
    // {
    //   field: 'regionName',
    //   headerName: 'REGION',
    //   sortable: true,
    //   valueGetter: (params: {data: TierDetails}) => getCorrectFieldValue(params.data.regionName)
    // },
    // {
    //   field: 'locationName',
    //   headerName: 'LOCATION',
    //   sortable: true,
    //   valueGetter: (params: {data: TierDetails}) => getCorrectFieldValue(params.data.locationName)
    // },
    // {
    //   field: 'departmentName',
    //   headerName: 'DEPARTMENT',
    //   sortable: true,
    //   valueGetter: (params: {data: TierDetails}) => getCorrectFieldValue(params.data.departmentName)
    // }
  ]
);
