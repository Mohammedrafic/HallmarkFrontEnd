import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { accrualReportTypesList, analyticsConstants } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SearchCandidate, SkillCategoryDto } from '../models/common-report.model';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-financial-time-sheet-report',
  templateUrl: './financial-time-sheet-report.component.html',
  styleUrls: ['./financial-time-sheet-report.component.scss']
})
export class FinancialTimeSheetReportComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "OrganizationParamFTS": "",
    "StartDateParamFTS": "",
    "EndDateParamFTS": "",
    "RegionParamFTS": "",
    "LocationParamFTS": "",
    "DepartmentParamFTS": "",
    "SkillCategoriesParamFTS":"",
    "SkillsParamFTS":"",
    "CandidateNameParamFTS":"",
    "CandidateStatusesParamFTS":"",
    "OrderTypesParamFTS":"",
    "JobStatusesParamFTS":"",
    "JobIdParamFTS":"",
    "BearerParamFTS": "",
    "BusinessUnitIdParamFTS": "",
    "HostName": "",
    "AccrualReportFilterTypeFTS": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/FinancialTimeSheet/FinancialTimeSheet.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/FinancialTimeSheet/FinancialTimeSheet.cat" };
  public title: string = "Financial Timesheet";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  public allOption: string = "All";
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

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.commonReportFilterData)
  public financialTimeSheetFilterData$: Observable<CommonReportFilterOptions>;

  @Select(LogiReportState.commonReportCandidateSearch)
  public financialTimeSheetCandidateSearchData$: Observable<SearchCandidate[]>;

  candidateSearchData: SearchCandidate[] = [];

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'id' };
  selectedDepartments: Department[];
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public financialTimesheetReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  public candidateNameControl: AbstractControl;
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  public defaultOrganizations: number;
  public defaultRegions: (number | undefined)[] = [];
  public defaultLocations: (number | undefined)[] = [];
  public defaultDepartments: (number | undefined)[] = [];
  public defaultSkillCategories: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public defaultSkills: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public candidateFilterData :{ [key: number]: SearchCandidate; }[] = [];
  public isResetFilter: boolean = false;
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

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

    this.SetReportData();
  }

  ngOnInit(): void {
   
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();      
      this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
    
      this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.AccrualReportTypes)?.setValue(1);
      this.onFilterControlValueChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.financialTimesheetReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        regionIds: new FormControl([], [Validators.required]),
        locationIds: new FormControl([], [Validators.required]),
        departmentIds: new FormControl([], [Validators.required]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        candidateName: new FormControl(null),
        candidateStatuses: new FormControl([]),
        orderTypes: new FormControl([]),
        jobStatuses: new FormControl([]),
        jobId: new FormControl(''),
        accrualReportTypes: new FormControl(null, [Validators.required])
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = uniqBy(data, 'organizationId');
      this.filterColumns.businessIds.dataSource = this.organizations;
      this.defaultOrganizations = this.agencyOrganizationId;
      
      this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
      this.changeDetectorRef.detectChanges();
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!this.isClearAll) {
        let orgList = this.organizations?.filter((x) => data == x.organizationId);
        this.selectedOrganizations = orgList;
        const regionsList: Region[] = [];
        const locationsList: Location[] = [];
        const departmentsList: Department[] = [];
        orgList.forEach((value) => {
          regionsList.push(...value.regions);
          value.regions.forEach((region) => {
            locationsList.push(...region.locations);
            region.locations.forEach((location) => {
              departmentsList.push(...location.departments);
            });
          });
        });

        this.regionsList = sortByField(regionsList, 'name');
        this.locationsList = sortByField(locationsList, 'name');
        this.departmentsList = sortByField(departmentsList, 'name');

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
        this.financialTimeSheetFilterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: CommonReportFilterOptions | null) => {
          if (data != null) {
            this.filterOptionsData = data;
            this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
            this.filterColumns.skillIds.dataSource = [];
            this.filterColumns.jobStatuses.dataSource = data.orderStatuses;
            this.filterColumns.candidateStatuses.dataSource = data.candidateStatuses;
            this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
            this.defaultOrderTypes = OrderTypeOptions.map((list) => list.id);
            this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue(this.defaultSkillCategories);
            this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.OrderTypes)?.setValue(this.defaultOrderTypes);
          }
        });
        this.regions = this.regionsList;
        this.filterColumns.regionIds.dataSource = this.regions;
        this.defaultRegions = this.regionsList.map((list) => list.id);
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.isClearAll = false;
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      }
    });
    this.regionIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.regionIdControl.value.length > 0) {
        let regionList = this.regions?.filter((object) => data?.includes(object.id));
        this.selectedRegions = regionList;
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.defaultLocations = this.locations.map((list) => list.id);
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue(this.defaultLocations);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      }
    });
    this.locationIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.locationIdControl.value.length > 0) {
        this.selectedLocations = this.locations?.filter((object) => data?.includes(object.id));
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
        this.defaultDepartments = this.departments.map((list) => list.id);
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue(this.defaultDepartments);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.selectedDepartments = this.departments?.filter((object) => data?.includes(object.id));
      if (this.isInitialLoad&&data.length>0) {

        this.SearchReport();
        this.isInitialLoad = false;
      }
    });
    this.skillCategoryIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.defaultSkills = skills.map((list) => list.id);
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });
    
  }

  public SearchReport(): void {   
   

    this.filteredItems = [];
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let {accrualReportTypes,businessIds,candidateName,candidateStatuses,departmentIds,jobId,jobStatuses,locationIds,orderTypes,
      regionIds,skillCategoryIds,skillIds,startDate, endDate } = this.financialTimesheetReportForm.getRawValue();
      if (!this.financialTimesheetReportForm.dirty) {
        this.message = "Default filter selected with all regions, locations and departments for 90 days";
      }
      else {
        this.isResetFilter = false;
        this.message = ""
      }
    this.paramsData =
    {
      "OrganizationParamFTS": this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "StartDateParamFTS": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamFTS": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamFTS": regionIds.join(","),
      "LocationParamFTS": locationIds.join(","),
      "DepartmentParamFTS": departmentIds.join(","),
      "SkillCategoriesParamFTS":skillCategoryIds.length==0?"null":skillCategoryIds.join(","),
      "SkillsParamFTS":skillIds.length==0?"null":skillIds.join(","),
      "CandidateNameParamFTS":candidateName==null||candidateName==""?"null":candidateName,
      "CandidateStatusesParamFTS":candidateStatuses.length==0?"null":candidateStatuses.join(","),
      "OrderTypesParamFTS":orderTypes.length==0?"null":orderTypes.join(","),
      "JobStatusesParamFTS":jobStatuses.length==0?"null":jobStatuses.join(","),
      "JobIdParamFTS":jobId==null||jobId==""?"null":jobId,
      "BearerParamFTS": auth,
      "BusinessUnitIdParamFTS": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
      "AccrualReportFilterTypeFTS": accrualReportTypes.toString()
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
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: OrderTypeOptions,
        valueField: 'name',
        valueId: 'id',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'id',
      },
      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },
      accrualReportTypes: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: accrualReportTypesList,
        valueField: 'name',
        valueId: 'id',
      }
    }
  }
  private SetReportData() {
    const logiReportData = this.store.selectSnapshot(LogiReportState.logiReportData);
    if (logiReportData != null && logiReportData.length == 0) {
      this.store.dispatch(new GetLogiReportData());
    }
    else {
      this.logiReportComponent?.SetReportData(logiReportData);
    }
  }

  public showFilters(): void {
    if (this.isResetFilter) {
    this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.financialTimesheetReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.CandidateName)?.setValue(null);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.OrderTypes)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.JobStatuses)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.JobId)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.AccrualReportTypes)?.setValue(0);
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.financialTimesheetReportForm.markAllAsTouched();
    if (this.financialTimesheetReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch([new ShowToast(MessageTypes.Error, error)]);
    return;
  }
  
  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }
  @OutsideZone
  private onFilterChild(e: FilteringEventArgs)
  {
    if (e.text != '') {
      let ids=[];
      ids.push(this.bussinessControl.value);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businssUnitIds:ids
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportCandidateSearch(filter))
        .subscribe((result) => {
          this.candidateFilterData = result.LogiReport.searchCandidates;
          this.candidateSearchData=result.LogiReport.searchCandidates;
          this.filterColumns.dataSource=this.candidateFilterData;
           // pass the filter data source to updateData method.
          e.updateData(this.candidateFilterData);
        });
     
    }
  }
}
