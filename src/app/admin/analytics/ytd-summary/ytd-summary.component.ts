import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {GetCommonReportFilterOptions,  GetLogiReportData,ClearLogiReportState} from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { ytdSummaryConstants, analyticsConstants, Month, Year } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SkillCategoryDto } from '../models/common-report.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-ytd-summary',
  templateUrl: './ytd-summary.component.html',
  styleUrls: ['./ytd-summary.component.scss']
})
export class YtdSummaryComponent implements OnInit, OnDestroy {
  public title: string = "YTD Summary";

  public paramsData: any = {

    "HostName": "",
    "BearerParamYTDS": "",
    "BusinessUnitIdParamYTDS": "",
    "OrganizationsYTDS": "",
    "regionYTDS": "",
    "locationYTDS": "",
    "departmentYTDS": "",
    "skillCategoryYTDS": "",
    "skillYTDS": "",
    "yearYTDS": "",
    "monthYTDS": "",
    "organizationNameYTDS": "",
    "reportPulledMessageYTDS":""
    
  };


  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/YTDSummary/YTDSummary.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/YTDSummary/YTDSummary.cat" };

  public message: string = "";
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

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.commonReportFilterData)
  public financialTimeSheetFilterData$: Observable<CommonReportFilterOptions>;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];



  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedDepartments: Department[];
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public ytdSummaryReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;

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
  public defaultSkillCategories: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public defaultSkills: (number | undefined)[] = [];
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;

  public yearList: Year[] = [];
  public monthList: Month[] = [];

  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone,
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
      this.loadYearAndMonth();
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();
      this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.isAlive = false;
          this.filterOptionsData = data;
          this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
          this.filterColumns.skillIds.dataSource = [];
          this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
          this.defaultSkills = data.masterSkills.map((list) => list.id)
          let currentDate = new Date();
          this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.Month)?.setValue(currentDate.getMonth() + 1);
          this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.Year)?.setValue(currentDate.getFullYear());
          if (this.isInitialLoad) {            
            setTimeout(() => { this.SearchReport(); }, 3000)
            this.isInitialLoad = false;
          }

          this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.SkillCategoryIds)?.setValue(this.defaultSkillCategories);
          this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
        }
      });
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
      this.onFilterSkillCategoryChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.BusinessIds)?.enable() : this.ytdSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    this.ytdSummaryReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        year: new FormControl([], [Validators.required]),
        month: new FormControl([], [Validators.required]),
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  private loadYearAndMonth(): void {
    this.yearList = [];
    this.monthList =[]
    let currentYear = (new Date()).getFullYear();
    for (let i = 3; i >= 1; i--) {
      this.yearList.push({ id: currentYear - i, name: (currentYear - i).toString() });
    }
    this.yearList.push({ id: currentYear, name: currentYear.toString() })
    for (let i = 1; i <= 5; i++) {
      this.yearList.push({ id: currentYear + i, name: (currentYear + i).toString() })
    }

    this.monthList.push({ id: 1, name: 'January' });
    this.monthList.push({ id: 2, name: 'February' });
    this.monthList.push({ id: 3, name: 'March' });
    this.monthList.push({ id: 4, name: 'April' });
    this.monthList.push({ id: 5, name: 'May' });
    this.monthList.push({ id: 6, name: 'June' });
    this.monthList.push({ id: 7, name: 'July' });
    this.monthList.push({ id: 8, name: 'August' });
    this.monthList.push({ id: 9, name: 'September' });
    this.monthList.push({ id: 10, name: 'October' });
    this.monthList.push({ id: 11, name: 'November' });
    this.monthList.push({ id: 12, name: 'December' });
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
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

          if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
            this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          }
          else {
            this.isResetFilter = true;
          }
          let businessIdData = [];
          businessIdData.push(data);
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };
          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          if (this.isInitialLoad) {
            setTimeout(() => { this.SearchReport() }, 3000);
            this.isInitialLoad = false;
          }
          this.changeDetectorRef.detectChanges();
        }
        else {
          this.isClearAll = false;
          this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.LocationIds)?.setValue([]);
      this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.LocationIds)?.setValue([]);
        this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }

  public onFilterSkillCategoryChangedHandler(): void {
    this.skillCategoryIdControl = this.ytdSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
      }
      else {
        this.ytdSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.ytdSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
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
    let { departmentIds, locationIds,regionIds, skillCategoryIds, skillIds, year, month} = this.ytdSummaryReportForm.getRawValue();

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
     // locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
      //departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);

      
    //regionIds.length > 0 ? regionIds.join(",") : this.regionsList?.length > 0 ? this.regionsList.map(x => x.id).join(",") : "null";
    //locationIds = locationIds.length > 0 ? locationIds : this.locationsList?.length > 0 ? this.locationsList.map(x => x.id).join(",") : "null";
    //departmentIds = departmentIds.length > 0 ? departmentIds : this.departmentsList?.length > 0 ? this.departmentsList.map(x => x.id).join(",") : "null";


    let currentDate = new Date(Date.now());
    let selectedMonthDate = new Date(year, month, 0);

    this.paramsData =
    {
      "HostName": this.baseUrl,
      "BearerParamYTDS": auth,
      "BusinessUnitIdParamYTDS": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "OrganizationsYTDS": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "regionYTDS": regionIds.length == 0 ? "null" : regionIds,
      "locationYTDS": locationIds.length == 0 ? "null" : locationIds,
      "departmentYTDS": departmentIds.length == 0 ? "null" : departmentIds,
      "skillCategoryYTDS": skillCategoryIds.length == 0 ? "null" : skillCategoryIds.join(","),
      "skillYTDS": skillIds.length == 0 ? "null" : skillIds.join(","),
      "yearYTDS": year,
      "monthYTDS": month,

      "organizationNameYTDS": this.filterColumns.businessIds.dataSource?.find((item: any) => item.organizationId?.toString() === this.selectedOrganizations?.map((list) => list.organizationId).join(",")).name,
      "reportPulledMessageYTDS": "Data for 01/01/" + year.toString() + " - " + String(selectedMonthDate.getMonth() + 1).padStart(2, '0') + "/" + selectedMonthDate.getDate() + "/" + year.toString() + " pulled on " + String(currentDate.getMonth() + 1).padStart(2, '0') + "/" + currentDate.getDate() + "/" + currentDate.getFullYear().toString()
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
      skillCategoryIds: {
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
      year: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
          dataSource: [],
            valueField: 'name',
              valueId: 'id',
      },
      month: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      }
    }
  }
  public showFilters(): void {
    if (this.isResetFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.ytdSummaryReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.LocationIds)?.setValue([]);
    this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.SkillCategoryIds)?.setValue(this.defaultSkillCategories);
    this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
    this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.Year)?.setValue([]);
    this.ytdSummaryReportForm.get(ytdSummaryConstants.formControlNames.Month)?.setValue([]);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.filterColumns.locationIds.dataSource = [];
    this.filterColumns.departmentIds.dataSource = [];
  }
  public onFilterApply(): void {
    let { regionIds, locationIds, departmentIds, agingGroupIds } = this.ytdSummaryReportForm.getRawValue();

    regionIds = regionIds.length > 0 ? regionIds.join(",") : this.regionsList?.length > 0 ? this.regionsList.map(x => x.id).join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : this.locationsList?.length > 0 ? this.locationsList.map(x => x.id).join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : this.departmentsList?.length > 0 ? this.departmentsList.map(x => x.id).join(",") : "null";

    if (!(regionIds.length > 0 && locationIds.length > 0 && departmentIds.length > 0)) {

      this.ytdSummaryReportForm.markAllAsTouched();
      if (this.ytdSummaryReportForm?.invalid) {
        return;
      }
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch([new ShowToast(MessageTypes.Error, error)]);
    return;
  }
}
