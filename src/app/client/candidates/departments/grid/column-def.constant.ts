import { GridActionsCellComponent, GridActionsCellConfig } from '@shared/components/grid/cell-renderers/grid-actions-cell';
import { ValueFormatterParams } from '@ag-grid-community/core';
import { OrientationCompletedComponent } from './cell-renderers/orientation-completed/orientation-completed.component';
import { SkillMatchComponent } from './cell-renderers/skill-match/skill-match.component';
import { SkillNameComponent } from './cell-renderers/skill-name/skill-name.component';
import { DepartmentAssigned } from '../departments.model';

export interface ColumnDefParams {
  editHandler: (value: DepartmentAssigned) => void;
  deleteHandler: (id: number[]) => void;
  dateFormatter: (date: string) => string;
  disable: boolean;
}

export const columnDef = (columnParams: ColumnDefParams) => [
  {
    field: 'checkbox',
    headerName: '',
    width: 50,
    minWidth: 50,
    headerCheckboxSelection: true,
    headerCheckboxSelectionFilteredOnly: true,
    checkboxSelection: true,
  },
  {
    field: '',
    headerName: '',
    maxWidth: 100,
    cellRenderer: GridActionsCellComponent,
    cellRendererParams: (): GridActionsCellConfig => {
      return {
        actionsConfig: [
          {
            action: (value) => { columnParams.editHandler(value as DepartmentAssigned) },
            iconName: 'edit',
            iconClass: 'color-primary-active-blue-10',
            buttonClass: 'edit-button',
            disabled: columnParams.disable,
          },
          {
            action: (value) => columnParams.deleteHandler([(value as DepartmentAssigned).id]),
            iconName: 'trash-2',
            iconClass: 'color-supportive-red',
            buttonClass: 'remove-button',
            disabled: columnParams.disable,
          },
        ],
      };
    },
  },
  {
    field: 'regionName',
    headerName: 'Region',
    flex: 1,
  },
  {
    field: 'locationName',
    headerName: 'Location',
    flex: 1,
  },
  {
    field: 'departmentName',
    headerName: 'Department',
    flex: 1,
  },

  {
    field: 'skillMatch',
    headerName: 'Skill Match',
    cellRenderer: SkillMatchComponent,
    width: 100,
    minWidth: 100,
  },
  {
    field: 'skillName',
    headerName: 'Skill Name',
    cellRenderer: SkillNameComponent,
    flex: 1,
  },
  {
    field: 'isOriented',
    headerName: 'Orientation completed',
    cellRenderer: OrientationCompletedComponent,
    width: 140,
    minWidth: 140,
  },
  {
    field: 'startDate',
    headerName: 'Start Date',
    valueFormatter: (params: ValueFormatterParams) => columnParams.dateFormatter(params.value),
    maxWidth: 140,
  },
  {
    field: 'endDate',
    headerName: 'End Date',
    valueFormatter: (params: ValueFormatterParams) => columnParams.dateFormatter(params.value),
    maxWidth: 140,
  },
];
