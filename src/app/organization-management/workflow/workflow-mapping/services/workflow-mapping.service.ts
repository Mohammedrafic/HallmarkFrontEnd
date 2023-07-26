import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { WorkFlowFilterOption, WorkflowTypeList } from '@organization-management/workflow/interfaces';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';

@Injectable()
export class WorkflowMappingService {
  constructor(private formBuilder: FormBuilder,) {}

  public createWorkflowMappingForm(): FormGroup {
    return this.formBuilder.group({
      regions: ['', Validators.required],
      locations: ['', Validators.required],
      departments: ['', Validators.required],
      skills: ['', Validators.required],
      workflowType: ['', Validators.required],
      workflowName: ['', Validators.required],
      orderRoleUserFormArray: this.formBuilder.array([
        this.formBuilder.group({
          roleUserList: [],
          isPermissionBased: [],
        }),
      ]),
      applicationRoleUserFormArray: this.formBuilder.array([
        this.formBuilder.group({
          roleUserList: [],
          isPermissionBased: [],
        }),
      ]),
    });
  }

  public prepareFilterWorkflowGroupOption(workflowGroup: WorkflowTypeList[]): WorkFlowFilterOption[] {
    return workflowGroup.map((source: WorkflowTypeList) => {
      return {
        name: source.text,
        id: source.id,
      };
    });
  }

  public resetControls(controlList: string[], form: FormGroup): void {
    controlList.forEach((control: string) => {
      form.get(control)?.reset();
    });
  }

  public getIncludeIrpSources<T extends Partial<{includeInIRP: boolean}>>(sources: T[]): T[] {
    return sources.filter((source: T) => {
      return source?.includeInIRP;
    });
  }

  public setControlNullValue(
    controls: string[],
    form: FormGroup,
  ): void {
    controls.forEach((controlName: string) => {
      form.controls[controlName].setValue(null);
    });
  }

  public getDepartmentsBaseOnType(
    form: FormGroup,
    locations: OrganizationLocation[],
    locationIds: number[]
  ): OrganizationDepartment[] {
    const workflowType = form.get('workflowType')?.value ?? WorkflowGroupType.VMSOrderWorkflow;
    const departments = locations.filter((location: OrganizationLocation) => {
      return locationIds.includes(location.id as number);
    }).map((location: OrganizationLocation) => {
      return location.departments;
    }).flat() as OrganizationDepartment[];

    if (workflowType === WorkflowGroupType.IRPOrderWorkflow) {
      return this.getIncludeIrpSources(departments);
    }

    return departments;
  }

  public getLocationsBaseOnType(
    form: FormGroup,
    orgRegions: OrganizationRegion[],
    regionIds: number[]
  ): OrganizationLocation[] {
    const workflowType = form.get('workflowType')?.value ?? WorkflowGroupType.VMSOrderWorkflow;
    const locations = orgRegions.filter((region: OrganizationRegion) => {
      return regionIds.includes(region.id as number);
    }).map((region: OrganizationRegion) => {
      return region.locations;
    }).flat() as OrganizationLocation[];

    if (workflowType === WorkflowGroupType.IRPOrderWorkflow) {
      return this.getIncludeIrpSources(locations);
    }

    return locations;
  }
}
