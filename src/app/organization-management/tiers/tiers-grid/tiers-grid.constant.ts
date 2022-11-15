import { GridActionRendererComponent } from "@organization-management/tiers/tiers-grid/grid-action-renderer/grid-action-renderer.component";
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';

export const TiersColumnsDefinition = ( editCallback: (tier: TierDetails) => void ) => (
  [
    {
      headerName: '',
      width: 140,
      sortable: true,
      cellRenderer: GridActionRendererComponent,
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
      field: 'hours',
      headerName: 'NUMBER OF HOURS',
      sortable: true,
    },
    {
      field: 'priority',
      headerName: 'PRIORITY',
      sortable: true,
    },
    {
      field: 'regionName',
      headerName: 'REGION',
      sortable: true,
    },
    {
      field: 'locationName',
      headerName: 'LOCATION',
      sortable: true,
    },
    {
      field: 'departmentName',
      headerName: 'DEPARTMENT',
      sortable: true,
    }
  ]
);
