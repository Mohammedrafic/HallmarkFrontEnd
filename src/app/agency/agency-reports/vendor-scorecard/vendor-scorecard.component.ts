import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState, GetOrganizationsByAgency, GetOrganizationsStructureByOrgIds, GetAgencyCommonFilterReportOptions, GetCommonReportAgencyCandidateSearch } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { accrualReportTypesList, ORGANIZATION_DATA_FIELDS } from '../constants/agency-reports.constants';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import {
  CommonAgencyCandidateSearchFilter, CommonReportFilter,
  MasterSkillDto, SearchCandidate, SkillCategoryDto, OrderTypeOptionsForReport, AgencyCommonFilterReportOptions
} from '../models/agency-common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { DataSourceItem } from '../../../core/interface/common.interface';
import { GetOrganizationById } from '../../../admin/store/admin.actions';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '../../../shared/models/organization.model';
import { Period, VendorScorecardReportConstants } from '@admin/analytics/constants/analytics.constant';

@Component({
  selector: 'app-vendor-scorecard',
  templateUrl: './vendor-scorecard.component.html',
  styleUrls: ['./vendor-scorecard.component.scss']
})
export class VendorScorecardComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "OrganizationParamVSC": "",
    "StartDateParamVSC": "",
    "EndDateParamVSC": "",
    "RegionParamVSC": "",
    "LocationParamVSC": "",
    "DepartmentParamVSC": "",
    "SkillsParamVSC": "",
    "OrderTypesParamVSC": "",
    "BusinessUnitIdParamVSC": "",
    "HostName": "",
  };
  public reportName: LogiReportFileDetails = { name: "/AgencyReports/VendorScorecard/VendorScorecard.cls" };
  public catelogName: LogiReportFileDetails = { name: "/AgencyReports/VendorScorecard/VendorScorecard.cat" };
  public title: string = "Vendor Scorecard";
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

  @Select(LogiReportState.getOrganizationsByAgency)
  public organizationsByAgency$: Observable<DataSourceItem[]>;

  @Select(LogiReportState.getOrganizationsStructure)
  public getOrganizationsStructure$: Observable<OrganizationStructure[]>;

  @Select(LogiReportState.agencycommonReportFilterData)
  public agencycommonReportFilterData$: Observable<AgencyCommonFilterReportOptions>;

  @Select(LogiReportState.commonReportCandidateSearch)
  public financialTimeSheetCandidateSearchData$: Observable<SearchCandidate[]>;

  candidateSearchData: SearchCandidate[] = [];

  selectedOrganizations: OrganizationStructure[] = [];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };

  periodFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  @Select(UserState.lastSelectedAgencyId)
  private agencyId$: Observable<number>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = { text: 'organizationName', value: 'organizationId' };
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public agencyVendorScorecardReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  public candidateNameControl: AbstractControl;
  public regions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];
  public organizations: OrganizationStructure[] = [];
  public regionsList: OrganizationRegion[] = [];
  public locationsList: OrganizationLocation[] = [];
  public departmentsList: OrganizationDepartment[] = [];
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
  public filterOptionsData: AgencyCommonFilterReportOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  private defaultAgency: string;

  private culture = 'en-US';

  public periodList: Period[] = [];
  public periodIsDefault: boolean = false;
  public masterRegionsList: OrganizationRegion[] = [];
  public masterLocationsList: OrganizationLocation[] = [];
  public masterDepartmentsList: OrganizationDepartment[] = [];
  public associatedOrganizations: DataSourceItem[] = [];

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Reports", iconName: 'pie-chart' }));
    this.initForm();
    this.user = this.store.selectSnapshot(UserState.user);
    //if (this.user?.id != null) {
    //this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    //}
  }

  ngOnInit(): void {
        this.agencyId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.orderFilterColumnsSetup();
      if (data != null && data != undefined) {
        this.defaultAgency = data.toString();

        this.store.dispatch(new GetOrganizationsByAgency())
        this.store.dispatch(new ClearLogiReportState());
        this.organizationsByAgency$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: DataSourceItem[]) => {
          if (data != null && data != undefined) {
            this.associatedOrganizations = data;

            this.store.dispatch(new GetOrganizationsStructureByOrgIds(data.map(i => i.id ?? 0)));
            this.getOrganizationsStructure$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: OrganizationStructure[]) => {

              if (data != undefined && data != null && data.length > 0) {
                this.organizations = uniqBy(data, 'organizationId');
                this.filterColumns.businessIds.dataSource = this.organizations;
                this.defaultOrganizations = this.organizations.length == 0 ? 0 : this.organizations[0].organizationId;
                this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);
                this.changeDetectorRef.detectChanges();
              }
            });
          }
        });
      }


      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });

      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.onFilterSkillCategoryChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark || this.user?.businessUnitType == BusinessUnitType.Agency ? this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.BusinessIds)?.enable() : this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.BusinessIds)?.disable();
      this.loadperiod();
    });

  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.agencyVendorScorecardReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, []),
        endDate: new FormControl(new Date(Date.now()), []),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillIds: new FormControl([]),
        orderTypes: new FormControl([]),
        excludeInactiveAgency: new FormControl(false),
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
    let { startDate, period } = this.agencyVendorScorecardReportForm.getRawValue();
    const value = event.itemData.id;
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
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.StartDate)?.setValue(startDateControl);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.EndDate)?.setValue(new Date((endDateControl)));
    this.periodIsDefault = this.agencyVendorScorecardReportForm.controls['period'].value == "0" ? true : false;
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
    this.periodList.push({ id: 6, name: 'Year Till Date' });
    this.periodList.push({ id: 7, name: 'Last Completed 6 Months' });
    this.periodList.push({ id: 8, name: 'Last Completed 12 months' });
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.Period)?.setValue("0");
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.BusinessIds) as AbstractControl;
    this.defaultOrganizations = this.organizations.length == 0 ? 0 : this.organizations[0].organizationId;
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);


    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {

        this.isAlive = true;
        this.previousOrgId = data;
        if (!this.isClearAll) {
          let orgList = this.organizations?.filter((x) => data == x.organizationId);
          this.selectedOrganizations = orgList;
          this.regionsList = [];
          let regionsList: OrganizationRegion[] = [];
          let locationsList: OrganizationLocation[] = [];
          let departmentsList: OrganizationDepartment[] = [];

          //this.selectedOrganizations = orgList;

          // let orgList = this.organizations?.filter((x) => data[0] == x.organizationId);
          orgList.forEach((value) => {
            regionsList.push(...value.regions);
            locationsList = regionsList.map(obj => {
              if (obj.locations == null) {
                return [];
              }
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

          this.store.dispatch(new GetAgencyCommonFilterReportOptions(filter));
          this.agencycommonReportFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: AgencyCommonFilterReportOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              //this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = [];
              // this.filterColumns.jobStatuses.dataSource = data.jobStatusesAndReasons;
              // this.filterColumns.candidateStatuses.dataSource = data.candidateStatusesAndReasons;

              this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
              let masterSkills = this.filterOptionsData.masterSkills;
              let skills = masterSkills.filter((i) => this.defaultSkillCategories?.includes(i.skillCategoryId));
              this.filterColumns.skillIds.dataSource = skills;

              // this.filterColumns.SkillIds.dataSource = skills;
              // this.defaultSkills = skills.map((list) => list.id);
              this.isDefaultLoad = true;
              setTimeout(() => { this.SearchReport() }, 3000);
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.LocationIds)?.setValue([]);
      this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.LocationIds)?.setValue([]);
        this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  public onFilterSkillCategoryChangedHandler(): void {
    // this.skillCategoryIdControl = this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    // this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
    //   
    //   if (this.skillCategoryIdControl.value.length > 0) {
    //     let masterSkills = this.filterOptionsData.masterSkills;
    //     this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
    //     let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
    //     this.filterColumns.skillIds.dataSource = skills;
    //     this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.SkillIds)?.setValue(skills.map((list) => list.id));
    //   }
    //   else {
    //     this.filterColumns.skillIds.dataSource = [];
    //     this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.SkillIds)?.setValue([]);
    //   }
    // });
    // this.skillIdControl = this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.SkillIds) as AbstractControl;
    // this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
    //   if (this.skillIdControl.value.length > 0) {
    //     let masterSkills = this.filterOptionsData.masterSkills;
    //     this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
    //   }
    // });
  }

  public SearchReport(): void {


    this.filteredItems = [];
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }

    let { businessIds, departmentIds, locationIds, orderTypes,
      regionIds, skillIds, startDate, endDate, period } = this.agencyVendorScorecardReportForm.getRawValue();
    if (!this.agencyVendorScorecardReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 90 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
    debugger;
    regionIds = regionIds.length > 0 ? regionIds.join(",") : "";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "";
    skillIds = skillIds.length > 0 ? skillIds.join(",") : this.filterColumns.skillIds.dataSource?.length > 0 ? this.filterColumns.skillIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "";
    var orgName = this.selectedOrganizations.length == 1 ? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(",") : "";
    let currentDate = new Date(Date.now());
    this.paramsData =
    {
      "OrganizationsVSR": this.selectedOrganizations?.length == 0 ? "" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "StartDateVSR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateVSR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionsVSR": regionIds.length == 0 ? "" : regionIds,
      "LocationsVSR": locationIds.length == 0 ? "" : locationIds,
      "DepartmentsVSR": departmentIds.length == 0 ? "" : departmentIds,
      "SkillVSR": skillIds.length == 0 ? "" : skillIds,
      "OrderTypeVSR": orderTypes.length == 0 ? "" : orderTypes.join(","),
      "BusinessUnitIdParamVSC": this.defaultAgency == null ? this.selectedOrganizations != null && this.selectedOrganizations.length > 0 && this.selectedOrganizations[0]?.organizationId != null ?
        this.selectedOrganizations[0].organizationId.toString() : "1" : this.defaultAgency,
      "HostNameVSR": this.baseUrl,
      "organizationNameVSR": orgName,
      "reportPulledMessageVSR": "Report Print date: " + String(currentDate.getMonth() + 1).padStart(2, '0') + "/" + currentDate.getDate() + "/" + currentDate.getFullYear().toString(),
      "DateRangeCS": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim(),
      "PeriodVSR": period == null ? 0 : period,
      "ActiveAgencyVSR": 0,
      "AgenciesVSR": this.defaultAgency == null ? this.selectedOrganizations != null && this.selectedOrganizations.length > 0 && this.selectedOrganizations[0]?.organizationId != null ?
        this.selectedOrganizations[0].organizationId.toString() : "1" : this.defaultAgency,
      "OrderIDVSR": "",
      "UseridVSR": this.user?.id,
    };

    debugger;
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }
  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      businessIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'organizationName',
        valueId: 'organizationId',
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

      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },

      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: OrderTypeOptionsForReport,
        valueField: 'name',
        valueId: 'id',
      },
      period: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text }

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
    this.filterService.removeValue(event, this.agencyVendorScorecardReportForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.RegionIds)?.setValue([]);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.LocationIds)?.setValue([]);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.SkillIds)?.setValue([]);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.OrderTypes)?.setValue([]);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.Period)?.setValue(0);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.StartDate)?.setValue(startDate);
    this.agencyVendorScorecardReportForm.get(VendorScorecardReportConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }


  public onFilterApply(): void {

    this.agencyVendorScorecardReportForm.markAllAsTouched();
    if (this.agencyVendorScorecardReportForm?.invalid) {
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
      let filter: CommonAgencyCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids,
        agencyId: Number(this.defaultAgency)
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportAgencyCandidateSearch(filter))
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
