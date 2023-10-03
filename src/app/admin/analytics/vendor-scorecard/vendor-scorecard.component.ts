

import { ChangeDetectorRef, Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile, delay } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetCommonReportFilterOptions, GetLogiReportData, ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { VendorScorecardReportConstants, analyticsConstants, InvoiceStatus } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonReportFilter, CommonReportFilterOptions, OrderTypeOptionsForReport } from '../models/common-report.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';

// import { ExportOrientation } from '@organization-management/orientation/components/orientation-historical-data/orientation.action';
import { VendorScorePayload } from '@shared/models/vendorscorecard.model';
import { Filtervendorscorecard } from './vendorscorecard.action';
import { VendorScorecardresponse, VendorScorecardresponsepayload } from "@shared/models/vendorscorecard.model";
import { VendorSCorecardState } from './vendorscorecard.state';
import { DatePipe } from '@angular/common'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas';
import {
  AccumulationChartComponent,
  AccumulationChart,
  IAccLoadedEventArgs,
  AccumulationTheme,
} from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-vendor-scorecard',
  templateUrl: './vendor-scorecard.component.html',
  styleUrls: ['./vendor-scorecard.component.scss']
})
export class VendorScorecardComponent implements OnInit, OnDestroy {
  @ViewChild('pie')
  public title: string = "Vendor Scorecard";

  public paramsData: any = {

    "HostNameVSR": "",
    "BearerParamVSR": "",
    "BusinessUnitIdParamVSR": "",
    "OrganizationsVSR": "",
    "RegionsVSR": "",
    "LocationsVSR": "",
    "DepartmentsVSR": "",
    "AgenciesVSR": "",
    "StartDateVSR": "",
    "EndDateVSR": "",
    "OrderTypeVSR": "",
    "SkillVSR": ""
  };


  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/VendorScoreCard/VendorScoreCardReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/VendorScoreCard/VendorScoreCardReport.cat" };
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

  public allOption: string = "All";

  public VendorScorecardresponse: VendorScorecardresponse[] = [];
  public invoiceStatusList: InvoiceStatus[] = [];
  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegions: Region[];

  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocations: Location[];

