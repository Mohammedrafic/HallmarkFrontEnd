import { DateTimeHelper } from '@core/helpers';
import {
  AssignNewDepartment,
  EditAssignedDepartment,
  EditDepartmentPayload,
  NewDepartmentPayload,
} from '../departments.model';

export class DepartmentHelper {
  static editDepartmentPayload(
    formData: EditAssignedDepartment,
    departmentIds: number[] | null,
    employeeWorkCommitmentId: number
  ): EditDepartmentPayload {
    const { startDate, endDate, isHomeCostCenter, orientedStartDate, isOriented } = formData;
    return {
      forceUpdate: false,
      employeeWorkCommitmentId: employeeWorkCommitmentId,
      startDate: startDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(startDate)),
      endDate: endDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(endDate)),
      ids: departmentIds,
      ...(orientedStartDate && { orientedStartDate: DateTimeHelper.toUtcFormat(orientedStartDate) }),
      ...(isHomeCostCenter && { isHomeCostCenter }),
      ...(isOriented && { isOriented }),
    };
  }

  static newDepartmentPayload(formData: AssignNewDepartment, employeeWorkCommitmentId: number): NewDepartmentPayload {
    const { departmentId, startDate, endDate, isOriented, isHomeCostCenter } = formData;
    return {
      forceUpdate: false,
      employeeWorkCommitmentId: employeeWorkCommitmentId,
      departmentId: departmentId,
      isOriented: !!isOriented,
      startDate: startDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(startDate)),
      endDate: endDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(endDate)),
      ...(isHomeCostCenter && { isHomeCostCenter }),
    };
  }

  static findSelectedItems(values: number[], structureData: unknown[]): unknown[] {
    return values.map((id: number) => (structureData as { id: number }[]).find((item) => item.id === id));
  }
}
