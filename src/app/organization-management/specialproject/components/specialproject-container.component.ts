import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SpecialProjectTabs, AddButtonText } from '@shared/enums/special-project-tabs.enum'
import { DialogMode } from '@shared/enums/dialog-mode.enum';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { UserState } from '../../../store/user.state';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { currencyValidator } from '@shared/validators/currency.validator';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Skill } from '@shared/models/skill.model';
import { SpecialProjectState } from '../../store/special-project.state';
import { ProjectType } from '@shared/models/project.model';
import { GetProjectTypes, GetSpecialProjectById, SaveSpecialProject } from '../../store/special-project.actions';
import { SpecialProject } from '@shared/models/special-project.model';
import { GetAllOrganizationSkills } from '../../store/organization-management.actions';
import { SpecialProjectsComponent } from '../components/special-projects/special-projects.component';
import { PurchaseOrdersComponent } from '../components/purchase-orders/purchase-orders.component'
import { GetPurchaseOrders, GetPurchaseOrderById, SavePurchaseOrder } from '../../store/purchase-order.actions';
import { PurchaseOrder } from '../../../shared/models/purchase-order.model';
import { PurchaseOrderState } from '../../store/purchase-order.state';


@Component({
  selector: 'app-specialproject-container',
  templateUrl: './specialproject-container.component.html',
  styleUrls: ['./specialproject-container.component.scss']
})

export class SpecialProjectContainerComponent implements OnInit, OnDestroy {
  @ViewChild(SpecialProjectsComponent, { static: false }) childC: SpecialProjectsComponent;
  @ViewChild(PurchaseOrdersComponent, { static: false }) childPurchaseComponent: PurchaseOrdersComponent;
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

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;
  public organizationId: number = 0;

  @Select(SpecialProjectState.SpecialProjectEntity)
  specialProjectEntity$: Observable<SpecialProject>;

  @Select(PurchaseOrderState.purchaseOrderEntity)
  purchaseOrderEntity$: Observable<PurchaseOrder>;

  id: number = 0;


  constructor(private store: Store,
    private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.orgStructureDataSetup();
    this.onOrganizationStructureDataLoadHandler();
    this.createForm();
    this.onOrgStructureControlValueChangedHandler();
    this.onSkillDataLoadHandler();
    this.getProjectTypes();
    this.onOrganizationChangedHandler();
  }

  ngOnDestroy(): void {

  }

