import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData,
  GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState
} from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { accrualConstants, analyticsConstants } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SearchCandidate, SkillCategoryDto } from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';

@Component({
  selector: 'app-accrual-report',
  templateUrl: './accrual-report.component.html',
  styleUrls: ['./accrual-report.component.scss']
})
export class AccrualReportComponent implements OnInit, OnDestroy {

  public paramsData: any = {

    "HostNameAS": "",
    "BearerParamAS": "",
    "BusinessUnitIdParamAS": "",

    "HostNameAD": "",
    "BearerParamAD": "",
    "BusinessUnitIdParamAD": "",

    "HostNameAF": "",
    "BearerParamAF": "",
    "BusinessUnitIdParamAF": "",

    "OrganizationsAS": "",
    "RegionAS": "",
    "LocationAS": "",
    "DepartmentAS": "",
    "SkillCategoryAC": "",
    "SkillAS": "",
    "AgencyAS": "",
    "Candidate": "",
    "OrderIdAS": "",
    "TimesheetStartDate": "",
    "TimesheetEndDate": "",
    "InvoiceStartDate": "",
    "InvoiceEndDate": "",

    "OrganizationsAD": "",
    "RegionAD": "",
    "LocationAD": "",
    "DepartmentAD": "",
    "SkillCategoryAD": "",
    "SkillAD": "",
    "AgencyAD": "",
    "CandidateAD": "",
    "OrderIdAD": "",
    "TimesheetStartDateAD": "",
    "TimesheetEndDateAD": "",
    "InvoiceStartDateAD": "",
    "InvoiceEndDateAD": "",

    "OrganizationsAF": "",
    "RegionAF": "",
    "LocationAF": "",
    "DepartmentAF": "",
    "SkillCategoryAF": "",
    "SkillAF": "",
    "AgencyAF": "",
    "CandidateAF": "",
    "OrderIdAF": "",
    "TimesheetStartDateAF": "",
    "TimesheetEndDateAF": "",
    "InvoiceStartDateAF": "",
    "InvoiceEndDateAF": ""

  };


  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/NewAccrualReport/NewAccrualReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/NewAccrualReport/NewAccrualReport.cat" };
  public title: string = "Accrual Reports";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

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

