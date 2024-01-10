import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, distinctUntilChanged, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
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
import { accrualReportTypesList, analyticsConstants, Period } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { toNumber, uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';

import {
  CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions,
  MasterSkillDto, SearchCandidate, SkillCategoryDto, OrderTypeOptionsForReport
} from '../models/common-report.model';
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
    "SkillCategoriesParamFTS": "",
    "SkillsParamFTS": "",
    "CandidateNameParamFTS": "",
    "CandidateStatusesParamFTS": "",
    "OrderTypesParamFTS": "",
    "JobStatusesParamFTS": "",
    "JobIdParamFTS": "",
    "BearerParamFTS": "",
    "BusinessUnitIdParamFTS": "",
    "HostName": "",
    "AccrualReportFilterTypeFTS": "",
    "InvoiceIdParamFTS": "",
    "TimesheetStatusesFTS": "",
    "organizationNameFTS":"",
    "reportPulledMessageFTS":"",
    "DateRangeFTS": "",
    "PeriodParamFTS":""

  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/FinancialTimeSheet/FinancialTimeSheet.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/FinancialTimeSheet/FinancialTimeSheet.cat" };
  public title: string = "Financial Timesheet";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  public allOption: string = "All";
  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };


  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };


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
  selectedOrganizations: Organisation[] = [];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };

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
  public accrualReportTypesControl: AbstractControl;
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
  public isDefaultLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  private fixedTimesheetStatusesIncluded: number[] = [ 2, 3,  5, 6];
  private defaultTimesheetStatuses: number[] = [ 2, 3, 6];
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public periodList: Period[] = [];
  public periodIsDefault: boolean = false;
  periodFields: FieldSettingsModel = { text: 'name', value: 'name' };
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  private culture = 'en-US';

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: 'pie-chart' }));
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
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.loadperiod();
      this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.AccrualReportTypes)?.setValue(1);
      this.organizationData$.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (data != null && data.length > 0) {
          this.organizations = uniqBy(data, 'organizationId');
          this.filterColumns.businessIds.dataSource = this.organizations;
          if (this.agencyOrganizationId) {
            this.defaultOrganizations = this.agencyOrganizationId;
            this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
          }
          this.changeDetectorRef.detectChanges();
        }
      });
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.onFilterSkillCategoryChangedHandler();
      this.onFilterTimesheetStatusesChangedHandler();
      if (this.user)
        if (this.user.businessUnitType == BusinessUnitType.Hallmark || this.user.businessUnitType == BusinessUnitType.MSP) {
          this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        } else { this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable(); }
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
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        candidateName: new FormControl(null),
        candidateStatuses: new FormControl([]),
        orderTypes: new FormControl([]),
        jobStatuses: new FormControl([]),
        jobId: new FormControl(''),
        accrualReportTypes: new FormControl(null, [Validators.required]),
        invoiceID: new FormControl(''),
        timesheetStatuses: new FormControl([]),
        period: new FormControl(null)
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }
  selectPeriod(event: any) {
    let { startDate, period } = this.financialTimesheetReportForm.getRawValue();
    const value = event.itemData.id;
    this.periodIsDefault = this.financialTimesheetReportForm.controls['period'].value == "Custom" ? true : false;
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue("");
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue("");
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

    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue(startDateControl);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue(new Date((endDateControl)));

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
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe((data) => {
      this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
          //businessIdData.push(data[0]);
          businessIdData = data;
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };

          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = [];
              this.filterColumns.jobStatuses.dataSource = data.jobStatusesAndReasons;
              this.filterColumns.candidateStatuses.dataSource = data.candidateStatusesAndReasons;
              this.filterColumns.timesheetStatuses.dataSource = data.timesheetStatuses.filter(i => this.fixedTimesheetStatusesIncluded.includes(i.id));
              this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.TimesheetStatuses)?.setValue(this.defaultTimesheetStatuses);
              this.isDefaultLoad = true;
              this.SearchReport()
            }
          });

        }
        else {
          this.isClearAll = false;
          this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  public onFilterSkillCategoryChangedHandler(): void {
    this.skillCategoryIdControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(skills.map((list) => list.id));
      }
      else {
        this.filterColumns.skillIds.dataSource = [];
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
  public onFilterTimesheetStatusesChangedHandler(): void {
    this.accrualReportTypesControl = this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.AccrualReportTypes) as AbstractControl;
    this.accrualReportTypesControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data == 1) {
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.TimesheetStatuses)?.setValue(this.defaultTimesheetStatuses);
      }
      else {
        this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.TimesheetStatuses)?.setValue([]);
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

    let { accrualReportTypes, businessIds, candidateName, candidateStatuses, departmentIds, jobId, jobStatuses, locationIds, orderTypes,
      regionIds, skillCategoryIds, skillIds, startDate, endDate, invoiceID, timesheetStatuses, period } = this.financialTimesheetReportForm.getRawValue();
    if (!this.financialTimesheetReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 90 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
    // locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    // departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
    skillCategoryIds = skillCategoryIds.length > 0 ? skillCategoryIds.join(",") : this.filterColumns.skillCategoryIds.dataSource?.length > 0 ? this.filterColumns.skillCategoryIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";
    skillIds = skillIds.length > 0 ? skillIds.join(",") : this.filterColumns.skillIds.dataSource?.length > 0 ? this.filterColumns.skillIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";
    let currentDate = new Date(Date.now());

    this.paramsData =
    {
      "OrganizationParamFTS": this.selectedOrganizations?.length == 0 ? "null" :
        this.selectedOrganizations?.join(","),
      "StartDateParamFTS": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamFTS": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamFTS": regionIds.length == 0 ? "null" : regionIds,
      "LocationParamFTS": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentParamFTS": departmentIds.length == 0 ? "null" : departmentIds,
      "SkillCategoriesParamFTS": skillCategoryIds.length == 0 ? "null" : skillCategoryIds,
      "SkillsParamFTS": skillIds.length == 0 ? "null" : skillIds,
      "CandidateNameParamFTS": candidateName == null || candidateName == "" ? "null" : candidateName.toString(),
      "CandidateStatusesParamFTS": candidateStatuses.length == 0 ? "null" : candidateStatuses.join(","),
      "OrderTypesParamFTS": orderTypes.length == 0 ? "null" : orderTypes.join(","),
      "JobStatusesParamFTS": jobStatuses.length == 0 ? "null" : jobStatuses.join(","),
      "JobIdParamFTS": jobId == null || jobId == "" ? "null" : jobId,
      "BearerParamFTS": auth,
      "BusinessUnitIdParamFTS": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
      "AccrualReportFilterTypeFTS": accrualReportTypes.toString(),
      "InvoiceIdParamFTS": invoiceID == null || invoiceID == "" ? "null" : invoiceID,
      "TimesheetStatusesFTS": accrualReportTypes == 1 ? (timesheetStatuses.length == 0 ? "null" : timesheetStatuses.join(",")) : "null",
      "organizationNameFTS": this.selectedOrganizations.length==1? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(","):"",
      
      "reportPulledMessageFTS": ("Report Print date: " + formatDate(startDate, "MMM", this.culture) + " " + currentDate.getDate() + ", " + currentDate.getFullYear().toString()).trim(),
      "DateRangeFTS": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim(),
      "PeriodParamFTS": toNumber(this.periodList.filter(x => x.name == period).map(y => y.id))
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
        dataSource: OrderTypeOptionsForReport,
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
      },
      accrualReportTypes: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: accrualReportTypesList,
        valueField: 'name',
        valueId: 'id',
      },
      invoiceID: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },
      timesheetStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
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
    this.filterService.removeValue(event, this.financialTimesheetReportForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.JobId)?.setValue(null);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.AccrualReportTypes)?.setValue(1);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.InvoiceID)?.setValue(null);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.TimesheetStatuses)?.setValue(this.defaultTimesheetStatuses);
    this.financialTimesheetReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
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
