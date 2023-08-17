import { MasterSkillDto, workCommitmentDto } from './../models/common-report.model';
import { EmitType } from '@syncfusion/ej2-base';
import {
  ScheduleCandidate,
  ScheduleCandidatesPage,
  ScheduleFilters,
} from 'src/app/modules/schedule/interface/schedule.interface';
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
  GetCandidateSearchFromScheduling,
  GetCredentialTypes,
  GetStaffScheduleReportFilterOptions,
} from '@organization-management/store/logi-report.action';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
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
import { uniqBy } from 'lodash';
import { filter, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { AppSettings, APP_SETTINGS } from 'src/app.settings';
import { GetOrganizationsStructureAll } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { SetHeaderState, ShowFilterDialog, ShowToast } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { ORGANIZATION_DATA_FIELDS } from '../analytics.constant';
import { analyticsConstants } from '../constants/analytics.constant';
import { CommonReportFilter, StaffScheduleReportFilterOptions } from '../models/common-report.model';
import { OutsideZone } from '@core/decorators';
import { CredentialType } from '@shared/models/credential-type.model';
@Component({
  selector: 'app-credential-expiry-irp',
  templateUrl: './credential-expiry-irp.component.html',
  styleUrls: ['./credential-expiry-irp.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CredentialExpiryIrpComponent implements OnInit {
  public baseUrl = '';
  public user: User | null;
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
  public masterSkills: MasterSkillDto[] = [];
  public workCommitments: workCommitmentDto[] = [];
  public credentialTypes: CredentialType[] = [];
  public paramsData = {
    OrganizationIdParam: '',
    DepartmentIdParam: '',
    SkillsIdParam: '',
    CredentialTypeParam: '',
    DaysExpiringInParam: '',
    EmployeeParam: '',
    WorkCommitmentParam: '',
  };
  public credentialExpiryForm: FormGroup;
  public reportName: LogiReportFileDetails = {
    name: '/IRPReports/CredentialExpiry/CredentialExpiryReport.cls',
  };
  public catelogName: LogiReportFileDetails = { name: '/IRPReports/CredentialExpiry/CredentialExpiry.cat' };
  public title = 'Credential Expiry';
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

  @Select(LogiReportState.credentialTypes)
  credentialType$: Observable<CredentialType[]>;

  get daysExpiringIn(): AbstractControl {
    return this.credentialExpiryForm.get('daysExpiringIn') as AbstractControl;
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
      this.store.dispatch(new ClearLogiReportState());
      this.setReportData();
      this.agencyOrganizationId = data;
      this.isInitialLoad = true;
      this.handleFilterControlValueChange();
      this.onFilterRegionChangedHandler();
      this.onFilterLocationChangedHandler();

      this.user?.businessUnitType == BusinessUnitType.Hallmark
        ? this.credentialExpiryForm.get(analyticsConstants.formControlNames.BusinessIds)?.enable()
        : this.credentialExpiryForm.get(analyticsConstants.formControlNames.BusinessIds)?.disable();
    });
  }

  private setReportData() {
    this.logiReportData$
      .pipe(
        filter((data) => data.length > 0),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: ConfigurationDto[]) => {
        this.logiReportComponent.SetReportData(data);
      });
  }

  private initForm(): void {
    this.credentialExpiryForm = this.formBuilder.group({
      businessIds: new FormControl([Validators.required]),
      regionIds: new FormControl([]),
      locationIds: new FormControl([]),
      departmentIds: new FormControl([]),
      skillIds: new FormControl([]),
      workCommitments: new FormControl([]),
      employee: new FormControl(),
      credentialTypes: new FormControl([]),
      daysExpiringIn: new FormControl(30),
    });
  }

  public showFilters(): void {
    if (this.isLoadNewFilter) {
      this.handleFilterControlValueChange();
    }
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public handleFilterControlValueChange(): void {
    this.bussinessControl = this.credentialExpiryForm.get(
      analyticsConstants.formControlNames.BusinessIds
    ) as AbstractControl;

    this.organizationData$
      .pipe(
        filter((data) => data != null && data.length > 0),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        this.organizations = uniqBy(data, 'organizationId');
        this.defaultOrganizations = this.agencyOrganizationId;
        this.credentialExpiryForm
          .get(analyticsConstants.formControlNames.BusinessIds)
          ?.setValue(this.agencyOrganizationId);
        this.changeDetectorRef.detectChanges();
      });

    this.onBusinessControlValueChanged();
  }

  private onBusinessControlValueChanged() {
    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
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

          if (this.regionsList.length === 0 || this.locationsList.length === 0 || this.departmentsList.length === 0) {
            this.showToastMessage(this.regionsList.length, this.locationsList.length, this.departmentsList.length);
          } else {
            this.isResetFilter = true;
          }
          this.regions = this.regionsList;

          this.loadShiftData(data);
        } else {
          this.isClearAll = false;
          this.credentialExpiryForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
        }
      }
    });
  }

  private loadShiftData(businessUnitId: number) {
    const businessIdData = [];
    businessIdData.push(businessUnitId);
    const filterObj: CommonReportFilter = {
      businessUnitIds: businessIdData,
    };
    this.store.dispatch(new GetStaffScheduleReportFilterOptions(filterObj)).pipe(
      filter((data) => data !== null),
      takeWhile(() => this.isAlive)
    );
    this.staffScheduleReportFilterData$.subscribe((data: StaffScheduleReportFilterOptions) => {
      this.isAlive = false;
      this.filterOptionData = data;
      this.masterSkills = data?.masterSkills;
      this.workCommitments = data?.masterWorkCommitments;
      this.loadCredentialTypes();
      this.changeDetectorRef.detectChanges();      
    });
  }
  
  private loadCredentialTypes() {    
    this.store.dispatch(new GetCredentialTypes()).pipe(takeWhile(() => this.isAlive));
    this.credentialType$.subscribe((data) => {
      this.credentialTypes = data;
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

  public onFilterRegionChangedHandler(): void {
    this.regionIdControl = this.credentialExpiryForm.get(
      analyticsConstants.formControlNames.RegionIds
    ) as AbstractControl;
    this.regionIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.departments = [];
      this.locations = [];
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.regionIdControl.value.length > 0) {
        this.locations = this.locationsList.filter((i) => data?.includes(i.regionId));
      } else {
        this.credentialExpiryForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
        this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterLocationChangedHandler(): void {
    this.locationIdControl = this.credentialExpiryForm.get(
      analyticsConstants.formControlNames.LocationIds
    ) as AbstractControl;
    this.locationIdControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      if (this.locationIdControl.value.length > 0) {
        this.departments = this.departmentsList.filter((i) => data?.includes(i.locationId));
      } else {
        this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
      }
      this.changeDetectorRef.detectChanges();
    });
  }

  public onFilterClearAll(): void {
    const currentYear = new Date().getFullYear();
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.RegionIds)?.setValue([]);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.LocationIds)?.setValue([]);
    this.credentialExpiryForm.get(analyticsConstants.formControlNames.DepartmentIds)?.setValue([]);
    this.credentialExpiryForm.get('skillIds')?.setValue([]);
    this.credentialExpiryForm.get('startMonth')?.setValue(1);
    this.credentialExpiryForm.get('endMonth')?.setValue(12);
    this.credentialExpiryForm.get('startYear')?.setValue(currentYear);
    this.credentialExpiryForm.get('endYear')?.setValue(currentYear);
    this.filteredItems = [];
    this.locations = [];
    this.departments = [];

    this.regionsList = this.masterRegionsList;
    this.locationsList = this.masterLocationsList;
    this.departmentsList = this.masterDepartmentsList;

    this.changeDetectorRef.detectChanges();
  }

  public onFilterApply(): void {
    this.credentialExpiryForm.markAllAsTouched();
    if (this.credentialExpiryForm?.invalid) {
      return;
    }
    this.filteredItems = [];
    this.searchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public searchReport(): void {
    this.filteredItems = [];

    const { departmentIds, skillIds, workCommitments, employee, credentialTypes, daysExpiringIn } =
      this.credentialExpiryForm.getRawValue();
    if (!this.credentialExpiryForm.dirty) {
      this.message = 'Default filter selected with all regions, locations and departments.';
    } else {
      this.isResetFilter = false;
      this.message = '';
    }

    let departmentIdParam = '';
    if (departmentIds.length > 0) {
      departmentIdParam = departmentIds.join(',');
    } else if (this.departmentsList?.length > 0) {
      departmentIdParam = this.departmentsList.map((x) => x.id).join(',');
    }

    const skillIdParam = skillIds.length > 0 ? skillIds.join(',') : '';
    const workCommitmentParam = workCommitments.length > 0 ? workCommitments.join(',') : '';
    const ctParam = credentialTypes.length > 0 ? credentialTypes.join(',') : '';
    this.paramsData = {
      OrganizationIdParam: this.selectedOrganizations?.map((list) => list.organizationId).join(','),
      DepartmentIdParam: departmentIdParam,
      SkillsIdParam: skillIdParam,
      CredentialTypeParam: ctParam,
      DaysExpiringInParam: daysExpiringIn,
      EmployeeParam: employee,
      WorkCommitmentParam: workCommitmentParam,
    };
    console.log(this.paramsData);
    this.logiReportComponent.paramsData = this.paramsData;
    this.logiReportComponent.RenderReport();
  }

  getLastWeek() {
    const today = new Date(Date.now());
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
  }

  public onFiltering: EmitType<FilteringEventArgs> = (e: FilteringEventArgs) => {
    this.onFilterChild(e);
  };

  @OutsideZone
  private onFilterChild(e: FilteringEventArgs) {
    if (e.text != '') {
      const filter: ScheduleFilters = {
        firstLastNameOrId: e.text,
        startDate: '',
        endDate: '',
      };
      this.store.dispatch(new GetCandidateSearchFromScheduling(filter));
      this.employeesSearchFromScheduling$.subscribe((result) => {
        const candidates = result.items?.map((candidate: ScheduleCandidate) => ({
          ...candidate,
          fullName: `${candidate.firstName} ${candidate.lastName}`,
        }));
        this.candidateFilterData = candidates;
        this.candidateSearchData = candidates;
        e.updateData(this.candidateFilterData);
      });
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }
}

