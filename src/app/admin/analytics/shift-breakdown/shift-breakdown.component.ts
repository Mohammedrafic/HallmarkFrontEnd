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
  GetCommonReportFilterOptions,
  GetSkillsbyDepartment,
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
  CommonReportFilterOptions,
  StaffScheduleReportFilterOptions,
} from '../models/common-report.model';
import { YEARANDMONTH_Validation } from '@shared/constants/messages';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-shift-breakdown',
  templateUrl: './shift-breakdown.component.html',
  styleUrls: ['./shift-breakdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShiftBreakdownComponent implements OnInit {
  public allOption: string = "All";

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
  selectedLocation: boolean;
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
  public shiftBreakdownForm: FormGroup;
  public reportName: LogiReportFileDetails = {
    name: '/IRPReports/ShiftBreakDown/ShiftBreakDownPieChart.cls',
  };
  public catelogName: LogiReportFileDetails = { name: '/IRPReports/ShiftBreakDown/ShiftBreakDown.cat' };
  public title = 'Shift Breakdown Report';
  public message = '';
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };
  remoteWaterMark = 'e.g. Andrew Fuller';
  public showSummary:boolean = true;

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
  public filterOptionData: CommonReportFilterOptions;

  private unsubscribe$: Subject<void> = new Subject();
  private agencyOrganizationId: number;
  private previousOrgId = 0;  
  private isAlive = true;

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;

  @Select(LogiReportState.commonReportFilterData)
  public CommonReportFilterData$: Observable<CommonReportFilterOptions>;

  @Select(LogiReportState.skillbydepartment)
  skillbydepartment$: Observable<any>;

  get startMonthControl(): AbstractControl { 
    return this.shiftBreakdownForm.get('startMonth') as AbstractControl; 
  }
  get endMonthControl(): AbstractControl { 
    return this.shiftBreakdownForm.get('endMonth') as AbstractControl; 
  }
  get startYearControl(): AbstractControl { 
    return this.shiftBreakdownForm.get('startYear') as AbstractControl; 
  }
  get endYearControl(): AbstractControl { 
    return this.shiftBreakdownForm.get('endYear') as AbstractControl; 
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
      this.onFilterDepartmentChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark
        ? this.shiftBreakdownForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        : this.shiftBreakdownForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
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
    this.shiftBreakdownForm = this.formBuilder.group({
      businessIds: new FormControl([Validators.required]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
      skillIds: new FormControl([]),
      startMonth: new FormControl(1),
      endMonth: new FormControl(12),
      startYear: new FormControl(currentYear),
      endYear: new FormControl(currentYear),
      ViewType: new FormControl('0')
    });
  }

  public showFilters(): void {
    if (this.isLoadNewFilter) {
      this.handleFilterControlValueChange();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public handleFilterControlValueChange(): void {
    this.bussinessControl = this.shiftBreakdownForm.get(
      analyticsConstants.formControlNames.BusinessIds
    ) as AbstractControl;

    this.organizationData$
      .pipe(filter((data) => data != null && data.length > 0), takeUntil(this.unsubscribe$))
      .subscribe((data) => {      
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.shiftBreakdownForm
          .get(analyticsConstants.formControlNames.BusinessIds)
          ?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();      
    });

    this.onBusinessControlValueChanged();
  }

  private onBusinessControlValueChanged(){
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.shiftBreakdownForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
                (location) => location.regionId === obj.id && this.checkActiveDate(location.inactiveDate, location.reactivateDate));
            })
            .reduce((a, b) => a.concat(b), []);
            departmentsList = locationsList
            .map((obj) => {
              return obj.departments.filter(
                (department) => department.locationId === obj.id && this.checkActiveDate(department.inactiveDate, department.reactivateDate));
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
          this.shiftBreakdownForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  checkActiveDate(inactivateDate?:string, reactivateDate?:string){
    return this.selectedLocation = inactivateDate == null || (new Date != null && inactivateDate && reactivateDate)
          ? formatDate(inactivateDate!,'yyyy-MM-dd','en_US') > formatDate(new Date,'yyyy-MM-dd','en_US') ||
          formatDate(reactivateDate!,'yyyy-MM-dd','en_US') <= formatDate(new Date,'yyyy-MM-dd','en_US')
          : inactivateDate == null || (new Date != null && inactivateDate && !reactivateDate)
          ? formatDate(inactivateDate!,'yyyy-MM-dd','en_US') > formatDate(new Date,'yyyy-MM-dd','en_US')
          : inactivateDate == null

  }

  private loadShiftData(businessUnitId: number) {
    const businessIdData = [];
    businessIdData.push(businessUnitId);
    const filterObj: CommonReportFilter = {
      businessUnitIds: businessIdData,
    };
    this.store.dispatch(new GetCommonReportFilterOptions(filterObj));
    this.CommonReportFilterData$.pipe(filter((data) => data !== null), takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions) => {
        this.isAlive = false;
        this.filterOptionData = data;
        this.filterColumns.skillIds.dataSource = [];
        this.filterColumns.skillIds.dataSource = data?.masterSkills;
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
    this.filterService.removeValue(event, this.shiftBreakdownForm, this.filterColumns);
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.shiftBreakdownForm.get(
      analyticsConstants.formControlNames.RegionIds
    ) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.shiftBreakdownForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.shiftBreakdownForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter((i) => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;        
      } else {
        this.filterColumns.locationIds.dataSource = [];
        this.shiftBreakdownForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.shiftBreakdownForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.shiftBreakdownForm.get(
      analyticsConstants.formControlNames.LocationIds
    ) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.shiftBreakdownForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter((i) => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      } else {
        this.filterColumns.departmentIds.dataSource = [];
        this.shiftBreakdownForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterDepartmentChangedHandler(): void {
    this.departmentIdControl = this.shiftBreakdownForm.get(
      analyticsConstants.formControlNames.DepartmentIds
    ) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.shiftBreakdownForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      if (this.departmentIdControl.value.length > 0) {
        this.store.dispatch(new GetSkillsbyDepartment(data))
        this.skillbydepartment$.pipe(takeUntil(this.unsubscribe$)).subscribe((skills: any[]) => {
          if(skills && skills.length > 0){
            this.filterColumns.skillIds.dataSource = sortByField(skills, "name");
          } else {
            this.filterColumns.skillIds.dataSource = [];
            this.shiftBreakdownForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(null);
          }
          this.changeDetectorRef.markForCheck();
        });
      } else {
        this.filterColumns.skillIds.dataSource = [];
        this.shiftBreakdownForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }


  public onFilterClearAll(): void {
    const currentYear = new Date().getFullYear();    
    this.shiftBreakdownForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.shiftBreakdownForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.shiftBreakdownForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.shiftBreakdownForm.get('skillIds')?.setValue([]);
    this.shiftBreakdownForm.get('startMonth')?.setValue(1);
    this.shiftBreakdownForm.get('endMonth')?.setValue(12);
    this.shiftBreakdownForm.get('startYear')?.setValue(currentYear);
    this.shiftBreakdownForm.get('endYear')?.setValue(currentYear);
    this.shiftBreakdownForm.get('ViewType')?.setValue('0');
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;

    this.changeDetectorRef.detectChanges();
  }

  public onFilterApply(): void {
    this.shiftBreakdownForm.markAllAsTouched();
    if (this.shiftBreakdownForm?.invalid) {
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
    } = this.shiftBreakdownForm.getRawValue();
    if (!this.shiftBreakdownForm.dirty) {
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
    if(startYear > endYear){
      this.showErrorMessage();
    } else if(startYear === endYear){
      if(startMonth <= endMonth){
        this.filterCall();  
      } else {
        this.showErrorMessage();
      }
    } else if(startYear < endYear){
      this.filterCall();
    }
  }

  showErrorMessage() {
    this.store.dispatch(new ShowToast(MessageTypes.Error, YEARANDMONTH_Validation));
  }

  filterCall() {
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

  chartChanged(name:string, event:any):void {
    if(name == "Detail"){
      this.reportName = {
        name: '/IRPReports/ShiftBreakDown/ShiftBreakDownLineChart.cls',
      };
    } else {
      this.reportName = {
        name: '/IRPReports/ShiftBreakDown/ShiftBreakDownPieChart.cls',
      };
    }
    this.changeDetectorRef.detectChanges();
  }
}
