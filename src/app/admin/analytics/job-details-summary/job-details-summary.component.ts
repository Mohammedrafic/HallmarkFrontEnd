import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil } from 'rxjs';
import { LogiReportState } from '../../../organization-management/store/logi-report.state';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { SetHeaderState, ShowFilterDialog, ShowToast } from '../../../store/app.actions';
import { SecurityState } from '../../../security/store/security.state';
import { UserState } from '../../../store/user.state';
import { BUSINESS_DATA_FIELDS } from '../../alerts/alerts.constants';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FilteredItem } from '../../../shared/models/filter.model';
import { User } from '@shared/models/user.model';
import { FilterService } from '@shared/services/filter.service';
import { AppSettings, APP_SETTINGS } from '../../../../app.settings';
import { GetOrganizationsStructureAll } from '../../../security/store/security.actions';
import { analyticsConstants } from '../constants/analytics.constant';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { Organisation } from '@shared/models/visibility-settings.model';
import { JobDetailSummaryFilter, JobDetailSummaryReportFilterOptions } from '../models/jobdetail-summary.model';
import { GetJobDetailSummaryReportFilterOptions, GetLogiReportData } from '../../../organization-management/store/logi-report.action';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { OrderTypeOptions } from '@shared/enums/order-type';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { formatDate } from '@angular/common';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';

@Component({
  selector: 'app-job-details-summary',
  templateUrl: './job-details-summary.component.html',
  styleUrls: ['./job-details-summary.component.scss']
})
export class JobDetailsSummaryComponent implements OnInit, OnDestroy {

