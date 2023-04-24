import { DepartmentMatchStatus } from "./department-match-cell-enum";
import { DepartmentMatchConfig } from "./department-match-cell.interface";

export const departmentMatchCellConfig: Record<DepartmentMatchStatus, DepartmentMatchConfig> = {
  [DepartmentMatchStatus.Unassigned]: {
    status: 'Unassigned',
    icon: 'alert-triangle',
    color: 'var(--supportive-red)',
  },
  [DepartmentMatchStatus.Assigned]: {
    status: 'Assigned',
    icon: 'check-circle',
    color: 'var(--supportive-green-10)',
  },
  [DepartmentMatchStatus.NotRequired]: {
    status: 'Not Required',
    icon: 'x-circle',
    color: 'var(--supportive-orange)',
  },
};
