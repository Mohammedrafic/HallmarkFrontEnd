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
import { GetCommonReportFilterOptions, GetLogiReportData, } from '@organization-management/store/logi-report.action';
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
import { AgencyDto, CommonReportFilter, CommonReportFilterOptions } from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { vmsInvoiceConstants, analyticsConstants, Month, Year, InvoiceStatus, Period } from '../constants/analytics.constant';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { toNumber, uniqBy } from 'lodash';

@Component({
  selector: 'app-vms-invoice-report',
  templateUrl: './vms-invoice-report.component.html',
  styleUrls: ['./vms-invoice-report.component.scss']
})
export class VmsInvoiceReportComponent implements OnInit, OnDestroy {

  public paramsData: any = {
    "OrganizationParamVMSIR": "",
    "StartDateParamVMSIR": "",
    "EndDateParamVMSIR": "",
    "RegionParamVMSIR": "",
    "LocationParamVMSIR": "",
    "DepartmentParamVMSIR": "",
    "AgencyParamVMSIR": "",
    "YearParamVMSIR": "",
    "MonthParamVMSIR": "",
    "InvoiceStatusParamVMSIR": "",
    "InvoiceIdParamVMSIR": "",
    "BearerParamVMSIR": "",
    "BusinessUnitIdParamVMSIR": "",
    "HostName": "",
    "organizationNameVMSIR": "",
    "reportPulledMessageVMSIR": "",
    "DateRangeVMSIR": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/VMSInvoiceReport/VMSInvoiceReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/VMSInvoiceReport/VMSInvoiceReport.cat" };
  public title: string = "VMS Invoice Report";
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
  public CommonReportFilterData$: Observable<CommonReportFilterOptions>;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  agencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  yearFields: FieldSettingsModel = { text: 'name', value: 'name' };
  periodFields: FieldSettingsModel = { text: 'name', value: 'name' };
  monthFields: FieldSettingsModel = { text: 'name', value: 'id' };
  invoiceStatusFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedDepartments: Department[];
  selectedAgencies: AgencyDto[];
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public vmsInvoiceReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
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
  public defaultAgencyIds: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public isResetFilter: boolean = false;
  public filterOptionsData: CommonReportFilterOptions;

  public yearList: Year[] = [];
  public monthList: Month[] = [];
  public periodList: Period[] = [];
  public invoiceStatusList: InvoiceStatus[] = [];

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  private previousOrgId: number = 0;
  private culture = 'en-US';
  public periodIsDefault: boolean = false;

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
    this.orderFilterColumnsSetup();
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.loadperiod();
      this.loadYearAndMonth();
      this.loadInvoiceStatus();

      this.CommonReportFilterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.filterOptionsData = data;
          this.filterColumns.agencyIds.dataSource = data.agencies;
          this.defaultAgencyIds = data.agencies.map((list) => list.agencyId);
          this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);

