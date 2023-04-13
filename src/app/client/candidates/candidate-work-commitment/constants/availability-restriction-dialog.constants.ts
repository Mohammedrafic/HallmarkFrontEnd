import { AvailabilityFilterColumns } from '../enums';
import { AvailabilityFormFieldConfig } from '../interfaces';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { filterOptionFields } from '@core/constants/filters-helper.constant';
import { DaysDropdownDataSource } from '@core/constants/days-week.constant';

export const DepartmentFilterFormConfig = (): ReadonlyArray<
  AvailabilityFormFieldConfig<AvailabilityFilterColumns>
> => [
    {
      type: ControlTypes.Dropdown,
      title: 'Avail. Restriction Start Day',
      field: AvailabilityFilterColumns.START_DAY,
      optionFields: filterOptionFields,
      dataSource: DaysDropdownDataSource,
    },
    {
      type: ControlTypes.Dropdown,
      title: 'Avail. Restriction End Day',
      field: AvailabilityFilterColumns.END_DAY,
      optionFields: filterOptionFields,
      dataSource: DaysDropdownDataSource,
    },
    {
      type: ControlTypes.Date,
      title: 'Avail. Restriction Start Time',
      field: AvailabilityFilterColumns.START_TIME,
    },
    {
      type: ControlTypes.Date,
      title: 'Avail. Restriction End Time',
      field: AvailabilityFilterColumns.END_TIME,
    },
  ];
