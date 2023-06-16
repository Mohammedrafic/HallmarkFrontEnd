import { Injectable } from '@angular/core';

import { OrganizationDepartment, OrganizationLocation,OrganizationDepartmentInactivate,OrganizationLocationInactivate, OrganizationRegion } from '@shared/models/organization.model';

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

  public getLocationsById(id: number, jobStartDate?: any | undefined): OrganizationLocation[] {
    return (this.selectedLocations = (
      this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[]
    ).filter(
      (location) =>
        location.inactiveDate == null ||
        new Date(location.inactiveDate) >= new Date(jobStartDate) ||
        (location.reactivateDate != null
          ? new Date(location.reactivateDate) <= new Date(jobStartDate)
          : location.reactivateDate == null)
    ));
  }

  public getLocation(id: number, locationID?: number): OrganizationLocationInactivate{
    let OrganizationLocationInactivate: OrganizationLocationInactivate = {
      isInActivate: (this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[]).some(
        (location) =>
          location.id == locationID &&
          location.inactiveDate != null
      ),
      inActiveDate: (this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[]).find(
        (location) =>
          location.id == locationID &&
          location.inactiveDate != null 
      )?.inactiveDate,
      reActiveDate: (this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[]).find(
        (location) =>
          location.id == locationID &&
          location.reactivateDate != null)?.reactivateDate,
    };
    return OrganizationLocationInactivate;
  }

  public getLocationsByIdSet(id: number, jobStartDates: string[]): OrganizationLocation[] {
    let resultSet: OrganizationLocation[] = [];
    this.selectedLocations = this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[];
    jobStartDates.forEach((element ) => {
      let filteredlist: OrganizationLocation[] = [];
      filteredlist = this.selectedLocations.filter(
        (location) =>
          location.inactiveDate == null ||
          (new Date(location.inactiveDate).toLocaleDateString() > new Date(element).toLocaleDateString())
          ||
         (location.reactivateDate != null
           ? new Date(location.reactivateDate) <= new Date(element)
           : location.reactivateDate == null)
      );
      if (filteredlist || filteredlist != null) {
        resultSet = resultSet.concat(filteredlist);
       filteredlist=[]
      }
    });
    resultSet = [...new Map(resultSet.map((m) => [m.id, m])).values()];
    return resultSet;
  }

  public getLocationsByInactive(
    id: number,
    jobStartDate?: any | undefined,
    locationID?: number
  ): OrganizationLocationInactivate {
    let OrganizationLocationInactivate: OrganizationLocationInactivate = {
      isInActivate: (this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[]).some(
        (location) =>
          location.id == locationID &&
          location.inactiveDate != null &&
          new Date(location.inactiveDate).toLocaleDateString() > new Date(jobStartDate).toLocaleDateString() &&
          (location.reactivateDate != null
            ? new Date(location.reactivateDate).toLocaleDateString() >= new Date(jobStartDate).toLocaleDateString()
            : location.reactivateDate == null)
      ),
      inActiveDate: (this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[]).find(
        (location) =>
          location.id == locationID &&
          location.inactiveDate != null &&
          new Date(location.inactiveDate).toLocaleDateString() > new Date(jobStartDate).toLocaleDateString() &&
          (location.reactivateDate != null
            ? new Date(location.reactivateDate).toLocaleDateString() >= new Date(jobStartDate).toLocaleDateString()
            : location.reactivateDate == null)
      )?.inactiveDate,
      reActiveDate: (this.getSources(this.irpOrgStructure, id, 'locations') as OrganizationLocation[]).find(
        (location) =>
          location.id == locationID &&
          location.inactiveDate != null &&
          new Date(location.inactiveDate).toLocaleDateString() > new Date(jobStartDate).toLocaleDateString() &&
          (location.reactivateDate != null
            ? new Date(location.reactivateDate).toLocaleDateString() >= new Date(jobStartDate).toLocaleDateString()
            : location.reactivateDate == null)
      )?.reactivateDate,
    };
    return OrganizationLocationInactivate;
  }

  public getDepartmentsById(id: number, startDate?: any | undefined): OrganizationDepartment[] {
    return (this.getSources(this.selectedLocations, id, 'departments') as OrganizationDepartment[]).filter(
      (department) =>
        department.inactiveDate == null 
        ||
        new Date(department.inactiveDate).toLocaleDateString() > new Date(startDate).toLocaleDateString() ||
        (department.reactivateDate != null
          ? new Date(department.reactivateDate).toLocaleDateString() <= new Date(startDate).toLocaleDateString()
          : department.reactivateDate == null)
    );
  }

  public getDepartment(id: number,  departmentid?: number): OrganizationDepartmentInactivate {
    let OrganizationDepartmentInactivate: OrganizationDepartmentInactivate = {
      isInActivate: (this.getSources(this.selectedLocations, id, 'departments') as OrganizationDepartment[]).some(
        (department: OrganizationDepartment) =>
          department.inactiveDate != null &&
          department.id == departmentid 
      ),
      inActiveDate: (this.getSources(this.irpOrgStructure, id, 'departments') as OrganizationDepartment[]).find(
        (department) =>
          department.id == departmentid &&
          department.inactiveDate != null 
      )?.inactiveDate,
      reActiveDate: (this.getSources(this.irpOrgStructure, id, 'departments') as OrganizationDepartment[]).find(
        (department) =>
          department.id == departmentid &&
          department.inactiveDate != null 
      )?.reactivateDate,
    };
    return OrganizationDepartmentInactivate;
  }

  public getDepartmentByInactive(
    id: number,
    jobStartDate?: any | undefined,
    departmentid?: number
  ): OrganizationDepartmentInactivate {
    let OrganizationDepartmentInactivate: OrganizationDepartmentInactivate = {
      isInActivate: (this.getSources(this.selectedLocations, id, 'departments') as OrganizationDepartment[]).some(
        (department: OrganizationDepartment) =>
          department.inactiveDate != null &&
          new Date(department.inactiveDate) > new Date(jobStartDate) &&
          (department.reactivateDate != null
            ? new Date(department.reactivateDate) >= new Date(jobStartDate)
            : department.reactivateDate == null)
      ),
      inActiveDate: (this.getSources(this.irpOrgStructure, id, 'departments') as OrganizationDepartment[]).find(
        (department) =>
          department.id == departmentid &&
          department.inactiveDate != null &&
          new Date(department.inactiveDate) > new Date(jobStartDate) &&
          (department.reactivateDate != null
            ? new Date(department.reactivateDate) >= new Date(jobStartDate)
            : department.reactivateDate == null)
      )?.inactiveDate,
      reActiveDate: (this.getSources(this.irpOrgStructure, id, 'departments') as OrganizationDepartment[]).find(
        (department) =>
          department.id == departmentid &&
          department.inactiveDate != null &&
          new Date(department.inactiveDate) > new Date(jobStartDate) &&
          (department.reactivateDate != null
            ? new Date(department.reactivateDate) >= new Date(jobStartDate)
            : department.reactivateDate == null)
      )?.reactivateDate,
    };
    return OrganizationDepartmentInactivate;
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
