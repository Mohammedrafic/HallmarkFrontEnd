import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DetailRowService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { combineLatest, filter, first, Observable, Subject, take, takeUntil, throttleTime } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GetOrganizationStructure } from 'src/app/store/user.actions';
import { ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import { FieldSettingsModel, MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { Skill } from '@shared/models/skill.model';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { WorkflowState } from '../../store/workflow.state';
import { Step, Workflow, WorkflowFilters, WorkflowWithDetails } from '@shared/models/workflow.model';
import {
  GetRolesForWorkflowMapping,
  GetUsersForWorkflowMapping,
  GetWorkflowMappingPages,
  GetWorkflows,
  GetWorkflowsSucceed,
  RemoveWorkflowMapping,
  SaveWorkflowMapping,
  SaveWorkflowMappingSucceed,
} from '../../store/workflow.actions';
import { UserState } from '../../../store/user.state';
import { User } from '@shared/models/user-managment-page.model';
import { WorkflowStepType } from '@shared/enums/workflow-step-type';
import {
  RolesByPermission,
  RoleWithUser,
  StepMapping,
  StepRoleUser,
  UsersByPermission,
  WorkflowMappingPage,
  WorkflowMappingPost,
} from '@shared/models/workflow-mapping.model';
import { WorkflowType } from '@shared/enums/workflow-type';
import { MaskedDateTimeService } from '@syncfusion/ej2-angular-calendars';
import { WorkflowGroupType } from '@shared/enums/workflow-group-type';
import {
  OrganizationDepartment,
  OrganizationLocation,
  OrganizationRegion,
  OrganizationStructure,
} from '@shared/models/organization.model';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { isEmpty } from 'lodash';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { Query } from "@syncfusion/ej2-data";
import { FilteringEventArgs } from "@syncfusion/ej2-dropdowns";
import {
  CreateWorkflowTypeList,
  FiltersColumnsConfig,
  VmsWorkflowType,
} from '@organization-management/workflow/workflow-mapping/constants';
import { WorkflowMappingService } from '@organization-management/workflow/workflow-mapping/services';
import { SystemFlags } from '@organization-management/workflow/interfaces';

type RoleWithUserModel = { [key: number]: { [workflowType: number]: RoleWithUser[] } };
type WorkflowAsKeyModel = { [key: number]: (UsersByPermission | RolesByPermission)[] };

@Component({
  selector: 'app-workflow-mapping',
  templateUrl: './workflow-mapping.component.html',
  styleUrls: ['./workflow-mapping.component.scss'],
  providers: [DetailRowService, MaskedDateTimeService],
})
export class WorkflowMappingComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('regionDropdown') regionDropdown: MultiSelectComponent;
  @ViewChild('locationDropdown') locationDropdown: MultiSelectComponent;
  @ViewChild('departmentDropdown') departmentDropdown: MultiSelectComponent;

  @Input() isActive = false;
  @Input() isIRPFlagEnabled = false;
  @Input() systemFlags: SystemFlags;

  @Select(WorkflowState.workflowMappingPages)
  public workflowMappings$: Observable<WorkflowMappingPage>;

  @Select(WorkflowState.rolesPerUsers)
  private rolesPerUsers$: Observable<RolesByPermission[]>;

  @Select(UserState.organizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.assignedSkillsByOrganization)
  private skills$: Observable<Skill[]>;

  @Select(WorkflowState.sortedWorkflows)
  private workflows$: Observable<WorkflowWithDetails[]>;

  @Select(WorkflowState.users)
  private users$: Observable<UsersByPermission[]>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  public orgStructure: OrganizationStructure;
  public orgRegions: OrganizationRegion[] = [];
  public regions: Region[] = [];
  public allRegions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];
  public skills: Skill[] = [];
  public allSkills: Skill[] = [];
  public workflowGroupTypesSources = [VmsWorkflowType];
  public workflowSources: WorkflowWithDetails[] = [];
  public allWorkflows: WorkflowWithDetails[] = [];
  public workflows: WorkflowWithDetails[];
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  public skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };
  public workflowGroupTypesFields: FieldSettingsModel = { text: 'text', value: 'id' };
  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public optionFields = { text: 'name', value: 'id' };
  public orderWorkflowSteps: Step[] = [];
  public applicationWorkflowSteps: Step[] = [];
  public rolesWithUsers: RoleWithUserModel;
  public isEdit = false;
  public workflowMappingFormGroup: FormGroup;
  public editedRecordId?: number;
  public isMappingSectionShown = false;
  public workflowTypes = WorkflowType;
  public showForm: boolean;
  public WorkflowFilterFormGroup: FormGroup;
  public filters: WorkflowFilters = {
    pageSize: this.pageSize,
    pageNumber: 1,
  };
  public filterColumns: any;
  public allRegionsSelected = false;
  public allLocationsSelected = false;
  public allDepartmentsSelected = false;
  public maxDepartmentsLength = 1000;
  public query: Query = new Query().take(this.maxDepartmentsLength);
  public filterType: string = 'Contains';

  private formBuilder: FormBuilder;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  get orderRoleUserFormArray() {
    return this.workflowMappingFormGroup.get('orderRoleUserFormArray') as FormArray;
  }

  get applicationRoleUserFormArray() {
    return this.workflowMappingFormGroup.get('applicationRoleUserFormArray') as FormArray;
  }

  constructor(
    protected override store: Store,
    private actions$: Actions,
    private filterService: FilterService,
    @Inject(FormBuilder) private builder: FormBuilder,
    private confirmService: ConfirmService,
    private workflowMappingService: WorkflowMappingService,
  ) {
    super(store);
    this.formBuilder = builder;
    this.createWorkflowMappingFormGroup();
    this.WorkflowFilterFormGroup = this.formBuilder.group({
      names: new FormControl([]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentsIds: new FormControl([]),
      skillIds: new FormControl([]),
      types: new FormControl([]),
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.initFiltersConfig();
    this.initWorkflowSources();
    this.watchForWorkflowType();
    this.watchForWorkflowSources();
    this.watchForChangePage();
    this.watchForOrganizationChange();

    combineLatest([this.users$, this.rolesPerUsers$])
      .pipe(
        filter(([usersP, rolesP]) => !isEmpty(usersP) && !isEmpty(rolesP)),
        first(),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((response) => {
        const [usersP, rolesP] = response;

        if (usersP && usersP.length > 0) {
          const workFlowAsKey = usersP
            .filter(({ users }: UsersByPermission) => users?.length)
            .reduce(this.mapByWorkflowType, {});

          this.rolesWithUsers = Object.entries(workFlowAsKey).reduce((acc: {}, [key, value]) => {
            return { ...acc, [key]: this.mapUserPermissions(value, +key) };
          }, {});
        }

        if (rolesP && rolesP.length > 0) {
          const workFlowAsKey = rolesP
            .filter(({ roles }: RolesByPermission) => roles?.length)
            .reduce(this.mapByWorkflowType, {});

          this.rolesWithUsers = Object.entries(workFlowAsKey).reduce((acc: {}, [key, value]) => {
            return { ...acc, [key]: this.mapRolePermissions(value, +key) };
          }, {});
        }
      });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetWorkflowsSucceed)).subscribe((workflows) => {
      this.workflows = workflows.payload;
      this.filterColumns.names.dataSource = workflows.payload.map((item: WorkflowWithDetails) => item.name);
    });

    this.watchForRegions();

    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.orgRegions = structure.regions;
        this.allRegions = [...this.orgRegions];
        this.filterColumns.regionIds.dataSource = this.allRegions;
      });

    this.WorkflowFilterFormGroup.get('regionIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedRegions: OrganizationRegion[] = [];
        const locations: OrganizationLocation[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.allRegions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.filterColumns.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          locations.push(...(region.locations as []));
        });
        this.filterColumns.locationIds.dataSource = sortByField(locations, 'name');
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.WorkflowFilterFormGroup.get('locationIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.WorkflowFilterFormGroup, this.filterColumns);
      }
    });

    this.WorkflowFilterFormGroup.get('locationIds')?.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        const departments: OrganizationDepartment[] = [];
        val.forEach((id) =>
          selectedLocations.push(
            this.filterColumns.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
          )
        );
        this.filterColumns.departmentsIds.dataSource = [];
        selectedLocations.forEach((location) => {
          departments.push(...(location.departments as []));
        });
        this.filterColumns.departmentsIds.dataSource = sortByField(departments, 'name');
      } else {
        this.filterColumns.departmentsIds.dataSource = [];
        this.WorkflowFilterFormGroup.get('departmentsIds')?.setValue([]);
        this.filteredItems = this.filterService.generateChips(this.WorkflowFilterFormGroup, this.filterColumns);
      }
    });

    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.skills = skills;
        this.allSkills = skills;
        this.filterColumns.skillIds.dataSource = skills;
      }
    });

    this.watchForLocations();

    this.workflowMappingFormGroup.get('workflowName')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    ).subscribe((id: number) => {
      if (this.orderRoleUserFormArray.length > 0) {
        this.orderRoleUserFormArray.clear();
      }

      if (this.applicationRoleUserFormArray.length > 0) {
        this.applicationRoleUserFormArray.clear();
      }

      const foundWorkflow = this.workflows.find((item) => item.id === id);
      // sort steps by order
      foundWorkflow?.workflows?.forEach((workflow: Workflow) => {
        workflow.steps.sort((first: Step, second: Step) => (first.order as number) - (second.order as number));
      });
      // add nextStepStatus field
      foundWorkflow?.workflows?.forEach((workflow: Workflow) => {
        workflow.steps = workflow.steps.map((item: Step, index: number, array: Step[]) => {
          return {
            ...item,
            nextStepStatus: array[index + 1]?.status,
          };
        });
      });

      if (foundWorkflow && foundWorkflow.workflows) {
        this.orderWorkflowSteps = foundWorkflow.workflows[0].steps.filter(
          (step) => step.type === WorkflowStepType.Incomplete || step.type === WorkflowStepType.Custom
        ); // includes required Order step
        this.applicationWorkflowSteps = foundWorkflow.workflows[1].steps.filter((step) => step.requirePermission); // excludes not required App step
      }

      if (this.orderWorkflowSteps.length > 0) {
        this.orderWorkflowSteps.forEach(() => {
          this.orderRoleUserFormArray.push(
            this.formBuilder.group({ roleUserList: [null, Validators.required], isPermissionBased: [false] })
          );
        });
      }

      if (this.applicationWorkflowSteps.length > 0) {
        this.applicationWorkflowSteps.forEach(() => {
          this.applicationRoleUserFormArray.push(
            this.formBuilder.group({ roleUserList: [null, Validators.required], isPermissionBased: [false] })
          );
        });
      }

      this.isMappingSectionShown = true;
    });

    // close modal window with form and clear details
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SaveWorkflowMappingSucceed)).subscribe(() => {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
    });
  }

  public allRegionsChange(event: { checked: boolean }): void {
    this.allRegionsSelected = event.checked;
    const regionsControl = this.workflowMappingFormGroup.controls['regions'];
    if (this.allRegionsSelected) {
      regionsControl.setValue(null);
      regionsControl.disable();
      let locations: OrganizationLocation[] = [];
      this.allRegions.forEach((region: OrganizationRegion) => {
        const filteredLocation = region.locations || [];
        locations = [...locations, ...filteredLocation] as OrganizationLocation[];
      });
      this.locations = sortByField(locations, 'name');
    } else {
      regionsControl.enable();
    }
  }

  public allLocationsChange(event: { checked: boolean }): void {
    this.allLocationsSelected = event.checked;
    const locationsControl = this.workflowMappingFormGroup.controls['locations'];
    if (this.allLocationsSelected) {
      locationsControl.setValue(null);
      locationsControl.disable();
      let departments: OrganizationDepartment[] = [];
      this.locations?.forEach((location: OrganizationLocation) => {
        const filteredDepartments = location.departments || [];
        departments = [...departments, ...filteredDepartments] as OrganizationDepartment[];
      });
      this.departments = sortByField(departments, 'name');
    } else {
      locationsControl.enable();
    }
  }

  public allDepartmentsChange(event: { checked: boolean }): void {
    this.allDepartmentsSelected = event.checked;
    const departmentsControl = this.workflowMappingFormGroup.controls['departments'];
    if (this.allDepartmentsSelected) {
      departmentsControl.setValue(null);
      departmentsControl.disable();
    } else {
      departmentsControl.enable();
    }
  }

  public onDepartmentsFiltering(e: FilteringEventArgs): void {
    const char = e.text.length + 1;
    let query: Query = new Query();
    query =
      e.text !== ""
        ? query.where('name', 'contains', e.text, true).take(char * 15)
        : query;
    e.updateData(this.departments as [], query);
  };

  mapByWorkflowType(acc: WorkflowAsKeyModel, value: UsersByPermission | RolesByPermission) {
    if (acc?.[value.workflowType]) {
      return { ...acc, [value.workflowType]: [...acc[value.workflowType], value] };
    } else {
      return {
        ...acc,
        [value.workflowType]: [value],
      };
    }
  }

  mapRolePermissions(listOfPermissions: any, key: number): { [key: number]: RoleWithUser[] } {
    return listOfPermissions.reduce((acc: any, { type, roles }: any) => {
      if (!isEmpty(this.rolesWithUsers?.[key]?.[type])) {
        return {
          ...acc,
          [type]: [
            ...this.rolesWithUsers[key][type],
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

  mapUserPermissions(listOfPermissions: any, key: number): { [key: number]: RoleWithUser[] } {
    return listOfPermissions.reduce((acc: any, { type, users }: any) => {
      if (!isEmpty(this.rolesWithUsers?.[key]?.[type])) {
        return {
          ...acc,
          [type]: [
            ...this.rolesWithUsers[key][type],
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

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public override updatePage(): void {
    this.filters.orderBy = this.orderBy;
    this.store.dispatch(new GetWorkflowMappingPages(this.filters));
  }

  public onFilterClose() {
    this.WorkflowFilterFormGroup.setValue({
      regionIds: this.filters.regionIds || [],
      locationIds: this.filters.locationIds || [],
      departmentsIds: this.filters.departmentsIds || [],
      skillIds: this.filters.skillIds || [],
      types: this.filters.types || [],
      names: this.filters.names || [],
    });
    this.filteredItems = this.filterService.generateChips(this.WorkflowFilterFormGroup, this.filterColumns);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.WorkflowFilterFormGroup, this.filterColumns);
  }

  private clearFilters(): void {
    this.WorkflowFilterFormGroup.reset();
    this.filteredItems = [];
    this.currentPage = 1;
    this.filters = {};
  }

  public onFilterClearAll(): void {
    this.clearFilters();
    this.store.dispatch(new GetWorkflowMappingPages(this.filters));
  }

  public onFilterApply(): void {
    this.filters = this.WorkflowFilterFormGroup.getRawValue();
    this.filteredItems = this.filterService.generateChips(this.WorkflowFilterFormGroup, this.filterColumns);
    this.filters.pageNumber = this.currentPage;
    this.filters.pageSize = this.pageSize;
    this.store.dispatch(new GetWorkflowMappingPages(this.filters));
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public onAddMappingClick(): void {
    this.store.dispatch(new GetOrganizationStructure());
    this.store.dispatch(new ShowSideDialog(true));
    this.showForm = true;
  }

  public onEditButtonClick(data: any, event: any): void {
    this.showForm = true;
    this.addActiveCssClass(event);
    this.isMappingSectionShown = true;
    this.isEdit = true;
    this.editedRecordId = data.mappingId;

    setTimeout(() => {
      const foundWorkflow = this.workflows.find((w) => w.name === data.workflowName);

      this.workflowMappingFormGroup.controls['workflowType'].setValue(data.workflowGroupType);
      this.workflowMappingFormGroup.controls['workflowName'].setValue(foundWorkflow?.id);

      this.allRegionsChange({ checked: !data.regionId });
      this.allLocationsChange({ checked: !data.locationId });
      this.allDepartmentsChange({ checked: !data.departmentId });

      if (!data.regionId) {
        this.allRegionsSelected = true;
        this.workflowMappingFormGroup.controls['regions'].setValue(null);
      } else {
        this.workflowMappingFormGroup.controls['regions'].setValue([data.regionId]);
      }

      if (!data.locationId) {
        this.allLocationsSelected = true;
        this.workflowMappingFormGroup.controls['locations'].setValue(null);
      } else {
        this.workflowMappingFormGroup.controls['locations'].setValue([data.locationId]);
      }

      if (!data.departmentId) {
        this.allDepartmentsSelected = true;
        this.workflowMappingFormGroup.controls['departments'].setValue(null);
      } else {
        this.workflowMappingFormGroup.controls['departments'].setValue([data.departmentId]);
      }

      if (data.skills.length === 0) {
        this.workflowMappingFormGroup.controls['skills'].setValue(this.allSkills.map((skill: Skill) => skill.id));
      } else {
        this.workflowMappingFormGroup.controls['skills'].setValue(data.skills.map((skill: any) => skill.skillId));
      }

      this.setFormArrayControls(data.stepMappings);
    });

    this.store.dispatch(new GetOrganizationStructure());
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveButtonClick(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      }).pipe(
      take(1)
    ).subscribe((confirm) => {
      if (confirm) {
        this.store.dispatch(new RemoveWorkflowMapping(data.mappingId, this.filters));
      }
      this.removeActiveCssClass();
    });
  }

  public onCancelFormClick(): void {
    if (this.workflowMappingFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.showForm = false;
        this.clearFormDetails();
        this.removeActiveCssClass();
      });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.showForm = false;
      this.clearFormDetails();
      this.removeActiveCssClass();
    }
  }

  public onSaveFormClick(): void {
    if (this.workflowMappingFormGroup.valid) {
      const isAllRegions = this.allRegionsSelected;
      const workflowMapping: WorkflowMappingPost = {
        mappingId: this.editedRecordId,
        regionIds: isAllRegions ? null : this.workflowMappingFormGroup.controls['regions'].value,
        locationIds:
          this.allLocationsSelected
            ? null
            : this.workflowMappingFormGroup.controls['locations'].value,
        departmentIds:
          this.allDepartmentsSelected
            ? null
            : this.workflowMappingFormGroup.controls['departments'].value,
        skillIds:
          this.workflowMappingFormGroup.controls['skills'].value.length === this.allSkills.length
            ? []
            : this.workflowMappingFormGroup.controls['skills'].value, // [] means All on the BE side
        workflowGroupId: this.workflowMappingFormGroup.controls['workflowName'].value, // workflowName contains selected workflow id, on the BE workflowGroupId is just workflowId
        stepMappings: this.getStepMappings(),
      };

      this.store.dispatch(new SaveWorkflowMapping(workflowMapping, this.filters));
    } else {
      this.workflowMappingFormGroup.markAllAsTouched();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
    this.filters.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  public rowDataBound(args: any): void {
    // hides expand button if no children
    if (args.data.stepMappings.length === 0) {
      args.row.querySelector('td').innerHTML = ' ';
      args.row.querySelector('td').className = 'e-customized-expand-cell';
    }
  }

  public disableRoleUserList(index: number, isDisable: boolean, formArray: FormArray): void {
    if (isDisable) {
      formArray.at(index).get('roleUserList')?.disable();
    } else {
      formArray.at(index).get('roleUserList')?.enable();
    }
  }

  public getStepDetails(stepMappings: StepMapping[], workflowName: string, workflowType: WorkflowType): StepRoleUser[] {
    const foundWorkflow = this.workflows.find((flow) => flow.name === workflowName);
    const stepDetails: StepRoleUser[] = [];

    if (foundWorkflow && foundWorkflow.workflows) {
      const workflowIndex =
        workflowType === WorkflowType.OrderWorkflow ? WorkflowType.OrderWorkflow : WorkflowType.ApplicationWorkflow;

      stepMappings.forEach((stepMap) => {
        if (foundWorkflow.workflows) {
          const foundStep = foundWorkflow.workflows[workflowIndex - 1].steps.find(
            (st) => st.id === stepMap.workflowStepId
          );
          // @ts-ignore
          const foundUserRole = this.rolesWithUsers[workflowType][stepMap.workflowType];
          if (foundStep && foundUserRole) {
            stepDetails.push({ step: foundStep, roleUser: foundUserRole });
          }
        }
      });
    }

    return stepDetails;
  }

  private setFormArrayControls(stepMappings: StepMapping[]): void {
    this.setUsersAndRolesForEdit(
      stepMappings.filter((s) => s.workflowType === WorkflowType.OrderWorkflow),
      this.orderWorkflowSteps,
      this.orderRoleUserFormArray
    );
    this.setUsersAndRolesForEdit(
      stepMappings.filter((s) => s.workflowType === WorkflowType.ApplicationWorkflow),
      this.applicationWorkflowSteps,
      this.applicationRoleUserFormArray
    );
  }

  private setUsersAndRolesForEdit(stepMappings: StepMapping[], workflowSteps: Step[], formArray: FormArray): void {
    workflowSteps.forEach((step, i) => {
      let foundMatchedSteps = stepMappings.filter((s) => s.workflowStepId === step.id);

      if (foundMatchedSteps.length) {
        foundMatchedSteps.forEach((foundMatchedStep: StepMapping) => {
          if (foundMatchedStep.workflowStepId) {
            const foundUserRole = this.rolesWithUsers[foundMatchedStep.workflowType!]?.[step.type]?.find(
              (r: RoleWithUser) => r.id === foundMatchedStep?.userId || r.id === foundMatchedStep?.roleId?.toString()
            );
            if (foundUserRole) {
              const value = formArray.controls[i].value.roleUserList
                ? [...formArray.controls[i].value.roleUserList, foundUserRole.id]
                : [foundUserRole.id];
              formArray.controls[i].get('roleUserList')!.setValue(value);
            }
            formArray.controls[i].get('isPermissionBased')!.setValue(foundMatchedStep.isPermissionBased);
          }
        });
      }
    });
  }

  private getStepMappings(): StepMapping[] {
    const mappings: StepMapping[] = [];

    this.orderWorkflowSteps.forEach((step, i) => {
      const { roleUserList } = (this.orderRoleUserFormArray.controls[i] as FormGroup).getRawValue();
      if (!roleUserList) {
        const stepMapping: StepMapping = {
          workflowStepId: step.id,
          isPermissionBased: this.orderRoleUserFormArray.controls[i].value.isPermissionBased,
        };
        mappings.push(stepMapping);
      } else {
        roleUserList.forEach((roleUserId: string) => {
          if (roleUserId.includes('-')) {
            // define if roleUserId is GUID and then assign it to userId instead of roleId
            const stepMapping: StepMapping = {
              workflowStepId: step.id,
              userId: roleUserId,
              isPermissionBased: this.orderRoleUserFormArray.controls[i].value.isPermissionBased,
            };
            mappings.push(stepMapping);
          } else {
            const stepMapping: StepMapping = {
              workflowStepId: step.id,
              roleId: parseInt(roleUserId),
              isPermissionBased: this.orderRoleUserFormArray.controls[i].value.isPermissionBased,
            };
            mappings.push(stepMapping);
          }
        });
      }
    });

    this.applicationWorkflowSteps.forEach((step, i) => {
      const { roleUserList } = (this.applicationRoleUserFormArray.controls[i] as FormGroup).getRawValue();
      if (!roleUserList) {
        const stepMapping: StepMapping = {
          workflowStepId: step.id,
          isPermissionBased: this.applicationRoleUserFormArray.controls[i].value.isPermissionBased,
        };
        mappings.push(stepMapping);
      } else {
        roleUserList.forEach((roleUserId: string) => {
          if (roleUserId.includes('-')) {
            // define if roleUserId is GUID and then assign it to userId instead of roleId
            const stepMapping: StepMapping = {
              workflowStepId: step.id,
              userId: roleUserId,
              isPermissionBased: this.applicationRoleUserFormArray.controls[i].value.isPermissionBased,
            };
            mappings.push(stepMapping);
          } else {
            const stepMapping: StepMapping = {
              workflowStepId: step.id,
              roleId: parseInt(roleUserId),
              isPermissionBased: this.applicationRoleUserFormArray.controls[i].value.isPermissionBased,
            };
            mappings.push(stepMapping);
          }
        });
      }
    });

    return mappings;
  }

  private createWorkflowMappingFormGroup(): void {
    this.workflowMappingFormGroup = this.workflowMappingService.createWorkflowMappingForm();
  }

  private watchForWorkflowSources(): void {
    this.workflows$.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    ).subscribe((workflows: WorkflowWithDetails[]) => {
      this.workflowSources = workflows;
      this.allWorkflows = workflows;
    });
  }

  private watchForLocations(): void {
    this.workflowMappingFormGroup.get('locations')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    ).subscribe((locationIds: number[]) => {
      const departments = this.workflowMappingService.getDepartmentsBaseOnType(
        this.workflowMappingFormGroup,
        this.locations,
        locationIds
      );

      this.departments = sortByField(departments, 'name');
      this.workflowMappingService.setControlNullValue(
        ['departments'],
        this.workflowMappingFormGroup,
      );
    });
  }

  private watchForRegions(): void {
    this.workflowMappingFormGroup.get('regions')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    ).subscribe((regionIds: number[]) => {
      const locations = this.workflowMappingService.getLocationsBaseOnType(
        this.workflowMappingFormGroup,
        this.orgRegions,
        regionIds,
      );


      this.locations = sortByField(locations, 'name');
      this.workflowMappingService.setControlNullValue(
        ['locations', 'departments'],
        this.workflowMappingFormGroup,
      );
    });
  }

  private watchForWorkflowType(): void {
    this.workflowMappingFormGroup.get('workflowType')?.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$)
    ).subscribe((value: WorkflowGroupType) => {
      this.workflowMappingService.resetControls(
        ['regions', 'locations', 'departments', 'skills', 'workflowName'],
        this.workflowMappingFormGroup
      );
      this.setWorkflowSources(value);
    });
  }

  private setWorkflowSources(value: WorkflowGroupType): void {
    if (value === WorkflowGroupType.IRPOrderWorkflow) {
      this.skills = this.workflowMappingService.getIncludeIrpSources(this.allSkills);
      this.workflowSources = this.workflowMappingService.getIncludeIrpSources(this.allWorkflows);
      return;
    }

    this.skills = this.allSkills;
    this.workflowSources = this.allWorkflows;
  }

  private initWorkflowSources(): void {
    const workflowGroupSources = CreateWorkflowTypeList(this.isIRPFlagEnabled, this.systemFlags);
    this.workflowGroupTypesSources = workflowGroupSources;
    this.filterColumns.types.dataSource = this.workflowMappingService.prepareFilterWorkflowGroupOption(
      workflowGroupSources
    );
  }

  private initFiltersConfig(): void {
    this.filterColumns = FiltersColumnsConfig;
  }

  private watchForChangePage(): void {
    this.pageSubject.pipe(
      throttleTime(100),
      takeUntil(this.unsubscribe$),
    ).subscribe((page) => {
      this.currentPage = page;
      this.filters.pageNumber = page;
      this.store.dispatch(new GetWorkflowMappingPages(this.filters));
    });
  }

  private watchForOrganizationChange(): void {
    this.organizationId$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.clearFilters();
      this.store.dispatch([
        new GetAssignedSkillsByOrganization(),
        new GetWorkflowMappingPages(this.filters),
        new GetRolesForWorkflowMapping(),
        new GetUsersForWorkflowMapping(),
        new GetWorkflows({
          includeInVMS: false,
          includeInIRP: false,
        }),
      ]);
    });
  }

  private clearFormDetails(): void {
    this.workflowMappingFormGroup.reset();
    this.isEdit = false;
    this.editedRecordId = undefined;
    this.isMappingSectionShown = this.allRegionsSelected = this.allLocationsSelected = this.allDepartmentsSelected = false;
    this.allRegionsChange({ checked: false });
    this.allLocationsChange({ checked: false });
    this.allDepartmentsChange({ checked: false });
  }
}
