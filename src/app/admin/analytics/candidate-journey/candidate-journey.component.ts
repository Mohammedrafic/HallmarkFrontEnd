import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, distinctUntilChanged, takeUntil, takeWhile } from 'rxjs';
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
import { analyticsConstants, Period } from '../constants/analytics.constant';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SkillCategoryDto, OrderTypeOptionsForReport } from '../models/common-report.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { toNumber, uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { DateTime } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-candidate-journey',
  templateUrl: './candidate-journey.component.html',
  styleUrls: ['./candidate-journey.component.scss']
})
export class CandidateJourneyComponent implements OnInit, OnDestroy {

  public paramsData: any = {
    "OrganizationParamCJR": "",
    "StartDateFromParamCJR": "",
    "StartDateToParamCJR": "",
    "EndDateFromParamCJR": "",
    "EndDateToParamCJR": "",
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
    "TodayCJR": "",
    "organizationNameCJR": "",
    "reportPulledMessageCJR": "",
    "DateRangeCJR": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateJourney/CandidateJourney.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateJourney/CandidateJourney.cat" };
  public message: string = "";
  public title: string = "Candidate Journey";
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
  public defaultOrganizations: number;
  public defaultRegions: (number | undefined)[] = [];
  public defaultLocations: (number | undefined)[] = [];
  public defaultDepartments: (number | undefined)[] = [];
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
  private fixedJobStatusesIncluded: number[] = [3, 4, 7, 8];
  private fixedCandidateStatusesIncluded: number[] = [1, 2, 3, 4, 5, 7, 10, 11, 12, 13];
  private orderTypesList = OrderTypeOptionsForReport.filter(i => i.id != 1);
  periodFields: FieldSettingsModel = { text: 'name', value: 'name' };

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public periodList: Period[] = [];
  public periodIsDefault: boolean = false;


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
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.loadperiod();
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

      this.organizationData$.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (data != null && data.length > 0) {
          this.organizations = uniqBy(data, 'organizationId');
          this.filterColumns.businessIds.dataSource = this.organizations;
          if (this.agencyOrganizationId) {
            this.defaultOrganizations = this.agencyOrganizationId;
            this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
          }
          this.changeDetectorRef.detectChanges();
        }
      });

      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.onFilterSkillCategoryChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark || BusinessUnitType.MSP ? this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDateFrom = new Date(Date.now());
    startDateFrom.setDate(startDateFrom.getDate() - 30);
    this.candidateJourneyForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDateFrom: new FormControl(startDateFrom, [Validators.required]),
        startDateTo: new FormControl(startDateFrom, [Validators.required]),
        EndDateFrom: new FormControl(new Date(Date.now())),
        EndDateTo: new FormControl(new Date(Date.now())),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        orderTypes: new FormControl([]),
        jobStatuses: new FormControl([]),
        candidateStatuses: new FormControl([]),
        jobId: new FormControl(null),
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
    let { startDateFrom, EndDateFrom, period } = this.candidateJourneyForm.getRawValue();
    const value = event.itemData.id;
    this.periodIsDefault = this.candidateJourneyForm.controls['period'].value == "Custom" ? true : false;
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.StartDateFrom)?.setValue("");
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.StartDateTo)?.setValue("");
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.EndDateFrom)?.setValue("");
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.EndDateTo)?.setValue("");
    const PeriodCheck = value;
    let startDateFromControl = new Date(Date.now());
    let startDateToControl = new Date(Date.now());
    let EndDateFromControl = new Date(Date.now());
    let EndDateToControl = new Date(Date.now());
    let lastDayOfLastMonth = new Date();
    lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth(), 0);

    switch (PeriodCheck) {
      case 0:
        startDateFromControl.setDate(startDateFromControl.getDate() - 30);
        EndDateFromControl.setDate(EndDateFromControl.getDate() - 30);
        break;
      case 1:
        startDateFromControl.setDate(startDateFromControl.getDate() - 31);
        EndDateFromControl.setDate(EndDateFromControl.getDate() - 31);

        startDateToControl.setDate(startDateToControl.getDate() - 1);
        EndDateToControl.setDate(EndDateToControl.getDate() - 1);
        break;
      case 2:
        startDateFromControl.setDate(startDateFromControl.getDate() - 61);
        EndDateFromControl.setDate(EndDateFromControl.getDate() - 61);

        startDateToControl.setDate(startDateToControl.getDate() - 1);
        EndDateToControl.setDate(EndDateToControl.getDate() - 1);
        break;
      case 3:
        startDateFromControl.setDate(startDateFromControl.getDate() - 91);
        EndDateFromControl.setDate(EndDateFromControl.getDate() - 91);

        startDateToControl.setDate(startDateToControl.getDate() - 1);
        EndDateToControl.setDate(EndDateToControl.getDate() - 1);
        break;
      case 4:
        startDateFromControl = new Date(startDateFromControl.getFullYear(), startDateFromControl.getMonth(), 1);
        EndDateFromControl = new Date(EndDateFromControl.getFullYear(), EndDateFromControl.getMonth(), 1);
        break;
      case 5:
        const today = new Date(Date.now());
        const quarter = Math.floor((today.getMonth() / 3));
        startDateFromControl = new Date(today.getFullYear(), quarter * 3 - 3, 1);
        EndDateFromControl = new Date(today.getFullYear(), quarter * 3 - 3, 1);

        startDateToControl = new Date(startDateFromControl.getFullYear(), startDateFromControl.getMonth() + 3, 0);
        EndDateToControl = new Date(startDateFromControl.getFullYear(), startDateFromControl.getMonth() + 3, 0);
        break;
      case 6:
        const startDateFrom = new Date(startDateFromControl.getFullYear(), 0, 1)
        startDateFrom.setDate(startDateFrom.getDate());
        EndDateFromControl.setDate(startDateFrom.getDate());
        startDateFromControl = startDateFrom;
        break;
      case 7:
        const firstDay = new Date(startDateFromControl.getFullYear(), startDateFromControl.getMonth(), 1);
        startDateFromControl = this.addMonths(firstDay, -6);
        startDateFromControl.setDate(startDateFromControl.getDate());
        EndDateFromControl.setDate(startDateFromControl.getDate());

        startDateToControl = new Date((lastDayOfLastMonth));
        EndDateToControl = new Date((lastDayOfLastMonth));
        break;
      case 8:
        const dayFirst = new Date(startDateFromControl.getFullYear(), startDateFromControl.getMonth(), 1);
        startDateFromControl = this.addMonths(dayFirst, -12);
        startDateFromControl.setDate(startDateFromControl.getDate());
        EndDateFromControl.setDate(startDateFromControl.getDate());

        startDateToControl = new Date((lastDayOfLastMonth));
        EndDateToControl = new Date((lastDayOfLastMonth));
        break;
    }

    this.candidateJourneyForm.get(analyticsConstants.formControlNames.StartDateFrom)?.setValue(startDateFromControl);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.StartDateTo)?.setValue(new Date((startDateToControl)));

    this.candidateJourneyForm.get(analyticsConstants.formControlNames.EndDateFrom)?.setValue(EndDateFromControl);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.EndDateTo)?.setValue(new Date((EndDateToControl)));

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
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.bussinessControl.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      this.selectedOrganizations = [];
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

          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.candidateJourneyFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = [];
              this.filterColumns.jobStatuses.dataSource = data.jobStatusesAndReasons;
              this.filterColumns.candidateStatuses.dataSource = data.allCandidateStatusesAndReasons.filter(i => this.fixedCandidateStatusesIncluded.includes(i.status));
              this.filterColumns.jobStatuses.dataSource = data.allJobStatusesAndReasons.filter(i => this.fixedJobStatusesIncluded.includes(i.status));
              this.defaultOrderTypes = this.orderTypesList.map((list) => list.id);
              this.SearchReport();
            }
          });

        }
        else {
          this.isClearAll = false;
          this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  public onFilterSkillCategoryChangedHandler(): void {
    this.skillCategoryIdControl = this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(skills.map((list) => list.id));
      }
      else {
        this.filterColumns.skillIds.dataSource = [];
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
    let { businessIds, candidateStatuses, departmentIds, jobId,
      jobStatuses, locationIds, orderTypes, regionIds, skillCategoryIds, skillIds, startDateFrom, startDateTo,EndDateFrom,EndDateTo, period }
      = this.candidateJourneyForm.getRawValue();
    if (!this.candidateJourneyForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 30 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
    if (startDateTo == null) {
      if (startDateFrom > new Date(Date.now())) {
        startDateTo = startDateFrom;
      }
      else {
        startDateTo = new Date(Date.now())
      }
    }
    // locationIds = locationIds.length > 0 ? locationIds.join(",") : [];
    // departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : 'null';

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
    skillCategoryIds = skillCategoryIds.length > 0 ? skillCategoryIds.join(",") : this.filterColumns.skillCategoryIds.dataSource?.length > 0 ? this.filterColumns.skillCategoryIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";
    skillIds = skillIds.length > 0 ? skillIds.join(",") : this.filterColumns.skillIds.dataSource?.length > 0 ? this.filterColumns.skillIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";

    let currentDate = new Date(Date.now());

    this.paramsData =
    {
      "OrganizationParamCJR": this.selectedOrganizations?.length == 0 ? "null" :
        this.selectedOrganizations?.join(","),
      "StartDateFromParamCJR": formatDate(startDateFrom, this.dateFormat, this.culture),
      "StartDateToParamCJR": startDateTo == null ? "01/01/0001" : formatDate(startDateTo, this.dateFormat, this.culture),
      "EndDateFromParamCJR": formatDate(EndDateFrom, this.dateFormat, this.culture),
      "EndDateToParamCJR": startDateTo == null ? "01/01/0001" : formatDate(EndDateTo, this.dateFormat, this.culture),
      "RegionParamCJR": regionIds.length == 0 ? "null" : regionIds,
      "LocationParamCJR": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentParamCJR": departmentIds.length == 0 ? "null" : departmentIds,
      "SkillCategoriesParamCJR": skillCategoryIds.length == 0 ? "null" : skillCategoryIds,
      "SkillsParamCJR": skillIds.length == 0 ? "null" : skillIds,
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
      "TodayParamCJR": formatDate(new Date(), this.dateFormat, this.culture),
      "organizationNameParamCJR": this.selectedOrganizations.length == 1 ? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(",") : "",
      "reportPulledMessageParamCJR": ("Report Print date: " + formatDate(currentDate, "MMM", this.culture) + " " + currentDate.getDate() + ", " + currentDate.getFullYear().toString()).trim(),
      "DateRangeParamCJR": (formatDate(startDateFrom, "MMM", this.culture) + " " + startDateFrom.getDate() + ", " + startDateFrom.getFullYear().toString()).trim() + " - " + (formatDate(startDateTo, "MMM", this.culture) + " " + startDateTo.getDate() + ", " + startDateTo.getFullYear().toString()).trim(),
      "PeriodParamCJR": toNumber(this.periodList.filter(x => x.name == period).map(y => y.id)),
      "UserIdParamCJR": this.user?.id

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
      startDateFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
      startDateTo: { type: ControlTypes.Date, valueType: ValueType.Text },

      EndDateFrom: { type: ControlTypes.Date, valueType: ValueType.Text },
      EndDateTo: { type: ControlTypes.Date, valueType: ValueType.Text },

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
    this.filterService.removeValue(event, this.candidateJourneyForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDateFrom = new Date(Date.now());
    startDateFrom.setDate(startDateFrom.getDate() - 30);
    let EndDateFrom = new Date(Date.now());
    startDateFrom.setDate(EndDateFrom.getDate() - 30);

    this.candidateJourneyForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.OrderTypes)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.JobStatuses)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.StartDateFrom)?.setValue(startDateFrom);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.StartDateTo)?.setValue(new Date(Date.now()));
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.EndDateFrom)?.setValue(EndDateFrom);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.EndDateTo)?.setValue(new Date(Date.now()));
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.JobId)?.setValue([]);
    this.candidateJourneyForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
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



