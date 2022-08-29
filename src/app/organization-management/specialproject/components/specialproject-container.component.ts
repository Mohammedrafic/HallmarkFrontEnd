import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SpecialProjectTabs, AddButtonText } from '@shared/enums/special-project-tabs.enum'
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { Organization, OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { UserState } from '../../../store/user.state';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Skill } from '@shared/models/skill.model';
import { SpecialProjectState } from '../../store/special-project.state';
import { ProjectType } from '@shared/models/project.model';
import { GetProjectTypes, GetSpecialProjectById, SaveSpecialProject } from '../../store/special-project.actions';
import { SpecialProject } from '@shared/models/special-project.model';
import { GetAllOrganizationSkills } from '../../store/organization-management.actions';
import { SpecialProjectsComponent } from '../components/special-projects/special-projects.component';
import { PurchaseOrdersComponent } from '../components/purchase-orders/purchase-orders.component';
import { GetPurchaseOrders, GetPurchaseOrderById, SavePurchaseOrder } from '../../store/purchase-order.actions';
import { PurchaseOrder, PurchaseOrderPage } from '@shared/models/purchase-order.model';
import { PurchaseOrderState } from '../../store/purchase-order.state';
import { SpecialProjectCategoryState } from '../../store/special-project-category.state';
import { SpecialProjectCategoryComponent } from '../components/special-project-categories/special-project-categories.component';
import { SpecialProjectCategory } from '@shared/models/special-project-category.model';
import { GetSpecialProjectCategoryById, SaveSpecialProjectCategory } from '../../store/special-project-category.actions';
import { FormControlNames } from '../enums/specialproject.enum';
import { ProjectNames, SaveSpecialProjectMappingDto, SpecialProjectMapping } from '@shared/models/special-project-mapping.model';
import { GetProjectNamesByTypeId, SaveSpecialProjectMapping, SpecialProjectShowConfirmationPopUp } from '../../store/special-project-mapping.actions';
import { ProjectMappingComponent } from '../components/project-mapping/project-mapping.component';
import { SpecialProjectMappingState } from '../../store/special-project-mapping.state';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { ConfirmService } from '@shared/services/confirm.service';
import { DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE } from '../../../shared/constants';
import { SavePurchaseOrderMapping, ShowConfirmationPopUp } from '../../store/purchase-order-mapping.actions';
import { PurchaseOrderMappingState } from '../../store/purchase-order-mapping.state';
import { PurchaseOrderNames, SavePurchaseOrderMappingDto } from '../../../shared/models/purchase-order-mapping.model';
import { PurchaseOrderMappingComponent } from '../components/purchase-order-mapping/purchase-order-mapping.component';

@Component({
  selector: 'app-specialproject-container',
  templateUrl: './specialproject-container.component.html',
  styleUrls: ['./specialproject-container.component.scss']
})

export class SpecialProjectContainerComponent implements OnInit, OnDestroy {
  @ViewChild(SpecialProjectsComponent, { static: false }) childC: SpecialProjectsComponent;
  @ViewChild(PurchaseOrdersComponent, { static: false }) childPurchaseComponent: PurchaseOrdersComponent;
  @ViewChild(SpecialProjectCategoryComponent, { static: false }) childSpecialProjectCategoryComponent: SpecialProjectCategoryComponent;
  @ViewChild(ProjectMappingComponent, { static: false }) childSpecialProjectMappingComponent: ProjectMappingComponent;
  @ViewChild(PurchaseOrderMappingComponent, { static: false }) childPurchaseOrderMappingComponent: PurchaseOrderMappingComponent;
  public form: FormGroup;
  public SpecialProjectTabs = SpecialProjectTabs;
  public selectedTab: SpecialProjectTabs = SpecialProjectTabs.SpecialProjects;
  public addButtonTitle: string = AddButtonText.AddSpecialProject;
  public title: string = '';
  public isEdit: boolean;
  public isSaving: boolean;
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public skillsFields = {
    text: 'skillDescription',
    value: 'id',
  };

