import { DateTimeHelper } from '@core/helpers';
import { DepartmentPayload } from '../departments.model';

export class DepartmentHelper {
  static editDepartmentPayload(
    formData: DepartmentPayload,
    departmentIds: number[] | null,
    employeeId: number
  ): DepartmentPayload {
    return {
      ...createDepartmentPayload(formData),
      ids: departmentIds,
      employeeId: employeeId,
    };
  }

  static newDepartmentPayload(formData: DepartmentPayload, employeeWorkCommitmentId: number): DepartmentPayload {
    return {
      ...createDepartmentPayload(formData),
      employeeWorkCommitmentId: employeeWorkCommitmentId,
    };
  }

  static findSelectedItems(values: number[], structureData: unknown[]): unknown[] {
    return values.map((id: number) => (structureData as { id: number }[]).find((item) => item.id === id));
  }
}

function createDepartmentPayload(formData: DepartmentPayload): DepartmentPayload {
  const { departmentIds, locationIds, regionIds, startDate, endDate, isOriented, isHomeCostCenter, orientationDate } = formData;
  return {
    forceUpdate: false,
    isOriented: !!isOriented,
    startDate: startDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(startDate)),
    endDate: endDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(endDate)),
    orientationDate: orientationDate && DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(orientationDate)),
    ...(departmentIds && { departmentIds, locationIds, regionIds }),
    ...(isHomeCostCenter && { isHomeCostCenter }),
  };
}

export function departmentName(name: string, id: string): string {
  return `${name} (${id})`;
}
