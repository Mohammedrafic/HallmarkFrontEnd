import { formatDate } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
  Inject,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { FilteredItem } from '@shared/models/filter.model';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { User } from '@shared/models/user.model';
import { Department, Region, Location, Organisation } from '@shared/models/visibility-settings.model';
import { FilterService } from '@shared/services/filter.service';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { uniqBy } from 'lodash';
import { Observable, Subject, takeUntil } from 'rxjs';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { analyticsConstants } from '../constants/analytics.constant';

@Component({
  selector: 'app-staff-schedule-by-shift',
  templateUrl: './staff-schedule-by-shift.component.html',
  styleUrls: ['./staff-schedule-by-shift.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffScheduleByShiftComponent implements OnInit {
  public baseUrl: string = '';
  public user: User | null;
  public filterColumns: any;
  public filteredItems: FilteredItem[] = [];
  public defaultRegions: (number | undefined)[] = [];
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public isClearAll: boolean = false;
  public isResetFilter: boolean = false;
  public isLoadNewFilter: boolean = false;
  public isInitialLoad: boolean = false;
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  public defaultOrganizations: number;
  public paramsData: any = {
    "OrganizationParam": "",
    "RegionsParam": "",
    "LocationsParam": "",
    "DepartmentsParam": "",
    "StartDateParam": "",
    "EndDateParam": ""
  };
  public staffScheduleReportForm: FormGroup;
  public reportName: LogiReportFileDetails = {
    name: '/IRPReports/StaffScheduleByShift/StaffScheduleByShift_PageReport.cls',
  };
  public catelogName: LogiReportFileDetails = { name: '/IRPReports/StaffScheduleByShift/StaffScheduleByShift.cat' };
  public title: string = 'Staff Schedule By Shift';
  public message: string = '';
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  private unsubscribe$: Subject<void> = new Subject();
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;

  private agencyOrganizationId: number;
  private previousOrgId: number = 0;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public allOption: string = 'All';

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings
  ) {
    this.baseUrl = this.appSettings.host.replace('https://', '').replace('http://', '');
    this.store.dispatch(new SetHeaderState({ title: 'Analytics', iconName: '' }));
    this.initForm();
    this.user = this.store.selectSnapshot(UserState.user);
    if (this.user?.id != null) {
      this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    }
  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.orderFilterColumnsSetup();
      this.store.dispatch(new ClearLogiReportState());
      //this.SetReportData();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          console.log(data);
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark
        ? this.staffScheduleReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        : this.staffScheduleReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
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
    };
  }

  private initForm(): void {
    let startDate = this.getLastWeek();
    let first = startDate.getDate() - startDate.getDay();
    let last = first + 6;
    let firstday = new Date(startDate.setDate(first));
    let lastday = new Date(startDate.setDate(last));
    startDate = firstday;
    let endDate = lastday;
    this.staffScheduleReportForm = this.formBuilder.group({
      businessIds: new FormControl([Validators.required]),
      startDate: new FormControl(startDate, [Validators.required]),
      endDate: new FormControl(endDate, [Validators.required]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
    });
  }

  public showFilters(): void {
    if (this.isLoadNewFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.staffScheduleReportForm.get(
      analyticsConstants.formControlNames.BusinessIds
    ) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.staffScheduleReportForm
          .get(analyticsConstants.formControlNames.BusinessIds)
          ?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.staffScheduleReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        //this.isAlive = true;
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
            locationsList = regionsList
              .map((obj) => {
                return obj.locations.filter((location) => location.regionId === obj.id);
              })
              .reduce((a, b) => a.concat(b), []);
            departmentsList = locationsList
              .map((obj) => {
                return obj.departments.filter((department) => department.locationId === obj.id);
              })
              .reduce((a, b) => a.concat(b), []);
          });

          this.regionsList = sortByField(regionsList, 'name');
          this.locationsList = sortByField(locationsList, 'name');
          this.departmentsList = sortByField(departmentsList, 'name');

          this.masterRegionsList = this.regionsList;
          this.masterLocationsList = this.locationsList;
          this.masterDepartmentsList = this.departmentsList;

          if (
            ((data == null || data <= 0) && this.regionsList.length == 0) ||
            this.locationsList.length == 0 ||
            this.departmentsList.length == 0
          ) {
            this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          } else {
            this.isResetFilter = true;
          }

          if (this.isInitialLoad) {
            setTimeout(() => { this.SearchReport() }, 3000);
            this.isInitialLoad = false;
          }
          this.changeDetectorRef.detectChanges();
          let businessIdData = [];
          businessIdData.push(data);

          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        } else {
          this.isClearAll = false;
          this.staffScheduleReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = '';
    let error: any =
      regionsLength == 0
        ? 'Regions/Locations/Departments are required'
        : locationsLength == 0
        ? 'Locations/Departments are required'
        : departmentsLength == 0
        ? 'Departments are required'
        : '';

    this.store.dispatch(new ShowToast(MessageTypes.Error, error));
    return;
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.staffScheduleReportForm, this.filterColumns);
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.staffScheduleReportForm.get(
      analyticsConstants.formControlNames.RegionIds
    ) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.staffScheduleReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.staffScheduleReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter((i) => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations
          .map((obj) => {
            return obj.departments.filter((department) => department.locationId === obj.id);
          })
          .reduce((a, b) => a.concat(b), []);
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.staffScheduleReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.staffScheduleReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.staffScheduleReportForm.get(
      analyticsConstants.formControlNames.LocationIds
    ) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.staffScheduleReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter((i) => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.staffScheduleReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    // this.departmentIdControl = this.staffScheduleReportForm.get(
    //   analyticsConstants.formControlNames.DepartmentIds
    // ) as AbstractControl;
    // this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
    //   this.departments = this.departments?.filter((object) => data?.includes(object.id));
    // });
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = this.getLastWeek();
    let first = startDate.getDate() - startDate.getDay();
    let last = first + 6;
    let firstday = new Date(startDate.setDate(first));
    let lastday = new Date(startDate.setDate(last));
    startDate = firstday;
    let endDate = lastday;
    this.staffScheduleReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.staffScheduleReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.staffScheduleReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.staffScheduleReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.staffScheduleReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(endDate);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }

  public onFilterApply(): void {
    this.staffScheduleReportForm.markAllAsTouched();
    if (this.staffScheduleReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public SearchReport(): void {
    this.filteredItems = [];

    let { businessIds, departmentIds, locationIds, regionIds, startDate, endDate } =
      this.staffScheduleReportForm.getRawValue();
    if (!this.staffScheduleReportForm.dirty) {
      this.message = 'Default filter selected with all regions, locations and departments.';
    } else {
      this.isResetFilter = false;
      this.message = '';
    }

    locationIds =
      locationIds.length > 0
        ? locationIds.join(',')
        : this.locations?.length > 0
        ? this.locations.map((x) => x.id).join(',')
        : [];
    departmentIds =
      departmentIds.length > 0
        ? departmentIds.join(',')
        : this.departments?.length > 0
        ? this.departments.map((x) => x.id).join(',')
        : [];

    regionIds =
      regionIds.length > 0
        ? regionIds.join(',')
        : this.regionsList?.length > 0
        ? this.regionsList.map((x) => x.id).join(',')
        : 'null';
    locationIds =
      locationIds.length > 0
        ? locationIds
        : this.locationsList?.length > 0
        ? this.locationsList.map((x) => x.id).join(',')
        : 'null';
    departmentIds =
      departmentIds.length > 0
        ? departmentIds
        : this.departmentsList?.length > 0
        ? this.departmentsList.map((x) => x.id).join(',')
        : 'null';
    this.paramsData = {
      OrganizationParam: this.selectedOrganizations?.map((list) => list.organizationId).join(','),
      StartDateParam: formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      EndDateParam: formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      RegionsParam: regionIds.length == 0 ? 'null' : regionIds,
      LocationsParam: locationIds.length == 0 ? 'null' : locationIds,
      DepartmentsParam: departmentIds.length == 0 ? 'null' : departmentIds,
      BusinessUnitIdParamTS: businessIds,
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }

  getLastWeek() {
    var today = new Date(Date.now());
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }
}

