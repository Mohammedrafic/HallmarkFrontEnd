import { Component, Inject, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department, Organisation } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil } from 'rxjs';
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
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { analyticsConstants } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from '../../../../app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { User } from '@shared/models/user.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
@Component({
  selector: 'app-overall-status',
  templateUrl: './overall-status.component.html',
  styleUrls: ['./overall-status.component.scss']
})
export class OverallStatusComponent implements OnInit, OnDestroy {
  public paramsData: any = {
    "OrganizationParamOASR": "",
    "StartDateParamOASR": "",
    "EndDateParamOASR": "",
    "RegionParamOASR": "",
    "LocationParamOASR": "",
    "DepartmentParamOASR": "",
    "BearerParamOASR": "",
    "BusinessUnitIdParamOASR": "",
    "HostName": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/OverAllStatus/OverAllStatus.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/OverAllStatus/OverAllStatus.cat" };
  public message: string = "";
  public title: string = "Overall Status Report";
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
  selectedDepartments: Department[];

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[] = [];

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public overallStatusReportForm: FormGroup;
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
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public isDefaultLoad: boolean = false;
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
    //this.SetReportData();  
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

      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.overallStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.overallStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.overallStatusReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl({ value: [], disabled: true }, [Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([])
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;
    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.overallStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.overallStatusReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
          this.isDefaultLoad = true;
          setTimeout(() => { this.SearchReport() }, 3000);
        }
        else {
          this.isClearAll = false;
          this.overallStatusReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });


  }

  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.overallStatusReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.overallStatusReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }


  public SearchReport(): void {
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { regionIds, locationIds, departmentIds, startDate, endDate } = this.overallStatusReportForm.getRawValue();
    locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);

    regionIds = regionIds.length > 0 ? regionIds.join(",") : this.regionsList?.length > 0 ? this.regionsList.map(x => x.id).join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds : this.locationsList?.length > 0 ? this.locationsList.map(x => x.id).join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds : this.departmentsList?.length > 0 ? this.departmentsList.map(x => x.id).join(",") : "null";

    this.paramsData =
    {
      "OrganizationParamOASR": this.selectedOrganizations?.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "StartDateParamOASR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamOASR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamOASR": regionIds.length == 0 ? "null" : regionIds,
      "LocationParamOASR": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentParamOASR": departmentIds.length == 0 ? "null" : departmentIds,
      "BearerParamOASR": auth,
      "BusinessUnitIdParamOASR": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl
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
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text }
    }
  }
  public showFilters(): void {
    if (this.isResetFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.overallStatusReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.overallStatusReportForm.markAllAsTouched();
    if (this.overallStatusReportForm?.invalid) {
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
}
