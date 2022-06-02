import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DetailRowService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { combineLatest, filter, Observable, of, Subject, takeUntil } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import { FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { GetAllSkills, GetDepartmentsByLocationId, GetLocationsByRegionId, GetRegions } from '../../store/organization-management.actions';
import { Location } from '@shared/models/location.model';
import { Department } from '@shared/models/department.model';
import { Skill, SkillsPage } from '@shared/models/skill.model';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { WorkflowState } from '../../store/workflow.state';
import { Step, WorkflowWithDetails } from '@shared/models/workflow.model';
import {
  GetRolesForWorkflowMapping,
  GetUsersForWorkflowMapping,
  GetWorkflowMappingPages,
  GetWorkflows,
  GetWorkflowsSucceed,
  RemoveWorkflowMapping,
  SaveWorkflowMapping,
  SaveWorkflowMappingSucceed
} from '../../store/workflow.actions';
import { UserState } from '../../../store/user.state';
import { RolesPerUser, User } from '@shared/models/user-managment-page.model';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import { RoleWithUser, StepMapping, StepRoleUser, WorkflowMappingPage, WorkflowMappingPost } from '@shared/models/workflow-mapping.model';
import { WorkflowType } from '@shared/enums/workflow-type';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';

@Component({
  selector: 'app-workflow-mapping',
  templateUrl: './workflow-mapping.component.html',
  styleUrls: ['./workflow-mapping.component.scss'],
  providers: [DetailRowService, MaskedDateTimeService]
})
export class WorkflowMappingComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('regionDropdown') regionDropdown: MultiSelectComponent;
  @ViewChild('locationDropdown') locationDropdown: MultiSelectComponent;
  @ViewChild('departmentDropdown') departmentDropdown: MultiSelectComponent;

  @Input() isActive: boolean = false;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;
  public regions: Region[] = [];
  public allRegions: Region[] = [];

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;
  public locations: Location[] = [];

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  public departments: Department[] = [];
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  @Select(OrganizationManagementState.skills)
  skills$: Observable<SkillsPage>;
  skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public allSkills: Skill[] = [];

  public jobOrderWorkflow = 'Job Order Workflow';
  public workflowGroupTypesData = [{ id: WorkflowGroupType.Organization, text: this.jobOrderWorkflow }];
  public workflowGroupTypesFields: FieldSettingsModel = { text: 'text', value: 'id' };

  @Select(WorkflowState.workflows)
  workflows$: Observable<WorkflowWithDetails[]>;
  public workflows: WorkflowWithDetails[];

  public orderWorkflowSteps: Step[] = [];
  public applicationWorkflowSteps: Step[] = [];

  @Select(WorkflowState.workflowMappingPages)
  workflowMappings$: Observable<WorkflowMappingPage>

  @Select(WorkflowState.rolesPerUsers)
  rolesPerUsers$: Observable<RolesPerUser[]>;
  public rolesWithUsers: RoleWithUser[] = [];

  @Select(WorkflowState.users)
  users$: Observable<User[]>;

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isEdit = false;
  public workflowMappingFormGroup: FormGroup;
  public editedRecordId?: number;
  public isMappingSectionShown: boolean = false;
  public workflowTypes = WorkflowType;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  get orderRoleUserFormArray() {
    return this.workflowMappingFormGroup.get('orderRoleUserFormArray') as FormArray;
  }

  get applicationRoleUserFormArray() {
    return this.workflowMappingFormGroup.get('applicationRoleUserFormArray') as FormArray;
  }

  private formBuilder: FormBuilder;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              private actions$: Actions,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createWorkflowMappingFormGroup();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegions());
    this.store.dispatch(new GetAllSkills());
    this.store.dispatch(new GetWorkflowMappingPages());

    this.store.dispatch(new GetRolesForWorkflowMapping());
    this.store.dispatch(new GetUsersForWorkflowMapping());
    this.store.dispatch(new GetWorkflows());

    combineLatest([this.users$, this.rolesPerUsers$])
      .pipe(filter(Boolean), takeUntil(this.unsubscribe$))
      .subscribe(response => {
        let [users, roles] = response;
        this.rolesWithUsers = [];

        if (users && users.length > 0) {
          users.forEach(user => {
            this.rolesWithUsers.push({id: user.id, name: user.firstName + ' ' + user.lastName});
          });
        }

        if (roles && roles.length > 0) {
          roles.forEach((role) => {
            this.rolesWithUsers.push({ id: role.id.toString(), name: role.name })
          });
        }
      });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetWorkflowsSucceed))
      .subscribe((workflows) => {
        this.workflows = workflows.payload;
      });

    this.workflowMappingFormGroup.get('regions')?.valueChanges.subscribe((regionIds: number[]) => {
      if (regionIds && regionIds.length > 0) {
        this.locations = [];
        regionIds.forEach((id) => {
          this.store.dispatch(new GetLocationsByRegionId(id));
        });
        this.departments = [];
      } else {
        this.locations = [];
        this.departments = [];
      }

      this.workflowMappingFormGroup.controls['locations'].setValue(null);
      this.workflowMappingFormGroup.controls['departments'].setValue(null);
    });

    this.regions$.pipe(takeUntil(this.unsubscribe$)).subscribe(regions => {
        if (regions && regions.length > 0) {
          this.allRegions = regions;
        }
    });

    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe(skills => {
      if (skills && skills.items.length > 0) {
        this.allSkills = skills.items;
      }
    });

    this.locations$.pipe(takeUntil(this.unsubscribe$)).subscribe(locations => {
      if (locations && locations.length > 0) {
        this.locations = this.locations.concat(locations);
      }
    });

    this.departments$.pipe(takeUntil(this.unsubscribe$)).subscribe(departments => {
      if (departments && departments.length > 0) {
        this.departments = this.departments.concat(departments);
      }
    });

    this.workflowMappingFormGroup.get('locations')?.valueChanges.subscribe((locationIds: number[]) => {
      if (locationIds && locationIds.length > 0) {
        this.departments = [];
        locationIds.forEach(id => {
          this.store.dispatch(new GetDepartmentsByLocationId(id));
        });
      } else {
        this.departments = [];
      }

      this.workflowMappingFormGroup.controls['departments'].setValue(null);
    });

    this.workflowMappingFormGroup.get('workflowName')?.valueChanges.subscribe((id: number) => {
      if (this.orderRoleUserFormArray.length > 0) {
        this.orderRoleUserFormArray.clear();
      }

      if (this.applicationRoleUserFormArray.length > 0) {
        this.applicationRoleUserFormArray.clear();
      }

      const foundWorkflow = this.workflows.find(item => item.id === id);
      if (foundWorkflow && foundWorkflow.workflows) {
        this.orderWorkflowSteps = foundWorkflow.workflows[0].steps.filter(step => step.type !== WorkflowStepType.Published); // excludes last Order step
        this.applicationWorkflowSteps = foundWorkflow.workflows[1].steps.filter(step => step.type !== WorkflowStepType.Offered);  // excludes last App step
      }

      if (this.orderWorkflowSteps.length > 0 && !this.isEdit) {
        this.orderWorkflowSteps.forEach(() => {
          this.orderRoleUserFormArray.push(this.formBuilder.control(null, Validators.required));
        });
      }

      if (this.applicationWorkflowSteps.length > 0 && !this.isEdit) {
        this.applicationWorkflowSteps.forEach(() => {
          this.applicationRoleUserFormArray.push(this.formBuilder.control(null, Validators.required));
        });
      }

      this.isMappingSectionShown = true
    });

    // close modal window with form and clear details
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveWorkflowMappingSucceed))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.clearFormDetails();
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onAddMappingClick(): void {
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditButtonClick(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.isMappingSectionShown = true;
    this.isEdit = true;
    this.editedRecordId = data.mappingId;
    

    setTimeout(() => {
      const foundWorkflow = this.workflows.find(w => w.name === data.workflowName);
      if (!data.regionId) {
        const allRegionsIds = this.allRegions.map(region => region.id);
        this.workflowMappingFormGroup.controls['regions'].setValue(allRegionsIds);
      } else {
        this.workflowMappingFormGroup.controls['regions'].setValue([data.regionId]);
      }
  
      if (!data.locationId) {
        const locationIds = this.locations.map(location => location.id);
        this.workflowMappingFormGroup.controls['locations'].setValue(locationIds);
      } else {
        this.workflowMappingFormGroup.controls['locations'].setValue([data.locationId]);
      }
  
      if (!data.departmentId) {
        const departmentIds = this.departments.map(department => department.departmentId);
        this.workflowMappingFormGroup.controls['departments'].setValue(departmentIds);
      } else {
        this.workflowMappingFormGroup.controls['departments'].setValue([data.departmentId]);
      }
  
      if (!data.skills) {
        this.workflowMappingFormGroup.controls['skills'].setValue(this.allSkills.map((skill: Skill) => skill.id));
      } else {
        this.workflowMappingFormGroup.controls['skills'].setValue(data.skills.map((skill: any) => skill.skillId));
      }
  
      this.workflowMappingFormGroup.controls['workflowType'].setValue(WorkflowGroupType.Organization);
      this.workflowMappingFormGroup.controls['workflowName'].setValue(foundWorkflow?.id);
      this.setFormArrayControls(data.stepMappings);
    })
    

    this.store.dispatch(new ShowSideDialog(true));
    // setTimeout(() => this.refreshComponents(), 250);
  }

  public onRemoveButtonClick(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(new RemoveWorkflowMapping(data.mappingId));
        }
        this.removeActiveCssClass();
      });
  }

  public onCancelFormClick(): void {
    if (this.workflowMappingFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(filter(confirm => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
          this.clearFormDetails();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
      this.removeActiveCssClass();
    }
  }

  public onSaveFormClick(): void {
    if (this.workflowMappingFormGroup.valid) {
      const workflowMapping: WorkflowMappingPost = {
        mappingId: this.editedRecordId,
        regionIds: this.workflowMappingFormGroup.controls['regions'].value.length === this.allRegions.length ? []
          : this.workflowMappingFormGroup.controls['regions'].value, // [] means All on the BE side
        locationIds: this.workflowMappingFormGroup.controls['locations'].value.length === this.locations.length ? []
          : this.workflowMappingFormGroup.controls['locations'].value, // [] means All on the BE side
        departmentIds: this.workflowMappingFormGroup.controls['departments'].value.length === this.departments.length ? []
          : this.workflowMappingFormGroup.controls['departments'].value, // [] means All on the BE side
        skillIds: this.workflowMappingFormGroup.controls['skills'].value.length === this.allSkills.length ? []
          : this.workflowMappingFormGroup.controls['skills'].value, // [] means All on the BE side
        workflowGroupId: this.workflowMappingFormGroup.controls['workflowName'].value, // workflowName contains selected workflow id, on the BE workflowGroupId is just workflowId
        stepMappings: this.getStepMappings()
      };

      this.store.dispatch(new SaveWorkflowMapping(workflowMapping));
    } else {
      this.workflowMappingFormGroup.markAllAsTouched();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public rowDataBound(args: any): void {
    // hides expand button if no children
    if(args.data.stepMappings.length === 0) {
      args.row.querySelector('td').innerHTML = ' ';
      args.row.querySelector('td').className = 'e-customized-expand-cell';
    } else {
      // TODO: add event to dynamically show Custom Step Name, Role/User columns
    }
  }

  public getStepDetails(stepMappings: StepMapping[], workflowName: string, workflowType: WorkflowType): StepRoleUser[] {
    const foundWorkflow = this.workflows.find(flow => flow.name === workflowName);
    const stepDetails: StepRoleUser[] = [];

    if (foundWorkflow && foundWorkflow.workflows) {
      const workflowIndex = workflowType === WorkflowType.OrderWorkflow ? WorkflowType.OrderWorkflow : WorkflowType.ApplicationWorkflow;

      stepMappings.forEach(stepMap => {
        if (foundWorkflow.workflows) {
          const foundStep = foundWorkflow.workflows[workflowIndex - 1].steps.find(st => st.id === stepMap.workflowStepId);
          const foundUserRole = this.rolesWithUsers.find(r => r.id === stepMap.userId || r.id === stepMap.roleId?.toString());
          if (foundStep && foundUserRole) stepDetails.push({ step: foundStep, roleUser: foundUserRole});
        }
      });
    }

    return stepDetails;
  }

  public setFormArrayControls(stepMappings: StepMapping[]): void {
    stepMappings.forEach((stepMap, i) => {
      const foundUserRole = this.rolesWithUsers.find(r => r.id === stepMap.userId || r.id === stepMap.roleId?.toString());

      if (foundUserRole && stepMap.workflowType === WorkflowType.OrderWorkflow) {
        this.orderRoleUserFormArray.push(this.formBuilder.control([foundUserRole.id], Validators.required));
      } else if (foundUserRole && stepMap.workflowType === WorkflowType.ApplicationWorkflow) {
        this.applicationRoleUserFormArray.push(this.formBuilder.control([foundUserRole.id], Validators.required));
      }
    });
  }

  private getStepMappings(): StepMapping[] {
    const mappings: StepMapping[] = [];

    this.orderWorkflowSteps.forEach((step, i) => {
      this.orderRoleUserFormArray.controls[i].value.forEach((roleUserId: string) => {
        if (roleUserId.includes('-')) { // define if roleUserId is GUID and then assign it to userId instead of roleId
          const stepMapping: StepMapping = { workflowStepId: step.id, userId: roleUserId };
          mappings.push(stepMapping);
        } else {
          const stepMapping: StepMapping = { workflowStepId: step.id, roleId: parseInt(roleUserId) };
          mappings.push(stepMapping);
        }
      });
    });

    this.applicationWorkflowSteps.forEach((step, i) => {
      this.applicationRoleUserFormArray.controls[i].value.forEach((roleUserId: string) => {
        if (roleUserId.includes('-')) { // define if roleUserId is GUID and then assign it to userId instead of roleId
          const stepMapping: StepMapping = {workflowStepId: step.id, userId: roleUserId};
          mappings.push(stepMapping);
        } else {
          const stepMapping: StepMapping = {workflowStepId: step.id, roleId: parseInt(roleUserId)};
          mappings.push(stepMapping);
        }
      });
    });

    return mappings;
  }

  private createWorkflowMappingFormGroup(): void {
   this.workflowMappingFormGroup = this.formBuilder.group({
     regions: ['', Validators.required],
     locations: ['', Validators.required],
     departments: ['', Validators.required],
     skills: ['', Validators.required],
     workflowType: [ '', Validators.required],
     workflowName: ['', Validators.required],
     orderRoleUserFormArray: this.formBuilder.array([]),
     applicationRoleUserFormArray: this.formBuilder.array([])
   });
  }

  private clearFormDetails(): void {
    this.workflowMappingFormGroup.reset();
    this.isEdit = false;
    this.editedRecordId = undefined;
    this.isMappingSectionShown = false;
  }

  private refreshComponents(): void {
    this.regionDropdown.refresh();
    this.locationDropdown.refresh();
    this.departmentDropdown.refresh();
  }
}

