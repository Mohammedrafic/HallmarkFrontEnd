import { BUSINESS_DATA_FIELDS, OPRION_FIELDS, User_DATA_FIELDS } from '@admin/alerts/alerts.constants';
import { GetuserlogReportPage } from '@admin/store/userlog-activity.actions';
import { useractivityReportState } from '@admin/store/userlog-activity.state';
import { ColDef, FilterChangedEvent, GridOptions, ICellRendererParams } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TypedValueGetterParams } from '@core/interface';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { LogiReportComponent } from '@shared/components/logi-report/logi-report.component';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { GRID_CONFIG } from '@shared/constants';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { LogiReportTypes } from '@shared/enums/logi-report-type.enum';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { FilteredItem } from '@shared/models/filter.model';
import { LogiReportFileDetails } from '@shared/models/logi-report-file';
import { User, UsersPage } from '@shared/models/user.model';
import { userActivity, useractivitlogreportPage } from '@shared/models/userlog-activity.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { BehaviorSubject, Observable, Subject, map, takeUntil, takeWhile } from 'rxjs';
import { APP_SETTINGS, AppSettings } from 'src/app.settings';
import { BUSSINES_DATA_FIELDS } from 'src/app/security/roles-and-permissions/roles-and-permissions.constants';
import { GetAllUsersPage, GetBusinessByUnitType, GetUsersPage } from 'src/app/security/store/security.actions';
import { SecurityState } from 'src/app/security/store/security.state';
import { DefaultUserGridColDef, SideBarConfig } from 'src/app/security/user-list/user-grid/user-grid.constant';
import { UNIT_FIELDS } from 'src/app/security/user-list/user-list.constants';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActivityComponent extends AbstractGridConfigurationComponent implements OnInit {
  public title: string = "User Activity Details";
  public message: string = ''
  userActivityForm: FormGroup;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;
  defaultColDef: ColDef = DefaultUserGridColDef;

  public unitFields = UNIT_FIELDS;
  public override filteredItems: FilteredItem[] = [];
  private isAlive = true;
  public userData: User[];
  public baseUrl: string = '';
  public gridApi: any;

  sideBar = SideBarConfig;
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  @Select(SecurityState.allUsersPage)
  public userData$: Observable<UsersPage>;

  
  @Select(useractivityReportState.CustomReportPage)
  public logInterfacePage$: Observable<useractivitlogreportPage>;

  @Select(SecurityState.businessUserData)
  public businessUserData$: Observable<(type: number) => BusinessUnit[]>;
  isBusinessFormDisabled = false;
  public reportName: LogiReportFileDetails = { name: "/JsonApiReports/TimeSheetReport/TimeSheet.cls" };
  public catelogName: LogiReportFileDetails = { name: "/JsonApiReports/TimeSheetReport/TimeSheet.cat" };
  public reportType: LogiReportTypes = LogiReportTypes.WebReport;
  private unsubscribe$: Subject<void> = new Subject();

  public paramsData: any = {
    "businessUnitType":'',
    "businnessUnit":  ''  ,  
    "userId":  ''  ,
    "StartDateParamTS": '',
    "EndDateParamTS": '',
    "BearerParamAR": '',
    "HostName":'',
  };
  @ViewChild(LogiReportComponent, { static: true }) logiReportComponent: LogiReportComponent;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  public totalRecordsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private store: Store, private actions$: Actions, private formBuilder: FormBuilder, private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(APP_SETTINGS) private appSettings: AppSettings

  ) {
    super();
    this.baseUrl = this.appSettings.host.replace("https://", "").replace("http://", "");
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
  isInitialloadCalled=false
  public readonly columnDefs: ColumnDefinitionModel[] = [
    {
      field: 'id',
      hide: true,
      filter: false,
    },
   
    {
      headerName: 'Name',
      field: 'userName',
      minWidth: 250,
      filter: true,
      sortable: true,
      resizable: true
    },
    {
      headerName: 'IP',
      field: 'userIP',
      minWidth: 250,
      filter: true,
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
      headerName: 'Date',
      field: 'utcDate',
      minWidth: 100,
      filter: 'agDateColumnFilter',
      filterParams: {
        buttons: ['reset'],
        debounceMs: 1000,
        suppressAndOrCondition: true,
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
          if (cellValue == null) {
            return 0;
          }
          const dateAsString = this.datePipe?.transform(cellValue, 'MM/dd/yyyy') as string
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
        if(!Number.isNaN(Date.parse(params.data?.creationDate)))
        {
          const str = this.datePipe?.transform(params.data.creationDate, 'MM/dd/yyyy') as string
          return str?.length > 0 ? str : "";
        }else{
          return params.data.creationDate;
        }
      },
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
  
  ];

  ngOnInit(): void {
    this.initForm();
    this.onBusinesstypeValueChanged();
    this.onBusinesunitValueChanged();
    const user = this.store.selectSnapshot(UserState.user) as User;
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(user?.businessUnitId || 0);

  }
  get bussinesUserData$(): Observable<BusinessUnit[]> {
    return this.businessUserData$.pipe(map((fn) => fn(this.businessUnitControl?.value)));
  }
  getLastWeek() {
    var today = new Date(Date.now());
    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
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

  }
  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }
  onFilterDelete(value: any) {


    
  }
  private onBusinesstypeValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      value && this.store.dispatch(new GetBusinessByUnitType(value));
      // this.dispatchUserPage([])
      // this.userData=[];
      // this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      //   if (data != undefined && data != null) {
      //     this.userData = data.items;
      //     this.userControl.patchValue(this.userData[0]?.id)
 
      // }
      // });
      if (!this.isBusinessFormDisabled) {
        this.businessControl.patchValue(0);
      }
    });

  }

  private onBusinesunitValueChanged(): void {

    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
        if(value==0)
        {        

          this.dispatchUserPage([]);
        }
        else{
          this.dispatchUserPage([value]);
          this.userData=[];

        }
        if(!this.isInitialloadCalled)
        {
        this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
          if (data != undefined && data != null) {
            this.userData = data.items;
            this.userControl.patchValue(this.userData[0]?.id)
            if (!this.isInitialloadCalled) { 
              this.isInitialload(); 
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

    let { businessunitType,businessunitName,userName,startDate,endDate } = this.userActivityForm.getRawValue();
 
 

    this.paramsData =
    {
      "businessUnitType":businessunitType,
      "businnessUnit":  businessunitName  ,  
      "userId":  userName  ,
      "StartDateParamTS": startDate,
      "EndDateParamTS": endDate,
  
    };
    //  this.logiReportComponent.paramsData = this.paramsData;
    // this.logiReportComponent.RenderReport();

    this.logInterfacePage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
    
      this.itemList = data?.items?.sort(function (a: any, b: any) {
        return b.createdAt.localeCompare(a.createdAt);
      });
      this.totalRecordsCount$.next(data?.totalCount);
      if (!data || !data?.items.length) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
      }
      this.gridApi?.setRowData(this.itemList);
    });

    this.store.dispatch(new GetuserlogReportPage(this.paramsData));
  }
  isInitialload(){
    this.SearchReport()
  }
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };
  itemList: Array<userActivity> = [];

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
  cacheBlockSize: any;

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.itemList);
  }
}
