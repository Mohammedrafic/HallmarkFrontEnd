import { Injectable } from '@angular/core';

import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from "@shared/models/organization.model";

@Injectable()
export class TiersService {

  public filterIrpLocationsDepartments(regionsStructure: OrganizationRegion[]): void {
    regionsStructure.forEach((region: OrganizationRegion) => {
      const regionLocations = region.locations || [];

      region.locations = regionLocations.filter((location: OrganizationLocation) => {
        return location.includeInIRP;
      }) as OrganizationLocation[];

      region.locations.forEach((location: OrganizationLocation) => {
        location.departments = location.departments.filter((department: OrganizationDepartment) => {
          return department.includeInIRP;
        });
      });
    });
  }
}
