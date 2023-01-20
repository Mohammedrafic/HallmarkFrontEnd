
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { filter, take, Observable, Subject, takeUntil } from 'rxjs';
import { FilterChangedEvent, GridApi, GridOptions, GridReadyEvent } from '@ag-grid-community/core';
import { ClearAlertTemplateState, GetGroupEmailById, SendGroupEmail} from '@admin/store/alerts.actions';
import { AlertsState } from '@admin/store/alerts.state';
import { SetHeaderState, ShowGroupEmailSideDialog, ShowToast } from 'src/app/store/app.actions';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { FormGroup } from '@angular/forms';

import { BUSINESS_DATA_FIELDS, OPRION_FIELDS, toolsRichTextEditor } from '../alerts.constants';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';


import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { UserState } from 'src/app/store/user.state';
import { ConfirmService } from '@shared/services/confirm.service';
import { GRID_CONFIG, SEND_EMAIL, SEND_EMAIL_REQUIRED } from '@shared/constants';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { MessageTypes } from '@shared/enums/message-types';
import { AppState } from '../../../store/app.state';
import { SendGroupEmailComponent } from './send-group-email/send-group-email.component';
import { GroupEmail, GroupEmailByBusinessUnitIdPage, GroupEmailFilters, SendGroupEmailRequest } from '@shared/models/group-email.model';
import { GetGroupMailByBusinessUnitIdPage } from '@admin/store/alerts.actions';
import { User } from '@shared/models/user.model';
import { GroupMailStatus } from '../group-email.enum';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { GroupEmailColumnsDefinition } from './group-email.constant';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';
@Component({
  selector: 'app-group-email',
  templateUrl: './group-email.component.html',
  styleUrls: ['./group-email.component.scss']
})
export class GroupEmailComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Output() editEmailTemplateEvent = new EventEmitter();
  public tools = toolsRichTextEditor;
  targetElement: HTMLElement = document.body;
  public userObj: User | null;
  @Select(SecurityState.bussinesData)
  public businessData$: Observable<BusinessUnit[]>;
  @Select()

  @Input() filterForm: FormGroup;
  public businessForm: FormGroup;
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public bussinesDataFields = BUSINESS_DATA_FIELDS;
  @ViewChild('RTE')
  public rteEle: RichTextEditorComponent;
  @ViewChild(SendGroupEmailComponent, { static: true }) groupEmailTemplateForm: SendGroupEmailComponent;

  public sendGroupEmailFormGroup: FormGroup;
  @Select(AlertsState.GroupEmailByBusinessUnitIdPage)
  public groupEmailPage$: Observable<GroupEmailByBusinessUnitIdPage>;
  @Select(AlertsState.GetGroupEmailById)
  public viewGroupEmail$: Observable<GroupEmail>;
  @Select(AlertsState.SendGroupEmail)
  public sendGroupEmail$: Observable<GroupEmail>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;
  public isSend:boolean=true;
  public userPermission: Permission = {};
  public readonly userPermissions = UserPermissions;
  public viewGroupEmailData: GroupEmail = {
    id: 0,
    subjectMail: "",
    bodyMail: "",
    toList: "",
    cCList: "",
    bCCList: "",
    status: null,
    fromMail: "",
    businessUnitId: null,
    sentBy: "",
    sentOn: "",
    statusString: ""
  };
  public unsubscribe$: Subject<void> = new Subject();
  get templateEmailTitle(): string {
    return "Send Group Email";
  }

  private gridApi: GridApi;
  private gridColumnApi: any;
  private isAlive = true;
  private filters: GroupEmailFilters = {};
  public title: string = "Group Email";
  public export$ = new Subject<ExportedFileType>();
  defaultValue: any;
  modules: any[] = [ServerSideRowModelModule, RowGroupingModule];
  rowModelType: any;
  serverSideInfiniteScroll: any;
  cacheBlockSize: any;
  pagination: boolean;
  paginationPageSize: number;
  
  filterText: string | undefined;
  frameworkComponents: any;
  serverSideStoreType: any;
  maxBlocksInCache: any;
  defaultColDef: any;
  itemList: Array<GroupEmail> | undefined;
  public rowData: GroupEmail[]=[];
  public rowSelection: 'single' | 'multiple' = 'single';
  public actionCellrenderParams: any = {
    onClick: this.onViewGroupEmail.bind(this),
    label: 'View',
    suppressMovable: true,
    filter: false,
    sortable: false,
    menuTabs: []
  };
  public readonly columnDefs: ColumnDefinitionModel[] = GroupEmailColumnsDefinition(this.actionCellrenderParams);
 
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  constructor(private actions$: Actions,
    private confirmService: ConfirmService,
    private store: Store) {
    super();
    store.dispatch(new SetHeaderState({ title: this.title, iconName: "" }));
    this.frameworkComponents = {
      buttonRenderer: ButtonRendererComponent,
    }
    this.rowModelType = 'serverSide';
    this.serverSideInfiniteScroll = true,
      this.pagination = true;
    this.paginationPageSize = this.pageSize,
      this.cacheBlockSize = this.pageSize;
    this.serverSideStoreType = 'partial';
    this.maxBlocksInCache = 2;
   
    this.defaultColDef = {
      flex: 1,
      minWidth: 120,
      resizable: true,
      sortable: true,
      filter: false
    };
  }
  ngOnDestroy(): void {
    this.store.dispatch(new ClearAlertTemplateState());
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }
  public noRowsOverlayComponent: any = CustomNoRowsOverlayComponent;
  public noRowsOverlayComponentParams: any = {
    noRowsMessageFunc: () => 'No Rows To Show',
  };
  ngOnInit(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.userObj = user;
    this.sendGroupEmailFormGroup = SendGroupEmailComponent.createForm();

    this.viewGroupEmail$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      
      if (data != undefined) {        
        this.groupEmailTemplateForm.rteCreated();
        this.viewGroupEmailData = data;
        this.UpdateForm(data);           
            
        this.store.dispatch(new ShowGroupEmailSideDialog(true));
      }
    });
    
    this.sendGroupEmail$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      if (data != undefined && data != null) {
        this.dispatchNewPage();       
          this.groupEmailCloseDialog(); 
        this.store.dispatch(new ShowToast(MessageTypes.Success, SEND_EMAIL));
      }
    });
    this.getGroupEmails();
    this.getPermission();
    console.log(this.userPermission);
  }
  public onViewGroupEmail(data: any): void {
    this.onView(data.rowData);
  }


  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.setRowData(this.rowData);
  }
  
  public getGroupEmails(): void {
    this.dispatchNewPage();
    this.groupEmailPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      if (!data || !data?.items.length) {
        this.gridApi?.showNoRowsOverlay();
      }
      else {
        this.gridApi?.hideOverlay();
        this.rowData = data.items;
        this.gridApi?.setRowData(this.rowData);
      }
    });
  
  }
  private dispatchNewPage(): void {
    this.store.dispatch(new GetGroupMailByBusinessUnitIdPage(this.userObj == null ? null : this.userObj.businessUnitId,true));
  }
  private dispatchViewGroupEmail(id: number): void {
    this.store.dispatch(new GetGroupEmailById(id));
  }
  onPageSizeChanged(event: any) {
    this.gridOptions.cacheBlockSize = Number(event.value.toLowerCase().replace("rows", ""));
    this.gridOptions.paginationPageSize = Number(event.value.toLowerCase().replace("rows", ""));
    if (this.gridApi != null) {
      this.gridApi.paginationSetPageSize(Number(event.value.toLowerCase().replace("rows", "")));
      this.gridApi.setRowData(this.rowData);
    }
  }
  public onView({ index, column, foreignKeyData, id, ...groupEMail }: GroupEmail & { index: string; column: unknown; foreignKeyData: unknown }): void {
   this.ResetForm();
   this.isSend=false;
    this.groupEmailTemplateForm.isSend=false;
    this.groupEmailTemplateForm.rteCreated();
    this.groupEmailTemplateForm.disableControls(false);
    let data ={id,...groupEMail};
    this.UpdateForm(data);           
        
    this.store.dispatch(new ShowGroupEmailSideDialog(true));
  }
  public onGroupEmailAddCancel(): void {
    this.groupEmailCloseDialog();
  }

  public onGroupEmailSend(): void {
    this.sendGroupEmailFormGroup.markAllAsTouched();
    if (this.sendGroupEmailFormGroup.invalid) {
      return;
    }
    if (this.groupEmailTemplateForm.emailBody!=''&&this.groupEmailTemplateForm.emailTo!=''&&this.groupEmailTemplateForm.emailSubject!='') {
      const formValues = this.groupEmailTemplateForm.groupEmailTemplateForm.getRawValue();
      const sendGroupEmailDto: SendGroupEmailRequest = {
        businessUnitId: formValues.business==0?null:formValues.business,
        bodyMail: formValues.emailBody,
        subjectMail: formValues.emailSubject,
        toList: formValues.emailTo == undefined ? "" : formValues.emailTo,
        cCList: formValues.emailCc == undefined ? "" : formValues.emailCc,
        bCCList: "",
        status: GroupMailStatus.Pending,
        fromMail: this.userObj?.email == undefined ? "" : this.userObj?.email,
        selectedFile: formValues.fileUpload,
        businessUnitType: formValues.businessUnit==0?null:formValues.businessUnit,
        userType: formValues.userType
      };
      this.store.dispatch(new SendGroupEmail(sendGroupEmailDto));

    }
    else{
      let controlNames="";
      let isAre=" is ";
      let field="Field ";
      if(this.groupEmailTemplateForm.emailTo=='')
      {
        controlNames="Email To";
      }
      if(this.groupEmailTemplateForm.emailSubject=='')
      {
        controlNames=controlNames==""?"Email Subject":controlNames+",Email Subject";
      }
      if(this.groupEmailTemplateForm.emailBody=='')
      {
        controlNames=controlNames==""?"Email Body":controlNames+",Email Body";
      }
      if(controlNames.indexOf(",")>0)
      {
        isAre=" are "
        field="Fields "
      }
      this.store.dispatch(new ShowToast(MessageTypes.Error,field+controlNames+isAre+ SEND_EMAIL_REQUIRED));
    }
  }
  public sideBar = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filters',
        toolPanel: 'agFiltersToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
    ],
  };
  public gridOptions: GridOptions = {
    pagination: true,
    cacheBlockSize: this.pageSize,
    paginationPageSize: this.pageSize,
    columnDefs: this.columnDefs,
    rowData: this.rowData,
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
  public onGroupEmailFormSendClick():void{
    this.ResetForm(); 
    this.isSend=true;
    this.groupEmailTemplateForm.isSend=true;
    this.groupEmailTemplateForm.rteCreated();
    this.groupEmailTemplateForm.disableControls(true);
    this.store.dispatch(new ShowGroupEmailSideDialog(true));

  }
  private groupEmailCloseDialog(): void {
    this.store.dispatch(new ShowGroupEmailSideDialog(false));
  }
  
  private UpdateForm(data: any): void {
    this.groupEmailTemplateForm.emailBody = data.bodyMail;
    this.groupEmailTemplateForm.emailSubject = data.subjectMail;
    this.groupEmailTemplateForm.emailTo=data.toList==null?"":data.toList;
    this.groupEmailTemplateForm.emailCc=data.ccList==null?"":data.ccList;
    this.groupEmailTemplateForm.businessUnitType = data.businessUnitType;
    this.groupEmailTemplateForm.businessUnit = data.businessUnitId;    
    this.groupEmailTemplateForm.userTypeInput = data.userType;
    this.groupEmailTemplateForm.populateUserType();    
  }
  private ResetForm(): void {
    this.groupEmailTemplateForm.emailBody = "";
    this.groupEmailTemplateForm.emailSubject = "";
    this.groupEmailTemplateForm.emailTo="";
    this.groupEmailTemplateForm.emailCc="";
    this.groupEmailTemplateForm.groupEmailTemplateForm.controls['user'].setValue([]);

  }
  private getPermission(): void {
    this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length),
      take(1)
    ).subscribe((permissions: Permission) => {
      console.log(permissions);
      this.userPermission = permissions;
    });
  }
}
