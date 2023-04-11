import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData,
  GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState, GetCommonReportCandidateStatusOptions
} from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { accrualConstants, analyticsConstants } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CandidateStatusAndReasonFilterOptionsDto, CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SearchCandidate, SkillCategoryDto } from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';

@Component({
  selector: 'app-candidate-status',
  templateUrl: './candidate-status.component.html',
  styleUrls: ['./candidate-status.component.scss']
})
export class CandidateStatusComponent implements OnInit {

  public title: string = "Candidate Status";

  public paramsData: any = {

    "HostName": "",
    "BearerParamCS": "",
    "BusinessUnitIdParamCS": "",
    "OrganizationsCS": "",
    "regionCS": "",
    "locationCS": "",
    "departmentCS": "",
    "BeginStartDateCS": "",
    "EndStartDateCS": "",
    "candidateStatusesParamCS": "",
    "skillCS": ""
  };


  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateStatus/CandidateStatus.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/CandidateStatus/CandidateStatus.cat" };

  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;

  public allOption: string = "All";

  @Select(LogiReportState.regions)
  public regions$: Observable<Region[]>;
  regionFields: FieldSettingsModel = { text: 'name', value: 'id' };


  @Select(LogiReportState.locations)
  public locations$: Observable<Location[]>;
  isLocationsDropDownEnabled: boolean = false;
  locationFields: FieldSettingsModel = { text: 'name', value: 'id' };

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

