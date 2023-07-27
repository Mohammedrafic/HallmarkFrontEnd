import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { EmitType } from '@syncfusion/ej2-base';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType } from 'src/app/security/store/security.actions';
import { ClearLogiReportState, GetStaffScheduleReportFilterOptions, GetCommonReportCandidateSearch, GetCommonReportFilterOptions, GetDepartmentsByLocations, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { formatDate } from '@angular/common';

import {
  CommonReportFilterOptions, MasterSkillDto, SkillCategoryDto, OrderTypeOptionsForReport, AgencyDto,
  CommonCandidateSearchFilter,
  CommonReportFilter,
  SearchCandidate,
  StaffScheduleReportFilterOptions,
} from '../models/common-report.model';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { FilteredItem } from '@shared/models/filter.model';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { User } from '@shared/models/user.model';
import { Department, Region, Location, Organisation } from '@shared/models/visibility-settings.model';
import { FilterService } from '@shared/services/filter.service';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { uniqBy, isBoolean } from 'lodash';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { OutsideZone } from '@core/decorators';
import { Skill } from '../../../shared/models/skill.model';
import { predictedcontractlaborspentConstants, analyticsConstants } from '../constants/analytics.constant';

@Component({
  selector: 'app-predicted-contract-labor-spent',
  templateUrl: './predicted-contract-labor-spent.component.html',
  styleUrls: ['./predicted-contract-labor-spent.component.scss']
})

export class PredictedContractLaborSpentComponent implements OnInit, OnDestroy {
  public baseUrl: string = '';
  public user: User | null;
  public minDate: Object = new Date(Date.now());

  public readonly dropDownfields = { text: 'name', value: 'id' };
  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public PredictedContractLaborSpentForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  public skillIds: Skill[] = [];
  public defaultOrganizations: number;


  public paramsData: any = {

    PCLOrganizationId: '',
    PCLStartdate: '',
    PCLEndDate: '',
    PCLRegionId: '',
    PCLLocationId: '',
    PCLDepartmentId: '',
    PCLSkillCategory: '',
    PCLSkillId: '',
    PCLUserId: ''
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/PredictedContractLaborSpent/PredicatedContractLaborSpent.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/PredictedContractLaborSpent/PredictedContractLaborSpent.cat" };
  public message: string = "";
  public title: string = "Predicted Contract Labor Spend";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public allOption: string = "All";

  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  public isInitialLoad: boolean = false;

  private dateFormat = 'MM/dd/yyyy';
  private culture = 'en-US';
  private nullValue = "null";
  private joinString = ",";

  public organizationFields = ORGANIZATION_DATA_FIELDS;
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };



  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegions: Region[];

  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocations: Location[];

  @Select(LogiReportState.departments)
  public departments$: Observable<Department[]>;
  isDepartmentsDropDownEnabled: boolean = false;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedDepartments: Department[];

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[] = [];

  @Select(LogiReportState.commonReportFilterData)
  public PredictedContractLaborSpentFilterData$: Observable<CommonReportFilterOptions>;

  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  filterOptionsData: CommonReportFilterOptions;
  skillCategoryIdControl: AbstractControl;
  skillIdControl: AbstractControl;
  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
    this.initForm();
    this.user = this.store.selectSnapshot(UserState.user);
    if (this.user?.id != null) {
      this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    }

  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();
      //this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });

      this.agencyOrganizationId = data;
      this.isInitialLoad = true;

      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.onFilterSkillCategoryChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.BusinessIds)?.enable() : this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate() + 14);
    this.PredictedContractLaborSpentForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(new Date(Date.now())  , [Validators.required]),
        endDate: new FormControl(endDate, [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([])
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }


  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        this.isAlive = true;
        this.previousOrgId = data;
        if (!this.isClearAll) {
          let orgList = this.organizations?.filter((x) => data == x.organizationId);
          this.selectedOrganizations = orgList;
          this.regionsList = [];
          let regionsList: Region[] = [];
          let locationsList: Location[] = [];
          let departmentsList: Department[] = [];

          orgList.forEach((value) => {
            regionsList.push(...value.regions);
            locationsList = regionsList.map(obj => {
              return obj.locations.filter(location => location.regionId === obj.id);
            }).reduce((a, b) => a.concat(b), []);
            departmentsList = locationsList.map(obj => {
              return obj.departments.filter(department => department.locationId === obj.id);
            }).reduce((a, b) => a.concat(b), []);
          });

          this.regionsList = sortByField(regionsList, "name");
          this.locationsList = sortByField(locationsList, 'name');
          this.departmentsList = sortByField(departmentsList, 'name');

          this.masterRegionsList = this.regionsList;
          this.masterLocationsList = this.locationsList;
          this.masterDepartmentsList = this.departmentsList;

          if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
            this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          }
          else {
            this.isResetFilter = true;
          }
          let businessIdData = [];
          businessIdData.push(data);
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };

          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.PredictedContractLaborSpentFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = [];
             this.SearchReport() ;
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.PredictedContractLaborSpentForm.get( predictedcontractlaborspentConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.LocationIds)?.setValue([]);
      this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.LocationIds)?.setValue([]);
        this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  public onFilterSkillCategoryChangedHandler(): void {
    this.skillIds = [];

    this.skillCategoryIdControl = this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {

        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
      }
      else {
        this.filterColumns.skillIds.dataSource = [];
        this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });
  }

  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch(new ShowToast(MessageTypes.Error, error));
    return;
  }

  public SearchReport(): void {
    this.filteredItems = [];
    let {
      businessIds,     
      departmentIds,      
      locationIds,      
      regionIds,      
      skillCategoryIds,
      skillIds,
      startDate,
      endDate }
      = this.PredictedContractLaborSpentForm.getRawValue();
    if (!this.PredictedContractLaborSpentForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 14 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }


    regionIds = regionIds.length > 0 ? regionIds.join(",") : '';
    locationIds = locationIds.length > 0 ? locationIds.join(",") : '';
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : '';
    skillCategoryIds = skillCategoryIds.length > 0 ? skillCategoryIds.join(",") : this.filterColumns.skillCategoryIds.dataSource?.length > 0 ? this.filterColumns.skillCategoryIds.dataSource.map((x: { id: any; }) => x.id).join(",") : '';
    skillIds = skillIds.length > 0 ? skillIds.join(",") : this.filterColumns.skillIds.dataSource?.length > 0 ? this.filterColumns.skillIds.dataSource.map((x: { id: any; }) => x.id).join(",") : '';


    this.paramsData =
    {
      PCLDepartmentId: departmentIds,
      PCLEndDate: endDate == null ? "01/01/0001" : formatDate(endDate, this.dateFormat, this.culture),
      PCLStartdate: formatDate(startDate, this.dateFormat, this.culture),
      PCLLocationId: locationIds,
      PCLOrganizationId: this.selectedOrganizations?.length == 0 ? this.nullValue : this.selectedOrganizations?.map((list) => list.organizationId).join(this.joinString),
      PCLRegionId: regionIds,
      PCLSkillId: skillIds,
      PCLUserId: this.user?.id,
      PCLSkillCategory: skillCategoryIds.length == 0 ? '' : skillCategoryIds
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }
  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      businessIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      regionIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      locationIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      departmentIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillCategoryIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
    
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text }

    }
  }
  public showFilters(): void {
    if (this.isResetFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.PredictedContractLaborSpentForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate() + 14);
    this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.RegionIds)?.setValue([]);
    this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.LocationIds)?.setValue([]);
    this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.DepartmentIds)?.setValue([]);
    
    this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.SkillIds)?.setValue([]);
    this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.StartDate)?.setValue(new Date(Date.now()));
    this.PredictedContractLaborSpentForm.get(predictedcontractlaborspentConstants.formControlNames.EndDate)?.setValue(endDate);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }

  public onFilterApply(): void {
    let {
      startDate,
      endDate
    }
      = this.PredictedContractLaborSpentForm.getRawValue();
    let CurrentDate: string = formatDate(new Date(), this.dateFormat, this.culture);
    let StartChkDate: string = formatDate(startDate, this.dateFormat, this.culture);
    let EndDateChk: string = formatDate(endDate, this.dateFormat, this.culture);
    if (StartChkDate < CurrentDate || EndDateChk < StartChkDate) {
      //this.message = "";
      //let error: any = "Start Date should be Gretaer Than or Equal to Current Date";
      //this.store.dispatch(new ShowToast(MessageTypes.Error, error));
      return;
    }
    //if (EndDateChk < StartChkDate) {
    //  this.message = "";
    //  let error: any = "End Date should be Gretaer Than or Equal to Start Date";
    //  this.store.dispatch(new ShowToast(MessageTypes.Error, error));
    //  return;
    //}
    this.PredictedContractLaborSpentForm.markAllAsTouched();
    if (this.PredictedContractLaborSpentForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
}
