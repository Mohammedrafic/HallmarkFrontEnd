import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { Region, Location, Department } from '@shared/models/visibility-settings.model';
import { EmitType } from '@syncfusion/ej2-base';
import { FieldSettingsModel, FilteringEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { debounceTime, Observable, Subject, takeUntil, takeWhile, distinctUntilChanged } from 'rxjs';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { UserState } from 'src/app/store/user.state';
import { BUSINESS_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { SecurityState } from 'src/app/security/store/security.state';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  GetDepartmentsByLocations, GetCommonReportFilterOptions, GetLocationsByRegions, GetLogiReportData,
  GetRegionsByOrganizations, GetCommonReportCandidateSearch, ClearLogiReportState
} from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { formatDate } from '@angular/common';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { FilteredItem } from '@shared/models/filter.model';
import { FilterService } from '@shared/services/filter.service';
import { accrualConstants, analyticsConstants, Period } from '../constants/analytics.constant';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { ConfigurationDto } from '@shared/models/analytics.model';
import { User } from '@shared/models/user.model';
import { Organisation } from '@shared/models/visibility-settings.model';
import { uniqBy } from 'lodash';
import { MessageTypes } from '@shared/enums/message-types';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { CommonCandidateSearchFilter, CommonReportFilter, CommonReportFilterOptions, MasterSkillDto, SearchCandidate, SkillCategoryDto } from '../models/common-report.model';
import { OutsideZone } from "@core/decorators";
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { AssociateAgencyDto } from '../../../shared/models/logi-report-file';

@Component({
  selector: 'app-vendor-activity',
  templateUrl: './vendor-activity.component.html',
  styleUrls: ['./vendor-activity.component.scss']
})
export class VendorActivityComponent implements OnInit, OnDestroy {

  public title: string = "Vendor Activity";

  public paramsData: any = {

    "HostName": "",
    "BearerParamVA": "",
    "BusinessUnitIdParamVA": "",
    "OrganizationsVA": "",
    "regionVA": "",
    "locationVA": "",
    "departmentVA": "",
    "agencyVA": "",
    "skillCategoryVA": "",
    "skillVA": "",
    "startDateVA": "",
    "endDateVA": "",
    "organizationNameVA": "",
    "reportPulledMessageVA": "",
    "DateRangeVA": ""
  };


  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/VendorActivity/VendorActivity.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/VendorActivity/VendorActivity.cat" };

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

  public agencyFields = {
    text: 'agencyName',
    value: 'agencyId',
  };
  selectedAgencies: AssociateAgencyDto[];
  public defaultAgencyIds: (number | undefined)[] = [];


  commonFields: FieldSettingsModel = { text: 'name', value: 'id' };
  selectedSkillCategories: SkillCategoryDto[];
  selectedSkills: MasterSkillDto[];

  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  private agencyOrganizationId: number;
  public organizations: Organisation[] = [];
  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  public organizationFields = ORGANIZATION_DATA_FIELDS;
  private unsubscribe$: Subject<void> = new Subject();
  public filterColumns: any;
  public VendorActivityReportForm: FormGroup;
  public bussinessControl: AbstractControl;
  public regionIdControl: AbstractControl;
  public locationIdControl: AbstractControl;
  public departmentIdControl: AbstractControl;
  public agencyIdControl: AbstractControl;
  public skillCategoryIdControl: AbstractControl;
  public skillIdControl: AbstractControl;

  public agencyData: AssociateAgencyDto[] = [];
  public regions: Region[] = [];
  public locations: Location[] = [];
  public departments: Department[] = [];
 // public organizations: Organisation[] = [];
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
  private dateFormat = 'MM/dd/yyyy';
  private culture = 'en-US'; 
  public masterRegionsList: Region[] = [];
  public masterLocationsList: Location[] = [];
  public masterDepartmentsList: Department[] = [];
  public periodList: Period[] = [];
  public periodIsDefault: boolean = false;
  periodFields: FieldSettingsModel = { text: 'name', value: 'name' };
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  public isDefaultLoad: boolean = false;
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
      this.loadperiod();
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

          this.filterColumns.agencyIds.dataSource = [];
          this.filterColumns.agencyIds.dataSource = data?.agencies;

          this.agencyIdControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
          let agencyIds = data?.agencies;
          this.selectedAgencies = agencyIds;
          this.defaultAgencyIds = agencyIds.map((list) => list.agencyId);
          this.VendorActivityReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue(this.defaultAgencyIds);

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
      this.user?.businessUnitType == BusinessUnitType.Hallmark ? this.VendorActivityReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable() : this.VendorActivityReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private initForm(): void {
    let today = new Date(Date.now());

    today.setDate(1);
    let year = today.getMonth() == 0 ? today.getFullYear() - 1 : today.getFullYear();
    let month = today.getMonth() == 0 ? 11 : today.getMonth() - 1;
    let startDate = new Date(year, month, 1);
    let endDate = new Date(year, month + 1, 0);

    this.VendorActivityReportForm = this.formBuilder.group(
      {
        businessIds: new FormControl([Validators.required]),
        regionIds: new FormControl([]),
        locationIds: new FormControl([]),
        departmentIds: new FormControl([]),
        agencyIds: new FormControl([], [Validators.required]),
        skillCategoryIds: new FormControl([]),
        skillIds: new FormControl([]),
        startDate: new FormControl(startDate, [Validators.required]),
        endDate: new FormControl(endDate, [Validators.required]),
        period: new FormControl(null)
      }
    );
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }

  selectPeriod(event: any) {
    let { startDate, period } = this.VendorActivityReportForm.getRawValue();
    const value = event.itemData.id;
    this.periodIsDefault = this.VendorActivityReportForm.controls['period'].value == "Custom" ? true : false;
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue("");
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue("");
    const PeriodCheck = value;
    let startDateControl = new Date(Date.now());
    let endDateControl = new Date(Date.now());
    let lastDayOfLastMonth = new Date();
    lastDayOfLastMonth.setMonth(lastDayOfLastMonth.getMonth(), 0);

    switch (PeriodCheck) {
      case 0:
        startDateControl.setDate(startDateControl.getDate() - 30);
        break;
      case 1:
        startDateControl.setDate(startDateControl.getDate() - 31);
        endDateControl.setDate(endDateControl.getDate() - 1);
        break;
      case 2:
        startDateControl.setDate(startDateControl.getDate() - 61);
        endDateControl.setDate(endDateControl.getDate() - 1);
        break;
      case 3:
        startDateControl.setDate(startDateControl.getDate() - 91);
        endDateControl.setDate(endDateControl.getDate() - 1);
        break;
      case 4:
        startDateControl = new Date(startDateControl.getFullYear(), startDateControl.getMonth(), 1);
        break;
      case 5:
        const today = new Date(Date.now());
        const quarter = Math.floor((today.getMonth() / 3));
        startDateControl = new Date(today.getFullYear(), quarter * 3 - 3, 1);
        endDateControl = new Date(startDateControl.getFullYear(), startDateControl.getMonth() + 3, 0);
        break;
      case 6:
        const startDate = new Date(startDateControl.getFullYear(), 0, 1)
        startDate.setDate(startDate.getDate());
        startDateControl = startDate;
        break;
      case 7:
        const firstDay = new Date(startDateControl.getFullYear(), startDateControl.getMonth(), 1);
        startDateControl = this.addMonths(firstDay, -6);
        startDateControl.setDate(startDateControl.getDate());
        endDateControl = new Date((lastDayOfLastMonth));
        break;
      case 8:
        const dayFirst = new Date(startDateControl.getFullYear(), startDateControl.getMonth(), 1);
        startDateControl = this.addMonths(dayFirst, -12);
        startDateControl.setDate(startDateControl.getDate());
        endDateControl = new Date((lastDayOfLastMonth));
        break;
    }

    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.startDate)?.setValue(startDateControl);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.endDate)?.setValue(new Date((endDateControl)));

  }
  private addMonths(date: any, months: any) {
    date.setMonth(date.getMonth() + months);
    return date;
  }
  private loadperiod(): void {
    this.periodList = [];
    this.periodList.push({ id: 0, name: 'Custom' });
    this.periodList.push({ id: 1, name: 'Last 30 days' });
    this.periodList.push({ id: 2, name: 'Last 60 days' });
    this.periodList.push({ id: 3, name: 'Last 90 days' });
    this.periodList.push({ id: 4, name: 'MTD' });
    this.periodList.push({ id: 5, name: 'Last Quarter' });
    this.periodList.push({ id: 6, name: 'YTD' });
    this.periodList.push({ id: 7, name: 'Last 6 Months' });
    this.periodList.push({ id: 8, name: 'Last 12 Months' });
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
  }

  public onFilterControlValueChangedHandler(): void {
    this.bussinessControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (data != null && data.length > 0) {
        this.organizations = uniqBy(data, 'organizationId');
        this.filterColumns.businessIds.dataSource = this.organizations;
        this.defaultOrganizations = this.agencyOrganizationId;
        this.VendorActivityReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);
        this.changeDetectorRef.detectChanges();
      }
    });
    //this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
    //  this.VendorActivityReportForm.get(accrualConstants.formControlNames.RegionIds)?.setValue([]);
    //  if (data != null && typeof data === 'number' && data != this.previousOrgId) {
    //    this.isAlive = true;
    //    this.previousOrgId = data;
    //    if (!this.isClearAll) {
    //      let orgList = this.organizations?.filter((x) => data == x.organizationId);
    //      this.selectedOrganizations = orgList;
    //      this.regionsList = [];
    //      let regionsList: Region[] = [];
    //      let locationsList: Location[] = [];
    //      let departmentsList: Department[] = [];
    //      orgList.forEach((value) => {
    //        regionsList.push(...value.regions);
    //        locationsList = regionsList.map(obj => {
    //          return obj.locations.filter(location => location.regionId === obj.id);
    //        }).reduce((a, b) => a.concat(b), []);
    //        departmentsList = locationsList.map(obj => {
    //          return obj.departments.filter(department => department.locationId === obj.id);
    //        }).reduce((a, b) => a.concat(b), []);
    //      });
    //      this.regionsList = sortByField(regionsList, "name");
    //      this.locationsList = sortByField(locationsList, 'name');
    //      this.departmentsList = sortByField(departmentsList, 'name');
    //      this.masterRegionsList = this.regionsList;
    //      this.masterLocationsList = this.locationsList;
    //      this.masterDepartmentsList = this.departmentsList;

    //      if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
    //        this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
    //      }
    //      else {
    //        this.isResetFilter = true;
    //      }
    //      let businessIdData = [];
    //      businessIdData.push(data);
    //      let filter: CommonReportFilter = {
    //        businessUnitIds: businessIdData
    //      };
    //      this.store.dispatch(new GetCommonReportFilterOptions(filter));
    //      this.regions = this.regionsList;
    //      this.filterColumns.regionIds.dataSource = this.regions;
    //      this.SearchReport() ;
    //    }
    //    else {
    //      this.isClearAll = false;
    //      this.VendorActivityReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    //    }
    //  }
    //});
    this.bussinessControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.BusinessIds) as AbstractControl;

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$), debounceTime(500)).subscribe((data) => {
      this.VendorActivityReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
      this.selectedOrganizations = [];
      // if (data != null && typeof data === 'number' && data != this.previousOrgId) {
      if (data && data.length > 0) {
        this.isAlive = true;
        this.previousOrgId = data;
        if (!this.isClearAll) {

          this.regionsList = [];
          let regionsList: Region[] = [];
          let locationsList: Location[] = [];
          let departmentsList: Department[] = [];
          this.selectedOrganizations = data;
          if (data.length == 1) {


            let orgList = this.organizations?.filter((x) => data[0] == x.organizationId);
            orgList.forEach((value) => {
              regionsList.push(...value.regions);
              locationsList = regionsList.map(obj => {
                return obj.locations.filter(location => location.regionId === obj.id);
              }).reduce((a, b) => a.concat(b), []);
              departmentsList = locationsList.map(obj => {
                return obj.departments.filter(department => department.locationId === obj.id);
              }).reduce((a, b) => a.concat(b), []);
            });

          }
          this.regionsList = regionsList.length > 0 ? sortByField(regionsList, "name") : [];
          this.locationsList = locationsList.length > 0 ? sortByField(locationsList, 'name') : [];
          this.departmentsList = departmentsList.length > 0 ? sortByField(departmentsList, 'name') : [];

          this.masterRegionsList = this.regionsList;
          this.masterLocationsList = this.locationsList;
          this.masterDepartmentsList = this.departmentsList;

          this.regions = this.regionsList;
          this.filterColumns.regionIds.dataSource = this.regions;
          if (this.bussinessControl?.value.length == "1") {
            if ((data == null || data <= 0) && this.regionsList.length == 0 || this.locationsList.length == 0 || this.departmentsList.length == 0) {
              this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
            }
            else {
              this.isResetFilter = true;
            }
          }
          let businessIdData = [];
          //businessIdData.push(data[0]);
          businessIdData = data;
          let filter: CommonReportFilter = {
            businessUnitIds: businessIdData
          };

          this.store.dispatch(new GetCommonReportFilterOptions(filter));
          this.financialTimeSheetFilterData$.pipe(takeWhile(() => this.isAlive)).subscribe((data: CommonReportFilterOptions | null) => {
            if (data != null) {
              this.isAlive = true;
              this.filterOptionsData = data;
              this.filterColumns.skillCategoryIds.dataSource = data.skillCategories;
              this.filterColumns.skillIds.dataSource = [];
              //this.filterColumns.jobStatuses.dataSource = data.jobStatusesAndReasons;
             // this.filterColumns.candidateStatuses.dataSource = data.candidateStatusesAndReasons;
              //this.filterColumns.timesheetStatuses.dataSource = data.timesheetStatuses.filter(i => this.fixedTimesheetStatusesIncluded.includes(i.id));
             // this.VendorActivityReportForm.get(analyticsConstants.formControlNames.TimesheetStatuses)?.setValue(this.defaultTimesheetStatuses);
              this.isDefaultLoad = true;
              this.SearchReport()
            }
          });

        }
        else {
          this.isClearAll = false;
          this.VendorActivityReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }
  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.RegionIds) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.VendorActivityReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.VendorActivityReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
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
        this.VendorActivityReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.VendorActivityReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.LocationIds) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.VendorActivityReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);

      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter(i => data?.includes(i.locationId));
        this.filterColumns.departmentIds.dataSource = this.departments;
      }
      else {
        this.filterColumns.departmentIds.dataSource = [];
        this.VendorActivityReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
    });
    this.departmentIdControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.DepartmentIds) as AbstractControl;
    this.departmentIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = this.departments?.filter((object) => data?.includes(object.id));
    });
  }


  public onFilterSkillCategoryChangedHandler(): void {
    this.skillCategoryIdControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds) as AbstractControl;
    this.skillCategoryIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillCategoryIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkillCategories = this.filterOptionsData.skillCategories?.filter((object) => data?.includes(object.id));
        let skills = masterSkills.filter((i) => data?.includes(i.skillCategoryId));
        this.filterColumns.skillIds.dataSource = skills;
        this.VendorActivityReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue(skills.map((list) => list.id));
      }
      else {
        this.filterColumns.skillIds.dataSource = [];
        this.VendorActivityReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
      }
    });
    this.skillIdControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.SkillIds) as AbstractControl;
    this.skillIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.skillIdControl.value.length > 0) {
        let masterSkills = this.filterOptionsData.masterSkills;
        this.selectedSkills = masterSkills?.filter((object) => data?.includes(object.id));
      }
    });

    this.agencyIdControl = this.VendorActivityReportForm.get(analyticsConstants.formControlNames.AgencyIds) as AbstractControl;
    this.agencyIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (this.agencyIdControl.value.length > 0) {
        let agencyIds = this.agencyData;
        this.selectedAgencies = agencyIds?.filter((object) => data?.includes(object.agencyId));
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
    let { departmentIds, locationIds,
      regionIds, skillCategoryIds, skillIds, startDate, endDate, agencyIds, period } = this.VendorActivityReportForm.getRawValue();

    if (!this.VendorActivityReportForm.dirty) {
      //this.message = "Default filter selected with all regions, locations and departments for 90 days";
    }
    else {
      this.isResetFilter = false;
      this.message = ""
    }

    //locationIds = locationIds.length > 0 ? locationIds.join(",") : (this.locations?.length > 0 ? this.locations.map(x => x.id).join(",") : []);
    //departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : (this.departments?.length > 0 ? this.departments.map(x => x.id).join(",") : []);
    regionIds = regionIds.length > 0 ? regionIds.join(",")  : "null";
    locationIds = locationIds.length > 0 ? locationIds.join(",") : "null";
    departmentIds = departmentIds.length > 0 ? departmentIds.join(",") : "null";
    skillCategoryIds = skillCategoryIds.length > 0 ? skillCategoryIds.join(",") : this.filterColumns.skillCategoryIds.dataSource?.length > 0 ? this.filterColumns.skillCategoryIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";
    skillIds = skillIds.length > 0 ? skillIds.join(",") : this.filterColumns.skillIds.dataSource?.length > 0 ? this.filterColumns.skillIds.dataSource.map((x: { id: any; }) => x.id).join(",") : "null";
    let currentDate = new Date(Date.now());

    this.paramsData =
    {

      "HostName": this.baseUrl,
      "BearerParamVA": auth,
      "BusinessUnitIdVA": window.localStorage.getItem("lastSelectedOrganizationId") == null
        ? this.organizations != null && this.organizations[0]?.id != null ?
          this.organizations[0].id.toString() : "1" :
        window.localStorage.getItem("lastSelectedOrganizationId"),
     // "OrganizationsVA": this.selectedOrganizations.length == 0 ? "null" : this.selectedOrganizations?.map((list) => list.organizationId).join(","),
      "OrganizationsVA": this.selectedOrganizations?.length == 0 ? "null" :
        this.selectedOrganizations?.join(","),

      "regionVA": regionIds.length == 0 ? "null" : regionIds,
      "locationVA": locationIds.length == 0 ? "null" : locationIds,
      "departmentVA": departmentIds.length == 0 ? "null" : departmentIds,
      "agencyVA": agencyIds.length == 0 ? "null" : agencyIds.join(","),
      "skillCategoryVA": skillCategoryIds.length == 0 ? "null" : skillCategoryIds,
      "skillVA": skillIds.length == 0 ? "null" : skillIds,
      "startDateVA": formatDate(startDate, 'MM/dd/yyyy', 'en-US'),
      "endDateVA": formatDate(endDate, 'MM/dd/yyyy', 'en-US'),
      "organizationNameVA": this.selectedOrganizations.length == 1 ? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(",") : "",

      "reportPulledMessageVA": ("Report Print date: " + formatDate(startDate, "MMM", this.culture) + " " + currentDate.getDate() + ", " + currentDate.getFullYear().toString()).trim(),
      "DateRangeVA": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim()
      
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
      agencyIds: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'agencyName',
        valueId: 'agencyId',
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
      startDate: { type: ControlTypes.Date, valueType: ValueType.Text },
      endDate: { type: ControlTypes.Date, valueType: ValueType.Text },
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
    this.filterService.removeValue(event, this.VendorActivityReportForm, this.filterColumns);
  }
  public onFilterClearAll(): void {
    this.isClearAll = true;
    let today = new Date(Date.now());

    today.setDate(1);
    let year = today.getMonth() == 0 ? today.getFullYear() - 1 : today.getFullYear();
    let month = today.getMonth() == 0 ? 11 : today.getMonth() - 1;
    let startDate = new Date(year, month, 1);
    let endDate = new Date(year, month + 1, 0);

    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([]);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.BusinessIds)?.setValue([this.agencyOrganizationId]);

    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.AgencyIds)?.setValue([]);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.SkillCategoryIds)?.setValue([]);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.SkillIds)?.setValue([]);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.StartDate)?.setValue(startDate);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.EndDate)?.setValue(endDate);
    this.VendorActivityReportForm.get(analyticsConstants.formControlNames.Period)?.setValue("Custom");
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];
    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;
  }

  public onFilterApply(): void {
    const {
      startDate,
      endDate
    }
      = this.VendorActivityReportForm.getRawValue();
    const startChkDate: string = formatDate(startDate, this.dateFormat, this.culture);
    const  endDateChk: string = formatDate(endDate, this.dateFormat, this.culture);
    if (endDateChk < startChkDate) {
      return;
    }
    this.VendorActivityReportForm.markAllAsTouched();
    if (this.VendorActivityReportForm?.invalid) {
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