  @Select(LogiReportState.getCommonReportCandidateStatusData)
  public getCommonReportCandidateStatusData$: Observable<CandidateStatusAndReasonFilterOptionsDto[]>;

  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };

  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public candidateStatusReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  public canidateStatusControl: AbstractControl;
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
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public isResetFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  private fixedCandidateStatusesIncluded: number[] = [6, 7, 11];

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];

  public candidateStatuses: CandidateStatusAndReasonFilterOptionsDto[] = [];


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
    this.SetReportData();
  }

  ngOnInit(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();
      this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.isAlive = false;
          this.filterOptionsData = data;
          this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
          this.filterColumns.skillIds.dataSource = [];

          let masterSkills = this.filterOptionsData.masterSkills;
          this.selectedSkillCategories = data.skillCategories?.filter((object) => object.id);
          let skills = masterSkills.filter((i) => i.skillCategoryId);
          this.filterColumns.skillIds.dataSource = skills;
        }
      });

      this.SetReportData();
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
      this.onFilterCandidateStatusChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.candidateStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.candidateStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());

    if (startDate.getDay() == 0)
      startDate.setDate(startDate.getDate() + 7);
    if (startDate.getDay() == 1)
      startDate.setDate(startDate.getDate() + 6);
    if (startDate.getDay() == 2)
      startDate.setDate(startDate.getDate() + 5);
    if (startDate.getDay() == 3)
      startDate.setDate(startDate.getDate() + 4);
    if (startDate.getDay() == 4)
      startDate.setDate(startDate.getDate() + 3);
    if (startDate.getDay() == 5)
      startDate.setDate(startDate.getDate() + 2);
    if (startDate.getDay() == 6)
      startDate.setDate(startDate.getDate() + 1);

    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    this.candidateStatusReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),

        beginStartDate: new FormControl(startDate, [Validators.required]),
        endStartDate: new FormControl(endDate, [Validators.required]),
        candidateStatuses: new FormControl([])
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.candidateStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.candidateStatusReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.candidateStatusReportForm.get(accrualConstants.formControlNames.RegionIds)?.setValue([]);
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
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;

          this.store.dispatch(new GetCommonReportCandidateStatusOptions(filter));
          this.getCommonReportCandidateStatusData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: any) => {
            if (data != null) {
              this.filterColumns.candidateStatuses.dataSource = data;
            }
          });

          setTimeout(() => { this.SearchReport() }, 3000);
        }
        else {
          this.isClearAll = false;
          this.candidateStatusReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.candidateStatusReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.candidateStatusReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.candidateStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.candidateStatusReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.candidateStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.candidateStatusReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.candidateStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.candidateStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.candidateStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }


  public onFilterSkillCategoryChangedHandler(): void {
    this.skillCategoryIdControl = this.candidateStatusReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.candidateStatusReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(skills.map((list) => list.id));
      }
      else {
        this.filterColumns.skillIds.dataSource = [];
        this.candidateStatusReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.candidateStatusReportForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });
  }
  public onFilterCandidateStatusChangedHandler(): void {
    this.canidateStatusControl = this.candidateStatusReportForm.get(analyticsConstants.formControlNames.CandidateStatuses) as AbstractControl;
    this.canidateStatusControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.canidateStatusControl.value.length > 0) {
        this.candidateStatuses = this.filterColumns.candidateStatuses.dataSource?.filter((object: { status: any; }) => data?.includes(object.status));
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
    let { departmentIds, locationIds, candidateStatuses,
      regionIds, skillCategoryIds, skillIds, beginStartDate, endStartDate } = this.candidateStatusReportForm.getRawValue();

    if (!this.candidateStatusReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments for next week";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }
    locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);
    candidateStatuses = candidateStatuses.length > 0 ? this.candidateStatuses?.map(x => x.statusText).join(",") : this.filterColumns.candidateStatuses.dataSource.map((x: { statusText: any; }) => x.statusText).join(",");

    regionIds = regionIds.length > 0 ? regionIds.join(",") : this.regionsList?.length > 0 ? this.regionsList.map(x => x.id).join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds : this.locationsList?.length > 0 ? this.locationsList.map(x => x.id).join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds : this.departmentsList?.length > 0 ? this.departmentsList.map(x => x.id).join(",") : "null";
    skillCategoryIds = skillCategoryIds.length > 0 ? skillCategoryIds.join(",") : this.filterColumns.skillCategoryIds.dataSource?.length > 0 ? this.filterColumns.skillCategoryIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";
    skillIds = skillIds.length > 0 ? skillIds.join(",") : this.filterColumns.skillIds.dataSource?.length > 0 ? this.filterColumns.skillIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";


    this.paramsData =
    {

      "HostName": this.baseUrl,
      "BearerParamCS": auth,
      "BusinessUnitIdParamCS": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),

      "OrganizationsCS": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "regionCS": regionIds.length == 0 ? "null" : regionIds,
      "locationCS": locationIds.length == 0 ? "null" : locationIds,
      "departmentCS": departmentIds.length == 0 ? "null" : departmentIds,
      "BeginStartDateCS": formatDate(beginStartDate, 'MM/dd/yyyy', 'en-US'),
      "EndStartDateCS": formatDate(endStartDate, 'MM/dd/yyyy', 'en-US'),
      "candidateStatusesParamCS": candidateStatuses.length == 0 ? "null" : candidateStatuses,
      "skillCS": skillIds.length == 0 ? "null" : skillIds,
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

      beginStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endStartDate: { type: ControlTypes.Date, valueType: ValueType.Text },

      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
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
    this.filterService.removeValue(event, this.candidateStatusReportForm, this.filterColumns);
  }

  private getNextDayOfWeek(date: any, dayOfWeek: any): any {
    // Code to check that date and dayOfWeek are valid left as an exercise ;)
    var resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeek - date.getDay()) % 7);
    return resultDate;
  }

  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    if (startDate.getDay() == 0)
      startDate.setDate(startDate.getDate() + 7);
    if (startDate.getDay() == 1)
      startDate.setDate(startDate.getDate() + 6);
    if (startDate.getDay() == 2)
      startDate.setDate(startDate.getDate() + 5);
    if (startDate.getDay() == 3)
      startDate.setDate(startDate.getDate() + 4);
    if (startDate.getDay() == 4)
      startDate.setDate(startDate.getDate() + 3);
    if (startDate.getDay() == 5)
      startDate.setDate(startDate.getDate() + 2);
    if (startDate.getDay() == 6)
      startDate.setDate(startDate.getDate() + 1);

    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);

    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.BeginStartDate)?.setValue(startDate);
    this.candidateStatusReportForm.get(analyticsConstants.formControlNames.EndStartDate)?.setValue(endDate);

    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }

  public onFilterApply(): void {
    this.candidateStatusReportForm.markAllAsTouched();
    if (this.candidateStatusReportForm?.invalid) {
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
