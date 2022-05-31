import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, of, Subject, takeUntil } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  ClearDepartmentList,
  ClearLocationList,
  GetAllSkills,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetRegions
} from '../../store/organization-management.actions';
import { Location } from '@shared/models/location.model';
import { Department } from '@shared/models/department.model';
import { SkillsPage } from '@shared/models/skill.model';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { WorkflowType } from '@shared/enums/workflow-type';
import { WorkflowState } from '../../store/workflow.state';
import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { GetWorkflows, RemoveWorkflowMapping, SaveWorkflowMapping } from '../../store/workflow.actions';
import { UserState } from '../../../store/user.state';
import { WorkflowMappingPage, WorkflowMappingPost } from '@shared/models/workflow-mapping.model';
import { GetRolePerUser } from '../../../security/store/security.actions';

export enum WorkflowTypesGroup {
  OrderWorkflow = 'Job Order Workflow',
  ApplicationWorkflow = 'Application Workflow'
}

@Component({
  selector: 'app-workflow-mapping',
  templateUrl: './workflow-mapping.component.html',
  styleUrls: ['./workflow-mapping.component.scss']
})
export class WorkflowMappingComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @Input() isActive: boolean = false;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  public departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  @Select(OrganizationManagementState.skills)
  skills$: Observable<SkillsPage>;
  skillsFields: FieldSettingsModel = { text: 'skillDescription', value: 'id' };

  workflowTypes$: Observable<WorkflowTypesGroup[]> = of([WorkflowTypesGroup.OrderWorkflow, WorkflowTypesGroup.ApplicationWorkflow]);

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(WorkflowState.workflows)
  workflowName$: Observable<WorkflowWithDetails[]>;
  workflowNameFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(WorkflowState.workflowMappingPages)
  workflowMappings$: Observable<WorkflowMappingPage>;

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isEdit = false;
  public workflowMappingFormGroup: FormGroup;
  public editedWorkflowMappingId?: number;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  private formBuilder: FormBuilder;
  private pageSubject = new Subject<number>();
  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createWorkflowMappingFormGroup();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegions());
    this.store.dispatch(new GetAllSkills());
    this.organizationId$.pipe(filter(Boolean), takeUntil(this.unsubscribe$)).subscribe(id => {
      this.store.dispatch(new GetRolePerUser(1, id)); // TODO: need businessUnitType
      this.store.dispatch(new GetWorkflows(id));
    });

    this.workflowMappingFormGroup.get('regions')?.valueChanges.subscribe((val: number[]) => {
      if (val && val.length > 0) {
        this.store.dispatch(new GetLocationsByRegionId(val[0]));
        this.store.dispatch(new ClearDepartmentList());
      } else {
        this.store.dispatch(new ClearLocationList());
        this.store.dispatch(new ClearDepartmentList());
      }

      this.workflowMappingFormGroup.controls['locations'].setValue(0);
      this.workflowMappingFormGroup.controls['departments'].setValue(0);
    });

    this.workflowMappingFormGroup.get('locations')?.valueChanges.subscribe((val: number[]) => {
      if (val && val.length > 0) {
        this.store.dispatch(new GetDepartmentsByLocationId(val[0]));
      } else {
        this.store.dispatch(new ClearDepartmentList());
      }

      this.workflowMappingFormGroup.controls['departments'].setValue(0);
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
    // TODO: add implementation
    this.workflowMappingFormGroup.setValue({
      regions: [data.regionId],
      locations: [data.locationId],
      departments: [data.departmentId],
      skills: data.skills,
      workflowType: data.workflowGroupId,
      workflowName: data.workflowName
    });
    this.isEdit = true;
    this.editedWorkflowMappingId = data.mappingId;
    this.store.dispatch(new ShowSideDialog(true));
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
          this.isEdit = false;
          this.workflowMappingFormGroup.reset();
          this.removeActiveCssClass();
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
      this.removeActiveCssClass();
    }
  }

  public onSaveFormClick(): void {
    // TODO: add implementation
    if (this.workflowMappingFormGroup.valid) {
      const workflowMapping: WorkflowMappingPost = {
        mappingId: this.editedWorkflowMappingId,
        regionIds: this.workflowMappingFormGroup.controls['regions'].value,
        locationIds: this.workflowMappingFormGroup.controls['locations'].value,
        departmentIds: this.workflowMappingFormGroup.controls['departments'].value,
        skillIds: this.workflowMappingFormGroup.controls['skills'].value,
        workflowGroupId: WorkflowType.OrderWorkflow, // TODO: clarify,
        stepMappings: [] // TODO: need implementation
      };
      console.log(workflowMapping);
      // this.store.dispatch(new SaveWorkflowMapping(workflowMapping));
      this.clearFormDetails();
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

  private createWorkflowMappingFormGroup(): void {
   this.workflowMappingFormGroup = this.formBuilder.group({
     regions: ['', Validators.required],
     locations: ['', Validators.required],
     departments: ['', Validators.required],
     skills: ['', Validators.required],
     workflowType: [ '', Validators.required],
     workflowName: ['', Validators.required]
   });
  }

  private clearFormDetails(): void {
    this.workflowMappingFormGroup.reset();
    this.isEdit = false;
    this.editedWorkflowMappingId = undefined;
  }
}
