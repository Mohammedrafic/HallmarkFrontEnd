import { Injectable } from '@angular/core';

import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';

@Injectable()
export class OrganizationStructureService {
  private irpOrgStructure: OrganizationRegion[];
  private selectedLocations: OrganizationLocation[];

  public getOrgStructureForIrp(structure: OrganizationRegion[]): OrganizationRegion[] {
    structure.forEach((region: OrganizationRegion) => {
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

    return  this.irpOrgStructure = structure;
  }

  public getLocationsById(id: number): OrganizationLocation[] {
    return this.selectedLocations = (this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[])
    .filter((location) => !location.isDeactivated);
  }

  public getDepartmentsById(id: number): OrganizationDepartment[] {
    return this.getSources(this.selectedLocations, id, 'departments')
    .filter((department) => !department.isDeactivated);
  }

  //TODO: add correct model, and enum for type param
  private getSources(
    structure: OrganizationLocation[] | OrganizationRegion[], id: number, type: string
  ): OrganizationLocation[] | OrganizationDepartment[] {
    const containers: OrganizationLocation[] | OrganizationDepartment[] = [];
    structure?.forEach((value: any) => {
      if (value.id === id) {
        containers.push(value[type]);
      }
    });

    return containers.flatMap((element: OrganizationLocation | OrganizationDepartment) => element);
  }
}
