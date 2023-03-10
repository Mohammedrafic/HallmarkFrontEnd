import { Component, Inject, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ClearLogiReportState, GetLogiReportData } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ageGroups, analyticsConstants } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS, REGION_DATA_FIELDS } from '../analytics.constant';
import { Organisation } from '@shared/models/visibility-settings.model';
import { User } from '@shared/models/user.model';
import { uniqBy } from 'lodash';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-aging-details',
  templateUrl: './aging-details.component.html',
  styleUrls: ['./aging-details.component.scss']
})
export class AgingDetailsComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "OrganizationParamAR": "",
    "RegionParamAR": "",
    "LocationParamAR": "",
    "DepartmentParamAR": "",
    "BearerParamAR": "",
    "BusinessUnitIdParamJD": "",
    "HostName": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/AgingReport/AgingReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/AgingReport/Aging.cat" };
  public title: string = "Aging Details";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  public allOption: string = "All";
  public regionFields = REGION_DATA_FIELDS;
  
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  
  isDepartmentsDropDownEnabled: boolean = false;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };
    agingGroupFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[]=[];

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;
  
  public agingGroups=ageGroups;
  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public agingReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
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
  public defaultAgingGroups:(number)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public isResetFilter: boolean = false;
  private previousOrgId: number = 0;

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

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
      this.store.dispatch(new ClearLogiReportState());
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.orderFilterColumnsSetup();
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.agingReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.agingReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    this.agingReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        agingGroupIds:new FormControl(null)
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFilterControlValueChangedHandler(): void {
      this.bussinessControl = this.agingReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;
      this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
        if (data != null && data.length > 0) {
          this.organizations = uniqBy(data, 'organizationId');
          this.filterColumns.businessIds.dataSource = this.organizations;
          this.defaultOrganizations = this.agencyOrganizationId;
          this.agingReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
          this.changeDetectorRef.detectChanges();
        }
      });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agingReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      if (typeof data === 'number' && data != this.previousOrgId) {
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

          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.defaultAgingGroups=this.agingGroups.map((list)=>list.id);
          this.agingReportForm.get(analyticsConstants.formControlNames.AgingGroupIds)?.setValue(this.defaultAgingGroups);
          if (this.isInitialLoad) {
            setTimeout(()=>{ this.SearchReport()},3000);
            this.isInitialLoad = false;
          }
          this.changeDetectorRef.detectChanges();
        }
        else {
          this.isClearAll = false;
          this.agingReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.agingReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agingReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.agingReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

 public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.agingReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
     
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
   this.departmentIdControl = this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
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
    let { regionIds,locationIds,departmentIds,agingGroupIds } = this.agingReportForm.getRawValue();
    
    if (!this.agingReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }

    //locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length  > 0 ? this.locations.map(x=> x.id).join(",") : []); 
    //departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length  > 0 ? this.departments.map(x=> x.id).join(",") : []); 

    regionIds =        regionIds.length > 0 ? regionIds.join(",") :  "null"; 
    locationIds = locationIds.length > 0 ? locationIds.join(",") :"null"; 
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") :"null"; 
    

    this.paramsData =
    {
      "OrganizationParamAR":this.selectedOrganizations?.length==0?"null": this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "RegionParamAR":      regionIds.length==0? "null" : regionIds,
      "LocationParamAR":    locationIds.length==0?"null" : locationIds,
      "DepartmentParamAR":  departmentIds.length==0?"null" :  departmentIds,
      "BearerParamAR": auth,
      "BusinessUnitIdParamJD": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.organizationId != null ?
          this.organizations[0].organizationId.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
      "AgingGroupAR":agingGroupIds==null?"null":agingGroupIds.toString()
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }

  private orderFilterColumnsSetup(): void {
    this.filterColumns = {
      businessIds: {
        type: ControlTypes.Dropdown,
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
      agingGroupIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: this.agingGroups,
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
    this.filterService.removeValue(event, this.agingReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    this.filterColumns.locationIds.dataSource = [];
    this.filterColumns.departmentIds.dataSource = [];
    this.agingReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.agingReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.agingReportForm.get(analyticsConstants.formControlNames.AgingGroupIds)?.setValue(null);
    this.filteredItems = [];
    this.locations =[];
    this.departments =[];
    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
        this.agingReportForm.markAllAsTouched();
        if (this.agingReportForm.invalid) {
          return;
    }
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch(new ShowToast(MessageTypes.Error, error));
    return;
  }
}
