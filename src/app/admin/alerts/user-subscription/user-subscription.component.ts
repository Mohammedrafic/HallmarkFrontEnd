import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Observable, Subject, takeWhile } from 'rxjs';
import { SecurityState } from 'src/app/security/store/security.state';
import { alertsFilterColumns, BUSINESS_UNITS_VALUES, BUSINESS_DATA_FIELDS, DISABLED_GROUP, OPRION_FIELDS, User_DATA_FIELDS } from '../alerts.constants';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { ToggleSwitchComponent } from '../toggle-switch/toggle-switch.component';
import { GridReadyEvent } from '@ag-grid-community/core';
import { AlertChannel, AlertEnum } from 'src/app/admin/alerts/alerts.enum';
import { GetUserSubscriptionPage, UpdateUserSubscription } from '@admin/store/alerts.actions';
import { UserSubscription, UserSubscriptionFilters, UserSubscriptionPage, UserSubscriptionRequest } from '@shared/models/user-subscription.model';
import { AlertsState } from '@admin/store/alerts.state';
import { GetAllUsersPage, GetBusinessByUnitType } from 'src/app/security/store/security.actions';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetHeaderState, ShowToast } from 'src/app/store/app.actions';
import { User, UsersPage } from '@shared/models/user.model';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_MODIFIED } from '@shared/constants';

