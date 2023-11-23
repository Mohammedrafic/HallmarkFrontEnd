import { User_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { GetuserlogReportPage } from '@admin/store/userlog-activity.actions';
import { useractivityReportState } from '@admin/store/userlog-activity.state';
import { ColDef, ExcelStyle, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
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
import { DefaultUseractivityGridColDef, SideBarConfig } from './user-activity.constant';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { RolesPerUser } from '@shared/models/user-managment-page.model';
import { GroupEmailRole } from '@shared/models/group-email.model';
import { AlertsState } from '@admin/store/alerts.state';
import { GetGroupEmailRoles } from '@admin/store/alerts.actions';
import { isNumber } from 'lodash';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActivityComponent extends AbstractGridConfigurationComponent implements OnInit {
  public title: string = "User Activity Log Report";
  public message: string = ''
  userActivityForm: FormGroup;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;
  public unitFields = UNIT_FIELDS;
  public override filteredItems: FilteredItem[] = [];
  private isAlive = true;
  public userData: User[];
  public baseUrl: string = '';
  public gridApi: any;
  sideBar = SideBarConfig;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  paginationPageSize: number;
  defaultColDef: ColDef = DefaultUseractivityGridColDef;
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
  private unsubscribe$: Subject<void> = new Subject();
  public businessValue: BusinessUnit[];
  public allOption: string = 'All';

  public paramsData: any = {
    "businessUnitType": '',
    "id": '',
    "userId": '',
    "periodFrom": '',
    "periodTo": '',
  };
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
    return this.userActivityForm.get('businessunitType') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.userActivityForm.get('businessunitName') as AbstractControl;
  }

  get userControl(): AbstractControl {
    return this.userActivityForm.get('userName') as AbstractControl;
  }
  get rolesControl(): AbstractControl {
    return this.userActivityForm.get('roles') as AbstractControl;
  }
  isInitialloadCalled = false;
  public readonly columnDefs: ColumnDefinitionModel[] = [

    {
      headerName: 'User Name',
      field: 'userName',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'User Email Id',
      field: 'userEmailId',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Business Unit Name',
      field: 'businessUnitName',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'User Status',
      field: 'userStatus',
      minWidth: 200,
      filter: true,
      sortable: true,
      resizable: true,
      valueFormatter: params => (params.value ? 'Inactive' : 'Active'),
    },
    {
      headerName: 'User IP',
      field: 'userIP',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },

    {
      headerName: 'UTC Date & Time',
      field: 'utcDate',
      minWidth: 175,
      cellClass: 'date',
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = this.datePipe?.transform(cellValue, 'MM/dd/yyyy hh:mm:ss') as string
          const dateParts = dateAsString.split('/');
          const year = Number(dateParts[2]);
          const month = Number(dateParts[0]) - 1;
          const day = Number(dateParts[1]);

          const cellDate = new Date(year, month, day);
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          } else if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
          return 0;
        },
        inRangeFloatingFilterDateFormat: 'DD MMM YYYY'
      },
      cellRenderer: (params: ICellRendererParams) => {
        const str = this.datePipe?.transform(params.data.utcDate, 'MM/dd/yyyy & hh:mm:ss') as string
        return str?.length > 0 ? str : "";
      },
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Screen Name',
      field: 'screenName',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Screen Url',
      field: 'screenUrl',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },

    {
      headerName: 'Browser',
      field: 'client',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Event Type',
      field: 'eventType',
      minWidth: 200,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Event Target',
      field: 'eventTarget',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Event Target Type',
      field: 'eventTargetType',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Event Value',
      field: 'eventValue',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'Message',
      field: 'message',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },



  ];

  ngOnInit(): void {
    this.initForm();
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
      });
    const user = this.store.selectSnapshot(UserState.user) as User;
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(user?.businessUnitId || 0);
    const businessUnitType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
    if (businessUnitType == BusinessUnitType.Agency || businessUnitType == BusinessUnitType.Organization) {
      this.businessUnitControl.disable();
      this.businessControl.disable();
      this.isOrgage = true;
    }



  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 7);
    let endate= new Date(Date.now())
    endate.setDate(endate.getDate()+7);
    this.userActivityForm = this.formBuilder.group(
      {
        businessunitType: new FormControl([], [Validators.required]),
        businessunitName: new FormControl([], [Validators.required]),
        userName: new FormControl([], [Validators.required]),
        startDate: new FormControl(startDate),
        endDate: new FormControl(new Date(Date.now())),
        roles: new FormControl(),
      }
    );
  }
  public onFilterApply(): void {
    this.userActivityForm.markAllAsTouched();
    if (this.userActivityForm.invalid) {
      return;
    }
    this.SearchReport();
    this.store.dispatch(new ShowFilterDialog(false));
  }
  onFilterClearAll() {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 7);
    this.userActivityForm.controls['startDate'].setValue(startDate);
    this.userActivityForm.controls['endDate'].setValue(new Date(Date.now()));
    this.userActivityForm.controls['userName'].setValue(this.userData[0]?.id);


  }
  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private onBusinesstypeValueChanged(): void {
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
          this.userActivityForm.getRawValue().businessunitType,
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

    let { businessunitType, businessunitName, userName, startDate, endDate } = this.userActivityForm.getRawValue();
    this.paramsData =
    {
      'businessUnitType': businessunitType,
      'id': businessunitName,
      'userId': userName,
      'periodFrom': startDate,
      'periodTo': endDate,

    };

    this.logInterfacePage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      this.itemList = data;
      this.totalRecordsCount$.next(data?.length);
      if (!data || !data?.length) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
      this.gridApi?.setRowData(this.itemList);
    });

    this.store.dispatch(new GetuserlogReportPage(this.paramsData));
  }

  isInitialload() {
    this.SearchReport()
  }

  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };

  public gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefs,
    rowData: this.itemList,
    sideBar: this.sideBar,
    noRowsOverlayComponent: CustomNoRowsOverlayComponent,
    noRowsOverlayComponentParams: this.noRowsOverlayComponentParams,
    onFilterChanged: (event: FilterChangedEvent) => {
      if (!event.api.getDisplayedRowCount()) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
    }
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.itemList);
  }

  onPageSizeChanged(event: any) {
    this.cacheBlockSize = Number(event.value.toLowerCase().replace('rows', ''));
    this.paginationPageSize = Number(event.value.toLowerCase().replace('rows', ''));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.itemList);
    }
  }
  onBtExport() {
    const params = {
      fileName: 'User Activity Log Report',
      sheetName: 'User Activity Log Report'
    };
    this.gridApi.exportDataAsExcel(params);
  }

  public excelStyles: ExcelStyle[] = [

    {
      id: 'date',
      dataType: 'DateTime',
      numberFormat: {
        format: 'mm-dd-yyyy hh:mm:ss',
      },
    },

  ];
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
