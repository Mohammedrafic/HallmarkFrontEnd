import { Pipe, PipeTransform } from '@angular/core';
import { DepartmentAssigned } from '../departments.model';

@Pipe({
  name: 'sortByHomeCostCenter',
})
export class HomeCostCenterPipe implements PipeTransform {
  transform(value: DepartmentAssigned[]): DepartmentAssigned[] {
    const homeCostCenterIndex = value.findIndex((item) => item.isHomeCostCenter);
    if (homeCostCenterIndex > 0) {
      const [homeCostCenter] = value.splice(homeCostCenterIndex, 1);
      return [homeCostCenter, ...value];
    } else {
      return value;
    }
  }
}
