import { AdminState } from './../../store/admin.state';
import { OrderManagementService } from './../../../client/order-management/components/order-management-content/order-management.service';
import { GetEmployeeUsers, GetNonEmployeeUsers, GetRolePerUser } from './../../../security/store/security.actions';
import { ButtonModel } from './../../../shared/models/buttons-group.model';
import { Component, Input, NgZone, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { distinctUntilChanged, filter, Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { SecurityState } from 'src/app/security/store/security.state';
import {
  alertsFilterColumns,
  BUSINESS_DATA_FIELDS,
  DISABLED_GROUP,
  OPRION_FIELDS,
  User_DATA_FIELDS
} from '../alerts.constants';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { ToggleSwitchComponent } from '../toggle-switch/toggle-switch.component';
import { GridReadyEvent } from '@ag-grid-community/core';
import { AlertChannel, AlertEnum,AlertIdEnum } from 'src/app/admin/alerts/alerts.enum';
import { GetGroupEmailRoles, GetUserSubscriptionPage, UpdateUserSubscription } from '@admin/store/alerts.actions';
import {
  UserSubscription,
  UserSubscriptionFilters,
  UserSubscriptionPage,
  UserSubscriptionRequest
} from '@shared/models/user-subscription.model';
import { AlertsState } from '@admin/store/alerts.state';
import { GetAllUsersPage, GetBusinessByUnitType, GetBusinessForEmployeeType } from 'src/app/security/store/security.actions';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetHeaderState, ShouldDisableUserDropDown, ShowToast } from 'src/app/store/app.actions';
import { User, UsersPage } from '@shared/models/user.model';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { MessageTypes } from '@shared/enums/message-types';
import { GRID_CONFIG, RECORD_MODIFIED, USER_SUBSCRIPTION_PERMISSION } from '@shared/constants';
import { AppState } from '../../../store/app.state';
import { BUSINESS_UNITS_VALUES_WITH_IRP } from '@shared/constants/business-unit-type-list';
import { OutsideZone } from '@core/decorators';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { DetectActiveSystem, SystemGroupConfig } from '@client/order-management/constants';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { GetOrganizationById } from '@admin/store/alerts.actions';
import { Organization } from '@shared/models/organization.model';
import { isNumber } from 'lodash';
import { GroupEmailRole } from '@shared/models/group-email.model';
import { RolesPerUser } from '@shared/models/user-managment-page.model';

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

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  @Select(AppState.shouldDisableUserDropDown)
  public shouldDisableUserDropDown$: Observable<boolean>;

  @Select(SecurityState.userData)
  public employeeUserData$: Observable<User[]>;

  @Select(SecurityState.nonEmployeeUserData)
  public nonEmployeeUserData$: Observable<User[]>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(SecurityState.rolesPerUsers)
  rolesPerUsers$: Observable<RolesPerUser[]>;

  @Input() filterForm: FormGroup;
  public businessForm: FormGroup;
  public isEditRole = false;
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES_WITH_IRP;
  public filteredBusinessUnits = BUSINESS_UNITS_VALUES_WITH_IRP;
  public optionFields = OPRION_FIELDS;
  public businessDataFields = BUSINESS_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;
  public roleId: number | null;
  public filterColumns = alertsFilterColumns;
  private filters: UserSubscriptionFilters = {};
  public export$ = new Subject<ExportedFileType>();
  public defaultColDef: any;
  public autoGroupColumnDef: any;
  public title: string = "Notification Subscription";
  public userGuid: string = "";
  public unsubscribe$: Subject<void> = new Subject();
  public totalRecordsCount: number;
  itemList: Array<UserSubscription> | undefined;
  private gridApi: any;
  private gridColumnApi: any;
  private isAlive: boolean = true;
  private isSavedData: boolean = false;
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
  defaultValue: any;
  defaultBusinessValue: any;
  defaultUserValue: any;
  userData: User[];
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;
  public showtoast:boolean = true;
  public getdata: any;

  public isIRPFlagEnabled = false;
  public isOrgVMSEnabled = false;
  public isOrgIRPEnabled = false;
  private previousSelectedSystemId: OrderManagementIRPSystemId | null;
  public activeSystem: OrderManagementIRPSystemId;
  public systemGroupConfig: ButtonModel[];
  public organizationId: number;
  public previousSelectedOrderId: number | null;
  private pageSubject = new Subject<number>();
  public filterType: string = 'Contains';
  public allOption: string = 'All';
  public placeholderValue: string = 'Select Role';
  public roleData: GroupEmailRole[];
  public masterUserData: User[];
  public allowActiveUsers:boolean = true;
  public isOrgage: boolean;
  public defaultRoles: (number | undefined)[] = [];
  get businessUnitControl(): AbstractControl {
    return this.businessForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.businessForm.get('business') as AbstractControl;
  }
  get usersControl(): AbstractControl {
    return this.businessForm.get('user') as AbstractControl;
  }
  get rolesControl(): AbstractControl {
    return this.businessForm.get('roles') as AbstractControl;
  }
  @Select(AlertsState.GetGroupRolesByOrgId)
  public roleData$: Observable<GroupEmailRole[]>;
  constructor(private actions$: Actions,
    private readonly ngZone: NgZone,
    private store: Store,
    private orderManagementService: OrderManagementService,
    private changeDetector: ChangeDetectorRef) {
    super();
    store.dispatch(new SetHeaderState({ title: this.title, iconName: 'lock' }));
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
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
        headerName: 'Notification Description',
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

  private onOrganizationChangedHandler(): void {
    this.organizationId$.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$),
    ).subscribe((id) => {
      this.organizationId = id;
      this.loadSystemButtons(id);
    });
  }

  loadSystemButtons(businessId?:number){
    this.isIRPFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
    const businessUnitType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
    if(businessUnitType == BusinessUnitType.Hallmark || businessUnitType == BusinessUnitType.Organization) {
      const id = businessId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;
      this.store.dispatch(new GetOrganizationById(id)).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        const { isIRPEnabled, isVMCEnabled } =
            this.store.selectSnapshot(AlertsState.getOrganizationData)?.preferences || {};

        this.isOrgIRPEnabled = !!isIRPEnabled;
        this.isOrgVMSEnabled = !!isVMCEnabled;

        if (this.previousSelectedSystemId === OrderManagementIRPSystemId.IRP && !this.isOrgIRPEnabled) {
          this.activeSystem = OrderManagementIRPSystemId.VMS;
        } else if (this.previousSelectedSystemId === OrderManagementIRPSystemId.IRP && this.isOrgIRPEnabled) {
          this.activeSystem = OrderManagementIRPSystemId.IRP;
        }

        if (this.previousSelectedSystemId === OrderManagementIRPSystemId.VMS && !this.isOrgVMSEnabled) {
          this.activeSystem = OrderManagementIRPSystemId.IRP;
        } else if (this.previousSelectedSystemId === OrderManagementIRPSystemId.VMS && this.isOrgVMSEnabled) {
          this.activeSystem = OrderManagementIRPSystemId.VMS;
        }

        if (!this.previousSelectedSystemId) {
          this.activeSystem = DetectActiveSystem(this.isOrgIRPEnabled, this.isOrgVMSEnabled);
        }
        this.systemGroupConfig = SystemGroupConfig(this.isOrgIRPEnabled, this.isOrgVMSEnabled, this.activeSystem);
        this.adjustBusinessUnitTypeBasedActiveSystem();
      });
    } else this.isIRPFlagEnabled = false;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.onOrganizationChangedHandler();
    this.onRolesValueChanged();

    const user = this.store.selectSnapshot(UserState.user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    const businessUnitType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
    if(businessUnitType == BusinessUnitType.Agency || businessUnitType == BusinessUnitType.Organization) {
      this.isOrgage=true;
    }
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.businessForm.disable();

    }
    if (user?.businessUnitType === BusinessUnitType.MSP) {
      const [Hallmark, ...rest] = this.businessUnits;
      this.businessUnits = rest;
    }

    if (user?.businessUnitType !== BusinessUnitType.Hallmark) {
      this.loadSystemButtons();
    }

    this.businessControl.patchValue(this.isBusinessFormDisabled ? user?.businessUnitId : 0);

    this.actions$
      .pipe(
        takeWhile(() => this.isAlive)
      );

    this.businessData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      if (data != undefined) {
        this.defaultBusinessValue = data[0]?.id;
        if (!this.isBusinessFormDisabled) {
          this.defaultValue = data[0]?.id;
        }
      }
    });
    this.userData$.pipe(filter(x => x !== null && x !== undefined), takeWhile(() => this.isAlive)).subscribe((data) => {
      this.userData = data.items;      
      let userValue = data.items[0]?.id;
      if (userValue != this.userData.find(x => x.id == user?.id)?.id) {
        if (this.userData.find(x => x.id == user?.id) != null) {
          this.businessForm.controls['user'].setValue(this.userData.find(x => x.id == user?.id)?.id);
        } else {
          this.businessForm.controls['user'].setValue(userValue);
        }
      } else {
        this.businessForm.controls['user'].setValue(userValue);
      }
    });

    this.shouldDisableUserDropDown$.pipe(takeUntil(this.unsubscribe$)).subscribe((disable: boolean) => {
      if (disable != undefined && disable == true) {
        this.store.dispatch(new ShouldDisableUserDropDown(false));
        this.businessForm.controls['user'].disable();
        this.businessForm.controls['business'].disable();
        this.businessForm.controls['businessUnit'].disable();

      }
    });
    this.allowActiveUsers = true;

  }

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.showLoadingOverlay();
    let datasource = this.createServerSideDatasource();
    params.api.setServerSideDatasource(datasource);
  }
  private generateBusinessForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      business: new FormControl(0),
      user: new FormControl(0),
      roles: new FormControl(0),
    });
  }
  private onBusinessUnitValueChanged(): void {
    const userBusinessType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
    let userBusinessId = this.store.selectSnapshot(UserState.user)?.businessUnitId as number;
    let userId = this.store.selectSnapshot(UserState.user)?.id as string; 
    this.businessUnitControl.valueChanges.pipe(distinctUntilChanged(), takeWhile(() => this.isAlive)).subscribe((value) => {            
      this.userData = [];
      this.roleData=[];
      this.rolesControl.reset();      
      this.usersControl.reset();
      if(userBusinessType == BusinessUnitType.Organization){
        this.usersControl.disable();
      }
      if(value ==BusinessUnitType.Organization){
        this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
          if (data != undefined) {
            this.userData = data.items;
            if(userBusinessType == BusinessUnitType.Organization){
              this.businessControl.patchValue(userBusinessId, {emitEvent:false}); 
              this.usersControl.patchValue(userId);
              this.changeDetector.detectChanges();
            }     
          }
        });
      }
      if(value == BusinessUnitType.Candidates){  
        this.businessControl.patchValue(userBusinessId);
        this.store.dispatch(new GetBusinessForEmployeeType());
        if(userBusinessType == BusinessUnitType.Organization){          
        this.usersControl.enable();
        }       
      } else { 
        this.loadUserRoles(userBusinessId);
        this.store.dispatch(new GetBusinessByUnitType(value));
      }   
      if (value == 1) {
        this.dispatchUserPage([]);
      }
    });
  }
  private onBusinessValueChanged(): void {
    this.businessControl.valueChanges.pipe( distinctUntilChanged(),takeWhile(() => this.isAlive)).subscribe((value) => {     
     
      this.userData = [];
      let businessUnitIds = [];      
      if (value != 0 && value != null) {
        businessUnitIds.push(this.businessControl.value);
      }
      let userBusinessId = this.store.selectSnapshot(UserState.user)?.businessUnitId as number;
      let userBusinessType = this.store.selectSnapshot(UserState.user)?.businessUnitType as BusinessUnitType;
      if(this.businessUnitControl?.value == BusinessUnitType.Candidates){        
        if(userBusinessType == BusinessUnitType.Organization){
        if(userBusinessId !=null && userBusinessId !=undefined)
          value = userBusinessId;
        }

        if(isNumber(value)){     
          this.store.dispatch(new GetEmployeeUsers(value));
          this.employeeUserData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
            if (data != undefined) {
              this.userData = data;              
              let userValue = data[0]?.id;
              this.changeDetector.detectChanges();
              if(userBusinessType == BusinessUnitType.Organization)
                this.businessControl.patchValue(userBusinessId, {emitEvent:false});
                const user = this.store.selectSnapshot(UserState.user);
                if (userValue != this.userData.find(x => x.id == user?.id)?.id) {
                  if (this.userData.find(x => x.id == user?.id) != null) {
                    this.businessForm.controls['user'].setValue(this.userData.find(x => x.id == user?.id)?.id);
                  } else {
                    this.businessForm.controls['user'].setValue(userValue);
                  }
                } else {
                  this.businessForm.controls['user'].setValue(userValue);
                }
            }
          });  
          this.loadUserRoles(this.businessControl.value); 
        }
       
      } else if(this.businessUnitControl?.value == BusinessUnitType.Organization
          && userBusinessType == BusinessUnitType.Hallmark
          && this.activeSystem == OrderManagementIRPSystemId.IRP) {          
            if(isNumber(value)){
              this.store.dispatch(new GetNonEmployeeUsers(value));
              this.nonEmployeeUserData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
                if (data != undefined) {          
                  this.userData = [];
                  this.userData = data;
                  this.changeDetector.detectChanges();
                  const user = this.store.selectSnapshot(UserState.user);
                  let userValue = data[0]?.id;      
                  this.changeDetector.detectChanges();          
                if (userValue != this.userData.find(x => x.id == user?.id)?.id) {
                  if (this.userData.find(x => x.id == user?.id) != null) {
                    this.businessForm.controls['user'].setValue(this.userData.find(x => x.id == user?.id)?.id);
                  } else {
                    this.businessForm.controls['user'].setValue(userValue);
                  }
                } else {
                  this.businessForm.controls['user'].setValue(userValue);
                }
                }
              });
              this.loadUserRoles(this.businessControl.value); 
            }
      } else { 
        this.loadUserRoles(this.businessControl.value); 
        this.dispatchUserPage(businessUnitIds);        
      }      
    });
  }
  private onUserValueChanged(): void {
    this.usersControl.valueChanges.pipe(distinctUntilChanged(), takeWhile(() => this.isAlive)).subscribe((value) => {
      this.dispatchNewPage(value);
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
          let filter: any;
          let jsonString = JSON.stringify(params.request.filterModel);
          if (jsonString != "{}") {
            let updatedJson = jsonString.replace("operator", "logicalOperator");
            filter = JSON.parse(updatedJson);
          }
          else filter = null;

          let sort = postData.sortFields.length > 0 ? postData.sortFields : null;
          self.userSubscriptionPage$.pipe(takeUntil(self.unsubscribe$)).subscribe((data: any) => {

            self.itemList = data?.items;
            if(self.businessUnitControl?.value === BusinessUnitType.Candidates) {
            self.itemList = self.itemList?.filter((x=>x.alertId!=AlertIdEnum['Order Comments-IRP']));
            }
            self.totalRecordsCount = data?.totalCount;

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
      let datasource = this.createServerSideDatasource();
      this.gridApi.setServerSideDatasource(datasource);
    }
  }
  private dispatchNewPage(user: any, sortModel: any = null, filterModel: any = null): void {
    const { businessUnit } = this.businessForm?.getRawValue();
    if (user != 0) {
      this.userGuid = user;
      this.getdata = this.store.dispatch(new GetUserSubscriptionPage(businessUnit || null, user, this.currentPage, this.pageSize, sortModel, filterModel, this.filters, this.activeSystem == OrderManagementIRPSystemId.IRP));
    }
  }
  private dispatchUserPage(businessUnitIds: number[]) {
    this.store.dispatch(new GetAllUsersPage(this.businessUnitControl.value, businessUnitIds, this.currentPage, this.pageSize, null, null, true));
  }
  public onEmailChanged(data: any): void {
    this.SaveData(data, AlertChannel.Email);
  }
  public onSmsChanged(data: any): void {
    this.SaveData(data, AlertChannel.SMS);
  }
  public onScreenChanged(data: any): void {
    this.SaveData(data, AlertChannel.OnScreen);
  }
  private SaveData(data: any, alertChannel: AlertChannel) {
    if (data != undefined) {
      let updateUserSubscription: UserSubscriptionRequest = {
        alertId: data.rowData?.alertId,
        userId: this.userGuid,
        alertChannel: alertChannel,
        enabled: data.event?.checked
      }
      if(this.activeSystem == OrderManagementIRPSystemId.IRP){
        const { businessUnit } = this.businessForm?.getRawValue();
        updateUserSubscription.businessUnitType = businessUnit;
        updateUserSubscription.isIRP = true;
      }
      this.store.dispatch(new UpdateUserSubscription(updateUserSubscription));
      this.updateUserSubscription$.pipe(takeUntil(this.unsubscribe$)).subscribe((updated: boolean) => {
        if (updated != undefined && updated == true) {
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        }
      });
    }
  }

  @OutsideZone
  getErrorAlert(){
    setTimeout(()=> {
      this.getdata.pipe(takeUntil(this.unsubscribe$)).subscribe((data:any)=> {
        if(data.null.userSubscriptionPage == undefined && this.showtoast == true){
          this.store.dispatch(new ShowToast(MessageTypes.Error, USER_SUBSCRIPTION_PERMISSION));
          this.showtoast = false;
        }
      });
    },3000)
  }

  changeSystem(selectedBtn: ButtonModel) {
    this.activeSystem = selectedBtn.id;
    this.adjustBusinessUnitTypeBasedActiveSystem();
  }

  adjustBusinessUnitTypeBasedActiveSystem(){
    const user = this.store.selectSnapshot(UserState.user);
    if(user?.businessUnitType == BusinessUnitType.Organization){
      this.businessUnitControl.disable();
    }
    this.businessControl.patchValue([]);
    this.filteredBusinessUnits=[];  
    this.filteredBusinessUnits = this.businessUnits;
    if(this.activeSystem == OrderManagementIRPSystemId.IRP){
      if(user?.businessUnitType == BusinessUnitType.Hallmark){
        this.filteredBusinessUnits = this.filteredBusinessUnits.filter(x=> x.id !== BusinessUnitType.MSP && x.id !== BusinessUnitType.Agency);
        this.businessUnitControl.patchValue(this.filteredBusinessUnits[0].id);
        this.businessControl.setValue(user?.businessUnitId, {emitEvent:false});        
      }
      if(user?.businessUnitType == BusinessUnitType.Organization){
        this.businessUnitControl.enable();
        this.filteredBusinessUnits = this.filteredBusinessUnits.filter(x=> x.id !== BusinessUnitType.MSP && x.id !== BusinessUnitType.Agency && x.id !== BusinessUnitType.Hallmark);
        this.businessControl.setValue(user?.businessUnitId, {emitEvent:false});
      }
    }

    if(this.activeSystem == OrderManagementIRPSystemId.VMS){
      this.filteredBusinessUnits = this.filteredBusinessUnits.filter(x=> x.id !== BusinessUnitType.Candidates);
      this.businessUnitControl.patchValue(user?.businessUnitType);
      this.businessControl.setValue(user?.businessUnitId, {emitEvent:false});      
    }
    
  }
  private onRolesValueChanged(): void {
    this.rolesControl.valueChanges.pipe(distinctUntilChanged(), takeWhile(() => this.isAlive)).subscribe((value) => {  
      this.usersControl.reset();
      this.userData = [];
      if(value && value.length >0){
        this.getUsersByRole();        
      } 
    });
  }
  private getUsersByRole(): void {   
    if (this.rolesControl.value.length > 0) {   
      const user = this.store.selectSnapshot(UserState.user);
      if (user?.businessUnitType != BusinessUnitType.MSP && user?.businessUnitType != BusinessUnitType.Hallmark) {
        this.dispatchUserPage([this.businessControl.value]);
      }
      this.userData = [];
    if (this.businessUnitControl?.value == BusinessUnitType.Organization
      && user?.businessUnitType == BusinessUnitType.Hallmark
      && this.activeSystem == OrderManagementIRPSystemId.IRP) {
      this.nonEmployeeUserData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
        if (data != undefined) {
          this.masterUserData = data;
          if (this.allowActiveUsers) {
            this.userData = data;
            this.userData = data.filter(i => i.isDeleted == false);
            this.userData = this.userData.filter(f => (f.roles || []).find((f: { id: number; }) => this.rolesControl?.value.includes(f.id)))         
            let userValue = this.userData[0]?.id;
            this.businessForm.controls['user'].setValue(userValue);    
            this.changeDetector.detectChanges();  
          }
        }
      });
    }
    else if (this.businessUnitControl?.value == BusinessUnitType.Candidates) {  
      this.employeeUserData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
        if (data != undefined && this.rolesControl?.value!=null) {          
          this.masterUserData = data;
          if (this.allowActiveUsers) {
            this.userData = data;
            this.userData = data.filter(i => i.isDeleted == false);
            this.userData = this.userData.filter(f => (f.roles || []).find((f: { id: number; }) => this.rolesControl?.value.includes(f.id)))         
            let userValue = this.userData[0]?.id;
            this.businessForm.controls['user'].setValue(userValue);    
            this.changeDetector.detectChanges();                          
          }
        }
      });
    }
    else {      
      this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
        if (data != undefined) {          
          if (this.allowActiveUsers && this.rolesControl?.value!=null) {
            this.userData = data.items.filter(i => i.isDeleted == false);           
            this.userData = this.userData.filter(f => (f.roles || []).find((f: { id: number; }) => this.rolesControl.value.includes(f.id)))            
            let userValue =this.userData[0]?.id;         
            this.businessForm.controls['user'].setValue(userValue);      
            this.changeDetector.detectChanges();                          
          }
        }
      });
    }  
    }
  }

  private loadUserRoles(id:any):void{  
    if (id != undefined && id > 0) {      
      if (!this.isOrgage) {
        this.rolesControl.reset();
        if(this.businessUnitControl?.value == BusinessUnitType.Candidates&&this.activeSystem == OrderManagementIRPSystemId.IRP){        
          
          this.store.dispatch(new GetRolePerUser(BusinessUnitType.Employee,[this.businessControl?.value]));
          this.rolesPerUsers$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {            
            this.roleData = data;          
          });
          this.changeDetector.detectChanges();
        } 
        else{
          this.store.dispatch(new GetGroupEmailRoles([id]));
          this.roleData$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
            this.roleData = data;
          });
          this.changeDetector.detectChanges();
        }        
      }
      else {
        if(this.businessUnitControl?.value == BusinessUnitType.Candidates&&this.activeSystem == OrderManagementIRPSystemId.IRP){         
          this.store.dispatch(new GetRolePerUser(BusinessUnitType.Employee,[this.businessControl?.value]));
          this.rolesPerUsers$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {            
            this.roleData = data;          
          });           
          this.businessForm.controls['roles'].setValue(this.roleData.map(x=>x.name).toString());
        }
        else
        {
        const user = this.store.selectSnapshot(UserState.user);        
        this.businessForm.controls['roles'].setValue(user?.roleNames);        
        }
      }
    }
  }
}
