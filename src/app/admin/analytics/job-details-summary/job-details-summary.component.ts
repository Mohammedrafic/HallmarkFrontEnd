import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, distinctUntilChanged, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetCommonReportFilterOptions, GetLogiReportData, GetCommonReportCandidateSearch, ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { AgencyDto, CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SearchCandidate, SkillCategoryDto } from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { analyticsConstants, Period } from '../constants/analytics.constant';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { uniqBy } from 'lodash';

@Component({
  selector: 'app-job-details-summary',
  templateUrl: './job-details-summary.component.html',
  styleUrls: ['./job-details-summary.component.scss']
})
export class JobDetailsSummaryComponent implements OnInit, OnDestroy {

  public paramsData: any = {
    "OrganizationParamJDSR": "",
    "StartDateParamJDSR": "",
    "EndDateParamJDSR": "",
    "RegionParamJDSR": "",
    "LocationParamJDSR": "",
    "DepartmentParamJDSR": "",
    "SkillCategoryParamJDSR": "",
    "SkillParamJDSR": "",
    "CandidateNameJDSR": "",
    "CandidateStatusJDSR": "",
    "JobStatusJDSR": "",
    "JobIdJDSR": "",
    "AgencysJDSR": "",
    "BearerParamJDSR": "",
    "BusinessUnitIdParamJDSR": "",
    "HostName": "",
    OrganizationNameJDSR: '',
    reportPulledMessageJDSR: '',
    DateRangeJDSR: ''
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/CredentialSummary/CredentialSummary.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/CredentialSummary/CredentialSummary.cat" };
  public title: string = "Credential Summary";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public allOption: string = "All";
  private culture = 'en-US';

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
  public CommonReportFilterData$: Observable<CommonReportFilterOptions>;

  @Select(LogiReportState.commonReportCandidateSearch)
  public commonReportCandidateSearchData$: Observable<SearchCandidate[]>;

  candidateSearchData: SearchCandidate[] = [];

  //@Select(SecurityState.organisations)
  //public organizationData$: Observable<Organisation[]>;
  //selectedOrganizations: Organisation[];

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[] = [];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  agencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  selectedDepartments: Department[];
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  selectedAgencies: AgencyDto[];
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public jobDetailSummaryReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
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
  public defaultAgencyIds: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public defaultSkills: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  private isAlive = true;
  private previousOrgId: number = 0;
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public isResetFilter: boolean = false;
  private fixedCandidateStatusesIncluded: number[] = [50, 60, 100, 90, 110];
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  periodFields: FieldSettingsModel = { text: 'name', value: 'name' };

  public periodList: Period[] = [];
  public periodIsDefault: boolean = false;
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

    //this.SetReportData();
  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.loadperiod();
      this.orderFilterColumnsSetup();
      this.store.dispatch(new ClearLogiReportState());
      //this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;

      this.organizationData$.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (data != null && data.length > 0) {
          this.organizations = uniqBy(data, 'organizationId');
          this.filterColumns.businessIds.dataSource = this.organizations;
          if (this.agencyOrganizationId) {
            this.defaultOrganizations = this.agencyOrganizationId;
            this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
          }
          this.changeDetectorRef.detectChanges();
        }
      });

      this.onFilterControlValueChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  selectPeriod(event: any) {
    let { startDate, endDate, period } = this.jobDetailSummaryReportForm.getRawValue();
    const value = event.itemData.id;
    this.periodIsDefault = this.jobDetailSummaryReportForm.controls['period'].value == "Custom" ? true : false;
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue("");
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue("");
   
    const PeriodCheck = value;
    let startDateControl = new Date(Date.now());
    let endDateControl = new Date(Date.now());
   
    let lastDayOfLastMonth = new Date();
    lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth(), 0);

    switch (PeriodCheck) {
      case 0:
        startDateControl.setDate(startDateControl.getDate() - 30);
        
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
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue(((startDateControl)));
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue(((endDateControl)));   

  }
  private addMonths(date: any, months: any) {
    date.setMonth(date.getMonth() + months);
    return date;
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
    this.periodList.push({ id: 7, name: 'Last 6 Months' });
    this.periodList.push({ id: 8, name: 'Last 12 Months' });
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
  }
  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate() + 30);
    this.jobDetailSummaryReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(endDate, [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        candidateName: new FormControl(null),
        candidateStatuses: new FormControl([]),
        jobStatuses: new FormControl([]),
        jobId: new FormControl(''),
        agencyIds: new FormControl([]),
        period: new FormControl(null)
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    //this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
    //  if (data != null && data.length > 0) {
    //    this.organizations = uniqBy(data, 'organizationId');
    //    this.filterColumns.businessIds.dataSource = this.organizations;
    //    this.defaultOrganizations = this.agencyOrganizationId;
    //    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
    //    this.changeDetectorRef.detectChanges();
    //  }
    //});

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      //if (data != null && typeof data === 'number' && data != this.previousOrgId) {
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

              //this.regionsList = sortByField(regionsList, "name");
              //this.locationsList = sortByField(locationsList, 'name');
              //this.departmentsList = sortByField(departmentsList, 'name');
            }
            this.regionsList = regionsList.length > 0 ? sortByField(regionsList, "name") : [];
            this.locationsList = locationsList.length > 0 ? sortByField(locationsList, 'name') : [];
            this.departmentsList = departmentsList.length > 0 ? sortByField(departmentsList, 'name') : [];

            this.masterRegionsList = this.regionsList;
            this.masterLocationsList = this.locationsList;
            this.masterDepartmentsList = this.departmentsList;
            this.regions = this.regionsList;
            this.filterColumns.regionIds.dataSource = this.regions;
            if (this.bussinessControl?.value.length == "1") {
              if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
                this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
              }
              else {
                this.isResetFilter = true;
              }
            }
            let businessIdData = [];
            //businessIdData.push(data);
            businessIdData = data;
            let filter: CommonReportFilter = {
              businessUnitIds: businessIdData
            };
          //this.selectedOrganizations = orgList;
          //this.regionsList = [];
          //let regionsList: Region[] = [];
          //let locationsList: Location[] = [];
          //let departmentsList: Department[] = [];
          //orgList.forEach((value) => {
          //  regionsList.push(...value.regions);
          //  locationsList = regionsList.map(obj => {
          //    return obj.locations.filter(location => location.regionId === obj.id);
          //  }).reduce((a, b) => a.concat(b), []);
          //  departmentsList = locationsList.map(obj => {
          //    return obj.departments.filter(department => department.locationId === obj.id);
          //  }).reduce((a, b) => a.concat(b), []);
          //});
          //this.regionsList = sortByField(regionsList, "name");
          //this.locationsList = sortByField(locationsList, 'name');
          //this.departmentsList = sortByField(departmentsList, 'name');

          //this.masterRegionsList = this.regionsList;
          //this.masterLocationsList = this.locationsList;
          //this.masterDepartmentsList = this.departmentsList;

          //if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
          //  this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          //}
          //else {
          //  this.isResetFilter = true;
          //}
          //let businessIdData = [];
          //businessIdData.push(data);
          //let filter: CommonReportFilter = {
          //  businessUnitIds: businessIdData
          //};
          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.CommonReportFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              data.jobStatuses = data.jobStatuses.filter((item: any) => {
                if (item.statusText !== 'Incomplete'
                  && item.statusText !== 'PreOpen'
                  && item.statusText !== 'Open'
                  && item.statusText !== 'Accepted'
                  && item.statusText !== 'Pending') {
                  return item;
                }
              });
              this.isAlive = true;
              this.filterOptionsData = data;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = data.masterSkills;
              this.filterColumns.jobStatuses.dataSource = data.jobStatuses;
              this.filterColumns.candidateStatuses.dataSource = data.candidateStatuses.filter(i => this.fixedCandidateStatusesIncluded.includes(i.status));
              this.filterColumns.agencyIds.dataSource = data.agencies;
              this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
              this.defaultSkills = [];
              this.defaultAgencyIds = data.agencies.map((list) => list.agencyId);
              this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
              this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
              this.changeDetectorRef.detectChanges();
              this.SearchReport();
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.defaultRegions = this.regionsList.map((list) => list.id);
          this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
          this.changeDetectorRef.detectChanges();
        }
        else {
          this.isClearAll = false;
          this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });

    this.regionIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {

        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.locationIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;

      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
    this.skillCategoryIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        //this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(skills.map((list) => list.id));
        //this.defaultSkills = skills.map((list) => list.id);
        //this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
        //this.changeDetectorRef.detectChanges();
      }
      else {
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
        let masterSkills = this.filterOptionsData.masterSkills;
       
        this.filterColumns.skillIds.dataSource = masterSkills;
      }
    });
    this.skillIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });

    this.agencyIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
    this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.agencyIdControl.value.length > 0) {
        let agencyData = this.filterOptionsData.agencies;
        this.selectedAgencies = agencyData?.filter((object) => data?.includes(object.agencyId));
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
    let { businessIds, candidateName, candidateStatuses, departmentIds, jobId, jobStatuses, locationIds,
      regionIds, skillCategoryIds, agencyIds, skillIds, startDate, endDate, period } = this.jobDetailSummaryReportForm.getRawValue();
    if (!this.jobDetailSummaryReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for last and next 30 days.";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
   
    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") :  "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
    let currentDate = new Date(Date.now());


    this.paramsData =
    {
      //"OrganizationParamJDSR": this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "OrganizationParamJDSR": this.selectedOrganizations?.length == 0 ? "null" :
        this.selectedOrganizations?.join(","),
      "StartDateParamJDSR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamJDSR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamJDSR": regionIds.length == 0 ? "null" : regionIds,
      "LocationParamJDSR": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentParamJDSR": departmentIds.length == 0 ? "null" : departmentIds,
      "SkillCategoryParamJDSR": skillCategoryIds?.length > 0 ? skillCategoryIds?.join(",") : 'null',
      "SkillParamJDSR": skillIds?.length > 0 ? skillIds?.join(",") : "null",
      "CandidateNameJDSR": candidateName == null || candidateName == "" ? 'null' : candidateName.toString(),
      "CandidateStatusJDSR": candidateStatuses?.length > 0 ? candidateStatuses.join(",") : 'null',
      "JobStatusJDSR": jobStatuses?.length > 0 ? jobStatuses.join(",") : 'null',
      "JobIdJDSR": jobId == null || jobId == "" ? 'null' : jobId,
      "AgencysJDSR": agencyIds?.length > 0 ? agencyIds.join(",") : 'null',
      "BearerParamJDSR": auth,
      "BusinessUnitIdParamJDSR": businessIds,
      "HostName": this.baseUrl,
      "OrganizationNameJDSR": this.filterColumns.businessIds.dataSource?.find((item: any) => item.organizationId?.toString() === this.selectedOrganizations?.map((list) => list.organizationId).join(",")).name,
      "reportPulledMessageJDSR": ("Report Print date: " + formatDate(startDate, "MMM", this.culture) + " " + currentDate.getDate() + ", " + currentDate.getFullYear().toString()).trim(),
      "DateRangeJDSR": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim()

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
      },
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
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
    this.filterService.removeValue(event, this.jobDetailSummaryReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate() + 30);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    let masterSkills = this.filterOptionsData.masterSkills;

    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.filterColumns.skillIds.dataSource = masterSkills;
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.CandidateName)?.setValue(null);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.JobStatuses)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(endDate);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.JobId)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.jobDetailSummaryReportForm.markAllAsTouched();
    if (this.jobDetailSummaryReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch(new ShowToast(MessageTypes.Error, error));
    return;
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }
  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids
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
