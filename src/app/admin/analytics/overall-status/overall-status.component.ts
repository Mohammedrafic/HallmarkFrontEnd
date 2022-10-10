import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Location, LocationsByRegionsFilter } from '@shared/models/location.model';
import { Region, regionFilter } from '@shared/models/region.model';
import { Department, DepartmentsByLocationsFilter } from '@shared/models/department.model';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetDepartmentsByLocations, GetLocationsByRegions, GetRegionsByOrganizations } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { startDateValidator } from '@shared/validators/date.validator';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { analyticsConstants } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from '../../../../app.settings';

@Component({
  selector: 'app-overall-status',
  templateUrl: './overall-status.component.html',
  styleUrls: ['./overall-status.component.scss']
})
export class OverallStatusComponent implements OnInit {
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
  departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };
  selectedDepartments: Department[];


  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  selectedOrganizations: BusinessUnit[];

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
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
  public organizations: BusinessUnit[] = [];
  public defaultOrganizations: number[] = [];
  public defaultRegions: (number | undefined)[] = [];
  public defaultLocations: (number | undefined)[] = [];
  public defaultDepartments: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService, @Inject(APP_SETTINGS) private appSettings: AppSettings) {
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
    this.initForm();
    const user = this.store.selectSnapshot(UserState.user);
    if (user?.businessUnitType != null) {
      this.store.dispatch(new GetBusinessByUnitType(BusinessUnitType.Organization));
    }
  }

  ngOnInit(): void {
    this.isInitialLoad = true;
    this.orderFilterColumnsSetup();
    this.onFilterControlValueChangedHandler();
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.overallStatusReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl(null, [Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        regionIds: new FormControl(null, [Validators.required]),
        locationIds: new FormControl(null, [Validators.required]),
        departmentIds: new FormControl(null, [Validators.required])
      }
    );
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;
    this.businessData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = data;
      this.filterColumns.businessIds.dataSource = data;
      this.defaultOrganizations = data.map((list) => list.id);
    });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!this.isClearAll) {
        this.selectedOrganizations = this.organizations?.filter((x) => data?.includes(x.id));
        let regionFilter: regionFilter = {
          ids: data,
          getAll: true
        };
        this.store.dispatch(new GetRegionsByOrganizations(regionFilter));
      }
      else {
        this.isClearAll = false;
      }
    });
    this.regionIdControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.regionIdControl.value.length > 0) {
        this.selectedRegions = this.regions?.filter((object) => data?.includes(object.id));
        let locationFilter: LocationsByRegionsFilter = {
          ids: data,
          getAll: true
        };
        this.store.dispatch(new GetLocationsByRegions(locationFilter));
      }
    });
    this.locationIdControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.locationIdControl.value.length > 0) {
        this.selectedLocations = this.locations?.filter((object) => data?.includes(object.id));
        let departmentFilter: DepartmentsByLocationsFilter = {
          ids: data,
          getAll: true
        };
        this.store.dispatch(new GetDepartmentsByLocations(departmentFilter));
      }
    });
    this.departmentIdControl = this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.selectedDepartments = this.departments?.filter((object) => data?.includes(object.departmentId));
      if (this.isInitialLoad) {
        this.SearchReport();
        this.isInitialLoad = false;
      }
    });
    this.onOrganizationsChange();
    this.onRegionsChange();
    this.onLocationsChange();
  }

  public SearchReport(): void {
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { startDate, endDate } = this.overallStatusReportForm.getRawValue();
    this.paramsData =
    {
      "OrganizationParamOASR": this.selectedOrganizations?.map((list) => list.id),
      "StartDateParamOASR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamOASR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamOASR": this.selectedRegions?.map((list) => list.id),
      "LocationParamOASR": this.selectedLocations?.map((list) => list.id),
      "DepartmentParamOASR": this.selectedDepartments?.map((list) => list.departmentId),
      "BearerParamOASR": auth,
      "BusinessUnitIdParamOASR": window.localStorage.getItem("lastSelectedOrganizationId") == null 
                                ?this.organizations!=null &&this.organizations[0]?.id!=null?
                                this.organizations[0].id.toString():"1": 
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
        valueField: 'departmentName',
        valueId: 'departmentId',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text }
    }
  }
  private onOrganizationsChange(): void {
    this.regions$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Region[]) => {
        if (data != undefined) {
          this.regions = data;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.defaultRegions = data.map((list) => list.id);
          this.defaultLocations = [];
          this.defaultDepartments = [];
        }
      });
  }
  private onRegionsChange(): void {
    this.locations$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Location[]) => {
        if (data != undefined) {
          this.locations = data;
          this.filterColumns.locationIds.dataSource = this.locations;
          this.defaultLocations = data.map((list) => list.id);
          this.defaultDepartments = [];
        }
      });
  }
  private onLocationsChange(): void {
    this.departments$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: Department[]) => {
        if (data != undefined) {
          this.departments = data;
          this.filterColumns.departmentIds.dataSource = this.departments;
          this.defaultDepartments = data.map((list) => list.departmentId);
        }
      });
  }
  public showFilters(): void {
    this.onFilterControlValueChangedHandler();
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.overallStatusReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([]);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.overallStatusReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.overallStatusReportForm.markAllAsTouched();
    if (this.overallStatusReportForm?.invalid) {
      return;
    }
    this.filteredItems = this.filterService.generateChips(this.overallStatusReportForm, this.filterColumns);
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
}