          if (this.isInitialLoad) {
            let currentDate = new Date();
            this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.Month)?.setValue(currentDate.getMonth() + 1);
            this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.Year)?.setValue(currentDate.getFullYear());
            this.SearchReport();
            this.isInitialLoad = false;
          }
        }
      });
      this.SetReportData();
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
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.BusinessIds)?.enable() : this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 6);
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate());
    this.vmsInvoiceReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(endDate, [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        agencyIds: new FormControl([], [Validators.required]),
        year: new FormControl(null),
        month: new FormControl(null),
        invoiceStatus: new FormControl(null),
        invoiceId: new FormControl(null),
        period: new FormControl(null)
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  selectPeriod(event: any) {
    let { startDate, period } = this.vmsInvoiceReportForm.getRawValue();
    const value = event.itemData.id;
    this.periodIsDefault = this.vmsInvoiceReportForm.controls['period'].value == "Custom" ? true : false;
    this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue("");
    this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue("");
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

    this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDateControl);
    this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date((endDateControl)));

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
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.Period)?.setValue("Custom");
  }
  private loadYearAndMonth(): void {
    this.yearList = [];
    this.monthList = []
    let currentYear = (new Date()).getFullYear();
    for (let i = 1; i <= 3; i++) {
      this.yearList.push({ id: currentYear - i, name: (currentYear - i).toString() });
    }
    this.yearList.push({ id: currentYear, name: currentYear.toString() })
    for (let i = 1; i <= 5; i++) {
      this.yearList.push({ id: currentYear + i, name: (currentYear + i).toString() })
    }

    this.monthList.push({ id: 1, name: 'January' });
    this.monthList.push({ id: 2, name: 'February' });
    this.monthList.push({ id: 3, name: 'March' });
    this.monthList.push({ id: 4, name: 'April' });
    this.monthList.push({ id: 5, name: 'May' });
    this.monthList.push({ id: 6, name: 'June' });
    this.monthList.push({ id: 7, name: 'July' });
    this.monthList.push({ id: 8, name: 'August' });
    this.monthList.push({ id: 9, name: 'September' });
    this.monthList.push({ id: 10, name: 'October' });
    this.monthList.push({ id: 11, name: 'November' });
    this.monthList.push({ id: 12, name: 'December' });
  }

  private loadInvoiceStatus(): void {
    this.invoiceStatusList = [];

    this.invoiceStatusList.push({ id: 1, name: 'Submitted pend appr' });
    this.invoiceStatusList.push({ id: 2, name: 'Pending Payment' });
    this.invoiceStatusList.push({ id: 3, name: 'Paid' });
  }
  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;
    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        // this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);

      this.selectedOrganizations = [];
      // if (data != null && typeof data === 'number' && data != this.previousOrgId) {
      if (data && data.length > 0) {
        this.previousOrgId = data;
        if (!this.isClearAll) {
          // let orgList = this.organizations?.filter((x) => data == x.organizationId);
          // this.selectedOrganizations = orgList;
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
            // this.regionsList = sortByField(regionsList, "name");
            // this.locationsList = sortByField(locationsList, 'name');
            // this.departmentsList = sortByField(departmentsList, 'name');
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
          // businessIdData.push(data);
          businessIdData = data;
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };
          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          if (this.isInitialLoad) {
            this.SearchReport()
            this.isInitialLoad = false;
          }
          this.changeDetectorRef.detectChanges();
        }
        else {
          this.isClearAll = false;
          this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
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
    let { departmentIds, locationIds,
      regionIds, agencyIds, startDate, endDate, year, month, invoiceStatus, invoiceId, period } = this.vmsInvoiceReportForm.getRawValue();
    if (!this.vmsInvoiceReportForm.dirty) {
      this.message = "Default filter selected with all regions ,locations and departments for last 7 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }


    regionIds = regionIds.length > 0 ? regionIds.join(",") : null;
    locationIds = locationIds.length > 0 ? locationIds.join(",") : null;
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : null;

    let currentDate = new Date(Date.now());
    var orgName = this.selectedOrganizations.length == 1 ? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(",") : "";
    this.paramsData =
    {
      "OrganizationParamVMSIR": this.selectedOrganizations?.length == 0 ? null : this.selectedOrganizations?.join(","),
      "StartDateParamVMSIR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamVMSIR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamVMSIR": regionIds == null ? null : regionIds,
      "LocationParamVMSIR": locationIds == null ? null : locationIds,
      "DepartmentParamVMSIR": departmentIds == null ? null : departmentIds,
      "AgencyParamVMSIR": agencyIds.length == 0 ? null : agencyIds.join(","),
      "YearParamVMSIR": year == null ? null : year.toString(),
      "MonthParamVMSIR": month == null ? null : month.toString(),
      "InvoiceStatusParamVMSIR": invoiceStatus == null ? null : invoiceStatus.toString(),
      "InvoiceIdParamVMSIR": invoiceId == null ? null : invoiceId,
      "BearerParamVMSIR": auth,
      "BusinessUnitIdParamVMSIR": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
      "organizationNameVMSIR": orgName,
      "reportPulledMessageVMSIR": "Report Print date: " + String(currentDate.getMonth() + 1).padStart(2, '0') + "/" + currentDate.getDate() + "/" + currentDate.getFullYear().toString(),
      "DateRangeParamVMSIR": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim(),
      "PeriodParamVMSIR": toNumber(this.periodList.filter(x => x.name == period).map(y => y.id)),
      "UserIdParamVMSIR": this.user?.id,
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
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
      },
      year: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      month: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      invoiceStatus: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      period: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
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
    this.filterService.removeValue(event, this.vmsInvoiceReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 6);
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate());
    this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([]);
    this.vmsInvoiceReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.LocationIds)?.setValue([]);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.StartDate)?.setValue(startDate);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.EndDate)?.setValue(endDate);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.AgencyIds)?.setValue([]);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.Year)?.setValue(null);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.Month)?.setValue(null);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.InvoiceStatus)?.setValue(null);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.InvoiceId)?.setValue(null);
    this.vmsInvoiceReportForm.get(vmsInvoiceConstants.formControlNames.Period)?.setValue("Custom");
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.vmsInvoiceReportForm.markAllAsTouched();
    if (this.vmsInvoiceReportForm?.invalid) {
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

  }

}
