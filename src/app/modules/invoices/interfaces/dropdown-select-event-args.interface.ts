import { SelectEventArgs } from '@syncfusion/ej2-angular-dropdowns';

export interface DropdownSelectArgs<T = unknown> extends Omit<SelectEventArgs, 'itemData'> {
  itemData: T;
}