  getProjectTypes(): void {
    this.store.dispatch(new GetProjectTypes());
    this.projectTypes$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.orgStructureData.projectTypeIds.dataSource = data;
      }
    });

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
          
          break;
      }
      
    });
  }

  private createForm(): void {
    this.form = new FormGroup({
      projectCategory: new FormControl(0, this.selectedTab == SpecialProjectTabs.SpecialProjects ? [Validators.required] : []),
      projectName: new FormControl(null, this.selectedTab == SpecialProjectTabs.SpecialProjects ? [Validators.required, Validators.maxLength(100), Validators.minLength(3)] : []),
      poName: new FormControl(null, this.selectedTab == SpecialProjectTabs.PurchaseOrders ? [Validators.required, Validators.maxLength(100), Validators.minLength(3)] : []),
      poDescription: new FormControl(null, this.selectedTab == SpecialProjectTabs.PurchaseOrders ? [Validators.required, Validators.maxLength(100), Validators.minLength(3)] : []),
      regionIds: new FormControl(0, [Validators.required]),
      locationIds: new FormControl(0, [Validators.required]),
      departmentsIds: new FormControl(0, [Validators.required]),
      skillIds: new FormControl(0, [Validators.required]),
      allowOnOrderCreation: new FormControl(null),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      projectBudget: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(11)]),
    })
  }

  public onTabSelected(selectedTab: any): void {
    this.selectedTab = selectedTab.selectedIndex;
    switch (this.selectedTab) {
      case SpecialProjectTabs.SpecialProjects:
        this.createForm();
        this.addButtonTitle = AddButtonText.AddSpecialProject;
        break;
      case SpecialProjectTabs.PurchaseOrders:
        this.createForm();
        this.addButtonTitle = AddButtonText.AddPurchaseOrder;
        break;
      case SpecialProjectTabs.SpecialProjectCategories:
        this.createForm();
        this.addButtonTitle = AddButtonText.AddSpecialProjectCategory;
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
        this.createForm();
        this.addButtonTitle = AddButtonText.AddSpecialProject;
        break;
      case SpecialProjectTabs.PurchaseOrders:
        this.createForm();
        this.addButtonTitle = AddButtonText.AddPurchaseOrder;
        break;
      case SpecialProjectTabs.SpecialProjectCategories:
        this.createForm();
        this.addButtonTitle = AddButtonText.AddSpecialProjectCategory;
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

    let regionName = '';
    let locationName = '';
    let deptName = '';
    if (this.form.value.regionIds) {
      let region = this.orgStructureData.regionIds.dataSource.find((x: OrganizationRegion) => x.id === this.form.value.regionIds[0]);
      regionName = region.name;
    }
    if (this.form.value.locationIds) {
      let location = this.orgStructureData.locationIds.dataSource.find((x: OrganizationLocation) => x.id === this.form.value.locationIds[0]);
      locationName = location.name;
    }
    if (this.form.value.departmentsIds) {
      let dept = this.orgStructureData.departmentsIds.dataSource.find((x: OrganizationDepartment) => x.id === this.form.value.departmentsIds[0]);
      deptName = dept.name;
    }

    switch (this.selectedTab) {
      case SpecialProjectTabs.SpecialProjects:
        this.saveSpecialProject(regionName, locationName, deptName);
        break;
      case SpecialProjectTabs.PurchaseOrders:
        this.savePurchaseOrder(regionName, locationName, deptName);
        break;
      case SpecialProjectTabs.SpecialProjectCategories:
       
        break;
    }
    
  }

  public saveSpecialProject(regionName: string, locationName: string, deptName:string) {
    let specialProject: SpecialProject =
    {
      id: this.id,
      projectTypeId: this.form.value.projectCategory,
      regionId: this.form.value.regionIds[0],
      regionName: regionName,
      locationId: this.form.value.locationIds[0],
      locationName: locationName,
      departmentId: this.form.value.departmentsIds[0],
      departmentName: deptName,
      skillId: this.form.value.skillIds[0],
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

  public savePurchaseOrder(regionName: string, locationName: string, deptName: string) {
    let purchaseOrder: PurchaseOrder =
    {
      id: this.id,
      poName: this.form.value.poName,
      poNumber: this.form.value.poDescription,
      regionId: this.form.value.regionIds[0],
      regionName: regionName,
      locationId: this.form.value.locationIds[0],
      locationName: locationName,
      departmentId: this.form.value.departmentsIds[0],
      departmentName: deptName,
      skillId: this.form.value.skillIds[0],
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

  public handleOnAdd(): void {
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
        break;
    }
    this.title = this.addButtonTitle;
  }

  public getSpecialProjectById(id: number) {
    this.store.dispatch(new GetSpecialProjectById(id));
    this.specialProjectEntity$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.id = data?.id;
        this.form.setValue({
          projectCategory: data.projectTypeId || 0,
          regionIds: [data.regionId || 0],
          locationIds: [data.locationId || 0],
          departmentsIds: [data.departmentId || 0],
          skillIds: [data.skillId || 0],
          startDate: data.startDate,
          endDate: data.endDate,
          projectName: data.name,
          projectBudget: data.projectBudget,
          poName: '',
          poDescription: '',
          allowOnOrderCreation: false
        });
        this.store.dispatch(new ShowSideDialog(true));
      }
    });
  }

  public getPurchaseOrderById(id: number) {
    this.store.dispatch(new GetPurchaseOrderById(id));
    this.purchaseOrderEntity$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data) {
        this.id = data?.id;
        this.form.setValue({
          projectCategory: 0,
          regionIds: [data.regionId || 0],
          locationIds: [data.locationId || 0],
          departmentsIds: [data.departmentId || 0],
          skillIds: [data.skillId || 0],
          startDate: data.startDate,
          endDate: data.endDate,
          projectName: '',
          projectBudget: data.projectBudget,
          poName: data.poName,
          poDescription: data.poNumber,
          allowOnOrderCreation: false
        });
        this.store.dispatch(new ShowSideDialog(true));
      }
    });
  }
}
