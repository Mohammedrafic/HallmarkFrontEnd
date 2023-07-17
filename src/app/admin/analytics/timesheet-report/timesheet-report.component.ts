import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import {GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { GetCommonReportFilterOptions, GetLogiReportData, GetCommonReportCandidateSearch, ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { AgencyDto, CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, SearchCandidate } from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { analyticsConstants } from '../constants/analytics.constant';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { uniqBy } from 'lodash';

@Component({
  selector: 'app-timesheet-report',
  templateUrl: './timesheet-report.component.html',
  styleUrls: ['./timesheet-report.component.scss']
})
export class TimesheetReportComponent implements OnInit, OnDestroy{

  public paramsData: any = {
    "OrganizationParamTS": "",
    "RegionsParamTS": "",
    "LocationsParamTS": "",
    "DepartmentsParamTS": "",
    "AgenciesParamTS": "",
    "JobIDParamTS": "",
    "StatusesParamTS": "",
    "CandidateNameParamTS": "",
    "StartDateParamTS": "",
    "EndDateParamTS": ""
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/TimeSheetReport/TimeSheet.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/TimeSheetReport/TimeSheet.cat" };
  public title: string = "Timesheet Report";
  public message: string = "";
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
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

  private fixedTimesheetStatusesIncluded: number[] = [0, 2, 3, 4, 5, 6, 10];
  accrualReportTypeFields: FieldSettingsModel = { text: 'name', value: 'id' };
  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  candidateNameFields: FieldSettingsModel = { text: 'fullName', value: 'fullName' };
  remoteWaterMark: string = 'e.g. Andrew Fuller';
  candidateStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  jobStatusesFields: FieldSettingsModel = { text: 'statusText', value: 'status' };
  agencyFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  selectedDepartments: Department[];
  selectedAgencies: AgencyDto[];
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;

  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public timesheetReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
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
  public defaultAgencyIds: (number | undefined)[] = [];
  public defaultOrderTypes: (number | undefined)[] = [];
  public today = new Date();
  public filteredItems: FilteredItem[] = [];
  public isClearAll: boolean = false;
  public isInitialLoad: boolean = false;
  public baseUrl: string = '';
  public user: User | null;
  public filterOptionsData: CommonReportFilterOptions;
  public candidateFilterData: { [key: number]: SearchCandidate; }[] = [];
  public isLoadNewFilter: boolean = false;
  private isAlive = true;
  private previousOrgId: number = 0;

  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public isResetFilter: boolean = false;

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

    //this.SetReportData();
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

      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.timesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.timesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let startDate = this.getLastWeek();
    let first = startDate.getDate() - startDate.getDay();
    //let last = first + 6;
    let firstday = new Date(startDate.setDate(first));
    let lastday = new Date(startDate.setDate(startDate.getDate()+6));
    startDate = firstday;
    let endDate = lastday;
    this.timesheetReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(endDate, [Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        candidateName: new FormControl(null),
        timesheetStatuses: new FormControl([]),
        jobStatuses: new FormControl([]),
        jobId: new FormControl(''),
        agencyIds: new FormControl([])
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  getLastWeek() {
    var today = new Date(Date.now());
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.timesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.timesheetReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      }
    });

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.timesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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
          this.CommonReportFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.filterColumns.jobStatuses.dataSource = data.jobStatuses;
              let timesheetStatusData = data.timesheetStatuses.filter(i => this.fixedTimesheetStatusesIncluded.includes(i.id));
              if (timesheetStatusData.filter((item) => item.name == "DNW")[0] == undefined) {
                timesheetStatusData.push({ id: -1, name: "DNW" }); //Include static "DNW" as a status to status dropdown with id -1
              }
              let archived = timesheetStatusData.filter((item) => item.name == "Archived")[0];
              let archivedIndex = timesheetStatusData.indexOf(archived, 0);
              if (archivedIndex >= 0) {
                timesheetStatusData.splice(archivedIndex, 1);
              }

              let noMileageExist = timesheetStatusData.filter((item) => item.name == "No mileages exist")[0];
              let noMileageExistIndex = timesheetStatusData.indexOf(noMileageExist, 0);
              if (noMileageExistIndex >= 0) {
                timesheetStatusData.splice(noMileageExistIndex, 1);
              }
              this.filterColumns.timesheetStatusIds.dataSource = timesheetStatusData;
              this.filterColumns.agencyIds.dataSource = data.agencies;
              this.defaultAgencyIds = data.agencies.map((list) => list.agencyId);
              this.timesheetReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
              if (this.isInitialLoad) {

                setTimeout(() => { this.SearchReport() }, 3000);
                this.isInitialLoad = false;
              }
              this.changeDetectorRef.detectChanges();
            }
          });
          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
        }
        else {
          this.isClearAll = false;
          this.timesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }


  public onFilterRegionChangedHandler(): void {

    this.regionIdControl = this.timesheetReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.timesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.timesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter(i => data?.includes(i.regionId));
        this.filterColumns.locationIds.dataSource = this.locations;
        this.departments = this.locations.map(obj => {
          return obj.departments.filter(department => department.locationId === obj.id);
        }).reduce((a, b) => a.concat(b), []);
      }
      else {
        this.filterColumns.locationIds.dataSource = [];
        this.timesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.timesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.timesheetReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.timesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.timesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.timesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
    this.agencyIdControl = this.timesheetReportForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
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
    
    let { businessIds, candidateName, timesheetStatuses, departmentIds, jobId, locationIds,
      regionIds, agencyIds, startDate, endDate } = this.timesheetReportForm.getRawValue();
    if (!this.timesheetReportForm.dirty) {
      this.message = "Default filter selected with all regions, locations and departments.";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }

    regionIds = regionIds.length > 0 ? regionIds.join(",") : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";

    var statusArray = Array.isArray(timesheetStatuses) 
    ? (timesheetStatuses?.length > 0 ? timesheetStatuses : []) 
    : (isNaN(timesheetStatuses) == false ? [timesheetStatuses] : []);
    this.paramsData =
    {
      "OrganizationParamTS": this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "StartDateParamTS": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "EndDateParamTS": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "RegionsParamTS": regionIds.length == 0 ? "null" : regionIds,
      "LocationsParamTS": locationIds.length == 0 ? "null" : locationIds,
      "DepartmentsParamTS": departmentIds.length == 0 ? "null" : departmentIds,
      "CandidateNameParamTS": candidateName == null || candidateName == "" ? 'null' : candidateName.toString(),
      "StatusesParamTS": statusArray?.length > 0 ? statusArray.join(",") : 'null',
      "JobIDParamTS": jobId == null || jobId == "" ? 'null' : jobId,
      "AgenciesParamTS": agencyIds?.length > 0 ? agencyIds.join(",") : 'null',
      "BearerParamTS": auth,
      "BusinessUnitIdParamTS": businessIds,
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
      timesheetStatusIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Text,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      },
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
    this.filterService.removeValue(event, this.timesheetReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    //this.isClearAll = true;
    let startDate = this.getLastWeek();
    let first = startDate.getDate() - startDate.getDay();
    //let last = first + 6;
    let firstday = new Date(startDate.setDate(first));
    let lastday = new Date(startDate.setDate(startDate.getDate() + 6));
    startDate = firstday;
    let endDate = lastday;
    this.timesheetReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue(this.defaultRegions);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.CandidateName)?.setValue(null);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.TimesheetStatuses)?.setValue([]);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.JobStatuses)?.setValue([]);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(endDate);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.JobId)?.setValue([]);
    this.timesheetReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }
  public onFilterApply(): void {
    this.timesheetReportForm.markAllAsTouched();
    if (this.timesheetReportForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  public showToastMessage(regionsLength: number, locationsLength: number, departmentsLength: number) {
    this.message = "";
    let error: any = regionsLength == 0 ? "Regions/Locations/Departments are required" : locationsLength == 0 ? "Locations/Departments are required" : departmentsLength == 0 ? "Departments are required" : "";

    this.store.dispatch(new ShowToast(MessageTypes.Error, error));
    return;
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  }
  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      let ids = [];
      ids.push(this.bussinessControl.value);
      let filter: CommonCandidateSearchFilter = {
        searchText: e.text,
        businessUnitIds: ids
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
