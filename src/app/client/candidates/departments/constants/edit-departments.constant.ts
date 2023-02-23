import { EditDepartmentFieldsEnum } from '@client/candidates/enums/edit-department.enum';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { DepartmentFormFieldConfig } from '../departments.model';

export const EditDepartmentsFormConfig = (
  isOriented: boolean,
): DepartmentFormFieldConfig<EditDepartmentFieldsEnum>[] => [
  {
    type: ControlTypes.Date,
    title: 'Start Date',
    field: EditDepartmentFieldsEnum.START_DATE,
    show: true,
    disabled: false,
  },
  {
    type: ControlTypes.Date,
    title: 'End Date',
    field: EditDepartmentFieldsEnum.END_DATE,
    show: true,
    disabled: true,
  },
  {
    type: ControlTypes.Checkbox,
    title: 'Oriented',
    field: EditDepartmentFieldsEnum.ORIENTED,
  },
  {
    type: ControlTypes.Checkbox,
    title: 'Home Cost Center',
    field: EditDepartmentFieldsEnum.HOME_COST_CENTER,
  },
  {
    type: ControlTypes.Date,
    title: 'Orientation Start Date',
    field: EditDepartmentFieldsEnum.ORIENTED_START_DATE,
    show: isOriented,
  },
];
