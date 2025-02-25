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
import { GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState, GetCommonReportCredentialSearch } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { Period, accrualReportTypesList, analyticsConstants ,periodList} from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { toNumber, uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import {
  CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions,
  MasterSkillDto, SearchCandidate, SkillCategoryDto, OrderTypeOptionsForReport, CommonCredentialSearchFilter, SearchCredential
} from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-missing-credentials',
  templateUrl: './missing-credentials.component.html',
  styleUrls: ['./missing-credentials.component.scss']
})
export class MissingCredentialsComponent implements OnInit, OnDestroy {

  public paramsData: any = {
    "OrganizationParamMSR": "",
    "StartDateParamMSR": "",
    "EndDateParamMSR": "",
    "RegionParamMSR": "",
    "LocationParamMSR": "",
    "DepartmentParamMSR": "",
    "CredentialParamMSR": "",
    "CandidateNameParamMSR": "",
    "CandidateStatusesParamMSR": "",
    "JobIdParamMSR": "",
    "BearerParamMSR": "",
    "BusinessUnitIdParamMSR": "",
    "HostName": "",
    "TodayMSR": "",
    "IsOptionalRequred": "",
    "organizationNameMSR": "",
    "reportPulledMessageMSR": "",
    "DateRangeMSR": "",
    "UserIdMSR": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/MissingCredentials/MissingCredentials.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/MissingCredentials/MissingCredentials.cat" };
  public title: string = "Missing Credentials";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  public allOption: string = "All";
  public IsOptionalRequred?: boolean = false;
  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegions: Region[] = [];

  public periodList: Period[] = [];
  public periodIsDefault: boolean = false;
  periodFields: FieldSettingsModel = { text: 'name', value: 'name' };
  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocations: Location[] = [];

  @Select(LogiReportState.departments)
  public departments$: Observable<Department[]>;
  isDepartmentsDropDownEnabled: boolean = false;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.commonReportFilterData)
  public financialTimeSheetFilterData$: Observable<CommonReportFilterOptions>;

