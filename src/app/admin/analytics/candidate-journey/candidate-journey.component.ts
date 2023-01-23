import { Component, OnInit, ViewChild ,OnDestroy, ChangeDetectorRef, Inject} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region,Location ,Department} from '@shared/models/visibility-settings.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType, GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ClearLogiReportState, GetCommonReportFilterOptions, GetDepartmentsByLocations, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { analyticsConstants } from '../constants/analytics.constant';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SkillCategoryDto,OrderTypeOptionsForReport } from '../models/common-report.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { DateTime } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-candidate-journey',
  templateUrl: './candidate-journey.component.html',
  styleUrls: ['./candidate-journey.component.scss']
})
export class CandidateJourneyComponent implements OnInit ,OnDestroy{
  
  public paramsData: any = {
    "OrganizationParamCJR": "",
    "StartDateParamCJR": "",
    "EndDateParamCJR": "",
    "RegionParamCJR": "",
    "LocationParamCJR": "",
    "DepartmentParamCJR": "",
    "SkillCategoriesParamCJR": "",
    "SkillsParamCJR": "",
    "CandidateStatusesParamCJR": "",
    "OrderTypesParamCJR": "",
    "JobStatusesParamCJR": "",
    "OrderIdParamCJR": "",
    "BearerParamCJR": "",
    "BusinessUnitIdParamCJR": "",
    "HostName": "",
    "TodayCJR":""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateJourney/CandidateJourney.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateJourney/CandidateJourney.cat" };  
  public message: string = "";
  public title: string = "Candidate Journey";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  public allOption:string="All";
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
  private agencyOrganizationId:number;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[]=[];

  @Select(LogiReportState.commonReportFilterData)
  public candidateJourneyFilterData$: Observable<CommonReportFilterOptions>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public candidateJourneyForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  public defaultOrganizations:number;
  public defaultRegions:(number|undefined)[] =[];
  public defaultLocations:(number|undefined)[]=[];
  public defaultDepartments:(number|undefined)[]=[];
  public defaultSkillCategories: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public defaultSkills: (number | undefined)[] = [];
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
  public user: User | null;  
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];  
  public baseUrl: string = '';
  private dateFormat = 'MM/dd/yyyy';
  private culture = 'en-US';
  private nullValue = "null";
  private joinString = ",";  
  private fixedJobStatusesIncluded:number[]=[3,4,7,8];
  private fixedCandidateStatusesIncluded:number[]=[1,2,3,4,5,7,10,11,12];
  private orderTypesList=OrderTypeOptionsForReport.filter(i=>i.id!=1);
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  filterOptionsData: CommonReportFilterOptions;
  skillCategoryIdControl: AbstractControl;
  skillIdControl: AbstractControl;
  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,    
    private changeDetectorRef: ChangeDetectorRef,
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
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data:number) => {  
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

      this.candidateJourneyForm.get(analyticsConstants.formControlNames.AccrualReportTypes)?.setValue(1);
      this.onFilterControlValueChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    this.candidateJourneyForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now())),
        regionIds: new FormControl([], [Validators.required]),
        locationIds: new FormControl([], [Validators.required]),
        departmentIds: new FormControl([], [Validators.required]),
        skillCategoryIds:new FormControl([]),
        skillIds:new FormControl([]),
        orderTypes:new FormControl([]),
        jobStatuses:new FormControl([]),
        candidateStatuses:new FormControl([]),
        jobId:new FormControl(null)
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
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
          this.candidateJourneyFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = false;
              this.filterOptionsData = data;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = [];
              this.filterColumns.jobStatuses.dataSource = data.allJobStatusesAndReasons.filter(i=>this.fixedJobStatusesIncluded.includes(i.status));
              this.filterColumns.candidateStatuses.dataSource = data.allCandidateStatusesAndReasons.filter(i=>this.fixedCandidateStatusesIncluded.includes(i.status));
              this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
              this.defaultOrderTypes = this.orderTypesList.map((list) => list.id);
              this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue(this.defaultSkillCategories);
              this.changeDetectorRef.detectChanges();
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.defaultRegions = this.regionsList.map((list) => list.id);
          this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
          this.changeDetectorRef.detectChanges();
        }
        else {
          this.isClearAll = false;
          this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
    this.regionIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.regionIdControl.value.length > 0) {
        let regionList = this.regions?.filter((object) => data?.includes(object.id));
        this.selectedRegions = regionList;
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.defaultLocations = this.locations.map((list) => list.id);
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue(this.defaultLocations);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      }
    });
    this.locationIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.locationIdControl.value.length > 0) {
        this.selectedLocations = this.locations?.filter((object) => data?.includes(object.id));
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
        this.defaultDepartments = this.departments.map((list) => list.id);
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue(this.defaultDepartments);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.selectedDepartments = this.departments?.filter((object) => data?.includes(object.id));
      if (this.isInitialLoad && data.length > 0) {

        setTimeout(()=>{ this.SearchReport()},3000);
        this.isInitialLoad = false;
      }
    });
    this.skillCategoryIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.defaultSkills = skills.map((list) => list.id);
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
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
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { businessIds,  candidateStatuses, departmentIds, jobId, 
      jobStatuses, locationIds, orderTypes,regionIds, skillCategoryIds, skillIds, startDate, endDate } 
      = this.candidateJourneyForm.getRawValue();
    if (!this.candidateJourneyForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 30 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
    this.paramsData =
    {
      "OrganizationParamCJR":this.selectedOrganizations?.length==0?this.nullValue: this.selectedOrganizations?.map((list) => list.organizationId).join(this.joinString),
      "StartDateParamCJR": formatDate(startDate, this.dateFormat, this.culture),
      "EndDateParamCJR":endDate==null?"01/01/0001": formatDate(endDate, this.dateFormat, this.culture),
      "RegionParamCJR": regionIds.length==0?this.nullValue : regionIds.join(this.joinString),
      "LocationParamCJR":locationIds.length==0?this.nullValue : locationIds.join(this.joinString),
      "DepartmentParamCJR":departmentIds.length==0?this.nullValue :  departmentIds.join(this.joinString),
      "SkillCategoriesParamCJR": skillCategoryIds.length == 0 ? this.nullValue : skillCategoryIds.join(this.joinString),
      "SkillsParamCJR": skillIds.length == 0 ? this.nullValue : skillIds.join(this.joinString),
      "CandidateStatusesParamCJR": candidateStatuses.length == 0 ? this.nullValue : candidateStatuses.join(this.joinString),
      "OrderTypesParamCJR": orderTypes.length == 0 ? this.nullValue : orderTypes.join(this.joinString),
      "JobStatusesParamCJR": jobStatuses.length == 0 ? this.nullValue : jobStatuses.join(this.joinString),
      "OrderIdParamCJR": jobId == null || jobId == "" ? this.nullValue : jobId,
      "BearerParamCJR": auth,
      "BusinessUnitIdParamCJR": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
      "TodayCJR":formatDate(new Date(),this.dateFormat,this.culture)
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
        dataSource: this.orderTypesList,
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
        valueId: 'status',
      },
      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      }
     
    }
  }
  private SetReportData(){
    const logiReportData = this.store.selectSnapshot(LogiReportState.logiReportData);
      if(logiReportData!=null&&logiReportData.length==0)
      {
        this.store.dispatch(new GetLogiReportData());
      }
      else{
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
    this.filterService.removeValue(event, this.candidateJourneyForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.OrderTypes)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.JobStatuses)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.JobId)?.setValue([]);
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.candidateJourneyForm.markAllAsTouched();
    if (this.candidateJourneyForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
}



