import { Pipe, PipeTransform } from '@angular/core';
import { DepartmentAssigned } from '../departments.model';

@Pipe({
  name: 'sortByHomeCostCenter',
})
export class HomeCostCenterPipe implements PipeTransform {
  transform(value: DepartmentAssigned[]): DepartmentAssigned[] {
    const isHomeCostCenter = value.findIndex((item) => item.isHomeCostCenter);
    if (isHomeCostCenter > 0) {
      const [homeCostCenter] = value.splice(isHomeCostCenter, 1);
      return [homeCostCenter, ...value];
    } else {
      return value;
    }
  }
}
