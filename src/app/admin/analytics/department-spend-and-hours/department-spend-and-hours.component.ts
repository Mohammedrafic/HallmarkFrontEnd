import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { FieldSettingsModel} from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetCommonReportFilterOptions, GetLogiReportData, ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { departmentSpendHourReportConstants, analyticsConstants, InvoiceStatus } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SkillCategoryDto } from '../models/common-report.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';
import { Skill } from '@shared/models/skill.model';

@Component({
  selector: 'app-department-spend-and-hours',
  templateUrl: './department-spend-and-hours.component.html',
  styleUrls: ['./department-spend-and-hours.component.scss'],
})
export class DepartmentSpendAndHoursComponent implements OnInit {
  public paramsData: any = {

    "HostNameDS": "",
    "BearerParamDS": "",
    "BusinessUnitIdParamDS": "",
    "DepartmentIdDS": "",
    "LocationIdDS": "",
    "OrganizationIdDS": "",
    "RegionIdDS": "",
    "SkillCategoryDS": "",
    "SkillDS": "",
    "TimsheetServiceDateFromDS": "",
    "TimsheetServiceDateToDS": "",
    "UserIdDS": ""
  };

  public user: User | null;
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/DepartmentSpendAndHours/DepartmentSpendAndHours.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/DepartmentSpendAndHours/DepartmentSpendAndHours.cat" };
  public title: string = "Department Spend & Hours Report";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

  public allOption: string = "All";

  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedRegions: Region[];

  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedLocations: Location[];

  @Select(LogiReportState.departments)
  public departments$: Observable<Department[]>;
  departmentFields: FieldSettingsModel = { text: 'name', value: 'id' };

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  @Select(LogiReportState.commonReportFilterData)
  public grantFilterData$: Observable<CommonReportFilterOptions>;

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  public agencyFields = {
    text: 'agencyName',
    value: 'agencyId',
  };
  selectedAgencies: AssociateAgencyDto[];
  public defaultAgencyIds: (number | undefined)[] = [];

  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  selectedDepartments: Department[];
 

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public departmentspendhourReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl; 
  public agencyIdControl: AbstractControl;
  public agencyData: AssociateAgencyDto[] = [];
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

  public defaultInvoiceStausIds: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public filterOptionsData: CommonReportFilterOptions;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  
  public defaultSkillCategories: (number | undefined)[] = [];
  public defaultSkills: (number | undefined)[] = [];
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
      this.onFilterSkillCategoryChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.BusinessIds)?.enable() : this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }
  

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    this.departmentspendhourReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),       
        agencyIds: new FormControl([]),       
        startDate: new FormControl(startDate,[]),
        endDate: new FormControl(new Date(Date.now()),[]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);


        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
          let businessIdData = [];
          businessIdData.push(data);
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };

          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.grantFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {

            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              let agencyIds = data?.agencies;
              this.selectedAgencies = agencyIds;
              this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
              this.defaultInvoiceStausIds=data?.invoiceStatuses.map((list)=>list.id);
              this.filterOptionsData = data;
                this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
                this.filterColumns.skillIds.dataSource = data.masterSkills;
              // this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
              // this.defaultSkills=data.masterSkills.map((list)=>list.id);
              let masterSkills = this.filterOptionsData.masterSkills;
              // let skills = masterSkills.filter((i) => data.skillCategories.map((list) => list.id)?.includes(i.skillCategoryId));
              // this.filterColumns.skillIds.dataSource = skills;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;

              setTimeout(() => { this.SearchReport() }, 3000);
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.defaultRegions=this.regions.map(x=>x.id);
        }
        else {
          this.isClearAll = false;
          this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  public skillIds: Skill[] = [];
  public onFilterSkillCategoryChangedHandler(): void {
    this.skillIds = [];

    this.skillCategoryIdControl = this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.skillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {

        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
      }
      else {
          this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.skillIds)?.setValue([]);
          let masterSkills = this.filterOptionsData.masterSkills;

          this.filterColumns.skillIds.dataSource = masterSkills;
      }
    });
      this.skillIdControl = this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.skillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });
  }
  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.departmentspendhourReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }


  public SearchReport(): void {
    if (!this.departmentspendhourReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for 30 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
    this.filteredItems = [];
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { departmentIds,locationIds,
      regionIds, startDate, endDate, agencyIds, skillIds,skillCategoryIds } = this.departmentspendhourReportForm.getRawValue();
    

    regionIds = regionIds.length > 0 ? regionIds.join(",") : null;
    locationIds = locationIds.length > 0 ? locationIds.join(",") : null;
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : null;
    
    this.isResetFilter = false;
    let _sDate=formatDate(startDate, 'MM/dd/yyyy', 'en-US')
    let _eDate=formatDate(endDate, 'MM/dd/yyyy', 'en-US')
    this.paramsData =
    {

      "HostNameDS": this.baseUrl,
      "BearerParamDS": auth,
      "BusinessUnitIdParamGR": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),

      "OrganizationIdDS": this.selectedOrganizations.length == 0 ? null : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "RegionIdDS": regionIds == null ? null : regionIds,
      "LocationIdDS": locationIds == null ? null : locationIds,
      "DepartmentIdDS": departmentIds == null ? null : departmentIds,   
      "TimsheetServiceDateFromDS": _sDate ,
      "TimsheetServiceDateToDS": _eDate,
      "SkillDS": skillIds.length == 0 ? null : skillIds.join(","),
      "SkillCategoryDS": skillCategoryIds.length == 0 ? null : skillCategoryIds.join(","),
      "UserIdDS": this.user?.id

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
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      skillIds: {
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
     if (this.isResetFilter) {
      this.onFilterControlValueChangedHandler();
     }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.departmentspendhourReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.RegionIds)?.setValue([]);
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.LocationIds)?.setValue([]);
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.LocationIds)?.setValue([]);
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.DepartmentIds)?.setValue([]);    
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.StartDate)?.setValue(startDate);
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.skillIds)?.setValue([]); 
    this.departmentspendhourReportForm.get(departmentSpendHourReportConstants.formControlNames.skillCategoryIds)?.setValue([]); 
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.departmentspendhourReportForm.markAllAsTouched();
    if (this.departmentspendhourReportForm?.invalid) {
      return;
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