  candidateSearchData: SearchCandidate[] = [];
  credentialSearchData: SearchCredential[] = [];

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[] = [];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  credentialNameFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateWaterMark: string = 'e.g. Andrew Fuller';
  credentialWaterMark: string = 'BLS';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  selectedDepartments: Department[] = [];
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;
  private fixedCanidateStatusesTypes: number[] = [4, 5, 10, 12];
  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public missingCredentialReportForm: FormGroup;
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
  public isDefaultLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public credentialFilterData: { [key: number]: SearchCredential; }[] = [];
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  private dateFormat = 'MM/dd/yyyy';
  private culture = 'en-US';
  private nullValue = "null";
  private joinString = ",";

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
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.missingCredentialReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.missingCredentialReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private loadperiod(): void {
    this.periodList = periodList;
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom"); 
}
  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.missingCredentialReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now())),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        candidateName: new FormControl(null),
        candidateStatuses: new FormControl([]),
        jobId: new FormControl(''),
        credentialName: new FormControl(null),
        IsOptionalRequred: new FormControl(false),
        period: new FormControl(null),
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.missingCredentialReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;
    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.missingCredentialReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.missingCredentialReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      this.selectedOrganizations = [];
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
          businessIdData = data;
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };
          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.filterColumns.candidateStatuses.dataSource = data.allCandidateStatusesAndReasons.
                filter(i => this.fixedCanidateStatusesTypes.includes(i.status));

              this.isDefaultLoad = true;
              this.SearchReport()
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.missingCredentialReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.missingCredentialReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.locations = [];
      this.departments = [];
      this.missingCredentialReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.missingCredentialReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.missingCredentialReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.missingCredentialReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.missingCredentialReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.missingCredentialReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.missingCredentialReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.missingCredentialReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
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
    let { candidateName, candidateStatuses, departmentIds, jobId, locationIds,
      regionIds, startDate, endDate, credentialName, IsOptionalRequred, period } = this.missingCredentialReportForm.getRawValue();
    if (!this.missingCredentialReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 90 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }

    //locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    //departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";

    let currentDate = new Date(Date.now());
    this.paramsData =
    {
      "OrganizationParamMSR": this.selectedOrganizations?.length == 0 ? "null" :
        this.selectedOrganizations?.join(","),
      "StartDateParamMSR": formatDate(startDate, this.dateFormat, this.culture),
      "EndDateParamMSR": endDate == null ? "01/01/0001" : formatDate(endDate, this.dateFormat, this.culture),
      "RegionParamMSR": regionIds.length == 0 ? "null" : regionIds,
      "LocationParamMSR": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentParamMSR": departmentIds.length == 0 ? "null" : departmentIds,
      "CredentialParamMSR": credentialName == null || credentialName == "" ? this.nullValue : credentialName.toString(),
      "CandidateNameParamMSR": candidateName == null || candidateName == "" ? this.nullValue : candidateName.toString(),
      "CandidateStatusesParamMSR": candidateStatuses.length == 0 ? this.nullValue : candidateStatuses.join(this.joinString),
      "JobIdParamMSR": jobId == null || jobId == "" ? this.nullValue : jobId,
      "BearerParamMSR": auth,
      "BusinessUnitIdParamMSR": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
      "TodayMSR": formatDate(new Date(), this.dateFormat, this.culture),
      "ISOptionalRequired": IsOptionalRequred,
      "organizationNameMSR": this.selectedOrganizations.length == 1 ? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(",") : "",
      //"reportPulledMessageMSR": "Report Print date: " + String(currentDate.getMonth() + 1).padStart(2, '0') + "/" + currentDate.getDate() + "/" + currentDate.getFullYear().toString(),
      "reportPulledMessageMSR": ("Report Print date: " + formatDate(currentDate, "MMM", this.culture) + " " + currentDate.getDate() + ", " + currentDate.getFullYear().toString()).trim(),

      "DateRangeMSR": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim(),
      "UserIdMSR": this.user?.id,
       "PeriodMSR": toNumber(this.periodList.filter(x => x.name == period).map(y => y.id)),

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

      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      credentialName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
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

      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },

    }
  }
  private GetFixedCandidateStatusTypes(): any {
    return [4, 5];
  }
  selectPeriod(event: any) {
    let { startDate, period } = this.missingCredentialReportForm.getRawValue();
    const value = event.itemData.id;
    this.periodIsDefault = this.missingCredentialReportForm.controls['period'].value == "Custom" ? true : false;
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue("");
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue("");
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

    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue(startDateControl);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue(new Date((endDateControl)));
  }
  private addMonths(date: any, months: any) {
    date.setMonth(date.getMonth() + months);
    return date;
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
    this.filterService.removeValue(event, this.missingCredentialReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.CandidateName)?.setValue(null);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.OrderTypes)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.JobStatuses)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue(startDate);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue(new Date(Date.now()));
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.JobId)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.CredentialName)?.setValue([]);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.IsOptionalRequred)?.setValue(false);
    this.missingCredentialReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.missingCredentialReportForm.markAllAsTouched();
    if (this.missingCredentialReportForm?.invalid) {
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

  public onFilterCandidateSearch: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterCandidateSearchChild(e);
  }
  public onFilterCredentialSearch: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterCredentialSearchChild(e);
  }
  @OutsideZone
  private onFilterCandidateSearchChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids
      };
      //this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportCandidateSearch(filter))
        .subscribe((result) => {
          this.candidateFilterData = result.LogiReport.searchCandidates;
          this.candidateSearchData = result.LogiReport.searchCandidates;
          //this.filterColumns.dataSource = this.candidateFilterData;
          // pass the filter data source to updateData method.
          e.updateData(this.candidateFilterData);
        });

    }
  }

  @OutsideZone
  private onFilterCredentialSearchChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonCredentialSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportCredentialSearch(filter))
        .subscribe((result) => {
          this.credentialFilterData = result.LogiReport.searchCredentials;
          this.credentialSearchData = result.LogiReport.searchCredentials;
          //this.filterColumns.dataSource = this.candidateFilterData;
          // pass the filter data source to updateData method.
          e.updateData(this.credentialFilterData);
        });

    }
  }

}
