import { DateTimeHelper } from '@core/helpers';
import { DepartmentPayload } from '../departments.model';

export class DepartmentHelper {
  static editDepartmentPayload(
    formData: DepartmentPayload,
    departmentIds: number[] | null,
    employeeWorkCommitmentId: number
  ): DepartmentPayload {
    return {
      ...createDepartmentPayload(formData, employeeWorkCommitmentId),
      ids: departmentIds,
    };
  }

  static newDepartmentPayload(formData: DepartmentPayload, employeeWorkCommitmentId: number): DepartmentPayload {
    return {
      ...createDepartmentPayload(formData, employeeWorkCommitmentId),
    };
  }

  static findSelectedItems(values: number[], structureData: unknown[]): unknown[] {
    return values.map((id: number) => (structureData as { id: number }[]).find((item) => item.id === id));
  }
}

function createDepartmentPayload(formData: DepartmentPayload, employeeWorkCommitmentId: number): DepartmentPayload {
  const { departmentId, startDate, endDate, isOriented, isHomeCostCenter, orientationDate } = formData;
  return {
    forceUpdate: false,
    employeeWorkCommitmentId: employeeWorkCommitmentId,
    isOriented: !!isOriented,
    startDate: startDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(startDate)),
    endDate: endDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(endDate)),
    orientationDate: orientationDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(orientationDate)),
    ...(departmentId && { departmentId }),
    ...(isHomeCostCenter && { isHomeCostCenter }),
  };
}

export function departmentName(name: string, id: string): string {
  return `${name} (${id})`;
}