  public projectTypeFields = {
    text: 'projectType',
    value: 'id',
  };

  public projectNameFields = {
    text: 'name',
    value: 'id',
  };
  public poNameFields = {
    text: 'name',
    value: 'id',
  };
  public orgStructure: OrganizationStructure;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  private unsubscribe$: Subject<void> = new Subject();
  public regions: OrganizationRegion[] = [];
  public orgStructureData: any;

  @Select(OrganizationManagementState.allOrganizationSkills)
  skills$: Observable<Skill[]>;

  @Select(SpecialProjectState.projectTypes)
  projectTypes$: Observable<ProjectType[]>;

  @Select(SpecialProjectMappingState.projectNames)
  projectNames$: Observable<ProjectNames[]>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;
  public organizationId: number = 0;

  @Select(SpecialProjectState.SpecialProjectEntity)
  specialProjectEntity$: Observable<SpecialProject>;

  @Select(PurchaseOrderState.purchaseOrderEntity)
  purchaseOrderEntity$: Observable<PurchaseOrder>;

  @Select(SpecialProjectCategoryState.specialProjectCategoryEntity)
  specialProjectCategoryEntity$: Observable<SpecialProjectCategory>;
  id: number = 0;
  selectedProjectId: number = 0;
  public specialProjectMappingToPost?: SaveSpecialProjectMappingDto;
  public purchaseOrderMappingToPost?: SavePurchaseOrderMappingDto;

  @Select(PurchaseOrderState.purchaseOrderPage)
  purchaseOrderPage$: Observable<PurchaseOrderPage>;

  constructor(private store: Store,
    private changeDetectorRef: ChangeDetectorRef,
    private actions$: Actions,
    private confirmService: ConfirmService) { }

