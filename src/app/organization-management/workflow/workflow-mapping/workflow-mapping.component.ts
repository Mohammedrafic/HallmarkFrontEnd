import { Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Region } from '@shared/models/region.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { GetAllSkills, GetRegions } from '../../store/organization-management.actions';
import { Location } from '@shared/models/location.model';
import { Department } from '@shared/models/department.model';
import { Skill } from '@shared/models/skill.model';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

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
  skills$: Observable<Skill[]>;
  skillsFields = { text: 'masterSkill.skillDescription', value: 'id' };

  // TODO: add @Select
  workflowTypes$: Observable<any>; // TODO: add model

  // TODO: add select
  workflowData$: Observable<any>; // TODO: add model

  public fields: FieldSettingsModel = { text: 'name', value: 'id' };
  public isEdit = false;
  public workflowMappingFormGroup: FormGroup;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  private formBuilder: FormBuilder;
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
  }

  public onRemoveButtonClick(data: any, event: any): void {
    // TODO: add implementation
  }

  public mapGridData(): void {
    this.workflowData$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.workflowData$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  public onCancelFormClick(): void {
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
  }

  public onSaveFormClick(): void {
    // TODO: add implementation
  }

  private createWorkflowMappingFormGroup(): void {
   this.workflowMappingFormGroup = this.formBuilder.group({
     regionId: ['', Validators.required],
     locationId: ['', Validators.required],
     departmentId: ['', Validators.required],
     skillId: ['', Validators.required],
     workflowType: [ '', Validators.required],
     workflowName: ['', Validators.required]
   });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }
}
