import { EditDepartmentFields } from '@client/candidates/enums/edit-department.enum';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { DepartmentFormFieldConfig } from '../departments.model';

export const EditDepartmentsFormConfig = (
  isOriented: boolean
): ReadonlyArray<DepartmentFormFieldConfig<EditDepartmentFields>> => [
  {
    type: ControlTypes.Date,
    title: 'Start Date',
    field: EditDepartmentFields.START_DATE,
    show: true,
    disabled: false,
  },
  {
    type: ControlTypes.Date,
    title: 'End Date',
    field: EditDepartmentFields.END_DATE,
    show: true,
    disabled: true,
  },
  {
    type: ControlTypes.Checkbox,
    title: 'Oriented',
    field: EditDepartmentFields.ORIENTED,
    disabled: false,
  },
  {
    type: ControlTypes.Checkbox,
    title: 'Home Cost Center',
    field: EditDepartmentFields.HOME_COST_CENTER,
    disabled: true,
  },
  {
    type: ControlTypes.Date,
    title: 'Orientation Start Date',
    field: EditDepartmentFields.ORIENTED_START_DATE,
    show: isOriented,
  },
];