  public agencyFields = {
    text: 'agencyName',
    value: 'agencyId',
  };
  selectedAgencies: AssociateAgencyDto[];
  public defaultAgencyIds: (number | undefined)[] = [];

  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
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
  public accrualReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
  public candidateNameControl: AbstractControl;
  public agencyData: AssociateAgencyDto[] = [];
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
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];

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
      this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.isAlive = true;
          this.filterOptionsData = data;
          this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
          this.filterColumns.skillIds.dataSource = [];

          this.selectedSkillCategories = data.skillCategories?.filter((object) => object.id);

          this.agencyIdControl = this.accrualReportForm.get(accrualConstants.formControlNames.AgencyIds) as AbstractControl;
          this.filterColumns.agencyIds.dataSource = [];
          this.filterColumns.agencyIds.dataSource = data?.agencies;

          let agencyIds = data?.agencies;
          this.filterColumns.agencyIds.dataSource = data?.agencies;
          this.selectedAgencies = agencyIds;
          this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
          this.accrualReportForm.get(accrualConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);

        }
      });
      this.SetReportData();

      this.agencyOrganizationId = data;
      this.isInitialLoad = true;

      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.onFilterSkillCategoryChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.accrualReportForm.get(accrualConstants.formControlNames.BusinessIds)?.enable() : this.accrualReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.accrualReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        candidateName: new FormControl(null),
        agencyIds: new FormControl([], [Validators.required]),
        orderId: new FormControl(null),
        invoiceType: new FormControl('0'),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.accrualReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.accrualReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);


        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.accrualReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        this.filterColumns.agencyIds.dataSource = [];
        this.accrualReportForm.get(accrualConstants.formControlNames.AgencyIds)?.setValue([]);

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
          this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            this.filterColumns.agencyIds.dataSource = [];

            if (data != null) {
              this.filterOptionsData = data;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = [];


              this.agencyIdControl = this.accrualReportForm.get(accrualConstants.formControlNames.AgencyIds) as AbstractControl;
              let agencyIds = data?.agencies;
              this.filterColumns.agencyIds.dataSource = data?.agencies;
              this.selectedAgencies = agencyIds;
              this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
              this.accrualReportForm.get(accrualConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
              this.SearchReport()
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.accrualReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.accrualReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.accrualReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.accrualReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.accrualReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.accrualReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.accrualReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.accrualReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.accrualReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.accrualReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  public onFilterSkillCategoryChangedHandler(): void {
    this.skillCategoryIdControl = this.accrualReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.accrualReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(skills.map((list) => list.id));
      }
      else {
        this.filterColumns.skillIds.dataSource = [];
        this.accrualReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.accrualReportForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
      this.agencyIdControl = this.accrualReportForm.get(accrualConstants.formControlNames.AgencyIds) as AbstractControl;
      this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (this.agencyIdControl.value.length > 0) {
          let agencyIds = this.agencyData;
          this.selectedAgencies = agencyIds?.filter((object) => data?.includes(object.agencyId));
        }
      });
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
    let { candidateName, departmentIds, orderId, locationIds,
      regionIds, skillCategoryIds, skillIds, startDate, endDate, agencyIds } = this.accrualReportForm.getRawValue();
    let byTimesheetOrInvoiceControl = this.accrualReportForm.get(accrualConstants.formControlNames.InvoiceType) as AbstractControl;
    let byTimesheetOrInvoiceValue = byTimesheetOrInvoiceControl?.value;

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
    skillCategoryIds = skillCategoryIds.length > 0 ? skillCategoryIds.join(",") : this.filterColumns.skillCategoryIds.dataSource?.length > 0 ? this.filterColumns.skillCategoryIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";
    skillIds = skillIds.length > 0 ? skillIds.join(",") : this.filterColumns.skillIds.dataSource?.length > 0 ? this.filterColumns.skillIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";

    this.isResetFilter = false;
    this.paramsData =
    {

      "HostNameAS": this.baseUrl,
      "BearerParamAS": auth,
      "BusinessUnitIdParamAS": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),

      "OrganizationsAS": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "RegionAS": regionIds.length == 0 ? "null" : regionIds,
      "LocationAS": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentAS": departmentIds.length == 0 ? "null" : departmentIds,
      "SkillCategoryAC": skillCategoryIds.length == 0 ? "null" : skillCategoryIds,
      "SkillAS": skillIds.length == 0 ? "null" : skillIds,
      "AgencyAS": agencyIds.length == 0 ? "null" : agencyIds.join(","),
      "Candidate": candidateName == null || candidateName == "" ? "null" : candidateName.toString(),
        //candidateName == null || candidateName == "" ? "null" : this.candidateSearchData?.filter((i) => i.id == candidateName).map(i => i.fullName),
      "OrderIdAS": orderId == null ? "null" : orderId,
      "TimesheetStartDate": byTimesheetOrInvoiceValue == '0' ? formatDate(startDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '01/01/1900', 'en-US'),
      "TimesheetEndDate": byTimesheetOrInvoiceValue == '0' ? formatDate(endDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '12/31/9999', 'en-US'),
      "InvoiceStartDate": byTimesheetOrInvoiceValue == '1' ? formatDate(startDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '01/01/1900', 'en-US'),
      "InvoiceEndDate": byTimesheetOrInvoiceValue == '1' ? formatDate(endDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '12/31/9999', 'en-US'),

      "HostNameAD": this.baseUrl,
      "BearerParamAD": auth,
      "BusinessUnitIdParamAD": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "OrganizationsAD": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "RegionAD": regionIds.length == 0 ? "null" : regionIds,
      "LocationAD": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentAD": departmentIds.length == 0 ? "null" : departmentIds,
      "SkillCategoryAD": skillCategoryIds.length == 0 ? "null" : skillCategoryIds,
      "SkillAD": skillIds.length == 0 ? "null" : skillIds,
      "AgencyAD": agencyIds.length == 0 ? "null" : agencyIds.join(","),
        "CandidateAD": candidateName == null || candidateName == "" ? "null" : candidateName.toString(),
//        candidateName == null || candidateName == "" ? "null" : this.candidateSearchData?.filter((i) => i.id == candidateName).map(i => i.fullName),
      "OrderIdAD": orderId == null ? "null" : orderId,
      "TimesheetStartDateAD": byTimesheetOrInvoiceValue == '0' ? formatDate(startDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '01/01/1900', 'en-US'),
      "TimesheetEndDateAD": byTimesheetOrInvoiceValue == '0' ? formatDate(endDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '12/31/9999', 'en-US'),
      "InvoiceStartDateAD": byTimesheetOrInvoiceValue == '1' ? formatDate(startDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '01/01/1900', 'en-US'),
      "InvoiceEndDateAD": byTimesheetOrInvoiceValue == '1' ? formatDate(endDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '12/31/9999', 'en-US'),

      "HostNameAF": this.baseUrl,
      "BearerParamAF": auth,
      "BusinessUnitIdParamAF": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "OrganizationsAF": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),

      "RegionAF": regionIds.length == 0 ? "null" : regionIds,
      "LocationAF": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentAF": departmentIds.length == 0 ? "null" : departmentIds,
      "SkillCategoryAF": skillCategoryIds.length == 0 ? "null" : skillCategoryIds,
      "SkillAF": skillIds.length == 0 ? "null" : skillIds,
      "AgencyAF": agencyIds.length == 0 ? "null" : agencyIds.join(","),
        "CandidateAF": candidateName == null || candidateName == "" ? "null" : candidateName.toString(),