@Component({
  selector: 'app-user-subscription',
  templateUrl: './user-subscription.component.html',
  styleUrls: ['./user-subscription.component.scss'],
})
export class UserSubscriptionComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  
  @Select(SecurityState.allUsersPage)
  public userData$: Observable<UsersPage>;

  @Select(AlertsState.UserSubscriptionPage)
  public userSubscriptionPage$: Observable<UserSubscriptionPage>;

  @Select(AlertsState.UpdateUserSubscription)
  public updateUserSubscription$: Observable<boolean>;

  @Input() filterForm: FormGroup;
  public businessForm: FormGroup;
  public isEditRole = false;
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public businessDataFields = BUSINESS_DATA_FIELDS;  
  public userDataFields = User_DATA_FIELDS;
  public roleId: number | null;
  public filterColumns = alertsFilterColumns;
  private filters: UserSubscriptionFilters = {};
  public export$ = new Subject<ExportedFileType>();
  public defaultColDef: any;
  public autoGroupColumnDef: any;
  public title: string = "User Subscription";
  //public userGuid: string = "BB401BC8-EA62-49B0-ABBD-9A32C3DA0853";
  public userGuid: string = "";
  itemList: Array<UserSubscription> | undefined;
  private gridApi: any;
  private gridColumnApi: any;
  private isAlive = true;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  rowModelType: any;
  serverSideInfiniteScroll: any;
  cacheBlockSize: any;
  pagination: boolean;
  paginationPageSize: number;
  columnDefs: any;
  filterText: string | undefined;
  frameworkComponents: any;
  sideBar: any;
  serverSideStoreType: any;
  maxBlocksInCache: any;
  defaultValue:any;
  userData:User[];
  get businessUnitControl(): AbstractControl {
    return this.businessForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.businessForm.get('business') as AbstractControl;
  }
  get usersControl(): AbstractControl {
    return this.businessForm.get('user') as AbstractControl;
  }
  constructor(private actions$: Actions,
    private store: Store) {
    super();
    store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
    this.rowModelType = 'serverSide';
    this.serverSideInfiniteScroll = true,
      this.pagination = true;
    this.paginationPageSize = this.pageSize,
      this.cacheBlockSize = this.pageSize;
    this.serverSideStoreType = 'partial';
    this.maxBlocksInCache = 2;
    this.columnDefs = [
      {
        field: 'id',
        hide: true
      },
      {
        headerName: 'Alert Description',
        field: 'alert.alertTitle',
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        }
      },
      {
        headerName: 'Email',
        field: 'isEmailEnabled',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          onChange: this.onEmailChanged.bind(this),
          label: 'email'
        },
        valueGetter: (params: { data: { isEmailEnabled: boolean } }) => { return AlertEnum[Number(params.data.isEmailEnabled)] },
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      {
        headerName: 'SMS',
        field: 'isSMSEnabled',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          onChange: this.onSmsChanged.bind(this),
          label: 'sms'
        },
        valueGetter: (params: { data: { isSMSEnabled: boolean } }) => { return AlertEnum[Number(params.data.isSMSEnabled)] },
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      {
        headerName: 'OnScreen',
        field: 'isOnScreenEnabled',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          onChange: this.onScreenChanged.bind(this),
          label: 'onScreen'
        },
        valueGetter: (params: { data: { isOnScreenEnabled: boolean } }) => { return AlertEnum[Number(params.data.isOnScreenEnabled)] },
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },


    ];

    this.defaultColDef = {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: false
    };

    this.autoGroupColumnDef = {
      flex: 1,
      minWidth: 280,
      field: 'name',
    };

  }
  ngOnDestroy(): void {
    this.isAlive = false;
  }
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };
  ngOnInit(): void {
    this.businessForm = this.generateBusinessForm();
    this.onBusinessUnitValueChanged();
    this.onBusinessValueChanged();
    this.onUserValueChanged();

    const user = this.store.selectSnapshot(UserState.user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.businessForm.disable();
    }
    if (user?.businessUnitType === BusinessUnitType.MSP) {
      const [Hallmark, ...rest] = this.businessUnits;
      this.businessUnits = rest;
    }
    this.businessControl.patchValue(this.isBusinessFormDisabled ? user?.businessUnitId : 0);


    this.actions$
      .pipe(
        takeWhile(() => this.isAlive)
      );

      this.businessData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
        
        if (!this.isBusinessFormDisabled) {
          this.defaultValue = data[0]?.id;
        }
      });
      this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => { 
        if(data!=undefined)
        {       
        this.userData=data.items;
        }
      });
  }
  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.showLoadingOverlay();
    var datasource = this.createServerSideDatasource();
    console.log(datasource);
    params.api.setServerSideDatasource(datasource);
  }
  private generateBusinessForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      business: new FormControl(0),
      user:new FormControl(0)
    });
  }
  private onBusinessUnitValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.userData=[];
      this.itemList=[];
      this.store.dispatch(new GetBusinessByUnitType(value));
      
    });
  }
  private onBusinessValueChanged(): void {
    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.userData=[];
      this.itemList=[];
      let businessUnitIds=[];
      if(value!=0 &&value!=null)
      {
      businessUnitIds.push(this.businessControl.value);
      }
      this.store.dispatch(new GetAllUsersPage(this.businessUnitControl.value,businessUnitIds,this.currentPage,this.pageSize,null,null, true));
      
    });
  } 
  private onUserValueChanged(): void {
    this.usersControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.dispatchNewPage();
      
    });
  }   
  createServerSideDatasource() {
    let self = this;
    return {
      getRows: function (params: any) {
        setTimeout(() => {
          let postData = {
            pageNumber: params.request.endRow / self.paginationPageSize,
            pageSize: self.paginationPageSize,
            sortFields: params.request.sortModel,
            filterModels: params.request.filterModel
          };
          var filter: any;
          let jsonString = JSON.stringify(params.request.filterModel);
          if (jsonString != "{}") {
            var updatedJson = jsonString.replace("operator", "logicalOperator");
            filter = JSON.parse(updatedJson);
          }
          else filter = null;

          var sort = postData.sortFields.length > 0 ? postData.sortFields : null;
          self.userSubscriptionPage$.pipe().subscribe((data: any) => {
          
              self.itemList = data?.items;
              if (!self.itemList || !self.itemList.length) {
                self.gridApi.showNoRowsOverlay();
              }
              else {
                self.gridApi.hideOverlay();
              }
              params.successCallback(self.itemList, data?.totalCount || 1);
            
          });
        }, 500);
      }
    }
  }
  onPageSizeChanged(event: any) {
    this.cacheBlockSize = Number(event.value.toLowerCase().replace("rows", ""));
    this.paginationPageSize = Number(event.value.toLowerCase().replace("rows", ""));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.gridOptionsWrapper.setProperty('cacheBlockSize', Number(event.value.toLowerCase().replace("rows", "")));
      var datasource = this.createServerSideDatasource();
      this.gridApi.setServerSideDatasource(datasource);
    }
  }
  private dispatchNewPage(sortModel: any = null, filterModel: any = null): void {
    const { businessUnit, business ,user} = this.businessForm?.getRawValue();
    if(this.usersControl.value!=0 &&this.usersControl.value!=undefined)
    {
      this.userGuid=user;
      this.store.dispatch(new GetUserSubscriptionPage(businessUnit || null, user, this.currentPage, this.pageSize, sortModel, filterModel, this.filters));
    }
  }
  public onEmailChanged(data: any): void {
    this.SaveData(data,AlertChannel.Email);
  }
  public onSmsChanged(data: any): void {
    this.SaveData(data,AlertChannel.SMS);
  }
  public onScreenChanged(data: any): void {
    this.SaveData(data,AlertChannel.OnScreen);
  }
  private SaveData(data:any,alertChannel:AlertChannel)
  {
    if (data != undefined) {
      let updateUserSubscription: UserSubscriptionRequest = {
        alertId: data.rowData?.alertId,
        userId: this.userGuid,
        alertChannel: alertChannel,
        enabled: data.event?.checked
      }
      this.store.dispatch(new UpdateUserSubscription(updateUserSubscription));
      this.updateUserSubscription$.pipe().subscribe((updated: any) => {
        if (updated != undefined &&updated==true) {        
          this.dispatchNewPage();
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));     
        }
      });
      
    }
  }

}
