import { GetStaffListReportCandidateSearch } from './../../../organization-management/store/logi-report.action';
import { EmitType } from '@syncfusion/ej2-base';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
  Inject,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { FilteredItem } from '@shared/models/filter.model';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { User } from '@shared/models/user.model';
import { Organisation, Location, Region, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { FilterService } from '@shared/services/filter.service';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { SecurityState } from 'src/app/security/store/security.state';
import { UserState } from 'src/app/store/user.state';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import {
  CommonCandidateSearchFilter,
  CommonReportFilter,
  SearchCandidate,
  StaffScheduleReportFilterOptions,
} from '../models/common-report.model';
import { analyticsConstants } from '../constants/analytics.constant';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { OutsideZone } from '@core/decorators';
import {
  ClearLogiReportState,
  GetCommonReportCandidateSearch,
  GetStaffScheduleReportFilterOptions,
} from '@organization-management/store/logi-report.action';
import { formatDate } from '@angular/common';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { MessageTypes } from '@shared/enums/message-types';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { uniqBy } from 'lodash';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';

@Component({
  selector: 'app-staff-list',
  templateUrl: './staff-list.component.html',
  styleUrls: ['./staff-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffListComponent implements OnInit {
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
    RegionsParam: '',
    LocationsParam: '',
    DepartmentsParam: '',
    SkillsParam: '',
    WorkCommitmentsParam: '',
    CandidateParam: '',
    ShowDepartmentUnassignedParam:''
  };
  public staffListReportForm: FormGroup;
  RegularReportName: string = '/IRPReports/StaffListReport/StaffList_PageReport.cls'
  DeptUnassignedReportName: string = '/IRPReports/StaffListReport/StaffList_PageReport2.cls'
  public reportName: LogiReportFileDetails = {
    name: this.RegularReportName,
  };
  public catelogName: LogiReportFileDetails = { name: '/IRPReports/StaffListReport/StaffListReport.cat' };
  public title: string = 'Staff List';
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
          this.logiReportComponent.SetReportData(data);
        }
      });
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark
        ? this.staffListReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        : this.staffListReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
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
    this.bussinessControl = this.staffListReportForm.get(
      analyticsConstants.formControlNames.BusinessIds
    ) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.staffListReportForm
          .get(analyticsConstants.formControlNames.BusinessIds)
          ?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.staffListReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
                console.log(data);
                this.filterOptionData = data;
                console.log(this.filterOptionData)
                this.filterColumns.skillIds.dataSource = this.filterOptionData.masterSkills;
                this.filterColumns.workCommitmentIds.dataSource = this.filterOptionData.masterWorkCommitments;
                this.changeDetectorRef.detectChanges();

                if (this.isInitialLoad) {
                  setTimeout(() => {
                    this.SearchReport();
                  }, 3000);
                  this.isInitialLoad = false;
                }
              }
            });

          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        } else {
          this.isClearAll = false;
          this.staffListReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
    this.regionIdControl = this.staffListReportForm.get(
      analyticsConstants.formControlNames.RegionIds
    ) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.staffListReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.staffListReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.staffListReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.staffListReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.staffListReportForm.get(
      analyticsConstants.formControlNames.LocationIds
    ) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.staffListReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter((i) => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.staffListReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  private initForm(): void {
    let startDate = this.getLastWeek();
    let first = startDate.getDate() - startDate.getDay();
    let last = first + 6;
    let firstday = new Date(startDate.setDate(first));
    let lastday = new Date(startDate.setDate(last));
    startDate = firstday;
    let endDate = lastday;
    this.staffListReportForm = this.formBuilder.group({
      businessIds: new FormControl([Validators.required]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
      skillIds: new FormControl([]),
      workCommitmentIds: new FormControl([]),
      employeeName: new FormControl(''),
      showOnlyDepartmentUnassignedCandidates: false,
    });
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.staffListReportForm, this.filterColumns);
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
    this.staffListReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.staffListReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.staffListReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.staffListReportForm.get('skillIds')?.setValue([]);
    this.staffListReportForm.get('workCommitmentIds')?.setValue([]);
    this.staffListReportForm.get('employeeName')?.setValue('');
    this.staffListReportForm.get('showOnlyDepartmentUnassignedCandidates')?.setValue(false);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }

  public showFilters(): void {
    if (this.isLoadNewFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterApply(): void {
    this.staffListReportForm.markAllAsTouched();
    if (this.staffListReportForm?.invalid) {
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
      showOnlyDepartmentUnassignedCandidates
    } = this.staffListReportForm.getRawValue();
    if (!this.staffListReportForm.dirty) {
      this.message = 'Default filter selected with all regions, locations and departments.';
    } else {
      this.isResetFilter = false;
      this.message = '';
    }

    regionIds =
      regionIds.length > 0
        ? regionIds.join(',')
        : this.regionsList?.length > 0
        ? this.regionsList.map((x) => x.id).join(',')
        : '';
    locationIds =
      locationIds.length > 0
        ? locationIds
        : this.locationsList?.length > 0
        ? this.locationsList.map((x) => x.id).join(',')
        : '';
    departmentIds =
      departmentIds.length > 0
        ? departmentIds
        : this.departmentsList?.length > 0
        ? this.departmentsList.map((x) => x.id).join(',')
        : '';
    skillIds = skillIds.length > 0 ? skillIds.join(',') : '';
    workCommitmentIds = workCommitmentIds.length > 0 ? workCommitmentIds.join(',') : '';
    let employeeId = employeeName != null && employeeName != '' ? parseInt(employeeName) : 0;    
    
    if(showOnlyDepartmentUnassignedCandidates)
      this.reportName.name = this.DeptUnassignedReportName; 
    else this.reportName.name = this.RegularReportName; 

    this.paramsData = {
      OrganizationParam: this.selectedOrganizations?.map((list) => list.organizationId).join(','),
      RegionsParam: regionIds,
      LocationsParam: locationIds,
      DepartmentsParam: departmentIds,
      SkillsParam: skillIds,
      WorkCommitmentsParam: workCommitmentIds,
      CandidateParam: employeeId,
      ShowDepartmentUnassignedParam: showOnlyDepartmentUnassignedCandidates
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
}

