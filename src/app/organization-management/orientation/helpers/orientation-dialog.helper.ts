import { FormGroup } from "@angular/forms";
import { FilterColumnsModel } from "@shared/models/filter.model";

export function setDataSourceValue<T>(filterColumns: FilterColumnsModel, key: string, sourceValue: T[]): void {
  filterColumns[key].dataSource = sourceValue;
}

export function clearFormControl(value: number[], form: FormGroup, control: string): void {
  form.get(control)?.setValue([]);
}
