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
import { invoiceSummaryConstants,  analyticsConstants } from '../constants/analytics.constant';
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
  selector: 'app-invoice-summary',
  templateUrl: './invoice-summary.component.html',
  styleUrls: ['./invoice-summary.component.scss']
})
export class InvoiceSummaryComponent implements OnInit, OnDestroy {
  public paramsData: any = {

    "HostNameISD": "",
    "BearerParamISD": "",
    "BusinessUnitIdParamISD": "",
    "organizationsISD": "",
    "regionsISD": "",
    "locationsISD": "",
    "DepartmentsISD": "",
    "agencyISD": "",
    "candidateISD": "",
    "invoiceNumberISD": "",
    "InvoiceStartDateISD": "",
    "invoiceEndDateISD": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/InvoiceSummaryReport/InvoiceSummaryReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/InvoiceSummaryReport/InvoiceSummaryReport.cat" };
  public title: string = "Invoice Summary Report";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public message: string = "";
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


  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public invoiceSummaryReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
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
  public defaultOrderTypes: (number | undefined)[] = [];
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
      this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.isAlive = false;
          this.filterOptionsData = data;
          this.filterColumns.agencyIds.dataSource = [];
          this.filterColumns.agencyIds.dataSource = data?.agencies;
          this.agencyIdControl = this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.AgencyIds) as AbstractControl;
          let agencyIds = data?.agencies;
          this.selectedAgencies = agencyIds;
          this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
          this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
          if (this.isInitialLoad) {
              this.SearchReport(); 
            this.isInitialLoad = false;
          }
        }
      });
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
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.BusinessIds)?.enable() : this.invoiceSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.invoiceSummaryReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        candidateName: new FormControl(null),
        agencyIds: new FormControl([], [Validators.required]),
        invoiceNumber: new FormControl(null),
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
    this.bussinessControl = this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;

        this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
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
          this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });

    this.agencyIdControl = this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.AgencyIds) as AbstractControl;
    this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.agencyIdControl.value.length > 0) {
        let agencyIds = this.agencyData;
        this.selectedAgencies = agencyIds?.filter((object) => data?.includes(object.agencyId));
      }
    });
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.LocationIds)?.setValue([]);
      this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.LocationIds)?.setValue([]);
        this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.DepartmentIds) as AbstractControl;
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
    let { candidateName, departmentIds, invoiceNumber, locationIds,
      regionIds, startDate, endDate, agencyIds } = this.invoiceSummaryReportForm.getRawValue();


    locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);

    regionIds = regionIds.length > 0 ? regionIds.join(",") : this.regionsList?.length > 0 ? this.regionsList.map(x => x.id).join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds : this.locationsList?.length > 0 ? this.locationsList.map(x => x.id).join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds : this.departmentsList?.length > 0 ? this.departmentsList.map(x => x.id).join(",") : "null";



    this.paramsData =
    {

      "HostNameISD": this.baseUrl,
      "BearerParamISD": auth,
      "BusinessUnitIdParamISD": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),

      "organizationsISD": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "regionsISD": regionIds.length == 0 ? "null" : regionIds,
      "locationsISD": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentsISD": departmentIds.length == 0 ? "null" : departmentIds,
      "agencyISD": agencyIds.length == 0 ? "null" : agencyIds.join(","),
      "candidateISD": candidateName == null || candidateName == "" ? "null" : candidateName.toString(),
//        candidateName == null || candidateName == "" ? "null" : this.candidateSearchData?.filter((i) => i.id == candidateName).map(i => i.fullName),
      "invoiceNumberISD": invoiceNumber == null ? "null" : invoiceNumber,
      "InvoiceStartDateISD": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "invoiceEndDateISD": formatDate(endDate, 'MM/dd/yyyy', 'en-US')
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
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      invoiceNumber: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },

      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },

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
    this.filterService.removeValue(event, this.invoiceSummaryReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.RegionIds)?.setValue([]);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.LocationIds)?.setValue([]);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.CandidateName)?.setValue(null);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.AgencyIds)?.setValue([]);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.InvoiceNumber)?.setValue(null);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.StartDate)?.setValue(startDate);
    this.invoiceSummaryReportForm.get(invoiceSummaryConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.filterColumns.locationIds.dataSource = [];
    this.filterColumns.departmentIds.dataSource = [];
  }
  public onFilterApply(): void {
    let { regionIds, locationIds, departmentIds, agingGroupIds } = this.invoiceSummaryReportForm.getRawValue();

    regionIds = regionIds.length > 0 ? regionIds.join(",") : this.regionsList?.length > 0 ? this.regionsList.map(x => x.id).join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : this.locationsList?.length > 0 ? this.locationsList.map(x => x.id).join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : this.departmentsList?.length > 0 ? this.departmentsList.map(x => x.id).join(",") : "null";

    if (!(regionIds.length > 0 && locationIds.length > 0 && departmentIds.length > 0)) {
      this.invoiceSummaryReportForm.markAllAsTouched();
      if (this.invoiceSummaryReportForm?.invalid) {
        return;
      }
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
