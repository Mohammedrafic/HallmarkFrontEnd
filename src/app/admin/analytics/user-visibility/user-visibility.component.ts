import { User_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { GetuserlogReportPage } from '@admin/store/userlog-activity.actions';
import { useractivityReportState } from '@admin/store/userlog-activity.state';
import { ColDef, ExcelStyle, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { FilteredItem } from '@shared/models/filter.model';
import { User, UsersPage } from '@shared/models/user.model';
import { userActivity, useractivitlogreportPage } from '@shared/models/userlog-activity.model';
import { BehaviorSubject, Observable, Subject, distinctUntilChanged, map, takeUntil, takeWhile } from 'rxjs';
import { APP_SETTINGS, AppSettings } from 'src/app.settings';
import { BUSSINES_DATA_FIELDS } from 'src/app/security/roles-and-permissions/roles-and-permissions.constants';
import { GetAllUsersPage, GetBusinessByUnitType, GetEmployeeUsers, GetNonEmployeeUsers, GetRolePerUser, GetUsersPage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { UNIT_FIELDS } from 'src/app/security/user-list/user-list.constants';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { RolesPerUser } from '@shared/models/user-managment-page.model';
import { GroupEmailRole } from '@shared/models/group-email.model';
import { AlertsState } from '@admin/store/alerts.state';
import { GetGroupEmailRoles } from '@admin/store/alerts.actions';
import { isNumber } from 'lodash';
import { Organisation } from '@shared/models/visibility-settings.model';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { ClearLogiReportState } from '@organization-management/store/logi-report.action';
import { analyticsConstants } from '../constants/analytics.constant';
import { LogiReportState } from '@organization-management/store/logi-report.state';
import { ConfigurationDto } from '@shared/models/analytics.model';

@Component({
  selector: 'app-user-visibility',
  templateUrl: './user-visibility.component.html',
  styleUrls: ['./user-visibility.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserVisibilityComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;

  public title: string = "User  Visibility";
  public message: string = ''
  userVisibilityForm: FormGroup;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;
  public unitFields = UNIT_FIELDS;
  public override filteredItems: FilteredItem[] = [];
  private isAlive = true;
  public userData: User[];
  public baseUrl: string = '';
  public gridApi: any;
  public filterColumns: any;

  public isResetFilter: boolean = false;
  // sideBar = SideBarConfig;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  paginationPageSize: number;
  // defaultColDef: ColDef = DefaultUseractivityGridColDef;
  cacheBlockSize: any;
  public roleData: GroupEmailRole[];

  itemList: Array<userActivity> = [];
  @Select(SecurityState.allUsersPage)
  public userData$: Observable<UsersPage>;

  @Select(useractivityReportState.CustomReportPage)
  public logInterfacePage$: Observable<useractivitlogreportPage>;

  // @Select(SecurityState.businessUserData)
  // public businessUserData$: Observable<(type: number) => BusinessUnit[]>;
  @Select(AlertsState.GetGroupRolesByOrgId)
  public roleData$: Observable<GroupEmailRole[]>;
  @Select(SecurityState.newBusinessDataPerUser)
  public newBusinessDataPerUser$: Observable<(type: number) => BusinessUnit[]>;
  isBusinessFormDisabled = false;
  @Select(SecurityState.rolesPerUsers)
  rolesPerUsers$: Observable<RolesPerUser[]>;
  @Select(SecurityState.nonEmployeeUserData)
  public nonEmployeeUserData$: Observable<User[]>;
  
  @Select(UserState.lastSelectedOrganizationId)
  private organizationId$: Observable<number>;
  
  private unsubscribe$: Subject<void> = new Subject();
  public businessValue: BusinessUnit[];
  public allOption: string = 'All';

  @Select(LogiReportState.logiReportData)
  public logiReportData$: Observable<ConfigurationDto[]>;

  private culture = 'en-US';

  @Select(SecurityState.organisations)
  public organizationData$: Observable<Organisation[]>;

  selectedOrganizations: Organisation[];

  public paramsData: any = {
    "DepartmentIdUV": '',
    "LocationIdUV": '',
    "OrganizationIdUV": '',
    "RegionIdUV": '',
    "RoleNameUV": '',
  };
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/UserVisibility/UserVisibility.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/UserVisibility/UserVisibility.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.PageReport;


  public totalRecordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  defaultBusinessValue: any;
  public masterUserData: User[];
  isOrgage: boolean;

  constructor(private store: Store, private formBuilder: FormBuilder, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(APP_SETTINGS) private appSettings: AppSettings

  ) {
    super();
    this.store.dispatch(new SetHeaderState({ title: "Analytics", iconName: '' }));
  }
  get businessUnitControl(): AbstractControl {
    return this.userVisibilityForm.get('businessunitType') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.userVisibilityForm.get('businessunitName') as AbstractControl;
  }

  get userControl(): AbstractControl {
    return this.userVisibilityForm.get('userName') as AbstractControl;
  }
  get rolesControl(): AbstractControl {
    return this.userVisibilityForm.get('roles') as AbstractControl;
  }
  isInitialloadCalled = false;


  ngOnInit(): void {
    // console.log(this.businessUnits[3]);
    //   this.store.dispatch(
    //     new GetAllUsersPage(
    //       this.userVisibilityForm.getRawValue().businessunitType,
    //       businessUnitIds,
    //       1,
    //       100,
    //       null,
    //       null,
    //       true
    //     )
    //   );
    // }
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: number) => {
      this.store.dispatch(new ClearLogiReportState());
      this.orderFilterColumnsSetup();
      this.logiReportData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: ConfigurationDto[]) => {
        if (data.length > 0) {
          this.logiReportComponent.SetReportData(data);
        }
      });
      // this.agencyOrganizationId = data;
      this.onFilterControlValueChangedHandler();
    });
    this.initForm();
    // this.onFilterControlValueChangedHandler();
    this.onBusinesstypeValueChanged();
    this.onBusinesunitValueChanged();
    this.onRolesValueChanged()
    
    this.newBusinessDataPerUser$
      .pipe(
        map((fn) => fn(this.businessUnitControl?.value)),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.businessValue = value;
        this.defaultBusinessValue = this.businessValue[0]?.id

        // this.userVisibilityForm.controls['businessunitName'].setValue(this.selectedOrganizations[0].id);

      });
    this.store.dispatch(new ClearLogiReportState());
    this.orderFilterColumnsSetup();
    const user = this.store.selectSnapshot(UserState.user) as User;
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(user?.businessUnitId || 0);
    
    const businessUnitType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
    if (businessUnitType == BusinessUnitType.Agency || businessUnitType == BusinessUnitType.Organization) {
      this.businessUnitControl.disable();
      this.businessControl.disable();
      this.isOrgage = true;
    }
    this.userVisibilityForm.controls['businessunitType'].setValue(3);



  }

  private initForm(): void {

    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 7);
    let endate = new Date(Date.now())
    endate.setDate(endate.getDate() + 7);
    this.userVisibilityForm = this.formBuilder.group(
      {
        businessunitType: new FormControl([], [Validators.required]),
        businessunitName: new FormControl([], [Validators.required]),
        userName: new FormControl([], [Validators.required]),
        roles: new FormControl(),
      }
    );
  }
  public onFilterApply(): void {
    this.userVisibilityForm.markAllAsTouched();
    if (this.userVisibilityForm.invalid) {
      return;
    }
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public bussinessControl: AbstractControl;
  public onFilterControlValueChangedHandler(): void {
    this.organizationData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      
      if (data != null && data.length > 0) {
        this.selectedOrganizations = data;

        this.changeDetectorRef.detectChanges();
      }
    });
    
    this.bussinessControl = this.userVisibilityForm.get('businessunitType') as AbstractControl;

    this.bussinessControl.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.selectedOrganizations = [];
      // if (data != null && typeof data === 'number' && data != this.previousOrgId) {
      if (data && data.length > 0) {
        this.filterColumns.agencyIds.dataSource = [];



      }
    });

  }

  onFilterClearAll() {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 7);
    this.userVisibilityForm.controls['businessunitType'].setValue(3);
    this.userVisibilityForm.controls['businessunitName'].setValue([]);
    // this.userVisibilityForm.controls['userName'].setValue(this.userData[0]?.id);
  }
  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private onBusinesstypeValueChanged(): void {
    

    this.userVisibilityForm.controls['businessunitName'].setValue(this.selectedOrganizations);
    this.businessValue = []
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      value && this.store.dispatch(new GetBusinessByUnitType(value));
      if (!this.isBusinessFormDisabled) {
        const user = this.store.selectSnapshot(UserState.user) as User;
        this.businessControl.patchValue(user?.businessUnitId || 0);
      }
    });

  }

  private onBusinesunitValueChanged(): void {
    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (value == 0) {
        this.dispatchUserPage([]);
      }
      else {
        this.dispatchUserPage([value]);
        this.userData = [];
      }

      if (!this.isInitialloadCalled) {
        this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
          if (data != undefined && data != null) {
            this.userData = sortByField(data.items, 'name');
            this.userControl.patchValue(this.userData[0]?.id)
            this.changeDetectorRef.detectChanges()
            const user = this.store.selectSnapshot(UserState.user) as User;
            if (this.businessUnitControl.value == user.businessUnitType) {
              this.userControl.patchValue(user.id)
            } else {
              this.userControl.patchValue(this.userData[0].id)
            }
            if (!this.isInitialloadCalled) {
              setTimeout(() => {
                this.userControl.patchValue(user.id)
                this.isInitialload();
              }, 0);
              this.isInitialloadCalled = true;
              this.changeDetectorRef.detectChanges();

            }
          }
        })
      }

      this.userData = [];
      let businessUnitIds = [];
      if (value != 0 && value != null) {
        businessUnitIds.push(this.businessControl.value);
      }

      this.roleData = [];
      this.changeDetectorRef.detectChanges()

      var businessId = this.businessControl.value;
      if (businessId != undefined) {
        this.store.dispatch(new GetGroupEmailRoles([businessId]));
        const user = this.store.selectSnapshot(UserState.user) as User;

        this.roleData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
          this.roleData = data;
          if (this.isOrgage) {
            const roleIds = user?.roles.map((role: { id: any; }) => role.id) || [];
            this.rolesControl.patchValue(roleIds);
          }
          this.changeDetectorRef.detectChanges()

        });
      }
    })

  }


  private dispatchUserPage(businessUnitIds: number[]) {
    if (this.businessUnitControl.value != null) {
      this.store.dispatch(
        new GetAllUsersPage(
          this.userVisibilityForm.getRawValue().businessunitType,
          businessUnitIds,
          1,
          100,
          null,
          null,
          true
        )
      );
    }


  }


  public SearchReport(): void {
    this.filteredItems = [];
    let auth = "Bearer ";
    for (let x = 0; x < window.localStorage.length; x++) {
      if (window.localStorage.key(x)!.indexOf('accesstoken') > 0) {
        auth = auth + JSON.parse(window.localStorage.getItem(window.localStorage.key(x)!)!).secret
      }
    }
    let { businessunitName, departmentIds, locationIds,userName,
      regionIds} = this.userVisibilityForm.getRawValue();


    regionIds = "null";
    locationIds = "null";
    departmentIds = "null";
    this.isResetFilter = false;
    // var orgName = this.selectedOrganizations.length == 1 ? this.filterColumns.businessIds.dataSource.filter((elem: any) => this.selectedOrganizations.includes(elem.organizationId)).map((value: any) => value.name).join(",") : "";
    let currentDate = new Date(Date.now());
    this.paramsData =
    {
      

      "OrganizationIdUV": businessunitName.toString(),
      "RegionIdUV": "",
      "LocationIdUV": "",
      "DepartmentIdUV":"",
      "RoleNameUV":"",
      "UserNameUV":userName,
      // "organizationNameVSR": orgName,
      "reportPulledMekssageVSR": "Report Print date: " + String(currentDate.getMonth() + 1).padStart(2, '0') + "/" + currentDate.getDate() + "/" + currentDate.getFullYear().toString(),
        // "DateRangeParamVSR": (formatDate(startDate, "MMM", this.culture) + " " + startDate.getDate() + ", " + startDate.getFullYear().toString()).trim() + " - " + (formatDate(endDate, "MMM", this.culture) + " " + endDate.getDate() + ", " + endDate.getFullYear().toString()).trim(),
        // "PeriodParamVSR": period == null ? 0 : period,
        // // "UserIdParamVMSIR": this.user?.id,

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
      userName: {
        type: ControlTypes.Multiselect,
        valueType: ValueType.Id,
        dataSource: [],
        valueField: 'name',
        valueId: 'id',
      }


    }
  }
  isInitialload() {
    this.SearchReport()
  }


  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private onRolesValueChanged(): void {
    this.rolesControl.valueChanges.pipe(distinctUntilChanged(), takeWhile(() => this.isAlive)).subscribe((value) => {
      this.userControl.reset();
      this.userData = [];
      if (value && value.length > 0) {
        this.getUsersByRole();
      }
      else {
        
        // if (this.businessUnitControl?.value == BusinessUnitType.Organization) {
        this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
          if (data != undefined && data != null) {
            this.userData = sortByField(data.items, 'name');
            this.userControl.patchValue(this.userData[0]?.id)
            this.changeDetectorRef.detectChanges()
            const user = this.store.selectSnapshot(UserState.user) as User;
            if (this.businessUnitControl.value == user.businessUnitType) {
              this.userControl.patchValue(user.id)
            } else {
              this.userControl.patchValue(this.userData[0].id)
            }
            if (!this.isInitialloadCalled) {
              setTimeout(() => {
                this.userControl.patchValue(user.id)
                this.isInitialload();
              }, 0);
              this.isInitialloadCalled = true;
              this.changeDetectorRef.detectChanges();

            }
          }
        })

      }


    });
  }
  private getUsersByRole(): void {
    this.userData = [];
    if (this.rolesControl.value.length > 0) {
      this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
        if (data != undefined) {
          this.masterUserData = data.items;
          this.userData = data.items.filter(i => i.isDeleted == false);
          this.userData = this.userData.filter(f => (f.roles || []).find((f: { id: number; }) => this.rolesControl.value.includes(f.id)))
          this.changeDetectorRef.detectChanges();
        }
      });

    }
  }
}
