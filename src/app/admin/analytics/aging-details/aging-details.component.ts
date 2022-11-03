import { Component, Inject, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType, GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ClearLogiReportState, GetDepartmentsByLocations, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { analyticsConstants } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS, REGION_DATA_FIELDS, REGIONS_ERROR } from '../analytics.constant';
import { Organisation } from '@shared/models/visibility-settings.model';
import { User } from '@shared/models/user.model';
import { uniq, uniqBy } from 'lodash';

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
  public regionFields= REGION_DATA_FIELDS;
  selectedRegions: Region[];

  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocations: Location[];

  isDepartmentsDropDownEnabled: boolean = false;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' }  ;
  selectedDepartments: Department[];


  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

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
  public regionsList:Region[]=[];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  public defaultOrganizations: number ;
  public defaultRegions: (number | undefined)[] = [];
  public defaultLocations: (number | undefined)[] = [];
  public defaultDepartments: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  private loadCounter = 0;
  public user: User | null;
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

    this.SetReportData();
  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.orderFilterColumnsSetup();
      this.onFilterControlValueChangedHandler();
      this.loadCounter = this.loadCounter + 1;
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.agingReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.agingReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    this.agingReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([], [Validators.required]),
        regionIds: new FormControl([], [Validators.required]),
        locationIds: new FormControl([], [Validators.required]),
        departmentIds: new FormControl([], [Validators.required])
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
      this.organizations = uniqBy(data,'organizationId');
      this.filterColumns.businessIds.dataSource = this.organizations;
      this.defaultOrganizations = this.agencyOrganizationId;
      let orgList = this.organizations?.filter((x) => this.agencyOrganizationId==x.organizationId);
        this.regionsList=[];        
        this.locationsList=[];
        this.departmentsList=[];
        orgList.forEach((value) => {
          this.regionsList.push(...value.regions);
          value.regions.forEach((region) => {
            this.locationsList.push(...region.locations);
            region.locations.forEach((location) => {
              this.departmentsList.push(...location.departments);
            });
          });
        });
        if (data.length>0&&this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {      
          this.showToastMessage(this.regionsList.length,this.locationsList.length,this.departmentsList.length);
        }
      this.agingReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
      this.changeDetectorRef.detectChanges();
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!this.isClearAll) {
        let orgList = this.organizations?.filter((x) => data==x.organizationId);
        this.selectedOrganizations = orgList;       
        
        
        this.regions =this.regionsList;
        this.filterColumns.regionIds.dataSource = this.regions;
        this.defaultRegions=this.regionsList.map((list) => list.id);
        this.agingReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);        
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.isClearAll = false;
      }
    });
    this.regionIdControl = this.agingReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.regionIdControl.value.length > 0) {
        let regionList = this.regions?.filter((object) => data?.includes(object.id));
        this.selectedRegions = regionList;
        this.locations=this.locationsList.filter(i=>data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource=this.locations;
        this.defaultLocations=this.locations.map((list)=>list.id);
        this.agingReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue(this.defaultLocations);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.locationIdControl = this.agingReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.locationIdControl.value.length > 0) {
        this.selectedLocations = this.locations?.filter((object) => data?.includes(object.id));
        this.departments=this.departmentsList.filter(i=>data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource=this.departments;
        this.defaultDepartments=this.departments.map((list)=>list.id);
        this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue(this.defaultDepartments);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.departmentIdControl = this.agingReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.selectedDepartments = this.departments?.filter((object) => data?.includes(object.id));
      if (this.isInitialLoad) {

        this.SearchReport();
        this.isInitialLoad = false;
      }
    });
   
  }

  public SearchReport(): void {
    this.message = "Default filter selected with all regions ,locations and departments for 90 days";
    this.filteredItems = [];
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    this.paramsData =
    {
      "OrganizationParamAR": this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "RegionParamAR": this.selectedRegions?.map((list) => list.id).join(","),
      "LocationParamAR": this.selectedLocations?.map((list) => list.id).join(","),
      "DepartmentParamAR": this.selectedDepartments?.map((list) => list.id).join(","),
      "BearerParamAR": auth,
      "BusinessUnitIdParamJD": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.organizationId != null ?
          this.organizations[0].organizationId.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl
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
    this.onFilterControlValueChangedHandler();
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
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.agingReportForm.markAllAsTouched();
    if (this.agingReportForm.invalid) {
      return;
    }
   
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  public showToastMessage(regionsLength:number,locationsLength:number,departmentsLength:number)
  {
    this.message = "";
    let error:any= regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch([new ShowToast(MessageTypes.Error, error)]);
    return;  
  }

}
