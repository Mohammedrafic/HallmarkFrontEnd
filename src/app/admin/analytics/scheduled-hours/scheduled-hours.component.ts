import { EmitType } from '@syncfusion/ej2-base';
import { CommonCandidateSearchFilter, CommonReportFilter } from './../models/common-report.model';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ChangeDetectorRef, NgZone, Inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { ClearLogiReportState, GetStaffListReportCandidateSearch, GetStaffScheduleReportFilterOptions } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { FilteredItem } from '@shared/models/filter.model';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { User } from '@shared/models/user.model';
import { Department, Organisation, Region, Location } from '@shared/models/visibility-settings.model';
import { FilterService } from '@shared/services/filter.service';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { uniqBy } from 'lodash';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { analyticsConstants } from '../constants/analytics.constant';
import { SearchCandidate, StaffScheduleReportFilterOptions } from '../models/common-report.model';
import { MessageTypes } from '@shared/enums/message-types';
import { OutsideZone } from '@core/decorators';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-scheduled-hours',
  templateUrl: './scheduled-hours.component.html',
  styleUrls: ['./scheduled-hours.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduledHoursComponent implements OnInit, OnDestroy {
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
  private isAlive: boolean = true;
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  public defaultOrganizations: number;
  public paramsData: any = {
    OrganizationParam: '',    
    LocationsParam: '',
    DepartmentsParam: '',
    SkillsParam: '',
    WorkCommitmentsParam: '',
    EmployeeParam: '',
    StartDateParam: '',
    EndDateParam: '',
    IncludeOnCallParam:'',
    ShowAllParam:''
  };
  public scheduledHoursReportForm: FormGroup;
  RegularReportName: string = '/IRPReports/ScheduledHoursReport/ScheduleHoursPageReport.cls'

  public reportName: LogiReportFileDetails = {
    name: this.RegularReportName,
  };
  public catelogName: LogiReportFileDetails = { name: '/IRPReports/ScheduledHoursReport/ScheduledHoursReport.cat' };
  public title: string = 'Scheduled Hours';
  public message: string = '';
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @Select(LogiReportState.getStaffScheduleReportOptionData)
  public staffScheduleReportFilterData$: Observable<StaffScheduleReportFilterOptions>;

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
  public candidateFilterData: { [key: number]: SearchCandidate }[] = [];
  candidateSearchData: SearchCandidate[] = [];

  public filterOptionData: StaffScheduleReportFilterOptions;

  get startDateControl(): AbstractControl { 
    return this.scheduledHoursReportForm.get('startDate') as AbstractControl; 
  }

  get endDateControl(): AbstractControl { 
    return this.scheduledHoursReportForm.get('endDate') as AbstractControl; 
  }

  constructor(
    private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
    @Inject(APP_SETTINGS) private appSettings: AppSettings
  ) {
    this.baseUrl = this.appSettings.host.replace('https://', '').replace('http://', '');
    this.store.dispatch(new SetHeaderState({ title: 'Analytics', iconName: 'pie-chart' }));
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
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark
        ? this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        : this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
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
      skillIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      employeeName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      workCommitmentIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      showOnlyDepartmentUnassignedCandidates: {
        type: ControlTypes.Checkbox,
        valueType: ValueType.Text,
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
    };
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.scheduledHoursReportForm.get(
      analyticsConstants.formControlNames.BusinessIds
    ) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.scheduledHoursReportForm
          .get(analyticsConstants.formControlNames.BusinessIds)
          ?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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

          let businessIdData = [];
          businessIdData.push(data);
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData,
          };
          this.store.dispatch(new GetStaffScheduleReportFilterOptions(filter));
          this.staffScheduleReportFilterData$
            .pipe(takeWhile(() => this.isAlive))
            .subscribe((data: StaffScheduleReportFilterOptions | null) => {
              if (data != null) {
                this.isAlive = false;
                this.filterOptionData = data;
                this.filterColumns.skillIds.dataSource = this.filterOptionData.masterSkills;
                this.filterColumns.workCommitmentIds.dataSource = this.filterOptionData.masterWorkCommitments;
                this.changeDetectorRef.detectChanges();

                if (this.isInitialLoad) {
                    this.SearchReport();
                  this.isInitialLoad = false;
                }
              }
            });

          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        } else {
          this.isClearAll = false;
          this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.scheduledHoursReportForm.get(
      analyticsConstants.formControlNames.RegionIds
    ) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter((i) => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        // this.departments = this.locations
        //   .map((obj) => {
        //     return obj.departments.filter((department) => department.locationId === obj.id);
        //   })
        //   .reduce((a, b) => a.concat(b), []);
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.scheduledHoursReportForm.get(
      analyticsConstants.formControlNames.LocationIds
    ) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter((i) => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  private initForm(): void {
    let startDate = this.getLastWeek();
    let first = startDate.getDate() - startDate.getDay();
    let firstday = new Date(startDate.setDate(first));
    let lastday = new Date(startDate.setDate(startDate.getDate()+6));
    startDate = firstday;
    let endDate = lastday;
    this.scheduledHoursReportForm = this.formBuilder.group({
      businessIds: new FormControl([Validators.required]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
      skillIds: new FormControl([]),
      workCommitmentIds: new FormControl([]),
      employeeName: new FormControl(''),
      startDate: new FormControl(startDate, [Validators.required]),
      endDate: new FormControl(endDate, [Validators.required]),
      includeOnCallHours: false,
      showAll: false
    });
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.scheduledHoursReportForm, this.filterColumns);
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = this.getLastWeek();
    let first = startDate.getDate() - startDate.getDay();
    let firstday = new Date(startDate.setDate(first));
    let lastday = new Date(startDate.setDate(startDate.getDate()+6));
    startDate = firstday;
    let endDate = lastday;
    this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.scheduledHoursReportForm.get('skillIds')?.setValue([]);
    this.scheduledHoursReportForm.get('workCommitmentIds')?.setValue([]);
    this.scheduledHoursReportForm.get('employeeName')?.setValue('');
    this.scheduledHoursReportForm.get('showAll')?.setValue(false);
    this.scheduledHoursReportForm.get('includeOnCallHours')?.setValue(false);
    this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.scheduledHoursReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(endDate);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
    
    this.changeDetectorRef.detectChanges();
  }

  public showFilters(): void {
    if (this.isLoadNewFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterApply(): void {
    this.scheduledHoursReportForm.markAllAsTouched();
    if (this.scheduledHoursReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public SearchReport(): void {
    this.filteredItems = [];

    let {
      businessIds,
      departmentIds,
      locationIds,
      regionIds,
      employeeName,
      workCommitmentIds,
      skillIds,
      startDate,
      endDate,
      showAll,
      includeOnCallHours
    } = this.scheduledHoursReportForm.getRawValue();
    if (!this.scheduledHoursReportForm.dirty) {
      this.message = 'Default filter selected with all regions, locations and departments.';
    } else {
      this.isResetFilter = false;
      this.message = '';
    }

    let regions = 
        regionIds.length > 0 
        ? regionIds
        : this.regionsList.map((i) => i.id);
      
    let locations = 
        locationIds.length > 0 
        ? locationIds
        : (regionIds.length > 0 
          ? this.locationsList.filter((i) => regionIds?.includes(i.regionId)).map((i) => i.id)
          : this.locationsList.map((i) => i.id));

    departmentIds = departmentIds.length > 0 ? departmentIds.join(',') : '';      
    skillIds = skillIds.length > 0 ? skillIds.join(',') : '';
    workCommitmentIds = workCommitmentIds.length > 0 ? workCommitmentIds.join(',') : '';
    let employeeId = employeeName != null && employeeName != '' ? parseInt(employeeName) : 0;    
    
    this.paramsData = {
      OrganizationParam: this.selectedOrganizations?.map((list) => list.organizationId).join(','),      
      LocationsParam: locations,
      DepartmentsParam: departmentIds,
      SkillsParam: skillIds,
      WorkCommitmentsParam: workCommitmentIds,
      EmployeeParam: employeeId,
      StartDateParam: formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      EndDateParam: formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      IncludeOnCallParam: includeOnCallHours,
      ShowAllParam: showAll
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }

  getLastWeek() {
    var today = new Date(Date.now());
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  };
  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids,
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetStaffListReportCandidateSearch(filter)).subscribe((result) => {
        this.candidateFilterData = result.LogiReport.searchCandidates;
        this.candidateSearchData = result.LogiReport.searchCandidates;
        this.filterColumns.dataSource = this.candidateFilterData;
        // pass the filter data source to updateData method.
        e.updateData(this.candidateFilterData);
      });
    }
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();  
    this.isAlive = false;  
  }
}
