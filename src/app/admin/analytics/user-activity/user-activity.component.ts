import { User_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { GetuserlogReportPage } from '@admin/store/userlog-activity.actions';
import { useractivityReportState } from '@admin/store/userlog-activity.state';
import { ColDef, ExcelStyle, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {  Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { FilteredItem } from '@shared/models/filter.model';
import { User, UsersPage } from '@shared/models/user.model';
import { userActivity, useractivitlogreportPage } from '@shared/models/userlog-activity.model';
import { BehaviorSubject, Observable, Subject, map, takeUntil, takeWhile } from 'rxjs';
import { APP_SETTINGS, AppSettings } from 'src/app.settings';
import { BUSSINES_DATA_FIELDS } from 'src/app/security/roles-and-permissions/roles-and-permissions.constants';
import { GetAllUsersPage, GetBusinessByUnitType, GetUsersPage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { UNIT_FIELDS } from 'src/app/security/user-list/user-list.constants';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { DefaultUseractivityGridColDef, SideBarConfig } from './user-activity.constant';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActivityComponent extends AbstractGridConfigurationComponent implements OnInit {
  public title: string = "User Audit Log Report";
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
  itemList: Array<userActivity> = [];
  @Select(SecurityState.allUsersPage)
  public userData$: Observable<UsersPage>;

  @Select(useractivityReportState.CustomReportPage)
  public logInterfacePage$: Observable<useractivitlogreportPage>;

  @Select(SecurityState.businessUserData)
  public businessUserData$: Observable<(type: number) => BusinessUnit[]>;
  isBusinessFormDisabled = false;

  private unsubscribe$: Subject<void> = new Subject();

  public paramsData: any = {
    "businessUnitType": '',
    "id": '',
    "userId": '',
    "periodFrom": '',
    "periodTo": '',
  };
  public totalRecordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

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
      valueFormatter: params => (params.value ? 'Active' : 'Inactive'),
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
 


  ];

  ngOnInit(): void {
    this.initForm();
    this.onBusinesstypeValueChanged();
    this.onBusinesunitValueChanged();
    const user = this.store.selectSnapshot(UserState.user) as User;
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(user?.businessUnitId || 0);
    const businessUnitType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
    if(businessUnitType == BusinessUnitType.Agency || businessUnitType == BusinessUnitType.Organization) {
      this.businessUnitControl.disable();
    }


  }
  get bussinesUserData$(): Observable<BusinessUnit[]> {
    return this.businessUserData$.pipe(map((fn) => fn(this.businessUnitControl?.value)));
  }

  private initForm(): void {
    let startDate = new Date(Date.now());
    startDate.setDate(startDate.getDate() - 7);
    this.userActivityForm = this.formBuilder.group(
      {
        businessunitType: new FormControl([], [Validators.required]),
        businessunitName: new FormControl([], [Validators.required]),
        userName: new FormControl([], [Validators.required]),
        startDate: new FormControl(startDate),
        endDate: new FormControl(new Date(Date.now())),
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
  }
  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  private onBusinesstypeValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      value && this.store.dispatch(new GetBusinessByUnitType(value));
      if (!this.isBusinessFormDisabled) {
        this.businessControl.patchValue(0);
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
            this.userData = sortByField(data.items,'name');
            this.userControl.patchValue(this.userData[0]?.id)
            if (!this.isInitialloadCalled) {
              setTimeout(()=>{
                this.isInitialload();
              }, 0);
              this.isInitialloadCalled = true;
              this.changeDetectorRef.detectChanges();

            }
          }
        })
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
      fileName: 'User Audit Log Report',
      sheetName:'User Audit Log Report'
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
}
