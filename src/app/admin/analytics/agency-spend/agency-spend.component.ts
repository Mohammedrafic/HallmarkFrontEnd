import { ScheduleCandidate, ScheduleCandidatesPage, ScheduleFilters } from 'src/app/modules/schedule/interface/schedule.interface';
import { EmitType } from '@syncfusion/ej2-base';
import { formatDate } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
  Inject,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import {
  ClearLogiReportState,
  GetCandidateSearchFromScheduling,
  GetCommonReportCandidateSearch,
  GetStaffScheduleReportFilterOptions,
} from '@organization-management/store/logi-report.action';
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
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { uniqBy, isBoolean } from 'lodash';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { analyticsConstants } from '../constants/analytics.constant';
import { OutsideZone } from '@core/decorators';
import {
  CommonCandidateSearchFilter,
  CommonReportFilter,
  SearchCandidate,
  StaffScheduleReportFilterOptions,
} from '../models/common-report.model';

@Component({
  selector: 'app-agency-spend',
  templateUrl: './agency-spend.component.html',
  styleUrls: ['./agency-spend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgencySpendComponent implements OnInit {
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
    DepartmentId: '',
    StartMonth: '',
    StartYear: '',
    EndMonth: '',
    EndYear: '',
    SkillsId: ''    
  };
  public agentSpendReportForm: FormGroup;
  public reportName: LogiReportFileDetails = {
    name: '/IRPReports/AgenySpend/AgenySpendSummary.cls',
  };
  public catelogName: LogiReportFileDetails = { name: '/IRPReports/AgenySpend/AgentSpendReport.cat' };
  public title: string = 'Agency Spend';
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

  @Select(LogiReportState.getEmployeesSearchFromScheduling)
  public employeesSearchFromScheduling$: Observable<ScheduleCandidatesPage>;

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
  public candidateFilterData: { [key: number]: ScheduleCandidate }[] = [];
  candidateSearchData: ScheduleCandidate[] = [];

  public filterOptionData: StaffScheduleReportFilterOptions;

  get startMonthControl(): AbstractControl { 
    return this.agentSpendReportForm.get('startMonth') as AbstractControl; 
  }
  get endMonthControl(): AbstractControl { 
    return this.agentSpendReportForm.get('endMonth') as AbstractControl; 
  }
  get startYearControl(): AbstractControl { 
    return this.agentSpendReportForm.get('startYear') as AbstractControl; 
  }
  get endYearControl(): AbstractControl { 
    return this.agentSpendReportForm.get('endYear') as AbstractControl; 
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
      this.initMonthYearDropdown();
      this.onFilterControlValueChangedHandler();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark
        ? this.agentSpendReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        : this.agentSpendReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initMonthYearDropdown(): void{    
    let monthList:any[] = [];
    let yearList:any[] = [];

    monthList.push({ name:'January', id:1 });
    monthList.push({ name:'February', id:2 });
    monthList.push({ name:'March', id:3 });
    monthList.push({ name:'April', id:4 });
    monthList.push({ name:'May', id:5 });
    monthList.push({ name:'June', id:6 });
    monthList.push({ name:'July', id:7 });
    monthList.push({ name:'August', id:8 });
    monthList.push({ name:'September', id:9 });
    monthList.push({ name:'October', id:10 });
    monthList.push({ name:'November', id:11 });
    monthList.push({ name:'December', id:12 });

    let currentYear = new Date().getFullYear();
    for(let i = currentYear - 2; i <= currentYear + 10; i++){
      yearList.push({ name:i, id:i });
    }

    this.filterColumns.startMonth.dataSource = [];
    this.filterColumns.startMonth.dataSource = monthList;

    this.filterColumns.endMonth.dataSource = [];
    this.filterColumns.endMonth.dataSource = monthList;

    this.filterColumns.startYear.dataSource = [];
    this.filterColumns.startYear.dataSource = yearList;

    this.filterColumns.endYear.dataSource = [];
    this.filterColumns.endYear.dataSource = yearList;
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
      startMonth: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      endMonth: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      startYear: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
      endYear: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
    };
  }

  private initForm(): void {
    let currentYear = new Date().getFullYear();
    this.agentSpendReportForm = this.formBuilder.group({
      businessIds: new FormControl([Validators.required]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
      skillIds: new FormControl([]),
      startMonth: new FormControl(1),
      endMonth: new FormControl(12),
      startYear: new FormControl(currentYear),
      endYear: new FormControl(currentYear),
    });
  }

  public showFilters(): void {
    if (this.isLoadNewFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.agentSpendReportForm.get(
      analyticsConstants.formControlNames.BusinessIds
    ) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.agentSpendReportForm
          .get(analyticsConstants.formControlNames.BusinessIds)
          ?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agentSpendReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
                this.filterColumns.skillIds.dataSource = [];
                this.filterColumns.skillIds.dataSource = data.masterSkills;
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
          this.agentSpendReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
    this.filterService.removeValue(event, this.agentSpendReportForm, this.filterColumns);
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.agentSpendReportForm.get(
      analyticsConstants.formControlNames.RegionIds
    ) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.agentSpendReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.agentSpendReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter((i) => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;        
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.agentSpendReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.agentSpendReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.agentSpendReportForm.get(
      analyticsConstants.formControlNames.LocationIds
    ) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agentSpendReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter((i) => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.agentSpendReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterClearAll(): void {
    let currentYear = new Date().getFullYear();    
    this.agentSpendReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.agentSpendReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.agentSpendReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.agentSpendReportForm.get('skillIds')?.setValue([]);
    this.agentSpendReportForm.get('startMonth')?.setValue(1);
    this.agentSpendReportForm.get('endMonth')?.setValue(12);
    this.agentSpendReportForm.get('startYear')?.setValue(currentYear);
    this.agentSpendReportForm.get('endYear')?.setValue(currentYear);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;

    this.changeDetectorRef.detectChanges();
  }

  public onFilterApply(): void {
    this.agentSpendReportForm.markAllAsTouched();
    if (this.agentSpendReportForm?.invalid) {
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
      skillIds,
      startMonth,
      endMonth,
      startYear,
      endYear
    } = this.agentSpendReportForm.getRawValue();
    if (!this.agentSpendReportForm.dirty) {
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
        ? locationIds.join(',')
        : this.locationsList?.length > 0
        ? this.locationsList.map((x) => x.id).join(',')
        : '';
    departmentIds =
      departmentIds.length > 0
        ? departmentIds.join(',')
        : this.departmentsList?.length > 0
        ? this.departmentsList.map((x) => x.id).join(',')
        : '';
    skillIds = skillIds.length > 0 ? skillIds.join(',') : '';    
    this.paramsData = {
      OrganizationParam: this.selectedOrganizations?.map((list) => list.organizationId).join(','),
      DepartmentId: departmentIds,
      SkillsId: skillIds,
      StartMonth: startMonth,
      EndMonth: endMonth,
      StartYear: startYear,
      EndYear: endYear
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }

  getLastWeek() {
    var today = new Date(Date.now());
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();  
    this.isAlive = false;  
  }
}
