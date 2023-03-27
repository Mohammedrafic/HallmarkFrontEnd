import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';

import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData,
  GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState
} from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { analyticsConstants } from '../constants/analytics.constant';
import { FilterService } from '@shared/services/filter.service';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { AgencyDto, CandidateStatusAndReasonFilterOptionsDto, CandidateStatusDto, CommonReportFilter, CommonReportFilterOptions } from '../models/common-report.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '../../../shared/enums/message-types';
import { User } from '../../../shared/models/user.model';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';

@Component({
  selector: 'app-credential-expiry',
  templateUrl: './credential-expiry.component.html',
  styleUrls: ['./credential-expiry.component.scss']
})
export class CredentialExpiryComponent implements OnInit,OnDestroy {
  public paramsData: any = {
    "OrganizationParamCREXP": "",
    "StartDateParamCREXP": "",
    "EndDateParamCREXP": "",
    "RegionParamCREXP": "",
    "LocationParamCREXP": "",
    "DepartmentParamCREXP": "",
    "BearerParamCREXP":"",
    "BusinessUnitIdParamCREXP":"",
    "HostName": "",
    "AgencyParamCREXP": "",
    "CandidateStatusCREXP": "",
    "JobIdCREXP": "",
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/CredentialExpiry/CredentialExpiry.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/CredentialExpiry/CredentialExpiry.cat" };
  public title: string = "Credential Expiry";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public allOption:string="All";
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

  @Select(LogiReportState.commonReportFilterData)
  public CommonReportFilterData$: Observable<CommonReportFilterOptions>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId:number;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public credentialExpiryForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
  public candidateStatusesIdControl: AbstractControl;
 

  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[];
  public defaultOrganizations:number[] =[];
  public defaultRegions:(number|undefined)[] =[];
  public defaultLocations:(number|undefined)[]=[];
  public defaultDepartments: (number | undefined)[] = [];
  public defaultAgencys: (number | undefined)[] = [];
  public defaultCandidateStatuses: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string;
  public filterOptionsData: CommonReportFilterOptions;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private previousOrgId: number = 0;
  public isResetFilter: boolean = false;
  private isAlive = true;
  public user: User | null;
  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  private fixedCandidateStatusesIncluded: number[] = [1, 2, 3,4,5,8,9,13];
  agencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  selectedAgencies: AgencyDto[] = [];
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  selectedCandidateStatuses: CandidateStatusAndReasonFilterOptionsDto[] = [];
  candidateStatusesData:CandidateStatusAndReasonFilterOptionsDto[] = [];
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
    message: string;
  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService  ,@Inject(APP_SETTINGS) private appSettings: AppSettings) {
      this.baseUrl = this.appSettings.host.replace("https://","").replace("http://","");
      this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
    this.initForm();
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
    }   
    //this.SetReportData();    
  }

  ngOnInit(): void {

    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();
      this.CommonReportFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.isAlive = false;
          this.filterOptionsData = data;
          //let notLoadingStatuses :string[]= ['Applied','Shortlisted','Rejected','Bill Rate Pending','Offered Bill Rate','Offboard','Withdraw','Cancelled','Not Applied'];
          
          this.candidateStatusesData=data.allCandidateStatusesAndReasons.filter(i => this.fixedCandidateStatusesIncluded.includes(i.status));
            this.filterColumns.candidateStatuses.dataSource =this.candidateStatusesData;
              this.filterColumns.agencyIds.dataSource = data.agencies;
             this.defaultCandidateStatuses = (this.candidateStatusesData||[]).map((list) => list.status);
             this.defaultAgencys = data.agencies.map((list) => list.agencyId);
              this.credentialExpiryForm.controls["candidateStatuses"].setValue(this.defaultCandidateStatuses.filter(f=>f !==90));
          if (this.isInitialLoad) {
            setTimeout(() => { this.SearchReport(); }, 3000)
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
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.credentialExpiryForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.credentialExpiryForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }


  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.credentialExpiryForm = this.formBuilder.group(
      {
        businessIds: new FormControl({value:[],disabled:true}, [Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        agencyIds: new FormControl([]),
        jobId: new FormControl(''),
        candidateStatuses: new FormControl([]),
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.credentialExpiryForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.credentialExpiryForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
      }
    });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        /*this.isAlive = true;*/
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
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          setTimeout(() => { this.SearchReport() }, 3000);
        }
        else {
          this.isClearAll = false;
          this.credentialExpiryForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });


    this.agencyIdControl = this.credentialExpiryForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
    this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.agencyIdControl.value.length > 0) {
        let agencyData = this.filterOptionsData.agencies;
        this.selectedAgencies = agencyData?.filter((object) => data?.includes(object.agencyId));
      }
    });

    this.candidateStatusesIdControl = this.credentialExpiryForm.get(analyticsConstants.formControlNames.CandidateStatuses) as AbstractControl;
    this.candidateStatusesIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.candidateStatusesIdControl.value.length > 0) {       
        this.selectedCandidateStatuses = this.candidateStatusesData?.filter((object) => data?.includes(object.status));
      }
    });

  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.credentialExpiryForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.credentialExpiryForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.credentialExpiryForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }


  public SearchReport(): void {
    let auth = "Bearer ";
    for(let x=0;x<window.localStorage.length;x++)
    { 
      if(window.localStorage.key(x)!.indexOf('accesstoken')>0)
      {
        auth=auth+ JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { departmentIds, locationIds,  regionIds, startDate, endDate, jobId,candidateStatuses } = this.credentialExpiryForm.getRawValue();

    if (!this.credentialExpiryForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 90 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }

    locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);

    regionIds = regionIds.length > 0 ? regionIds.join(",") : this.regionsList?.length > 0 ? this.regionsList.map(x => x.id).join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds : this.locationsList?.length > 0 ? this.locationsList.map(x => x.id).join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds : this.departmentsList?.length > 0 ? this.departmentsList.map(x => x.id).join(",") : "null";
    candidateStatuses = candidateStatuses.length > 0 ? candidateStatuses.join(",") : this.filterOptionsData.candidateStatuses?.length > 0 ? this.filterOptionsData.candidateStatuses.map(x => x.status).join(",") : "null";

      this.paramsData =
      {
      "OrganizationParamCREXP": this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "StartDateParamCREXP": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamCREXP": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamCREXP": regionIds.length == 0 ? "null" : regionIds,
      "LocationParamCREXP": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentParamCREXP": departmentIds.length == 0 ? "null" : departmentIds,
      "AgencyParamCREXP": this.selectedAgencies.length ==0?"null":this.selectedAgencies?.map((list) => list.agencyId).join(","),
      "CandidateStatusCREXP": candidateStatuses.length == 0 ? "null" : candidateStatuses?.join(","),
      "JobIdCREXP": jobId.trim() == "" ? "null" : jobId.trim(),
      "BearerParamCREXP":auth,
      "BusinessUnitIdParamCREXP":window.localStorage.getItem("lastSelectedOrganizationId") == null 
      ?this.organizations!=null &&this.organizations[0]?.id!=null?
      this.organizations[0].id.toString():"1": 
      window.localStorage.getItem("lastSelectedOrganizationId"),
        "HostName": this.baseUrl,
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
        valueField: 'departmentName',
        valueId: 'departmentId',
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
      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },
      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
    }
  }

  private SetReportData() {
    const logiReportData = this.store.selectSnapshot(LogiReportState.logiReportData);
      if(logiReportData!=null&&logiReportData.length==0)
      {
        this.store.dispatch(new GetLogiReportData());
      }
      else{
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
    this.filterService.removeValue(event, this.credentialExpiryForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue([]);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.JobId)?.setValue('');
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.credentialExpiryForm.markAllAsTouched();
    if (this.credentialExpiryForm?.invalid) {
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
}

