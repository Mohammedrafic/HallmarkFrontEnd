import { DateTimeHelper } from '@core/helpers';
import {
  AssignNewDepartment,
  EditAssignedDepartment,
  EditDepartmentPayload,
  NewDepartmentPayload,
} from '../departments.model';

export class DepartmentHelper {
  static elitDepartmentPayload(
    formData: EditAssignedDepartment,
    departmentIds: number[] | null,
    employeeWorkCommitmentId: number
  ): EditDepartmentPayload {
    const { startDate, endDate, homeCostCenter, orientedStartDate, isOriented } = formData;
    return {
      employeeWorkCommitmentId: employeeWorkCommitmentId,
      startDate: startDate && DateTimeHelper.toUtcFormat(startDate),
      endDate: endDate && DateTimeHelper.toUtcFormat(endDate),
      ids: departmentIds,
      ...(orientedStartDate && { orientedStartDate: DateTimeHelper.toUtcFormat(orientedStartDate) }),
      ...(homeCostCenter && { homeCostCenter }),
      ...(isOriented && { isOriented }),
    };
  }

  static newDepartmentPayload(formData: AssignNewDepartment, employeeWorkCommitmentId: number): NewDepartmentPayload {
    const { departmentId, startDate, endDate, isOriented } = formData;
    return {
      employeeWorkCommitmentId: employeeWorkCommitmentId,
      departmentId: departmentId,
      isOriented: !!isOriented,
      startDate: startDate && DateTimeHelper.toUtcFormat(startDate),
      endDate: endDate && DateTimeHelper.toUtcFormat(endDate),
    };
  }

  static findSelectedItems(values: number[], structureData: unknown[]): unknown[] {
    return values.map((id: number) => (structureData as { id: number }[]).find((item) => item.id === id));
  }
}
