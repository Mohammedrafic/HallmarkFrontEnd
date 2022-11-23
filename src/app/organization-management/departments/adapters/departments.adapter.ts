import { Department } from '@shared/models/department.model';
import { FormGroup } from '@angular/forms';

export class DepartmentsAdapter {
  public static prepareToSave(editedDepartmentId: number | undefined, selectedLocationId: number | undefined, formGroup: FormGroup): Department {
    const {
      extDepartmentId,
      invoiceDepartmentId,
      departmentName,
      inactiveDate,
      facilityPhoneNo,
      facilityEmail,
      facilityContact,
      unitDescription,
      includeInIRP
    } = formGroup.getRawValue();

    return {
      departmentId: editedDepartmentId,
      locationId: selectedLocationId,
      extDepartmentId,
      invoiceDepartmentId,
      departmentName,
      inactiveDate,
      facilityPhoneNo,
      facilityEmail,
      facilityContact,
      unitDescription,
      ...(typeof includeInIRP === 'boolean' && { includeInIRP })
    }
  }
}
