import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { ChangeEventArgs, FieldSettingsModel, AutoComplete, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType, GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData, GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { startDateValidator } from '@shared/validators/date.validator';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { AgencyDto, CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SearchCandidate, SkillCategoryDto } from '../models/common-report.model';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { OutsideZone } from "@core/decorators";
import { analyticsConstants } from '../constants/analytics.constant';

@Component({
  selector: 'app-job-details-summary',
  templateUrl: './job-details-summary.component.html',
  styleUrls: ['./job-details-summary.component.scss']
})
export class JobDetailsSummaryComponent implements OnInit, OnDestroy {

  public paramsData: any = {
    "OrganizationParamJDSR": "",
    "StartDateParamJDSR": "",
    "EndDateParamJDSR": "",
    "RegionParamJDSR": "",
    "LocationParamJDSR": "",
    "DepartmentParamJDSR": "",
    "SkillCategoryParamJDSR": "",
    "SkillParamJDSR": "",
    "CandidateNameJDSR": "",
    "CandidateStatusJDSR": "",
    "JobStatusJDSR": "",
    "JobIdJDSR": "",
    "AgencysJDSR":"",
    "BearerParamJDSR": "",
    "BusinessUnitIdParamJDSR": "",
    "HostName": "",
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/CredentialReport/CredentialReport.wls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/CredentialReport/Credential.cat" };
  public title: string = "Job Detail Summary";
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
  public CommonReportFilterData$: Observable<CommonReportFilterOptions>;

  @Select(LogiReportState.commonReportCandidateSearch)
  public commonReportCandidateSearchData$: Observable<SearchCandidate[]>;

  candidateSearchData: SearchCandidate[] = [];

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'id' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'id' };
  agencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  selectedDepartments: Department[];
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];
  selectedAgencies: AgencyDto[];
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public jobDetailSummaryReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
  public candidateNameControl: AbstractControl;
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
  public defaultAgencyIds: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public defaultSkills: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public isLoadNewFilter: boolean = false;
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
    this.orderFilterColumnsSetup();
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.CommonReportFilterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: CommonReportFilterOptions | null) => {
        if (data != null) {
          this.filterOptionsData = data;
          this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
          this.filterColumns.skillIds.dataSource = [];
          this.filterColumns.jobStatuses.dataSource = data.orderStatuses;
          this.filterColumns.candidateStatuses.dataSource = data.candidateStatuses;
          this.filterColumns.agencyIds.dataSource = data.agencies;
          this.defaultSkillCategories = data.skillCategories.map((list) => list.id);
          this.defaultAgencyIds = data.agencies.map((list) => list.agencyId);
          this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue(this.defaultSkillCategories);
          this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
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
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate() + 30);
    this.jobDetailSummaryReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(endDate, [Validators.required]),
        regionIds: new FormControl([], [Validators.required]),
        locationIds: new FormControl([], [Validators.required]),
        departmentIds: new FormControl([], [Validators.required]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        candidateName: new FormControl(null),
        candidateStatuses: new FormControl([]),
        jobStatuses: new FormControl([]),
        jobId: new FormControl(''),
        agencyIds: new FormControl([])
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = uniqBy(data, 'organizationId');
      this.filterColumns.businessIds.dataSource = this.organizations;
      this.defaultOrganizations = this.agencyOrganizationId;
      
      this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
      this.changeDetectorRef.detectChanges();
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null) {
        if (!this.isClearAll) {
          let orgList = this.organizations?.filter((x) => data == x.organizationId);
          this.selectedOrganizations = orgList;
          this.regionsList = [];
          this.locationsList = [];
          this.departmentsList = [];
          orgList.forEach((value) => {
            this.regionsList.push(...value.regions);
            value.regions.forEach((region) => {
              this.locationsList.push(...region.locations);
              region.locations.forEach((location) => {
                this.departmentsList.push(...location.departments);
              });
            });
          });
          if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
            this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          }
          else {
            this.isLoadNewFilter = true;
          }
          let businessIdData = [];
          businessIdData.push(data);
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };
          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          this.defaultRegions = this.regionsList.map((list) => list.id);
          this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
          this.changeDetectorRef.detectChanges();
        }
        else {
          this.isClearAll = false;
          this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
    this.regionIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.regionIdControl.value.length > 0) {
        let regionList = this.regions?.filter((object) => data?.includes(object.id));
        this.selectedRegions = regionList;
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.defaultLocations = this.locations.map((list) => list.id);
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue(this.defaultLocations);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      }
    });
    this.locationIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.locationIdControl.value.length > 0) {
        this.selectedLocations = this.locations?.filter((object) => data?.includes(object.id));
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
        this.defaultDepartments = this.departments.map((list) => list.id);
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue(this.defaultDepartments);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.selectedDepartments = this.departments?.filter((object) => data?.includes(object.id));
      if (this.isInitialLoad) {

        this.SearchReport();
        this.isInitialLoad = false;
      }
    });
    this.skillCategoryIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.defaultSkills = skills.map((list) => list.id);
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(this.defaultSkills);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });

    this.agencyIdControl = this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
    this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.agencyIdControl.value.length > 0) {
        let agencyData = this.filterOptionsData.agencies;
        this.selectedAgencies = agencyData?.filter((object) => data?.includes(object.agencyId));
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
    let { businessIds, candidateName, candidateStatuses, departmentIds, jobId, jobStatuses, locationIds,
      regionIds, skillCategoryIds,agencyIds, skillIds, startDate, endDate } = this.jobDetailSummaryReportForm.getRawValue();
      if (!this.jobDetailSummaryReportForm.dirty) {
        this.message = "Default filter selected with all regions, locations and departments for last and next 30 days.";
      }
      else {
        this.isLoadNewFilter = false;
        this.message = ""
    }

    this.paramsData =
    {
      "OrganizationParamJDSR": this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "StartDateParamJDSR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamJDSR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamJDSR": regionIds?.join(","),
      "LocationParamJDSR": locationIds?.join(","),
      "DepartmentParamJDSR": departmentIds?.join(","),
      "SkillCategoryParamJDSR": skillCategoryIds?.length>0? skillCategoryIds?.join(","):'null',
      "SkillParamJDSR": skillIds?.length>0? skillIds?.join(","):"null",
      "CandidateNameJDSR": candidateName == null||candidateName=="" ? 'null' : this.candidateSearchData?.filter((i) => i.id == candidateName).map(i => i.fullName)[0],
      "CandidateStatusJDSR": candidateStatuses?.length > 0 ? candidateStatuses.join(",") : 'null',
      "JobStatusJDSR": jobStatuses?.length > 0 ? jobStatuses.join(",") : 'null',
      "JobIdJDSR": jobId == null || jobId=="" ?  'null':jobId,
      "AgencysJDSR": agencyIds?.length > 0 ? agencyIds.join(",") : 'null',
      "BearerParamJDSR": auth,
      "BusinessUnitIdParamJDSR": businessIds,
      "HostName": this.baseUrl,
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
      candidateName: {
        type: ControlTypes.Dropdown,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'fullName',
        valueId: 'id',
      },
      candidateStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'id',
      },
      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      },
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
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
    if (this.isLoadNewFilter) {
      this.onFilterControlValueChangedHandler();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }
  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.jobDetailSummaryReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 30);
    let endDate = new Date(Date.now());
    endDate.setDate(endDate.getDate() + 30);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.filterColumns.skillIds.dataSource = [];
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.CandidateName)?.setValue(null);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.CandidateStatuses)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.JobStatuses)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(endDate);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.JobId)?.setValue([]);
    this.jobDetailSummaryReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue([]);
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.jobDetailSummaryReportForm.markAllAsTouched();
    if (this.jobDetailSummaryReportForm?.invalid) {
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

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }
  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text
      };
      this.filterColumns.dataSource = [];
      this.store.dispatch(new GetCommonReportCandidateSearch(filter))
        .subscribe((result) => {
          this.candidateFilterData = result.LogiReport.searchCandidates;
          this.candidateSearchData = result.LogiReport.searchCandidates;
          this.filterColumns.dataSource = this.candidateFilterData;
          // pass the filter data source to updateData method.
          e.updateData(this.candidateFilterData);
        });

    }
  }

}
