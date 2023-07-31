import { ScheduleCandidate, ScheduleCandidatesPage } from 'src/app/modules/schedule/interface/schedule.interface';
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
import {
  ClearLogiReportState,
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
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { uniqBy } from 'lodash';
import { filter, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { analyticsConstants } from '../constants/analytics.constant';
import {
  CommonReportFilter,
  StaffScheduleReportFilterOptions,
} from '../models/common-report.model';

@Component({
  selector: 'app-agency-spend',
  templateUrl: './agency-spend.component.html',
  styleUrls: ['./agency-spend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgencySpendComponent implements OnInit {
  public baseUrl= '';
  public user: User | null;
  public filterColumns:any = {};
  public filteredItems: FilteredItem[] = [];
  public defaultRegions: (number | undefined)[] = [];
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public isClearAll = false;
  public isResetFilter = false;
  public isLoadNewFilter = false;
  public isInitialLoad = false;
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
  public organizations: Organisation[] = [];
  public regionsList: Region[] = [];
  public locationsList: Location[] = [];
  public departmentsList: Department[] = [];
  public defaultOrganizations: number;
  public paramsData = {
    OrganizationParam: '',
    DepartmentId: '',
    StartMonth: '',
    StartYear: '',
    EndMonth: '',
    EndYear: '',
    SkillsId: '',    
  };
  public agentSpendReportForm: FormGroup;
  public reportName: LogiReportFileDetails = {
    name: '/IRPReports/AgenySpend/AgenySpendSummary.cls',
  };
  public catelogName: LogiReportFileDetails = { name: '/IRPReports/AgenySpend/AgentSpendReport.cat' };
  public title = 'Agency Spend';
  public message = '';
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };
  remoteWaterMark = 'e.g. Andrew Fuller';

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.getStaffScheduleReportOptionData)
  public staffScheduleReportFilterData$: Observable<StaffScheduleReportFilterOptions>;

  @Select(LogiReportState.getEmployeesSearchFromScheduling)
  public employeesSearchFromScheduling$: Observable<ScheduleCandidatesPage>;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  public candidateFilterData: { [key: number]: ScheduleCandidate }[] = [];
  candidateSearchData: ScheduleCandidate[] = [];
  public filterOptionData: StaffScheduleReportFilterOptions;

  private unsubscribe$: Subject<void> = new Subject();
  private agencyOrganizationId: number;
  private previousOrgId = 0;  
  private isAlive = true;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

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
    if (this.user?.id) {
      this.store.dispatch(new GetOrganizationsStructureAll(this.user?.id));
    }
  }

  ngOnInit(): void {
    this.initOrganizationData();
  }

  private initOrganizationData() {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.orderFilterColumnsSetup();
      this.store.dispatch(new ClearLogiReportState());
      this.setReportData();
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.initMonthYearDropdown();
      this.handleFilterControlValueChange();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark
        ? this.agentSpendReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        : this.agentSpendReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private setReportData() {
    this.logiReportData$
    .pipe(filter((data) => data.length > 0), takeUntil(this.unsubscribe$))
    .subscribe((data: ConfigurationDto[]) => {      
      this.logiReportComponent.SetReportData(data);    
    });
  }

  private initMonthYearDropdown(): void{        
    this.populateMonths();
    const yearList = [];
    const currentYear = new Date().getFullYear();
    //Loading year dropdown with past 2 and future 10 years 
    for(let i = currentYear - 2; i <= currentYear + 10; i++){
      yearList.push({ name:i, id:i });
    }

    this.filterColumns.startYear.dataSource = yearList;

    this.filterColumns.endYear.dataSource = yearList;
  }

  private populateMonths() {
    const monthList = [];
    const monthNames = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];
    for (let i=1; i<=monthNames.length;i++) {
      monthList.push({ name:monthNames[i-1], id:i });
    }
    this.filterColumns.startMonth.dataSource = monthList;

    this.filterColumns.endMonth.dataSource = monthList;
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
    const currentYear = new Date().getFullYear();
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
      this.handleFilterControlValueChange();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public handleFilterControlValueChange(): void {
    this.bussinessControl = this.agentSpendReportForm.get(
      analyticsConstants.formControlNames.BusinessIds
    ) as AbstractControl;

    this.organizationData$
      .pipe(filter((data) => data != null && data.length > 0), takeUntil(this.unsubscribe$))
      .subscribe((data) => {      
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.agentSpendReportForm
          .get(analyticsConstants.formControlNames.BusinessIds)
          ?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();      
    });

    this.onBusinessControlValueChanged();
  }

  private onBusinessControlValueChanged(){
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.agentSpendReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      if (data != null && typeof data === 'number' && data != this.previousOrgId) {
        this.previousOrgId = data;
        if (!this.isClearAll) {
          const orgList = this.organizations?.filter((x) => data == x.organizationId);
          this.selectedOrganizations = orgList;
          this.regionsList = [];
          const regionsList: Region[] = [];
          let locationsList: Location[] = [];
          let departmentsList: Department[] = [];
          orgList.forEach((value) => {
            regionsList.push(...value.regions);
            locationsList = regionsList
              .map((obj) => {
                return obj.locations.filter(
                  (location) => location.regionId === obj.id && this.checkInactiveDate(location.inactiveDate));
              })
              .reduce((a, b) => a.concat(b), []);
            departmentsList = locationsList
              .map((obj) => {
                return obj.departments.filter(
                  (department) => department.locationId === obj.id && this.checkInactiveDate(department.inactiveDate));
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
            this.regionsList.length === 0 ||
            this.locationsList.length === 0 ||
            this.departmentsList.length === 0
          ) {
            this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          } else {
            this.isResetFilter = true;
          }
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;  
          
          this.loadShiftData(data);
        } else {
          this.isClearAll = false;
          this.agentSpendReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  checkInactiveDate(dateStr?:string) : boolean {
    if(dateStr == null || dateStr == undefined) {
      return true;
    }
    const date = new Date(dateStr);
    const today = new Date();
    if(date < today) {
      return false;
    }
    return true;
  }

  private loadShiftData(businessUnitId: number) {
    const businessIdData = [];
    businessIdData.push(businessUnitId);
    const filterObj: CommonReportFilter = {
      businessUnitIds: businessIdData,
    };
    this.store.dispatch(new GetStaffScheduleReportFilterOptions(filterObj))
      .pipe(filter((data) => data !== null), takeWhile(() => this.isAlive));                    
    this.staffScheduleReportFilterData$.subscribe((data: StaffScheduleReportFilterOptions) => {        
        this.isAlive = false;
        this.filterOptionData = data;
        this.filterColumns.skillIds.dataSource = [];
        this.filterColumns.skillIds.dataSource = data.masterSkills;
        this.changeDetectorRef.detectChanges();

        if (this.isInitialLoad) {
          this.searchReport();          
          this.isInitialLoad = false;
        }        
      });          
  }

  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = '';
    let error = '';
    if (regionsLength == 0) {
        error = 'Regions/Locations/Departments are required';
    }
    if (locationsLength == 0) {
        error = 'Locations/Departments are required';
    }
    if (departmentsLength == 0) {
        error = 'Departments are required';        
    }
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
    const currentYear = new Date().getFullYear();    
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
    this.validateMonthYear();
    this.agentSpendReportForm.markAllAsTouched();
    if (this.agentSpendReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.searchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public searchReport(): void {
    this.filteredItems = [];

    const {
      departmentIds,          
      skillIds,
      startMonth,
      endMonth,
      startYear,
      endYear,
    } = this.agentSpendReportForm.getRawValue();
    if (!this.agentSpendReportForm.dirty) {
      this.message = 'Default filter selected with all regions, locations and departments.';
    } else {
      this.isResetFilter = false;
      this.message = '';
    }

    let departmentIdParam = '';
    if(departmentIds.length > 0){
        departmentIdParam = departmentIds.join(',');
    }
    else if(this.departmentsList?.length > 0) {
      departmentIdParam = this.departmentsList.map((x) => x.id).join(',');
    }

    const skillIdParam = skillIds.length > 0 ? skillIds.join(',') : '';    
    this.paramsData = {
      OrganizationParam: this.selectedOrganizations?.map((list) => list.organizationId).join(','),
      DepartmentId: departmentIdParam,
      SkillsId: skillIdParam,
      StartMonth: startMonth,
      EndMonth: endMonth,
      StartYear: startYear,
      EndYear: endYear,
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }

  getLastWeek() {
    const today = new Date(Date.now());
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();  
    this.isAlive = false;  
  }

  validateMonthYear(): void {
    const startMonth = this.startMonthControl?.value;
    const endMonth = this.endMonthControl?.value;
    const startYear = this.startYearControl?.value;
    const endYear = this.endYearControl?.value;
    if(endYear < startYear) {
      this.endYearControl.setErrors({validationFailure:true});
    }
    if(endMonth < startMonth && parseInt(startYear) === parseInt(endYear)) {
      this.endMonthControl.setErrors({validationFailure:true});     
    }
  }
}