  ngOnInit(): void {
    this.orgStructureDataSetup();
    this.onOrganizationStructureDataLoadHandler();
    this.createForm();
    this.onOrgStructureControlValueChangedHandler();
    this.onSkillDataLoadHandler();
    this.getProjectTypes();
    this.onOrganizationChangedHandler();

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(SpecialProjectShowConfirmationPopUp))
      .subscribe(() => {
        this.confirmService
          .confirm(DATA_OVERRIDE_TEXT, {
            title: DATA_OVERRIDE_TITLE,
            okButtonLabel: 'Confirm',
            okButtonClass: ''
          }).pipe(filter(confirm => !!confirm))
          .subscribe(() => {
            if (this.specialProjectMappingToPost) {
              this.specialProjectMappingToPost.forceUpsert = true;
              this.store.dispatch(new SaveSpecialProjectMapping(this.specialProjectMappingToPost)).subscribe(val => {
                this.form.reset();
                this.childSpecialProjectMappingComponent.getSpecialProjectMappings();
                this.closeDialog();
                this.store.dispatch(new ShowSideDialog(false));
              });
            } else {
              this.store.dispatch(new ShowSideDialog(false));
              this.form.reset();
            }
          });
      });

    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(ShowConfirmationPopUp))
      .subscribe(() => {
        this.confirmService
          .confirm(DATA_OVERRIDE_TEXT, {
            title: DATA_OVERRIDE_TITLE,
            okButtonLabel: 'Confirm',
            okButtonClass: ''
          }).pipe(filter(confirm => !!confirm))
          .subscribe(() => {
            if (this.purchaseOrderMappingToPost) {
              this.purchaseOrderMappingToPost.forceUpsert = true;
              this.store.dispatch(new SavePurchaseOrderMapping(this.purchaseOrderMappingToPost)).subscribe(val => {
                this.form.reset();
                this.childPurchaseOrderMappingComponent.getPurchaseOrderMappings();
                this.closeDialog();
                this.store.dispatch(new ShowSideDialog(false));
              });
            } else {
              this.store.dispatch(new ShowSideDialog(false));
              this.form.reset();
            }
          });
      });

    this.getPONames();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getProjectTypes(): void {
    this.store.dispatch(new GetProjectTypes());
    this.projectTypes$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.orgStructureData.projectTypeIds.dataSource = data;
      }
    });

  }

  getPONames(): void {
    this.store.dispatch(new GetPurchaseOrders());
    this.purchaseOrderPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data?.items) {
        this.orgStructureData.poNameIds.dataSource = data?.items.map((item) => { return { id: item.id, name: item.poName } });
      }
    });

  }

  getProjectNamesByTypeId(typeId: number): void {
    this.store.dispatch(new GetProjectNamesByTypeId(typeId));
    this.projectNames$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.orgStructureData.projectNameIds.dataSource = data;
        if (this.isEdit && this.selectedProjectId > 0) {
          this.form.controls['projectNameMapping'].setValue(this.selectedProjectId);
        }
      }
    });

  }

  onProjectTypeDropDownChanged(event: ChangeEventArgs) {
    const selectedType = event.itemData as ProjectType;
    if (selectedType.id) {
      this.getProjectNamesByTypeId(selectedType.id);
    }
  }

  private onOrganizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizationId = data;
      switch (this.selectedTab) {
        case SpecialProjectTabs.SpecialProjects:
          this.childC?.getSpecialProjects();
          break;
        case SpecialProjectTabs.PurchaseOrders:
          this.childPurchaseComponent?.getPurchaseOrders();
          break;
        case SpecialProjectTabs.SpecialProjectCategories:
          this.childSpecialProjectCategoryComponent?.getSpecialProjectCategories();
          break;
        case SpecialProjectTabs.SpecialProjectsMapping:
          this.childSpecialProjectMappingComponent?.getSpecialProjectMappings();
          break;
        case SpecialProjectTabs.PurchaseOrdersMapping:
          this.childPurchaseOrderMappingComponent?.getPurchaseOrderMappings();
          break;
      }

    });
  }

  private createForm(): void {
    this.form = new FormGroup({})
    this.addRemoveFormcontrols();
  }

  public onTabSelected(selectedTab: any): void {
    this.selectedTab = selectedTab.selectedIndex;
    this.addRemoveFormcontrols();
  }

  public addRemoveFormcontrols() {
    switch (this.selectedTab) {
      case SpecialProjectTabs.SpecialProjects:
        this.addButtonTitle = AddButtonText.AddSpecialProject;
        this.form.addControl(FormControlNames.ProjectCategory, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.ProjectName, new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]));
        this.form.addControl(FormControlNames.StartDate, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.EndDate, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.ProjectBudget, new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(11)]));
        if (this.form.contains(FormControlNames.PrePopulateInOrders)) this.form.removeControl(FormControlNames.PrePopulateInOrders);
        if (this.form.contains(FormControlNames.projectCategoryMapping)) this.form.removeControl(FormControlNames.projectCategoryMapping);
        if (this.form.contains(FormControlNames.projectNameMapping)) this.form.removeControl(FormControlNames.projectNameMapping);
        if (this.form.contains(FormControlNames.RegionIds)) this.form.removeControl(FormControlNames.RegionIds);
        if (this.form.contains(FormControlNames.LocationIds)) this.form.removeControl(FormControlNames.LocationIds);
        if (this.form.contains(FormControlNames.DepartmentsIds)) this.form.removeControl(FormControlNames.DepartmentsIds);
        if (this.form.contains(FormControlNames.SkillIds)) this.form.removeControl(FormControlNames.SkillIds);
        if (this.form.contains(FormControlNames.PoName)) this.form.removeControl(FormControlNames.PoName);
        if (this.form.contains(FormControlNames.PoDescription)) this.form.removeControl(FormControlNames.PoDescription);
        if (this.form.contains(FormControlNames.SpecialProjectCategoryName)) this.form.removeControl(FormControlNames.SpecialProjectCategoryName);
        if (this.form.contains(FormControlNames.PoNamesMapping)) this.form.removeControl(FormControlNames.PoNamesMapping);
        break;
      case SpecialProjectTabs.PurchaseOrders:
        this.addButtonTitle = AddButtonText.AddPurchaseOrder;
        this.form.addControl(FormControlNames.PoName, new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]));
        this.form.addControl(FormControlNames.PoDescription, new FormControl(null, [Validators.required, Validators.maxLength(10), Validators.minLength(3)]));
        this.form.addControl(FormControlNames.StartDate, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.EndDate, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.ProjectBudget, new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(11)]));
        if (this.form.contains(FormControlNames.PrePopulateInOrders)) this.form.removeControl(FormControlNames.PrePopulateInOrders);
        if (this.form.contains(FormControlNames.projectCategoryMapping)) this.form.removeControl(FormControlNames.projectCategoryMapping);
        if (this.form.contains(FormControlNames.projectNameMapping)) this.form.removeControl(FormControlNames.projectNameMapping);
        if (this.form.contains(FormControlNames.RegionIds)) this.form.removeControl(FormControlNames.RegionIds);
        if (this.form.contains(FormControlNames.LocationIds)) this.form.removeControl(FormControlNames.LocationIds);
        if (this.form.contains(FormControlNames.DepartmentsIds)) this.form.removeControl(FormControlNames.DepartmentsIds);
        if (this.form.contains(FormControlNames.SkillIds)) this.form.removeControl(FormControlNames.SkillIds);
        if (this.form.contains(FormControlNames.ProjectCategory)) this.form.removeControl(FormControlNames.ProjectCategory);
        if (this.form.contains(FormControlNames.ProjectName)) this.form.removeControl(FormControlNames.ProjectName);
        if (this.form.contains(FormControlNames.SpecialProjectCategoryName)) this.form.removeControl(FormControlNames.SpecialProjectCategoryName);
        if (this.form.contains(FormControlNames.PoNamesMapping)) this.form.removeControl(FormControlNames.PoNamesMapping);
        break;
      case SpecialProjectTabs.SpecialProjectCategories:
        this.addButtonTitle = AddButtonText.AddSpecialProjectCategory;
        this.form.addControl(FormControlNames.SpecialProjectCategoryName, new FormControl(null, [Validators.required, Validators.maxLength(100), Validators.minLength(3)]));
        if (this.form.contains(FormControlNames.ProjectCategory)) this.form.removeControl(FormControlNames.ProjectCategory);
        if (this.form.contains(FormControlNames.ProjectName)) this.form.removeControl(FormControlNames.ProjectName);
        if (this.form.contains(FormControlNames.PoName)) this.form.removeControl(FormControlNames.PoName);
        if (this.form.contains(FormControlNames.PoDescription)) this.form.removeControl(FormControlNames.PoDescription);
        if (this.form.contains(FormControlNames.RegionIds)) this.form.removeControl(FormControlNames.RegionIds);
        if (this.form.contains(FormControlNames.LocationIds)) this.form.removeControl(FormControlNames.LocationIds);
        if (this.form.contains(FormControlNames.DepartmentsIds)) this.form.removeControl(FormControlNames.DepartmentsIds);
        if (this.form.contains(FormControlNames.SkillIds)) this.form.removeControl(FormControlNames.SkillIds);
        if (this.form.contains(FormControlNames.PrePopulateInOrders)) this.form.removeControl(FormControlNames.PrePopulateInOrders);
        if (this.form.contains(FormControlNames.StartDate)) this.form.removeControl(FormControlNames.StartDate);
        if (this.form.contains(FormControlNames.EndDate)) this.form.removeControl(FormControlNames.EndDate);
        if (this.form.contains(FormControlNames.ProjectBudget)) this.form.removeControl(FormControlNames.ProjectBudget);
        if (this.form.contains(FormControlNames.projectCategoryMapping)) this.form.removeControl(FormControlNames.projectCategoryMapping);
        if (this.form.contains(FormControlNames.projectNameMapping)) this.form.removeControl(FormControlNames.projectNameMapping);
        if (this.form.contains(FormControlNames.PoNamesMapping)) this.form.removeControl(FormControlNames.PoNamesMapping);
        break;
      case SpecialProjectTabs.SpecialProjectsMapping:
        this.form.addControl(FormControlNames.projectCategoryMapping, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.projectNameMapping, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.RegionIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.LocationIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.DepartmentsIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.SkillIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.PrePopulateInOrders, new FormControl(false));
        if (this.form.contains(FormControlNames.ProjectCategory)) this.form.removeControl(FormControlNames.ProjectCategory);
        if (this.form.contains(FormControlNames.ProjectName)) this.form.removeControl(FormControlNames.ProjectName);
        if (this.form.contains(FormControlNames.PoName)) this.form.removeControl(FormControlNames.PoName);
        if (this.form.contains(FormControlNames.PoDescription)) this.form.removeControl(FormControlNames.PoDescription);
        if (this.form.contains(FormControlNames.StartDate)) this.form.removeControl(FormControlNames.StartDate);
        if (this.form.contains(FormControlNames.EndDate)) this.form.removeControl(FormControlNames.EndDate);
        if (this.form.contains(FormControlNames.ProjectBudget)) this.form.removeControl(FormControlNames.ProjectBudget);
        if (this.form.contains(FormControlNames.PoNamesMapping)) this.form.removeControl(FormControlNames.PoNamesMapping);
        this.addButtonTitle = AddButtonText.AddMapping;
        break;
      case SpecialProjectTabs.PurchaseOrdersMapping:
        this.form.addControl(FormControlNames.PoNamesMapping, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.RegionIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.LocationIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.DepartmentsIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.SkillIds, new FormControl(null, [Validators.required]));
        this.form.addControl(FormControlNames.PrePopulateInOrders, new FormControl(false));
        if (this.form.contains(FormControlNames.ProjectCategory)) this.form.removeControl(FormControlNames.ProjectCategory);
        if (this.form.contains(FormControlNames.ProjectName)) this.form.removeControl(FormControlNames.ProjectName);
        if (this.form.contains(FormControlNames.PoName)) this.form.removeControl(FormControlNames.PoName);
        if (this.form.contains(FormControlNames.PoDescription)) this.form.removeControl(FormControlNames.PoDescription);
        if (this.form.contains(FormControlNames.StartDate)) this.form.removeControl(FormControlNames.StartDate);
        if (this.form.contains(FormControlNames.EndDate)) this.form.removeControl(FormControlNames.EndDate);
        if (this.form.contains(FormControlNames.ProjectBudget)) this.form.removeControl(FormControlNames.ProjectBudget);
        if (this.form.contains(FormControlNames.projectNameMapping)) this.form.removeControl(FormControlNames.projectNameMapping);
        if (this.form.contains(FormControlNames.projectCategoryMapping)) this.form.removeControl(FormControlNames.projectCategoryMapping);
        this.addButtonTitle = AddButtonText.AddMapping;
        break;
    }
  }

  private orgStructureDataSetup(): void {
    this.orgStructureData = {
      poName: { type: ControlTypes.Text, valueType: ValueType.Text },
      poDescription: { type: ControlTypes.Text, valueType: ValueType.Text },
      regionIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      departmentsIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'skillDescription',
        valueId: 'id',
      },
      projectTypeIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'projectType',
        valueId: 'id',
      },
      projectNameIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      poNameIds: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      budget: { type: ControlTypes.Text, valueType: ValueType.Text }
    };
  }


  private onOrganizationStructureDataLoadHandler(): void {
    this.organizationStructure$
      .pipe(takeUntil(this.unsubscribe$), filter(Boolean))
      .subscribe((structure: OrganizationStructure) => {
        this.orgStructure = structure;
        this.regions = structure.regions;
        this.orgStructureData.regionIds.dataSource = this.regions;
      });
  }

  private onOrgStructureControlValueChangedHandler(): void {

    this.form.get('regionIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        this.form.get('locationIds')?.setValue([]);
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.orgStructureData.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          this.orgStructureData.locationIds.dataSource.push(...(region?.locations as []));
        });
      } else {
        this.orgStructureData.locationIds.dataSource = [];
        this.form.get('locationIds')?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
    this.form.get('locationIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        this.form.get('departmentsIds')?.setValue([]);
        const selectedLocations: OrganizationLocation[] = [];
        val.forEach((id) =>
          selectedLocations.push(
            this.orgStructureData.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
          )
        );
        this.orgStructureData.departmentsIds.dataSource = [];
        selectedLocations.forEach((location) => {
          this.orgStructureData.departmentsIds.dataSource.push(...(location?.departments as []));
        });
      } else {
        this.orgStructureData.departmentsIds.dataSource = [];
        this.form.get('departmentsIds')?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });

  }

  private onSkillDataLoadHandler(): void {
    this.store.dispatch(new GetAllOrganizationSkills());
    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.orgStructureData.skillIds.dataSource = skills;
      }
    });
  }

  public closeDialog(): void {
    this.isEdit = false;
    switch (this.selectedTab) {
      case SpecialProjectTabs.SpecialProjects:
        this.addButtonTitle = AddButtonText.AddSpecialProject;
        break;
      case SpecialProjectTabs.PurchaseOrders:
        this.addButtonTitle = AddButtonText.AddPurchaseOrder;
        break;
      case SpecialProjectTabs.SpecialProjectCategories:
        this.addButtonTitle = AddButtonText.AddSpecialProjectCategory;
        break;
      case SpecialProjectTabs.SpecialProjectsMapping:
      case SpecialProjectTabs.PurchaseOrdersMapping:
        this.addButtonTitle = AddButtonText.AddMapping;
        break;
    }
    this.form.reset();
    this.store.dispatch(new ShowSideDialog(false));
  }

  public handleOnSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    switch (this.selectedTab) {
      case SpecialProjectTabs.SpecialProjects:
        this.saveSpecialProject();
        break;
      case SpecialProjectTabs.PurchaseOrders:
        this.savePurchaseOrder();
        break;
      case SpecialProjectTabs.SpecialProjectCategories:
        this.saveSpecialProjectCategory();
        break;
      case SpecialProjectTabs.SpecialProjectsMapping:
      case SpecialProjectTabs.PurchaseOrdersMapping:
        this.saveMappings();
        break;
    }
  }

  private saveSpecialProject() {
    let specialProject: SpecialProject =
    {
      id: this.id,
      projectTypeId: this.form.value.projectCategory,
      startDate: this.form.value.startDate,
      endDate: this.form.value.endDate,
      isDeleted: false,
      name: this.form.value.projectName,
      organizationId: this.organizationId,
      projectBudget: this.form.value.projectBudget,
    };
    this.store.dispatch(new SaveSpecialProject(specialProject)).subscribe(val => {
      this.form.reset();
      this.childC.getSpecialProjects();
      this.closeDialog();
    });
  }

  private savePurchaseOrder() {
    let purchaseOrder: PurchaseOrder =
    {
      id: this.id,
      poName: this.form.value.poName,
      poNumber: this.form.value.poDescription,
      startDate: this.form.value.startDate,
      endDate: this.form.value.endDate,
      isDeleted: false,
      organizationId: this.organizationId,
      projectBudget: this.form.value.projectBudget,
    };
    this.store.dispatch(new SavePurchaseOrder(purchaseOrder)).subscribe(val => {
      this.form.reset();
      this.childPurchaseComponent.getPurchaseOrders();
      this.closeDialog();
    });
  }

  private saveSpecialProjectCategory() {
    let specialProjectCategory: SpecialProjectCategory =
    {
      id: this.id,
      organizationId: this.organizationId,
      specialProjectCategory: this.form.value.SpecialProjectCategoryName
    };
    this.store.dispatch(new SaveSpecialProjectCategory(specialProjectCategory)).subscribe(val => {
      this.form.reset();
      this.childSpecialProjectCategoryComponent.getSpecialProjectCategories();
      this.closeDialog();
    });
  }

  public saveMappings() {
    const isAllRegions = this.form.controls['regionIds'].value.length === this.regions.length;
    const isAllLocations = this.form.controls['locationIds'].value.length === this.orgStructureData.locationIds.dataSource.length;
    const isAllDepartments = this.form.controls['departmentsIds'].value.length === this.orgStructureData.departmentsIds.dataSource.length;
    const isAllSkills = this.form.controls['skillIds'].value.length === this.orgStructureData.skillIds.dataSource.length;
    if (this.selectedTab == SpecialProjectTabs.SpecialProjectsMapping) {
      let specialProjectMapping: SaveSpecialProjectMappingDto =
      {
        Id: this.id,
        orderProjectNameId: this.form.value.projectNameMapping,
        regionIds: isAllRegions ? [] : this.form.controls['regionIds'].value,
        locationIds: isAllRegions && isAllLocations ? [] : this.form.controls['locationIds'].value,
        departmentIds: isAllRegions && isAllDepartments ? [] : this.form.controls['departmentsIds'].value,
        skillIds: isAllSkills ? [] : this.form.controls['skillIds'].value,
        prePopulateInOrders: this.form.controls['PrePopulateInOrders'].value != null ? this.form.controls['PrePopulateInOrders'].value : false
      };

      this.specialProjectMappingToPost = specialProjectMapping;
      this.store.dispatch(new SaveSpecialProjectMapping(specialProjectMapping)).subscribe(val => {
        this.form.reset();
        this.childSpecialProjectMappingComponent.getSpecialProjectMappings();
        this.closeDialog();
      });
    }
    if (this.selectedTab == SpecialProjectTabs.PurchaseOrdersMapping) {
      let purchaseOrderMapping: SavePurchaseOrderMappingDto =
      {
        Id: this.id,
        OrderPoNumberId: this.form.value.poNamesMapping,
        regionIds: isAllRegions ? [] : this.form.controls['regionIds'].value,
        locationIds: isAllRegions && isAllLocations ? [] : this.form.controls['locationIds'].value,
        departmentIds: isAllRegions && isAllDepartments ? [] : this.form.controls['departmentsIds'].value,
        skillIds: isAllSkills ? [] : this.form.controls['skillIds'].value,
        prePopulateInOrders: this.form.controls['PrePopulateInOrders'].value != null ? this.form.controls['PrePopulateInOrders'].value : false
      };

      this.purchaseOrderMappingToPost = purchaseOrderMapping;
      this.store.dispatch(new SavePurchaseOrderMapping(purchaseOrderMapping)).subscribe(val => {
        this.form.reset();
        this.childPurchaseOrderMappingComponent.getPurchaseOrderMappings();
        this.closeDialog();
      });
    }
  }

  public handleOnAdd(): void {
    this.id = 0;
    this.title = DialogMode.Add;
    this.title = this.addButtonTitle;
    this.isEdit = false;
    this.onOrgStructureControlValueChangedHandler();
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEditClick(data: any): void {
    this.isEdit = true;
    this.title = DialogMode.Edit;
    this.onOrgStructureControlValueChangedHandler();
    switch (this.selectedTab) {
      case SpecialProjectTabs.SpecialProjects:
        this.addButtonTitle = AddButtonText.EditSpecialProject;
        this.getSpecialProjectById(data.id);
        break;
      case SpecialProjectTabs.PurchaseOrders:
        this.addButtonTitle = AddButtonText.EditPurchaseOrder;
        this.getPurchaseOrderById(data.id);
        break;
      case SpecialProjectTabs.SpecialProjectCategories:
        this.addButtonTitle = AddButtonText.EditSpecialProjectCategory;
        this.getSpecilaProjectCategoryById(data.id);
        break;
      case SpecialProjectTabs.SpecialProjectsMapping:
      case SpecialProjectTabs.PurchaseOrdersMapping:
        this.addButtonTitle = AddButtonText.EditMapping;
        this.editMappings(data);
        break;
    }
    this.title = this.addButtonTitle;
  }

  private getSpecialProjectById(id: number) {
    this.store.dispatch(new GetSpecialProjectById(id));
    this.specialProjectEntity$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.id = data?.id;
        this.form.setValue({
          projectCategory: data.projectTypeId || null,
          startDate: data.startDate,
          endDate: data.endDate,
          projectName: data.name,
          projectBudget: data.projectBudget
        });
        this.store.dispatch(new ShowSideDialog(true));
      }
    });
  }

  private getPurchaseOrderById(id: number) {
    this.store.dispatch(new GetPurchaseOrderById(id));
    this.purchaseOrderEntity$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.id = data?.id;
        this.form.setValue({
          startDate: data.startDate,
          endDate: data.endDate,
          poName: data.poName,
          projectBudget: data.projectBudget,
          poDescription: data.poNumber
        });
        this.store.dispatch(new ShowSideDialog(true));
      }
    });
  }

  private getSpecilaProjectCategoryById(id: number) {
    this.store.dispatch(new GetSpecialProjectCategoryById(id));
    this.specialProjectCategoryEntity$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.id = data?.id;
        this.form.setValue({
          SpecialProjectCategoryName: data.specialProjectCategory,
        });
        this.store.dispatch(new ShowSideDialog(true));
      }
    });
  }

  private editMappings(data: any) {
    this.isEdit = true;
    this.id = data?.id;

    setTimeout(() => this.setupFormValues(data));

    this.store.dispatch(new ShowSideDialog(true));
  }

  setupFormValues(data: any) {
    if (!data.regionId) {
      const allRegionsIds = this.regions.map(region => region.id);
      this.form.controls['regionIds'].setValue(allRegionsIds);
    } else {
      this.form.controls['regionIds'].setValue([data.regionId]);
    }

    if (!data.locationId) {
      const locationIds = this.orgStructureData.locationIds.dataSource.map((location: OrganizationLocation) => location.id);
      this.form.controls['locationIds'].setValue(locationIds);
    } else {
      this.form.controls['locationIds'].setValue([data.locationId]);
    }

    if (!data.departmentId) {
      const departmentIds = this.orgStructureData.departmentsIds.dataSource.map((department: OrganizationDepartment) => department.id);
      this.form.controls['departmentsIds'].setValue(departmentIds);
    } else {
      this.form.controls['departmentsIds'].setValue([data.departmentId]);
    }

    if (data.skills.length === 0) {
      this.form.controls['skillIds'].setValue(this.orgStructureData.skillIds.dataSource.map((skill: Skill) => skill.id));
    } else {
      this.form.controls['skillIds'].setValue(data.skills.map((skill: any) => skill.id));
    }

    if (this.selectedTab == SpecialProjectTabs.SpecialProjectsMapping) {
      this.form.controls['projectCategoryMapping'].setValue(data.orderSpecialProjectCategoryId);
      this.selectedProjectId = data.orderSpecialProjectId;
      setTimeout(() => this.getProjectNamesByTypeId(data.orderSpecialProjectCategoryId));
    }
    else if (this.selectedTab == SpecialProjectTabs.PurchaseOrdersMapping) {
      this.form.controls['poNamesMapping'].setValue(data.orderPoNumberId);
    }
    if (this.selectedTab == SpecialProjectTabs.SpecialProjectsMapping) {
      this.form.controls['PrePopulateInOrders'].setValue(data.prePopulateInOrders);
    }
    else if (this.selectedTab == SpecialProjectTabs.PurchaseOrdersMapping) {
      this.form.controls['PrePopulateInOrders'].setValue(data.prePopulateInOrders);
    }
  }

}