//        candidateName == null || candidateName == "" ? "null" : this.candidateSearchData?.filter((i) => i.id == candidateName).map(i => i.fullName),
      "OrderIdAF": orderId == null ? "null" : orderId,
      "TimesheetStartDateAF": byTimesheetOrInvoiceValue == '0' ? formatDate(startDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '01/01/1900', 'en-US'),
      "TimesheetEndDateAF": byTimesheetOrInvoiceValue == '0' ? formatDate(endDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '12/31/9999', 'en-US'),
      "InvoiceStartDateAF": byTimesheetOrInvoiceValue == '1' ? formatDate(startDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '01/01/1900', 'en-US'),
      "InvoiceEndDateAF": byTimesheetOrInvoiceValue == '1' ? formatDate(endDate, 'MM/dd/yyyy', 'en-US') : formatDate(startDate, '12/31/9999', 'en-US'),

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
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
      },
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      orderId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },
      // candidateStatuses: {
      //   type: ControlTypes.Multiselect,
      //   valueType: ValueType.Text,
      //   dataSource: [],
      //   valueField: 'statusText',
      //   valueId: 'status',
      // },
      // orderTypes: {
      //   type: ControlTypes.Multiselect,
      //   valueType: ValueType.Id,
      //   dataSource: OrderTypeOptions,
      //   valueField: 'name',
      //   valueId: 'id',
      // },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      // jobStatuses: {
      //   type: ControlTypes.Multiselect,
      //   valueType: ValueType.Text,
      //   dataSource: [],
      //   valueField: 'statusText',
      //   valueId: 'id',
      // },

      // accrualReportTypes: {
      //   type: ControlTypes.Dropdown,
      //   valueType: ValueType.Id,
      //   dataSource: accrualReportTypesList,
      //   valueField: 'name',
      //   valueId: 'id',
      // }
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
    this.filterService.removeValue(event, this.accrualReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.accrualReportForm.get(accrualConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.accrualReportForm.get(accrualConstants.formControlNames.LocationIds)?.setValue([]);
    this.accrualReportForm.get(accrualConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.accrualReportForm.get(accrualConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.accrualReportForm.get(accrualConstants.formControlNames.SkillIds)?.setValue([]);
    this.accrualReportForm.get(accrualConstants.formControlNames.CandidateName)?.setValue(null);
    this.accrualReportForm.get(accrualConstants.formControlNames.AgencyIds)?.setValue([]);
    this.accrualReportForm.get(accrualConstants.formControlNames.OrderId)?.setValue([]);
    this.accrualReportForm.get(accrualConstants.formControlNames.StartDate)?.setValue(startDate);
    this.accrualReportForm.get(accrualConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.accrualReportForm.markAllAsTouched();
    if (this.accrualReportForm?.invalid) {
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
          e.updateData(this.candidateFilterData);
        });

    }
  }
}