  public paramsData: any = {
    "OrganizationParamACCR": "",
    "StartDateParamACCR": "",
    "EndDateParamACCR": "",
    "RegionParamACCR": "",
    "LocationParamACCR": "",
    "DepartmentParamACCR": "",
    "BearerParamACCR": "",
    "BusinessUnitIdParamACCR": "",
    "HostName": "",
    "AccrualReportFilterACCR": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/AccrualReport/ClientFinanceAccrualReport.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/AccrualReport/Accrual.cat" };

  public title: string = "Job Details Summary";
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
  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;
  selectedOrganizations: Organisation[];

  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedDepartments: Department[];
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  @Select(LogiReportState.jobDetailSummaryReportFilterData)
  public jobDetailSummaryReportFilterData$: Observable<JobDetailSummaryReportFilterOptions>;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public jobDetailsSummaryReportForm: FormGroup;
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
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptions: JobDetailSummaryReportFilterOptions;
  candidateStatusField: FieldSettingsModel = { text: 'statusText', value: 'status' };
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  constructor(private store: Store,
    private formBuilder: FormBuilder,
    private filterService: FilterService,
    private changeDetectorRef: ChangeDetectorRef,
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
      this.jobDetailSummaryReportFilterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: JobDetailSummaryReportFilterOptions | null) => {
        if (data != null) {
          this.filterOptions = data;
          this.filterColumns.skillCategoryIds.dataSource = this.filterOptions.skillCategories;
          this.filterColumns.candidateStatuses.dataSource = this.filterOptions.candidateStatuses;
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
      let businessIdData = [];
      businessIdData.push(data);
      let filter: JobDetailSummaryFilter = {
        businessUnitIds: businessIdData
      };
      this.store.dispatch(new GetJobDetailSummaryReportFilterOptions(filter));
      this.orderFilterColumnsSetup();
      this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.accrualReportTypes)?.setValue(1);
      this.onFilterControlValueChangedHandler();
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.orderFilterColumnsSetup();
      this.onFilterControlValueChangedHandler();
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
   
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.jobDetailsSummaryReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(new Date(Date.now()), [Validators.required]),
        regionIds: new FormControl([], [Validators.required]),
        locationIds: new FormControl([], [Validators.required]),
        departmentIds: new FormControl([], [Validators.required]),
        skillCategoryIds: new FormControl([], [Validators.required]),
        skillIds: new FormControl([], [Validators.required]),
        condidateStatus: new FormControl(null, [Validators.required]),
        jobId: new FormControl(null, []),
      }
    );
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.organizations = uniqBy(data, 'organizationId');
      this.filterColumns.businessIds.dataSource = this.organizations;
      this.defaultOrganizations = this.agencyOrganizationId;
      let orgList = this.organizations?.filter((x) => this.agencyOrganizationId == x.organizationId);
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
      if (data.length > 0 && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
        this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
      }
      this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
      this.changeDetectorRef.detectChanges();
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!this.isClearAll) {
        let orgList = this.organizations?.filter((x) => data == x.organizationId);
        this.selectedOrganizations = orgList;


        this.regions = this.regionsList;
        this.filterColumns.regionIds.dataSource = this.regions;
        this.defaultRegions = this.regionsList.map((list) => list.id);
        this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
        this.changeDetectorRef.detectChanges();
      }
      else {
        this.isClearAll = false;
      }
    });
    this.regionIdControl = this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.regionIdControl.value.length > 0) {
        let regionList = this.regions?.filter((object) => data?.includes(object.id));
        this.selectedRegions = regionList;
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.defaultLocations = this.locations.map((list) => list.id);
        this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue(this.defaultLocations);
        this.changeDetectorRef.detectChanges();
      }
      else {

      }
    });
    this.locationIdControl = this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.locationIdControl.value.length > 0) {
        this.selectedLocations = this.locations?.filter((object) => data?.includes(object.id));
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
        this.defaultDepartments = this.departments.map((list) => list.id);
        this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue(this.defaultDepartments);
        this.changeDetectorRef.detectChanges();
      }
    });
    this.departmentIdControl = this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.selectedDepartments = this.departments?.filter((object) => data?.includes(object.id));
      if (this.isInitialLoad) {
        this.SearchReport();
        this.isInitialLoad = false;
      }
    });
    this.skillCategoryIdControl = this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        const masterskills = this.filterOptions.masterSkills;
        let skills = masterskills?.filter((object: any) => data?.includes(object.skillCaetgoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.changeDetectorRef.detectChanges();
      }
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
      orderTypes: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: OrderTypeOptions,
        valueField: 'name',
        valueId: 'id',
      },
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      jobStatuses: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'statusText',
        valueId: 'status',
      },
      jobId: {
        type: ControlTypes.Text,
        valueType: ValueType.Text
      }
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

  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch([new ShowToast(MessageTypes.Error, error)]);
    return;
  }

  public showFilters(): void {
    this.onFilterControlValueChangedHandler();
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onFilterDelete(event: FilteredItem): void {
    this.filterService.removeValue(event, this.jobDetailsSummaryReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 90);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(new Date(Date.now()));
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.CondidateStatus)?.setValue(null);
    this.jobDetailsSummaryReportForm.get(analyticsConstants.formControlNames.JobId)?.setValue(null);
    this.filteredItems = [];
  }
  public onFilterApply(): void {
    this.jobDetailsSummaryReportForm.markAllAsTouched();
    if (this.jobDetailsSummaryReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public SearchReport(): void {
    this.message = "Default filter selected with all regions ,locations and departments for 90 days";

    this.filteredItems = [];
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { startDate, endDate } = this.jobDetailsSummaryReportForm.getRawValue();
    this.paramsData =
    {
      "OrganizationParamACCR": this.selectedOrganizations?.map((list) => list.id),
      "StartDateParamACCR": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamACCR": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionParamACCR": this.selectedRegions?.map((list) => list.id),
      "LocationParamACCR": this.selectedLocations?.map((list) => list.id),
      "DepartmentParamACCR": this.selectedDepartments?.map((list) => list.id),
      "BearerParamACCR": auth,
      "BusinessUnitIdParamACCR": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
      "HostName": this.baseUrl,
      "AccrualReportFilterACCR": this.jobDetailsSummaryReportForm.controls['accrualReportTypes'].value.toString()
    };
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }

}
