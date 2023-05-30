import { Department } from '@shared/models/department.model';
import { FormGroup } from '@angular/forms';
import { DateTimeHelper } from '@core/helpers';

export class DepartmentsAdapter {
  public static prepareToSave(
    editedDepartmentId: number | undefined,
    selectedLocationId: number | undefined,
    formGroup: FormGroup,
    skillsAvailable: boolean,
  ): Department {
    const {
      extDepartmentId,
      invoiceDepartmentId,
      departmentName,
      inactiveDate,
      reactivateDate,
      facilityPhoneNo,
      facilityEmail,
      facilityContact,
      unitDescription,
      includeInIRP,
      id,
      primarySkills,
      secondarySkills,
    } = formGroup.getRawValue();

    return {
      departmentId: editedDepartmentId,
      locationId: selectedLocationId,
      extDepartmentId,
      invoiceDepartmentId,
      departmentName,
      inactiveDate: inactiveDate ? DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(inactiveDate)) : null,
      reactivateDate: reactivateDate ? DateTimeHelper.setInitHours(DateTimeHelper.toUtcFormat(reactivateDate)) : null,
      facilityPhoneNo,
      facilityEmail,
      facilityContact,
      unitDescription,
      primarySkills: skillsAvailable ? primarySkills : null,
      secondarySkills: skillsAvailable ? secondarySkills : null,
      ...(typeof includeInIRP === 'boolean' && { includeInIRP }),
      id,
    };
  }
}
