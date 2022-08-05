import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SpecialProjectTabs, AddButtonText } from '@shared/enums/special-project-tabs.enum'
import { DialogMode } from '../../../shared/enums/dialog-mode.enum';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '../../../shared/models/organization.model';
import { UserState } from '../../../store/user.state';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ControlTypes, ValueType } from '../../../shared/enums/control-types.enum';
import { currencyValidator } from '@shared/validators/currency.validator';
import { OrganizationManagementState } from '../../store/organization-management.state';
import { Skill } from '../../../shared/models/skill.model';


@Component({
  selector: 'app-specialproject-container',
  templateUrl: './specialproject-container.component.html',
  styleUrls: ['./specialproject-container.component.scss']
})

export class SpecialProjectContainerComponent implements OnInit, OnDestroy {
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
  public orgStructure: OrganizationStructure;

  @Select(UserState.organizationStructure)
  organizationStructure$: Observable<OrganizationStructure>;
  private unsubscribe$: Subject<void> = new Subject();
  public regions: OrganizationRegion[] = [];
  public orgStructureData: any;

  @Select(OrganizationManagementState.allOrganizationSkills)
  skills$: Observable<Skill[]>;

  constructor(private store: Store,
              private datePipe: DatePipe  ) { }

  ngOnInit(): void {
    this.orgStructureDataSetup();
    this.onOrganizationStructureDataLoadHandler();
    this.createForm();
    this.onOrgStructureControlValueChangedHandler();
    this.onSkillDataLoadHandler();
  }

  ngOnDestroy(): void {

  }

  private createForm(): void {
    this.form = new FormGroup({
      projectCategory: new FormControl('', this.selectedTab == SpecialProjectTabs.SpecialProjects ? [Validators.required] : []),
      projectName: new FormControl('', this.selectedTab == SpecialProjectTabs.SpecialProjects ? [Validators.required, Validators.maxLength(100), Validators.minLength(3)] : []),
      poName: new FormControl('', this.selectedTab == SpecialProjectTabs.PurchaseOrders ? [Validators.required, Validators.maxLength(100), Validators.minLength(3)] : []),
      poDescription: new FormControl('', this.selectedTab == SpecialProjectTabs.PurchaseOrders ? [Validators.required, Validators.maxLength(100), Validators.minLength(3)] : []),
      regionIds: new FormControl('', [Validators.required]),
      locationIds: new FormControl('', [Validators.required]),
      departmentsIds: new FormControl('', [Validators.required]),
      skillIds: new FormControl('', [Validators.required]),
      allowOnOrderCreation: new FormControl(null),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      projectBudget: new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(11), currencyValidator(1)]),
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
        const selectedRegions: OrganizationRegion[] = [];
        val.forEach((id) =>
          selectedRegions.push(this.regions.find((region) => region.id === id) as OrganizationRegion)
        );
        this.orgStructureData.locationIds.dataSource = [];
        selectedRegions.forEach((region) => {
          region.locations?.forEach((location) => (location.regionName = region.name));
          this.orgStructureData.locationIds.dataSource.push(...(region.locations as []));
        });
      } else {
        this.orgStructureData.locationIds.dataSource = [];
        this.form.get('locationIds')?.setValue([]);
      }
    });
    this.form.get('locationIds')?.valueChanges.subscribe((val: number[]) => {
      if (val?.length) {
        const selectedLocations: OrganizationLocation[] = [];
        val.forEach((id) =>
          selectedLocations.push(
            this.orgStructureData.locationIds.dataSource.find((location: OrganizationLocation) => location.id === id)
          )
        );
        this.orgStructureData.departmentsIds.dataSource = [];
        selectedLocations.forEach((location) => {
          this.orgStructureData.departmentsIds.dataSource.push(...(location.departments as []));
        });
      } else {
        this.orgStructureData.departmentsIds.dataSource = [];
        this.form.get('departmentsIds')?.setValue([]);
      }
    });
  }

  private onSkillDataLoadHandler(): void {
    this.skills$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills) => {
      if (skills && skills.length > 0) {
        this.orgStructureData.skillIds.dataSource = skills;
      }
    });
  }

  public closeDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  public saveSpecialProject(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  public handleOnAdd(): void {
    this.title = DialogMode.Add;
    this.title = this.addButtonTitle;
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
    this.isSaving = false;
  }

}
