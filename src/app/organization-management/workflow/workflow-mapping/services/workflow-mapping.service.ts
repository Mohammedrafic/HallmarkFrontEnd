import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { WorkFlowFilterOption, WorkflowTypeList } from '@organization-management/workflow/interfaces';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import {
 MappedUserRolePermissions,
  RoleListsByPermission,
  RolesByPermission,
  RolesByType,
  RoleWithUser,
  UserListsByPermission,
  UsersByPermission,
  UsersByType,
  UsersWithRolesList,
  UserWithRole,
  WorkflowAsKey,
} from '@shared/models/workflow-mapping.model';
import { isEmpty } from 'lodash';
import { User } from '@shared/models/user-managment-page.model';

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

  public hasUsersAndRolesWithPermissions(
    [usersPermission, rolesPermission]: [UserListsByPermission, RoleListsByPermission]
  ): boolean {
    return !!(usersPermission.vmsUsers?.length || usersPermission.irpUsers?.length ) &&
      !!(rolesPermission.vmsRoles?.length || rolesPermission.irpRoles?.length);
  }

  public getUsersBaseOnWorkflow(
    usersPermission:UserListsByPermission,
    usersWithRolesList: UsersWithRolesList,
  ): UsersWithRolesList {
    const userKeys = {
      vmsUsers: this.getMappedUsersByType(usersPermission.vmsUsers),
      irpUsers: this.getMappedUsersByType(usersPermission.irpUsers),
    };
    const usersWithPermission = {
      vmsUsers: this.getUsersWithPermission(userKeys.vmsUsers, usersWithRolesList, WorkflowGroupType.VMSOrderWorkflow),
      irpUsers: this.getUsersWithPermission(userKeys.irpUsers, usersWithRolesList, WorkflowGroupType.IRPOrderWorkflow),
    };

    return {
      [WorkflowGroupType.VMSOrderWorkflow]: usersWithPermission.vmsUsers,
      [WorkflowGroupType.IRPOrderWorkflow]: usersWithPermission.irpUsers,
    };
  }

  public getRolesBaseOnWorkflow(
    rolesPermission: RoleListsByPermission,
    usersWithRolesList: UsersWithRolesList,
  ): UsersWithRolesList {
    const rolesKeys = {
      vmsRoles: this.getMappedRolesByType(rolesPermission.vmsRoles),
      irpRoles: this.getMappedRolesByType(rolesPermission.irpRoles),
    };
    const rolesWithPermission = {
      vmsRoles: this.getRolesWithPermission(rolesKeys.vmsRoles, usersWithRolesList, WorkflowGroupType.VMSOrderWorkflow),
      irpRoles: this.getRolesWithPermission(rolesKeys.irpRoles, usersWithRolesList, WorkflowGroupType.IRPOrderWorkflow),
    };

    return {
      [WorkflowGroupType.VMSOrderWorkflow]: rolesWithPermission.vmsRoles,
      [WorkflowGroupType.IRPOrderWorkflow]: rolesWithPermission.irpRoles,
    };
  }

  private getMappedRolesByType(roles: RolesByPermission[]): Partial<RolesByType> {
    return roles.filter(({ roles }: RolesByPermission) => roles?.length)
      .reduce(this.mapByWorkflowType.bind(this), {});
  }

  private getMappedUsersByType(users: UsersByPermission[]): Partial<UsersByType> {
    return users.filter(({ users }: UsersByPermission) => users?.length)
      .reduce(this.mapByWorkflowType.bind(this), {});
  }

  private getRolesWithPermission(
    keys: Partial<RolesByType>,
    usersWithRolesList: UsersWithRolesList,
    type: WorkflowGroupType
  ): UserWithRole {
    return Object.entries(keys).reduce((acc: UserWithRole, [key, value]) => {
      return { ...acc, [key]: this.mapRolePermissions(value, +key, usersWithRolesList, type) };
    }, {});
  }

  private getUsersWithPermission(
    keys: Partial<UsersByType>,
    usersWithRolesList: UsersWithRolesList,
    type: WorkflowGroupType
  ): UserWithRole {
    return Object.entries(keys).reduce((acc: UserWithRole, [key, value]) => {
      return { ...acc, [key]: this.mapUserPermissions(value, +key, usersWithRolesList, type) };
    }, {});
  }

  private mapByWorkflowType(acc: WorkflowAsKey, value: UsersByPermission | RolesByPermission) {
    if (acc?.[value.workflowType]) {
      return { ...acc, [value.workflowType]: [...acc[value.workflowType], value] };
    } else {
      return {
        ...acc,
        [value.workflowType]: [value],
      };
    }
  }

  private mapRolePermissions(
    listOfPermissions: RolesByPermission[],
    key: number,
    usersWithRolesList: UsersWithRolesList,
    typeWorkflow: WorkflowGroupType
    ): MappedUserRolePermissions {
    return listOfPermissions.reduce((
      acc: MappedUserRolePermissions,
      { type, roles }: {type: number, roles: RoleWithUser[]}
    ) => {
      if (!isEmpty(usersWithRolesList[typeWorkflow]?.[key]?.[type])) {
        return {
          ...acc,
          [type]: [
            ...usersWithRolesList[typeWorkflow][key][type],
            ...roles.map(({ id, name }: RoleWithUser) => ({
              id: id!.toString(),
              name,
            })),
          ],
        };
      } else {
        return {
          ...acc,
          [type]: roles.map(({ id, name }: RoleWithUser) => ({
            id: id!.toString(),
            name,
          })),
        };
      }
    }, {});
  }

  private mapUserPermissions(
    listOfPermissions: UsersByPermission[],
    key: number,
    usersWithRolesList: UsersWithRolesList,
    typeWorkflow: WorkflowGroupType
  ): MappedUserRolePermissions {
    return listOfPermissions.reduce((
      acc: MappedUserRolePermissions,
      { type, users }: {type: number, users: User[]}
    ) => {
      if (!isEmpty(usersWithRolesList[typeWorkflow]?.[key]?.[type])) {
        return {
          ...acc,
          [type]: [
            ...usersWithRolesList[typeWorkflow][key][type],
            ...users.map(({ id, firstName, lastName }: User) => ({
              id,
              name: `${firstName} ${lastName}`,
            })),
          ],
        };
      } else {
        return {
          ...acc,
          [type]: users.map(({ id, firstName, lastName }: User) => ({
            id,
            name: `${firstName} ${lastName}`,
          })),
        };
      }
    }, {});
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
