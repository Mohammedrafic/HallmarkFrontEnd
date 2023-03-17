import { EditDepartmentFields } from '@client/candidates/enums/edit-department.enum';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { DepartmentFormFieldConfig } from '../departments.model';

export const EditDepartmentsFormConfig = (
  isOriented: boolean,
  toggleHandler: (event: boolean, field: EditDepartmentFields) => void
): ReadonlyArray<DepartmentFormFieldConfig<EditDepartmentFields>> => [
  {
    type: ControlTypes.Date,
    title: 'Start Date',
    field: EditDepartmentFields.START_DATE,
    show: true,
    required: true,
  },
  {
    type: ControlTypes.Date,
    title: 'End Date',
    field: EditDepartmentFields.END_DATE,
    show: true,
    required: false,
  },
  {
    type: ControlTypes.Checkbox,
    title: 'Oriented',
    field: EditDepartmentFields.IS_ORIENTED,
    toggleHandler: (e: boolean, field: EditDepartmentFields) => { toggleHandler(e, field) }
  },
  {
    type: ControlTypes.Date,
    title: 'Orientation Start Date',
    field: EditDepartmentFields.ORIENTATION_DATE,
    show: isOriented,
    required: isOriented,
    isShort: true,
  },
];
