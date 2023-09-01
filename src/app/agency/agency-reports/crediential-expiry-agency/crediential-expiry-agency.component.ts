//import { GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState, GetOrganizationsByAgency, GetOrganizationsStructureByOrgIds, GetAgencyCommonFilterReportOptions, GetCommonReportAgencyCandidateSearch } from '@organization-management/store/logi-report.action';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel, FilteringEventArgs} from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetCommonReportFilterOptions, GetLogiReportData, ClearLogiReportState,GetCommonReportAgencyCandidateSearch,GetAgencyCommonFilterReportOptions, GetOrganizationsByAgency, GetOrganizationsStructureByOrgIds } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { departmentSpendHourReportConstants,analyticsConstants } from '@admin/analytics/constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '@admin/analytics/analytics.constant';
import { CommonReportFilterOptions } from '@admin/analytics/models/common-report.model';
// import { CommonReportFilter, CommonReportFilterOptions } from '../models/common-report.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';
import { OutsideZone } from '@core/decorators';
import { EmitType } from '@syncfusion/ej2-base';
import {
  CommonAgencyCandidateSearchFilter, CommonReportFilter,
  MasterSkillDto, SearchCandidate, SkillCategoryDto, OrderTypeOptionsForReport, AgencyCommonFilterReportOptions, CandidateStatusAndReasonFilterOptionsDto
} from '../models/agency-common-report.model';
import { AgencyCredientialExpiryConstants } from '../constants/agency-reports.constants';
import { DataSourceItem } from '@core/interface';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
@Component({
  selector: 'app-crediential-expiry-agency',
  templateUrl: './crediential-expiry-agency.component.html',
  styleUrls: ['./crediential-expiry-agency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CredientialExpiryAgencyComponent implements OnInit {
  public paramsData: any = {
    "AgencyIdCE":"",
    "CandidateNameCE": "",
    "CandidateStatusCE": "",
    "DepartmentIdsCE": "",
    "LocationIdsCE": "",
    "OrderEndDateCE": "",
    "OrderStartDateCE": "",
    "OrganizationIdCE": "",
    "PositionIdCE": "",
    "RegionIdsCE": "",
    "UserIdCE": "",
  
   };
  public reportName: LogiReportFileDetails = { name: "/AgencyReports/CredentialExpiry/CredentialExpiry.cls" };
  public catelogName: LogiReportFileDetails = { name: "/AgencyReports/CredentialExpiry/CredentialExpiry.cat" };
  public title: string = "Credential Expiry";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  public allOption: string = "All";
  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };

  public defaultCandidateStatuses: (number | undefined)[] = [ 4, 5,3];
  
  private fixedCandidateStatusesIncluded: number[] = [1, 2, 3, 4, 5,10,13,12];

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

  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  @Select(UserState.lastSelectedAgencyId)
  private agencyId$: Observable<number>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = {text: 'organizationName',value: 'organizationId'};
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public agencyCredientialExpiryReportForm: FormGroup;
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

  public masterRegionsList: OrganizationRegion[] = [];
  public masterLocationsList: OrganizationLocation[] = [];
  public masterDepartmentsList: OrganizationDepartment[] = [];
  public associatedOrganizations: DataSourceItem[]=[];
  selectedCandidateStatuses: CandidateStatusAndReasonFilterOptionsDto[] = [];
  candidateStatusesData:CandidateStatusAndReasonFilterOptionsDto[] = [];
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
                this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);
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
      this.user?.businessUnitType == BusinessUnitType.Hallmark || this.user?.businessUnitType == BusinessUnitType.Agency ? this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.BusinessIds)?.enable() : this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.BusinessIds)?.disable();
      
      });
  
  }

  private initForm(): void {
    this.agencyCredientialExpiryReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl( [Validators.required]),
        endDate: new FormControl( [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        candidateName: new FormControl(null),
        candidateStatuses: new FormControl([]),
        jobId: new FormControl(''),
       }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }


  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.BusinessIds) as AbstractControl;
    this.defaultOrganizations = this.organizations.length == 0 ? 0 : this.organizations[0].organizationId;
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.BusinessIds)?.setValue(this.defaultOrganizations);
    

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.RegionIds)?.setValue([]);
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
            debugger;
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              // this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              // this.filterColumns.skillIds.dataSource = [];
              // this.filterColumns.jobStatuses.dataSource = data.jobStatusesAndReasons;
              debugger;
              this.filterColumns.candidateStatuses.dataSource = data.candidateStatuses;

              this.candidateStatusesData=data.allCandidateStatusesAndReasons.filter(i => this.fixedCandidateStatusesIncluded.includes(i.status));
              this.filterColumns.candidateStatuses.dataSource =this.candidateStatusesData;
              this.agencyCredientialExpiryReportForm.controls["candidateStatuses"].setValue(this.defaultCandidateStatuses.filter(f=>f !==90));
          
              this.isDefaultLoad = true;
              setTimeout(() => { this.SearchReport() }, 3000);
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.LocationIds)?.setValue([]);
      this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.LocationIds)?.setValue([]);
        this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  

  public SearchReport(): void {


    this.filteredItems = [];
    // let auth = "Bearer ";
    // for (let x = 0; x < window.localStorage.length; x++) {
    //   if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
    //     auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
    //   }
    // }

    let {  businessIds, candidateName, candidateStatuses, departmentIds, jobId, locationIds,
      regionIds, startDate, endDate } = this.agencyCredientialExpiryReportForm.getRawValue();
    if (!this.agencyCredientialExpiryReportForm.dirty) {
      this.message = "";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
   
    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
   
    this.paramsData =
    {
      "AgencyIdCE":this.defaultAgency == null ? this.selectedOrganizations != null && this.selectedOrganizations.length > 0 && this.selectedOrganizations[0]?.organizationId != null ?
      this.selectedOrganizations[0].organizationId.toString() : "1" : this.defaultAgency,
      "CandidateNameCE": candidateName == null || candidateName == "" ? "null" : candidateName.toString(),
      "CandidateStatusCE": candidateStatuses.length == 0 ? "null" : candidateStatuses.join(","),
      "DepartmentIdsCE": departmentIds.length == 0 ? "null" : departmentIds,
      "LocationIdsCE": locationIds.length == 0 ? "null" : locationIds,
      "OrderEndDateCE": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "OrderStartDateCE":formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "OrganizationIdCE": this.selectedOrganizations?.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "PositionIdCE": jobId == null || jobId == "" ? "null" : jobId,
      "RegionIdsCE": regionIds.length == 0 ? "null" : regionIds,
      "UserIdCE":  this.user?.id,
    };
    console.log( this.paramsData);
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
    this.filterService.removeValue(event, this.agencyCredientialExpiryReportForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.RegionIds)?.setValue([]);
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.LocationIds)?.setValue([]);
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.CandidateName)?.setValue(null);
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.CandidateStatuses)?.setValue(this.defaultCandidateStatuses.filter(f=>f !==90));
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.StartDate)?.setValue([]);
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.EndDate)?.setValue([]);
    this.agencyCredientialExpiryReportForm.get(AgencyCredientialExpiryConstants.formControlNames.JobId)?.setValue(null);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }


  public onFilterApply(): void {

    this.agencyCredientialExpiryReportForm.markAllAsTouched();
    if (this.agencyCredientialExpiryReportForm?.invalid) {
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