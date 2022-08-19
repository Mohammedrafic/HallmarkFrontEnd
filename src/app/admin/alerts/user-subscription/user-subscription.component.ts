import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Observable, Subject,takeWhile } from 'rxjs';
import { SecurityState } from 'src/app/security/store/security.state';
import { alertsFilterColumns, BUSINESS_UNITS_VALUES, BUSSINES_DATA_FIELDS, DISABLED_GROUP, OPRION_FIELDS } from '../alerts.constants';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { ToggleSwitchComponent } from '@shared/components/toggle-switch/toggle-switch.component';
import { GridReadyEvent } from '@ag-grid-community/core';
import {AlertEnum} from 'src/app/admin/alerts/alerts.enum';
import { UserSubscriptionFilterService } from './user-subscription.service';
import { GetUserSubscriptionPage } from '@admin/store/alerts.actions';
import { UserSubscription, UserSubscriptionFilters, UserSubscriptionPage } from '@shared/models/user-subscription.model';
import { AlertsState } from '@admin/store/alerts.state';
import { GetBusinessByUnitType } from 'src/app/security/store/security.actions';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-user-subscription',
  templateUrl: './user-subscription.component.html',
  styleUrls: ['./user-subscription.component.scss'],
  providers: [UserSubscriptionFilterService]
})
export class UserSubscriptionComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Select(SecurityState.bussinesData)
  public bussinesData$: Observable<BusinessUnit[]>;

  @Select(AlertsState.UserSubscriptionPage)
  public userSubscriptionPage$: Observable<UserSubscriptionPage>;

  @Input() filterForm: FormGroup;
  public businessForm: FormGroup;
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public filterColumns = alertsFilterColumns;
  private filters: UserSubscriptionFilters = {};
  public export$ = new Subject<ExportedFileType>();
  public defaultColDef:any;
  public autoGroupColumnDef:any;
  public userSubscriptionFilterFormGroup: FormGroup = this.userSubscriptionFilterService.generateFiltersForm();
  public title: string = "User Subscription";
  itemList: Array<UserSubscription> | undefined;
  private gridApi : any;
  private gridColumnApi: any;
  private isAlive = true;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  rowModelType:any;
  serverSideInfiniteScroll:any;
  cacheBlockSize: any;
  pagination: boolean;
  paginationPageSize: number;
  columnDefs: any;
  filterText: string | undefined;
  frameworkComponents: any;
  sideBar: any;
  serverSideStoreType: any;
  maxBlocksInCache: any;
  get businessUnitControl(): AbstractControl {
    return this.businessForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.businessForm.get('business') as AbstractControl;
  }
  constructor(private userSubscriptionFilterService: UserSubscriptionFilterService,private actions$: Actions, 
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
        header:'Alert',
        field: 'alert',
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        }
      },
      {
        header: 'Email',
        field: 'email',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          
        },
        valueGetter : (params: { data: { email: boolean}}) => { return AlertEnum[Number(params.data.email)] },
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      {
        header: 'Text',
        field: 'text',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          
        },
        valueGetter : (params: { data: { text: boolean}}) => { return AlertEnum[Number(params.data.text)] },
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      },
      {
        header: 'OnScreen',
        field: 'onScreen',
        cellRenderer: ToggleSwitchComponent,
        cellRendererParams: {
          
        },
        valueGetter : (params: { data: { onScreen: boolean}}) => { return AlertEnum[Number(params.data.onScreen)] },
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
    this.isAlive=false;
  }

  ngOnInit(): void {
    this.businessForm = this.generateBusinessForm();
    this.onBusinessUnitValueChanged();

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
      

    this.bussinesData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      
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
    });
  }
  private onBusinessUnitValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.store.dispatch(new GetBusinessByUnitType(value));

      if (!this.isBusinessFormDisabled) {
        this.businessControl.patchValue(0);
      }
    });
  }
  createServerSideDatasource() {
    let self = this;    
    return {
      getRows: function (params: any) {
        setTimeout(()=> {
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
          self.dispatchNewPage(sort, filter);
          self.userSubscriptionPage$.pipe().subscribe((data: any) => {
            self.itemList = data.items;            
            params.successCallback(self.itemList, data.totalCount || 1);
          });
        }, 500);
      }
    }
  }
  onPageSizeChanged(event: any) {
    this.cacheBlockSize=Number(event.value.toLowerCase().replace("rows",""));
    this.paginationPageSize=Number(event.value.toLowerCase().replace("rows",""));
    if(this.gridApi!=null)
    {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows","")));
      this.gridApi.gridOptionsWrapper.setProperty('cacheBlockSize', Number(event.value.toLowerCase().replace("rows","")));
      var datasource = this.createServerSideDatasource();
      this.gridApi.setServerSideDatasource(datasource);
    }
  }
  private dispatchNewPage(sortModel: any = null, filterModel: any = null): void {
    const { businessUnit, business } = this.businessForm?.getRawValue();
    this.store.dispatch(new GetUserSubscriptionPage(businessUnit||null, business || null, this.currentPage, this.pageSize, sortModel, filterModel, this.filters));
  }


}
