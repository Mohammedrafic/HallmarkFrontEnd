import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
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
import { GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations, GetCommonReportAgencyCandidateSearch, ClearLogiReportState, GetOrganizationsByAgency, GetOrganizationsStructureByOrgIds, GetAgencyCommonFilterReportOptions } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import {  accrualReportTypesList,AgencyInvoiceSummaryConstants, ORGANIZATION_DATA_FIELDS } from '../constants/agency-reports.constants';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { FilterService } from '@shared/services/filter.service';
import { MessageTypes } from '@shared/enums/message-types';
import {
  CommonAgencyCandidateSearchFilter, CommonReportFilter,
   SearchCandidate,  OrderTypeOptionsForReport, AgencyCommonFilterReportOptions
} from '../models/agency-common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { DataSourceItem } from '../../../core/interface/common.interface';
import { GetOrganizationById } from '../../../admin/store/admin.actions';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '../../../shared/models/organization.model';
import { InvoiceStatus, invoiceStatusListWithReject } from '../../../admin/analytics/constants/analytics.constant';

@Component({
  selector: 'app-invoice-summary-report',
  templateUrl: './invoice-summary-report.component.html',
  styleUrls: ['./invoice-summary-report.component.scss']
})
export class InvoiceSummaryReportComponent implements OnInit, OnDestroy {

  public invoiceStatusListwithreject: InvoiceStatus[] = [];

  private loadInvoiceStatus(): void {
    this.invoiceStatusListwithreject = [];

    this.invoiceStatusListwithreject.push({ id: 1, name: 'Submitted pend appr' });
    this.invoiceStatusListwithreject.push({ id: 2, name: 'Pending Payment' });
    this.invoiceStatusListwithreject.push({ id: 3, name: 'Paid' });
    //this.invoiceStatusListwithreject.push({ id: 4, name: 'Rejected' });
  }
  public paramsData: any = {
    "AgenciesParamAIS": "",
    "OrganizationParamAIS": "",
    "StartDateParamAIS": "",
    "EndDateParamAIS": "",
    "RegionParamAIS": "",
    "LocationParamAIS": "",
    "DepartmentParamAIS": "",
    "CandidateNameParamAIS": "",
    "InvoiceStatusParamAIS": "",
    "InvoiceIdParamAIS": ""
  };
  public reportName: LogiReportFileDetails = { name: "/AgencyReports/InvoiceSummary/InvoiceSummaryReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/AgencyReports/InvoiceSummary/AgencyInvoiceSummary.cat" };
  public title: string = "Invoice Summary";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
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
  invoiceStatusFields: FieldSettingsModel = { text: 'name', value: 'id' };
  @Select(UserState.lastSelectedAgencyId)
  private agencyId$: Observable<number>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = { text: 'organizationName', value: 'organizationId' };
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public agencyInvoicesummaryReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
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
  public defaultInvoiceStatus: (number | undefined)[] = [1, 2, 3];
  
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
        this.loadInvoiceStatus();
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
                this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);
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
      this.user?.businessUnitType == BusinessUnitType.Hallmark || this.user?.businessUnitType == BusinessUnitType.Agency ? this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.BusinessIds)?.enable() : this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.BusinessIds)?.disable();

    });

  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 14);
    this.agencyInvoicesummaryReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        candidateName: new FormControl(null),
        invoiceStatus: new FormControl([]),
        invoiceID: new FormControl('')
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }


  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.BusinessIds) as AbstractControl;
    this.defaultOrganizations = this.organizations.length == 0 ? 0 : this.organizations[0].organizationId;
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);
    

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.RegionIds)?.setValue([]);
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
              this.isDefaultLoad = true;
              this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.InvoiceStatuses)?.setValue(this.defaultInvoiceStatus);
              setTimeout(() => { this.SearchReport() }, 3000);
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.LocationIds)?.setValue([]);
      this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.LocationIds)?.setValue([]);
        this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  public SearchReport(): void {
    this.filteredItems = [];

    let {  businessIds, candidateName, invoiceStatus, departmentIds,   locationIds, 
      regionIds, startDate, endDate, invoiceID } = this.agencyInvoicesummaryReportForm.getRawValue();
    if (!this.agencyInvoicesummaryReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 14 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
    regionIds = regionIds.length > 0 ? regionIds.join(",") : '';
    locationIds = locationIds.length > 0 ? locationIds.join(",") : '';
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : '';
    invoiceStatus = invoiceStatus.length > 0 ? invoiceStatus.join(",") : '';
    this.paramsData =
    {
      AgenciesAIS: this.defaultAgency,
      OrganizationAIS: this.selectedOrganizations?.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      StartDateAIS: formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      EndDateAIS: formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      RegionAIS: regionIds.length == 0 ? '' : regionIds,
      LocationAIS: locationIds.length == 0 ? '' : locationIds,
      DepartmentAIS: departmentIds.length == 0 ? '' : departmentIds,
      CandidateNameAIS: candidateName == null || candidateName == "" ? '' : candidateName.toString(),
      InvoiceStatusAIS: invoiceStatus.length == 0 ? '' : invoiceStatus,
      UseridAIS: this.user?.id,
      InvoiceIdAIS: invoiceID == null || invoiceID == "" ? '' : invoiceID 
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
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },      
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      invoiceStatus: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
     
      invoiceID: {
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
    this.filterService.removeValue(event, this.agencyInvoicesummaryReportForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 14);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.RegionIds)?.setValue([]);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.LocationIds)?.setValue([]);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.CandidateName)?.setValue(null);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.candidateStatuses)?.setValue([]);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.InvoiceStatuses)?.setValue(this.defaultInvoiceStatus);
    //this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.invoiceStatus)?.setValue([]);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.startDate)?.setValue(startDate);
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.endDate)?.setValue(new Date(Date.now()));
    this.agencyInvoicesummaryReportForm.get(AgencyInvoiceSummaryConstants.formControlNames.InvoiceID)?.setValue(null);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }


  public onFilterApply(): void {

    this.agencyInvoicesummaryReportForm.markAllAsTouched();
    if (this.agencyInvoicesummaryReportForm?.invalid) {
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
