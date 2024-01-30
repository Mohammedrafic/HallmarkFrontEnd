import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, distinctUntilChanged, filter, merge, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType, GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ClearLogiReportState, GetCommonReportCandidateSearch, GetCommonReportFilterOptions, GetDepartmentsByLocations, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { analyticsConstants, Period,clockList,Clock } from '../constants/analytics.constant';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SkillCategoryDto, OrderTypeOptionsForReport, AgencyDto, CommonCandidateSearchFilter, SearchCandidate } from '../models/common-report.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { includes, toNumber, uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { EmitType } from '@syncfusion/ej2-base';
import { OutsideZone } from '@core/decorators';
import { Skill } from '@shared/models/skill.model';
import { CandidateState } from '@agency/store/candidate.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { optionFields } from '@shared/constants';
import { GetMasterCredentials } from '@agency/store/candidate.actions';

@Component({
  selector: 'app-cock-id',
  templateUrl: './cock-id.component.html',
  styleUrls: ['./cock-id.component.scss'],
})
export class CockIdComponent implements OnInit {
  title="Clock ID"
  
  public paramsData: any = {

    "OrganizationIdsCl": "",
    "SkillIdsCLStartdateFromCL": "",
    "StartdateToCL": "",
    "RegionIdsCL": "",
    "LocationIdsCL": "",
    "OrderIdCL":"",
    "DepartmentIdsCL": "",
    "DurationOCS":"",
    "SkillIdsCL":"",
    "AgencyIdsCL": "",
    "CandidateNameCL":"",
    "CandidateStatusCL": "",
    "BOrganizationIdsCl": "",
    "UserIdCL": "",
    "OrganizationNameCL": "",
    "ReportPulledMessageCL": "",
    "DateRangeCL": "",
   "ClockIDCL":""
  };
  
  @Select(LogiReportState.commonReportCandidateSearch)
  public financialTimeSheetCandidateSearchData$: Observable<SearchCandidate[]>;

  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateSearchData: SearchCandidate[] = [];
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/ClockID/ClockID.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/ClockID/ClockID.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public allOption: string = "All";
  
  public readonly typeFieldSettingsModel = optionFields;
  public defaultSkillCategories: (number | undefined)[] = [];
  
  public defaultSkills: (number | undefined)[] = [];
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
  public CommonReportFilterData$: Observable<CommonReportFilterOptions>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public clockIdForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
  public candidateStatusesIdControl: AbstractControl;

  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  //public defaultOrganizations:number[] =[];
  public defaultRegions: (number | undefined)[] = [];
  public defaultLocations: (number | undefined)[] = [];
  public defaultDepartments: (number | undefined)[] = [];
  public defaultAgencys: (number | undefined)[] = [];
  public defaultCandidateStatuses: (string | undefined)[] = ['Onboard'];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string;
  public filterOptionsData: CommonReportFilterOptions;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private previousOrgId: number = 0;
  public isResetFilter: boolean = false;
  private isAlive = true;
  public user: User | null;
  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  private joinString = ",";
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  private fixedCandidateStatusesIncluded: string[] = ['Applied', 'Shortlisted', 'Custom', 'Offered', 'Accepted', 'Onboard'];
  private culture = 'en-US';
  public periodList: Period[] = [];
  public periodIsDefault: boolean = false;
  public clockList:Clock[]=[];

  periodFields: FieldSettingsModel = { text: 'name', value: 'name' };
  public defaultOrganizations: number;

  private get searchTermControl(): AbstractControl | null {
    return this.clockIdForm.get('searchTerm');
  }

  private get credentialTypeIdControl(): AbstractControl | null {
    return this.clockIdForm.get('credentialTypeId');
  }

  agencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  selectedAgencies: AgencyDto[] = [];
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'statusText' };
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  message: string;
  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private filterService: FilterService, @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
    this.initForm();
    this.user = this.store.selectSnapshot(UserState.user);
    const user = this.store.selectSnapshot(UserState.user);
    if (this.user?.id != null) {
      this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));

    }

    //if (user?.businessUnitType != null) {
    //  this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
    //}   
    //this.SetReportData();    
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
      this.loadperiod();
      this.loadclockId();
      this.organizationData$.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (data != null && data.length > 0) {
          this.organizations = uniqBy(data, 'organizationId');
          this.filterColumns.businessIds.dataSource = this.organizations;
          if (this.agencyOrganizationId) {
            this.defaultOrganizations = this.agencyOrganizationId;
            this.clockIdForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
          }
          this.changeDetectorRef.detectChanges();
        }
      });
      this.isInitialLoad = true;
      this.onFilterSkillCategoryChangedHandler();
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      
      // this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.clockIdForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.credentialExpiryForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();

      if (this.user)
        if (this.user.businessUnitType == BusinessUnitType.Hallmark || this.user.businessUnitType == BusinessUnitType.MSP) {
          this.clockIdForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        } else { this.clockIdForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable(); }
    });
  }


  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate());
    let endate = new Date(Date.now())
    endate.setDate(endate.getDate());
    this.clockIdForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(endate, [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        agencyIds: new FormControl([]),
        jobId: new FormControl(''),
        candidateStatuses: new FormControl([]),
        candidateName: new FormControl(null),
        opcredFlag: new FormControl(false),
        period: new FormControl(null),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        clockid:new FormControl([]),
      
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }


  selectPeriod(event: any) {
    let { startDate, period } = this.clockIdForm.getRawValue();
    const value = event.itemData.id;
    this.periodIsDefault = this.clockIdForm.controls['period'].value == "Custom" ? true : false;
    this.clockIdForm.get(analyticsConstants.formControlNames.startDate)?.setValue("");
    this.clockIdForm.get(analyticsConstants.formControlNames.endDate)?.setValue("");
    const PeriodCheck = value;
    let startDateControl = new Date(Date.now());
    let endDateControl = new Date(Date.now());
    let lastDayOfLastMonth = new Date();
    lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth(), 0);

    switch (PeriodCheck) {
      case 0:
        startDateControl.setDate(startDateControl.getDate() - 14);
        endDateControl.setDate(endDateControl.getDate() + 28);
        break;
      case 1:
        startDateControl.setDate(startDateControl.getDate() - 31);
        endDateControl.setDate(endDateControl.getDate() - 1);
        break;
      case 2:
        startDateControl.setDate(startDateControl.getDate() - 61);
        endDateControl.setDate(endDateControl.getDate() - 1);
        break;
      case 3:
        startDateControl.setDate(startDateControl.getDate() - 91);
        endDateControl.setDate(endDateControl.getDate() - 1);
        break;
      case 4:
        startDateControl = new Date(startDateControl.getFullYear(), startDateControl.getMonth(), 1);
        break;
      case 5:
        const today = new Date(Date.now());
        const quarter = Math.floor((today.getMonth() / 3));
        startDateControl = new Date(today.getFullYear(), quarter * 3 - 3, 1);
        endDateControl = new Date(startDateControl.getFullYear(), startDateControl.getMonth() + 3, 0);
        break;
      case 6:
        const startDate = new Date(startDateControl.getFullYear(), 0, 1)
        startDate.setDate(startDate.getDate());
        startDateControl = startDate;
        break;
      case 7:
        const firstDay = new Date(startDateControl.getFullYear(), startDateControl.getMonth(), 1);
        startDateControl = this.addMonths(firstDay, -6);
        startDateControl.setDate(startDateControl.getDate());
        endDateControl = new Date((lastDayOfLastMonth));
        break;
      case 8:
        const dayFirst = new Date(startDateControl.getFullYear(), startDateControl.getMonth(), 1);
        startDateControl = this.addMonths(dayFirst, -12);
        startDateControl.setDate(startDateControl.getDate());
        endDateControl = new Date((lastDayOfLastMonth));
        break;
    }

    this.clockIdForm.get(analyticsConstants.formControlNames.startDate)?.setValue(startDateControl);
    this.clockIdForm.get(analyticsConstants.formControlNames.endDate)?.setValue(new Date((endDateControl)));


  }
  private addMonths(date: any, months: any) {
    date.setMonth(date.getMonth() + months);
    return date;
  }
  private loadclockId():void{
    this.clockList=clockList;

  }
  private loadperiod(): void {
    this.periodList = [];
    this.periodList.push({ id: 0, name: 'Custom' });
    this.periodList.push({ id: 1, name: 'Last 30 days' });
    this.periodList.push({ id: 2, name: 'Last 60 days' });
    this.periodList.push({ id: 3, name: 'Last 90 days' });
    this.periodList.push({ id: 4, name: 'MTD' });
    this.periodList.push({ id: 5, name: 'Last Quarter' });
    this.periodList.push({ id: 6, name: 'YTD' });
    this.periodList.push({ id: 7, name: 'Last 6 Month' });
    this.periodList.push({ id: 8, name: 'Last 12 Months' });
    this.clockIdForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
  }
  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.clockIdForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe((data) => {
      this.clockIdForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      this.selectedOrganizations = [];
      // if (data != null && typeof data === 'number' && data != this.previousOrgId) {
      if (data && data.length > 0) {
        this.isAlive = true;
        this.previousOrgId = data;
       
        if (!this.isClearAll) {
          this.regionsList = [];
          let regionsList: Region[] = [];
          let locationsList: Location[] = [];
          let departmentsList: Department[] = [];
          this.selectedOrganizations = data;
          if (data.length == 1) {
            let orgList = this.organizations?.filter((x) => data[0] == x.organizationId);
            orgList.forEach((value) => {
              regionsList.push(...value.regions);
              locationsList = regionsList.map(obj => {
                return obj.locations.filter(location => location.regionId === obj.id);
              }).reduce((a, b) => a.concat(b), []);
              departmentsList = locationsList.map(obj => {
                return obj.departments.filter(department => department.locationId === obj.id);
              }).reduce((a, b) => a.concat(b), []);
            });

          }

          this.regionsList = sortByField(regionsList, "name");
          this.locationsList = sortByField(locationsList, 'name');
          this.departmentsList = sortByField(departmentsList, 'name');

          this.masterRegionsList = this.regionsList;
          this.masterLocationsList = this.locationsList;
          this.masterDepartmentsList = this.departmentsList;
          if (this.bussinessControl?.value.length == "1") {
            if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
              this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
            }
            else {
              this.isResetFilter = true;
            }
          }
          let businessIdData = [];
          businessIdData = data;
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };
          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.CommonReportFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.defaultCandidateStatuses = ['Onboard'];
              this.filterColumns.candidateStatuses.dataSource = data.candidateStatuses.filter(i => this.fixedCandidateStatusesIncluded.includes(i.statusText));
              this.clockIdForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
              this.clockIdForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue(this.defaultCandidateStatuses);
              this.filterColumns.agencyIds.dataSource = data.agencies;
              this.defaultAgencys = data.agencies.map((list) => list.agencyId);
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = data.masterSkills;
            let masterSkills = this.filterOptionsData.masterSkills;
            this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.changeDetectorRef.detectChanges();
              this.SearchReport();
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.SearchReport();
        }
        else {
          this.isClearAll = false;
          this.clockIdForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });


    this.agencyIdControl = this.clockIdForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
    this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.agencyIdControl.value.length > 0) {
        let agencyData = this.filterOptionsData.agencies;
        this.selectedAgencies = agencyData?.filter((object) => data?.includes(object.agencyId));
      }
    });

  }
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  public skillIds: Skill[] = [];
  public onFilterSkillCategoryChangedHandler(): void {
    this.skillIds = [];

    this.skillCategoryIdControl = this.clockIdForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {

        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
      }
      else {
          this.clockIdForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
          let masterSkills = this.filterOptionsData.masterSkills;

          this.filterColumns.skillIds.dataSource = masterSkills;
      }
    });
      this.skillIdControl = this.clockIdForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });
  }
  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.clockIdForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.clockIdForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.clockIdForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      this.locations = [];
      this.departments = [];

      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.clockIdForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.clockIdForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.clockIdForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.clockIdForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.clockIdForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.clockIdForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }


  public SearchReport(): void {
    let { businessIds, departmentIds, locationIds, regionIds,skillCategoryIds,skillIds,candidateName, startDate, endDate, jobId, candidateStatuses, 
      credentialType,period,duration,agencyIds,clockid } = this.clockIdForm.getRawValue();

    if (!this.clockIdForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 90 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "";

    let currentDate = new Date(Date.now());


    this.paramsData =
    {
      "OrganizationIdsCl": this.selectedOrganizations?.length == 0 ? businessIds.tostring() :
        this.selectedOrganizations?.map((list) => list).join(","),
      "SkillIdsCLStartdateFromCL": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "StartdateToCL": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionIdsCL": regionIds==null ? "" : regionIds,
      "LocationIdsCL": locationIds==null ? "" : locationIds,
      "DepartmentIdsCL": departmentIds==null? "" : departmentIds,
      "AgencyIdsCL":this.selectedAgencies.length == 0 ? "" : this.selectedAgencies?.map((list) => list.agencyId).join(","),
      "CandidateStatusCL": candidateStatuses.length == 0 ? '' : candidateStatuses.join(this.joinString),
      "PositionIdOMC": jobId == "" ? "" : jobId.trim(),
      "BOrganizationIdsCl": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      // "OptionalOMC": opcredFlag == "" ? "false" : opcredFlag.toString(),
      "UserIdCL": this.user?.id,
      "OrganizationNameCL": this.selectedOrganizations.length == 1 ? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(",") : "",
      "ReportPulledMessageCL": ("Report Print date: " + formatDate(currentDate, "MMM", this.culture) + " " + currentDate.getDate() + ", " + currentDate.getFullYear().toString()).trim(),
      "DateRangeCL": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim(),
      "PeriodOCE": toNumber(this.periodList.filter(x => x.name == period).map(y => y.id)),
      "CredentialsOMC":"",
      // "PositionIdOMC":jobId.tostring(),
      "SkillCategoryIdsOCS": skillCategoryIds.length == 0 ? "" : skillCategoryIds.join(","),
      "SkillIdsCL":skillIds.length == 0 ? "" : skillIds.join(","),
      "CandidateNameCL":candidateName==null?"":candidateName,
      "OrderIdCL":jobId == "" ? "" : jobId.trim(),
      "ClockIDCL":clockid,
      
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
        valueField: 'departmentName',
        valueId: 'departmentId',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
      },
      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },
      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'statusText',
      },
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      skillIds: {
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
     
      clockid: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
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
    this.filterService.removeValue(event, this.clockIdForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate());
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate());
    this.clockIdForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([]);
    this.clockIdForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
    this.clockIdForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.clockIdForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.clockIdForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.clockIdForm.get(analyticsConstants.formControlNames.startDate)?.setValue(startDate);
    this.clockIdForm.get(analyticsConstants.formControlNames.endDate)?.setValue(endDate);
    this.clockIdForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencys);
    this.clockIdForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue(this.defaultCandidateStatuses);
    this.clockIdForm.get(analyticsConstants.formControlNames.JobId)?.setValue('');
    this.clockIdForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.clockIdForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.clockIdForm.get(analyticsConstants.formControlNames.CandidateName)?.setValue(null);
    this.clockIdForm.get(analyticsConstants.formControlNames.clockid)?.setValue([]);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    if (this.selectedOrganizations.length == 0) {
      let error: any = "Organization is required";
      this.store.dispatch(new ShowToast(MessageTypes.Error, error));
      return;
    }
    this.clockIdForm.markAllAsTouched();
    if (this.clockIdForm?.invalid) {
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
  // @OutsideZone
  private onFilterChild(e: any) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: this.bussinessControl.value
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportCandidateSearch(filter))
        .subscribe((result) => {
          this.candidateFilterData = result.LogiReport.searchCandidates;
          this.candidateSearchData = result.LogiReport.searchCandidates;
          this.filterColumns.dataSource = this.candidateFilterData;
          // pass the filter data source to updateData method.
          e.updateData(this.candidateFilterData);
        });

    }
  }
}