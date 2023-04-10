import { Days } from "@shared/enums/days";
import { AvailabilityFilterColumns } from "../enums";
import { AvailabilityFormFieldConfig } from "../interfaces";
import { ControlTypes } from "@shared/enums/control-types.enum";
import { WeekDropdownOptions } from "./week-dropdown-options.constant";

type Options = typeof WeekDropdownOptions;
type DataSource = typeof Days;

export const DepartmentFilterFormConfig = (): ReadonlyArray<
  AvailabilityFormFieldConfig<AvailabilityFilterColumns, Options, DataSource>
> => [
    {
      type: ControlTypes.Dropdown,
      title: 'Avail. Restriction Start Day',
      field: AvailabilityFilterColumns.START_DAY,
      optionFields: WeekDropdownOptions,
      dataSource: Days,
    },
    {
      type: ControlTypes.Dropdown,
      title: 'Avail. Restriction End Day',
      field: AvailabilityFilterColumns.END_DAY,
      optionFields: WeekDropdownOptions,
      dataSource: Days,
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