  @Select(LogiReportState.departments)
  public departments$: Observable<Department[]>;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.commonReportFilterData)
  public vendorFilterData$: Observable<CommonReportFilterOptions>;

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
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  selectedDepartments: Department[];
  @Select(UserState.lastSelectedOrganizationId)

  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public VendorReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
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
  public istypeSetupTabActive: boolean = false;
  public defaultInvoiceStausIds: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public defaultSkills: (number | undefined)[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  private orderTypesList = OrderTypeOptionsForReport.filter(i => i.id != 1);
  public defaultOrderTypes: (number | undefined)[] = [];
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  //PREOGRESS BAR
  public startAngle: number = 0;
  public endAngle: number = 360;
  //PROGRESS BAR
  public defaultSkillCategories: (number | undefined)[] = [];
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
 
  constructor(private store: Store,
    public datepipe: DatePipe,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    // super(store);
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
    this.initForm();
    this.user = this.store.selectSnapshot(UserState.user);
    if (this.user?.id != null) {
      this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    }

  }




  public pie: AccumulationChartComponent | AccumulationChart;
  palette = [
    'rgba(253,65,60,0.9)',
    'rgba(253,150,60,0.9)',
    'rgba(253,187,44,0.9)',
    'rgb(255,217,134)',
    'rgb(48,52,57)',
  ];

  public animation: Object = {
    enable: false,
  };
  //Initializing Legend
  public legendSettings: Object = {
    visible: false,
  };
  //Initializing Datalabel
  public dataLabel: Object = {
    visible: true,
    position: 'Inside',
    rect: "red",
    font: { size: '12px', color: 'transparent' },
    background: "green",
    // template: '<div>${point.x}</div>',
  };
  // custom code start
  public load(args: IAccLoadedEventArgs): void {
    let selectedTheme: string = location.hash.split('/')[1];
    selectedTheme = selectedTheme ? selectedTheme : 'Material';
    args.accumulation.theme = <AccumulationTheme>(
      (selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)).replace(
        /-dark/i,
        'Dark'
      )
    );
    //dark mode
    this.pie.background = '#212121';
  }
  // custom code end
  public center: Object = { x: '50%', y: '50%' };
  public startAngles: number = 0;
  public endAngles: number = 360;
  public explode: boolean = true;
  public enableAnimation: boolean = false;
  public tooltip: Object = {
    enable: true,
    format: '${point.x} : <b>${point.y}%</b>',
  };
  public titles: string = '';



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
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.BusinessIds)?.enable() : this.VendorReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 60);
    this.VendorReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        agencyIds: new FormControl([], [Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        skillIds: new FormControl([]),
        orderTypes: new FormControl([]),
        invoiceType: new FormControl('0'),
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.VendorReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    //VendorScorecardres
    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.VendorReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);


        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.VendorReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        this.filterColumns.agencyIds.dataSource = [];
        this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.AgencyIds)?.setValue([]);

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
          this.vendorFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            this.filterColumns.agencyIds.dataSource = [];

            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
              this.agencyIdControl = this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.AgencyIds) as AbstractControl;
              let agencyIds = data?.agencies;
              this.filterColumns.agencyIds.dataSource = data?.agencies;
              this.selectedAgencies = agencyIds;
              this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
              // this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
              this.filterColumns.orderTypes.dataSource = data?.orderStatuses;
              let masterSkills = this.filterOptionsData.masterSkills;
              let skills = masterSkills.filter((i) => this.defaultSkillCategories?.includes(i.skillCategoryId));

              this.filterColumns.SkillIds.dataSource = skills;
              this.defaultSkills = skills.map((list) => list.id);
              this.defaultOrderTypes = this.orderTypesList.map((list) => list.id);
              this.filterColumns.orderTypes.dataSource = this.orderTypesList;
              this.SearchReport();
            }
            321
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.VendorReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  public onFilterSkillCategoryChangedHandler(): void {
    this.filterColumns.skillIds.dataSource = [];
  }
  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.VendorReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.VendorReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.VendorReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.VendorReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.VendorReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.VendorReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.VendorReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.VendorReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.VendorReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
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
      regionIds, startDate, endDate, agencyIds, orderTypes, skillIds } = this.VendorReportForm.getRawValue();


    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
    this.isResetFilter = false;
    this.paramsData =
    {

      "HostNameVSR": this.baseUrl,
      "BearerParamVSR": auth,
      "BusinessUnitIdParamVSR": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),

      "OrganizationsVSR": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "RegionsVSR": regionIds.length == 0 ? "null" : regionIds,
      "LocationsVSR": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentsVSR": departmentIds.length == 0 ? "null" : departmentIds,
      "AgenciesVSR": agencyIds.length == 0 ? "null" : agencyIds.join(","),

      "StartDateVSR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateVSR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "OrderTypeVSR": orderTypes == null || orderTypes == "" ? "null" : orderTypes,
      "SkillVSR": skillIds.length == 0 ? "null" : skillIds.join(",")


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

      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
      },

      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: this.orderTypesList,
        valueField: 'name',
        valueId: 'id',
      },
      SkillIds: {
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
    this.filterService.removeValue(event, this.VendorReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.LocationIds)?.setValue([]);
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.AgencyIds)?.setValue([]);
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.StartDate)?.setValue(startDate);
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.OrderTypes)?.setValue(null);
    this.VendorReportForm.get(VendorScorecardReportConstants.formControlNames.SkillIds)?.setValue([]);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    if (!this.istypeSetupTabActive) {
      this.VendorReportForm.markAllAsTouched();
      if (this.VendorReportForm?.invalid) {
        return;
      }
      this.filteredItems = [];
      let { startDate, endDate } = this.VendorReportForm.getRawValue();
      if (Date.parse(endDate) <= Date.parse(startDate)) {
        alert("Actual start date cannot be greater than the Actual End date")
      }
      else {
        this.SearchReport();
        this.store.dispatch(new ShowFilterDialog(false));
      }
    }
    else {
      this.filtergraphdata();
      this.store.dispatch(new ShowFilterDialog(false));
    }
  }
  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch([new ShowToast(MessageTypes.Error, error)]);
    return;
  }
  public onTabSelected(selected: any): void {
    this.istypeSetupTabActive = selected.value == 1 ? true : false;
  }

  public filtergraphdata(): void {
    let StartDate = (this.VendorReportForm.controls['startDate'].value) != null ? this.datepipe.transform(this.VendorReportForm.controls['startDate'].value, 'MM/dd/yyyy') : "";
    let EndDate = this.datepipe.transform(this.VendorReportForm.controls['endDate'].value, 'MM/dd/yyyy');
    let { departmentIds, locationIds,
      regionIds, startDate, endDate, agencyIds, orderTypes, skillIds } = this.VendorReportForm.getRawValue();

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";

    let vendorscorecard: VendorScorePayload =
    {
      Organizations: this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      Regions: regionIds.length == 0 ? "null" : regionIds,
      Locations: locationIds.length == 0 ? "null" : locationIds,
      Departments: departmentIds.length == 0 ? "null" : departmentIds,
      Skill: skillIds.length == 0 ? "null" : skillIds.join(","),
      OrderType: orderTypes == null || orderTypes == "" ? "null" : orderTypes.toString(),
      Agencies: agencyIds.length == 0 ? "null" : agencyIds.join(","),
      StartDate: StartDate != null ? StartDate : "",
      EndDate: EndDate != null ? EndDate : "",
    }
    this.store.dispatch(new Filtervendorscorecard(vendorscorecard)).pipe(delay(500)).subscribe((data) => {
      if (!data) {
        this.VendorScorecardresponse = [];
      }
      else {
        this.VendorScorecardresponse = data["VendorScoreCard"]["VendorScorecardEntity"];
      }
    });
  }
  public captureScreen() {
    var data = document.getElementById('contentToConvert')!;
    var whiteline="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXcAAAB3CAYAAAD4twBKAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGpSURBVHhe7dQBDQAADMOg+ze9+2hABDcAcuQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgcIkjtAkNwBguQOECR3gCC5AwTJHSBI7gBBcgfI2R7ukrNnl2CgBgAAAABJRU5ErkJggg=="
   
    html2canvas(data).then((canvas) => {
      var imgWidth = 200;
      var pageHeight = 295;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;
      debugger;
      const contentDataURL = canvas.toDataURL('image/png');
      console.log(contentDataURL);
      let pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
      var position = 0;
      let pS= 0;
      let pE=270;
      let graphCount = Number(this.VendorScorecardresponse.length);
      let pageCount = Number(graphCount / 3.5);
      for (let i = 0; i < pageCount; i++) {
        if (i != 0)
          pdf.addPage();
        pdf.addImage(contentDataURL, 'PNG', 5, position+10, imgWidth, imgHeight);
        pdf.addImage(whiteline, 'PNG', 5, pS, imgWidth, 10);
        pdf.addImage(whiteline, 'PNG', 5, pE, imgWidth, 30);
        
        // pdf.setLineWidth(100);
        position -= 268;
        // p+=10;z

      }
      //   pdf.addImage(contentDataURL, 'PNG', 5, position, imgWidth, imgHeight);
      //   pdf.addPage();
      //  pdf.addImage(contentDataURL, 'PNG', 5, -300, imgWidth, imgHeight);
      //  pdf.addPage();
      //  pdf.addImage(contentDataURL, 'PNG', 5, -600, imgWidth, imgHeight);
      //  pdf.addPage();
      //  pdf.addImage(contentDataURL, 'PNG', 5, -900, imgWidth, imgHeight);
      pdf.save('VendorScoreReport.pdf'); // Generated PDF
    });
  }
  
  public printPage() {

    // let printContents, popupWin;
    debugger;
    let myContainer = document.getElementById('demo') as HTMLInputElement;
    
    let d=myContainer.innerHTML;
    var c=myContainer.innerText;
    let popupWin;
    popupWin= window.open('', '_blank', 'top=0,left=0,height=100%,width=auto')!;
   
      popupWin.document.open();
      popupWin.document.write('<style>@import url(../styles/variables/colors);.flex-column{margin-top:20px;padding-bottom:10px;display:flex;position:relative;height:40px;font-weight:700}.form-line{display:flex;align-items:flex-end;padding-top:10px}.inline-radio-container{margin-bottom:10px}label{margin:0}.form-line-item-25{width:25%}.col3,.form-line-item-30{width:30%}.form-line-item-40{width:40%}.form-line-item-50,.submit-wrapper .col6{width:50%}.form-line-item-60{width:60%}.linear-parent{text-align:center;width:75%;margin:auto}.linear-button{text-align:center;padding:2%}.progressbar-mode{text-align:left;font-family:Roboto-Regular;font-size:14px;color:#3d3e3c;margin-left:10px;margin-top:5%;padding:0;top:20px}#reLoad{border-radius:4px;text-transform:capitalize}.graphgrid{display:grid!important;border-right:1px solid #000}.col3 p,.graph-heading{padding:0 10px}.graph-heading h4{color:#0078d6}.graph-cards{display:flex;align-items:flex-start}.col4 span{width:100%;display:block;text-align:left;padding:10px}// .label-sec{display:flex;align-items:center}.label-sec label{width:100px;font-weight:800;font-size:16px;color:#000!important}.label-sec label span{margin-left:auto;display:inline-block;float:right;color:#0078d6}.label-sec p{padding:0 15px!important}.spantag{font-size:10px!important;font-weight:700!important}.graphalign{width:14%!important;text-align:center!important}.Toplayer{width:100%!important;display:flex!important;background:#fff}.graph-heading,.heading{background:#f2f2f2}.col4{width:40%;text-align:center}.col7{width:93%}.widget-legend__point{width:20px!important;height:20px!important;border-radius:50px;display:flex;justify-content:center;align-items:center}.order-cound span{width:auto!important;display:inline-block!important}.order-cound h4{color:#0078d6;margin:10px!important}p.submit-value{color:#0078d6;font-weight:600;font-size:22px}.submit-wrapper{display:flex}.submit-wrapper .col6:last-child{border-right:0}.mainscore{margin-top:-91px!important}// .vendor-score-wrapper{height:100%;display:block;overflow-y:auto;float:left;width:100%}.vendor-graph{width:calc(100% - 4px)}.mb-3{margin-bottom:30px}.Rating{text-align:center!important;display:grid!important;font-size:35px!important}.graphs{padding-bottom:10px!important;margin-bottom:15px}.font-color,.font-color-dark,.font-inc{font-weight:800;margin:0;text-align:center!important}.Toplayers.head-line{background:#5b9bd5;line-height:0;display:flex!important}h4{padding-left:10px;color:#fff}p{color:#595959;font-weight:600}.heading{height:52px}.font-color{color:#44546a!important;font-size:xx-large}.font-color-dark{color:#000!important;font-size:xx-large}.font-inc{font-size:92px}.control-section{min-height:450px}p.head{font-size:20px;font-weight:bolder}// @media print{height:100%;width:1000%}.header,app-custom-side-dialog,app-shell{display:none!important}ejs-accumulationchart>svg>rect {fill: #f2f2f2 !important;}</style><body onload="window.print();window.close()">'+d+'</body>');
      popupWin.document.close();
    // window.print();
  }

}
