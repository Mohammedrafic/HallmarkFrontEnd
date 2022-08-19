import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { Observable, Subject } from 'rxjs';
import { GridReadyEvent } from '@ag-grid-community/core';
import { GetAlertsTemplatePage } from '@admin/store/alerts.actions';
import { AlertsTemplate, AlertsTemplateFilters, AlertsTemplatePage } from '@shared/models/alerts-template.model';
import { AlertsState } from '@admin/store/alerts.state';
import { SetHeaderState, ShowEmailSideDialog,ShowSmsSideDialog,ShowOnScreenSideDialog, ShowSideDialog } from 'src/app/store/app.actions';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { FormGroup } from '@angular/forms';
import { AlertsEmailTemplateFormComponent } from './alerts-email-template-form/alerts-email-template-form.component';
import { toolsRichTextEditor } from '../alerts.constants';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { AlertTemplateType } from '../alerts.enum';
import { AlertsSmsTemplateFromComponent } from './alerts-sms-template-from/alerts-sms-template-from.component';
import { AlertsOnScreenTemplateFormComponent } from './alerts-on-screen-template-form/alerts-on-screen-template-form.component';
@Component({
  selector: 'app-template',
  templateUrl: './alerts-template.component.html',
  styleUrls: ['./alerts-template.component.scss']
})
export class AlertsTemplateComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Output() editEmailTemplateEvent = new EventEmitter();
  @Output() editSmsTemplateEvent = new EventEmitter();
  @Output() editOnScreenTemplateEvent = new EventEmitter(); 
  public tools= toolsRichTextEditor;
  targetElement: HTMLElement = document.body;
  public alertTemplateType:string;
  @ViewChild('RTE')
  public rteEle: RichTextEditorComponent;
  @ViewChild(AlertsEmailTemplateFormComponent, {static : true}) emailTemplateForm : AlertsEmailTemplateFormComponent;
  @ViewChild(AlertsSmsTemplateFromComponent, {static : true}) smsTemplateForm : AlertsSmsTemplateFromComponent;
  @ViewChild(AlertsOnScreenTemplateFormComponent, {static : true}) onScreenTemplateForm : AlertsOnScreenTemplateFormComponent;
  private subTitle:string;  
  public emailTemplateFormGroup: FormGroup;
  public smsTemplateFormGroup: FormGroup;
  public onScreenTemplateFormGroup: FormGroup;
  @Select(AlertsState.AlertsTemplatePage)
  public alertsTemplatePage$: Observable<AlertsTemplatePage>;
  get templateEmailTitle(): string {
    return "Email Template for Alert : "+this.subTitle;
  }
  get templateSmsTitle(): string {
    return "SMS Template for Alert : "+this.subTitle;
  }
  get templateOnScreenTitle(): string {
    return "OnScreen Template for Alert : "+this.subTitle;
  }
  private gridApi : any;
  private gridColumnApi: any;  
  private filters: AlertsTemplateFilters = {};
  public title: string = "Alerts Template";
  public export$ = new Subject<ExportedFileType>();  
  public showParent:boolean=true;
  public showEmailEdit:boolean=false;
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
  defaultColDef:any;
  autoGroupColumnDef:any;
  itemList: Array<AlertsTemplate> | undefined;
  constructor(private actions$: Actions, 
    private store: Store) {
    super();    
    store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
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
        header:'Status',
        field: 'status',
        filter: false
      },
      {
        headerName: 'Email Template',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onEmailTemplateEdit.bind(this),
          label: 'Edit',
          suppressMovable: true,
          filter: false,
          sortable: false,
          menuTabs: []
        },
      },
      {
        headerName: 'SMS Template',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onSmsTemplateEdit.bind(this),
          label: 'Edit',
          suppressMovable: true,
          filter: false,
          sortable: false,
          menuTabs: []
        },
      },
      {
        headerName: 'OnScreen Template',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onScreenTemplateEdit.bind(this),
          label: 'Edit',
          suppressMovable: true,
          filter: false,
          sortable: false,
          menuTabs: []
        },
      },
      {
        headerName: 'Action',
        cellRenderer: 'buttonRenderer',
        cellRendererParams: {
          onClick: this.onRemove.bind(this),
          label: 'Delete'
        },
        pinned: 'right',
        suppressMovable: true,
        filter: false,
        sortable: false,
        menuTabs: []
      }   
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
  }

  ngOnInit(): void {    
    this.emailTemplateFormGroup = AlertsEmailTemplateFormComponent.createForm();
    this.smsTemplateFormGroup = AlertsSmsTemplateFromComponent.createForm();
    this.onScreenTemplateFormGroup =AlertsOnScreenTemplateFormComponent.createForm();
  }
  public onEmailTemplateEdit(data: any): void {
    this.alertTemplateType=AlertTemplateType[AlertTemplateType.Email];
    this.onEdit(data.rowData);
  }
  public onSmsTemplateEdit(data: any): void {    
    this.alertTemplateType=AlertTemplateType[AlertTemplateType.SMS];
    this.onEdit(data.rowData);
  }
  public onScreenTemplateEdit(data: any): void {    
    this.alertTemplateType=AlertTemplateType[AlertTemplateType.OnScreen];
    this.onEdit(data.rowData);
  }
  public onRemove(data: AlertsTemplate): void {
    // this.confirmService
    //   .confirm(DELETE_RECORD_TEXT, {
    //     title: DELETE_RECORD_TITLE,
    //     okButtonLabel: 'Delete',
    //     okButtonClass: 'delete-button',
    //   })
    //   .subscribe((confirm) => {
    //     if (confirm && data.id) {
    //     // this.store.dispatch(new RemoveRole(data.id))
    //     }
    //   });
  }
  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.showLoadingOverlay();     
    var datasource = this.createServerSideDatasource();
    console.log(datasource);
    params.api.setServerSideDatasource(datasource);
  }
  createServerSideDatasource() {
    let self = this;    
    return {
      getRows: function (params: any) {
        setTimeout(()=> {
          let postData = {
            pageNumber: params.request.endRow / self.paginationPageSize,
            pageSize: self.paginationPageSize,
            sortFields: params.request.sortModel
          };
          var filter: any;
          let jsonString = JSON.stringify(params.request.filterModel);
          if (jsonString != "{}") {
         var updatedJson = jsonString.replace("operator", "logicalOperator");
          filter = JSON.parse(updatedJson);
           }
           else filter = null;

          var sort = postData.sortFields.length > 0 ? postData.sortFields : null;
          self.dispatchNewPage(sort,filter);
          self.alertsTemplatePage$.pipe().subscribe((data: any) => {
            self.itemList = data.items;            
            params.successCallback(self.itemList, data.totalCount || 1);
          });
        }, 500);
      }
    }
  }
  private dispatchNewPage(sortModel: any = null, filterModel: any = null): void {
    this.store.dispatch(new GetAlertsTemplatePage(this.currentPage, this.pageSize, sortModel, filterModel, this.filters));
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
  public onEdit({ index, column, foreignKeyData, id, ...alertsTemplate }: AlertsTemplate & { index: string; column: unknown; foreignKeyData: unknown }): void {
    this.subTitle=alertsTemplate.alert;
    if(this.alertTemplateType===AlertTemplateType[AlertTemplateType.Email])  
    {
    this.emailTemplateForm.rteCreated();
    this.store.dispatch(new ShowEmailSideDialog(true)); 
    }
    else if(this.alertTemplateType===AlertTemplateType[AlertTemplateType.SMS])
    {
      this.smsTemplateForm.rteCreated();      
    this.store.dispatch(new ShowSmsSideDialog(true));  
    }
    else if(this.alertTemplateType===AlertTemplateType[AlertTemplateType.OnScreen])
    {
      this.onScreenTemplateForm.rteCreated();      
    this.store.dispatch(new ShowOnScreenSideDialog(true));
    }
       
  }
  public onEmailTemplateAddCancel(): void {
   
    // if (this.roleFormGroup.dirty) {
    //   this.confirmService
    //     .confirm(DELETE_CONFIRM_TEXT, {
    //       title: DELETE_CONFIRM_TITLE,
    //       okButtonLabel: 'Leave',
    //       okButtonClass: 'delete-button',
    //     })
    //     .pipe(filter((confirm) => !!confirm))
    //     .subscribe(() => {
    //       this.closeDialog();
    //     });
    // } else {
      this.emailTemplateCloseDialog();
    // }
  }
  public onSmsTemplateAddCancel(): void {
         this.smsTemplateCloseDialog();
  }
  public onScreenTemplateAddCancel(): void {
    this.onScreenTemplateCloseDialog();
}

  public onEmailTemplateSave(): void { 
    // this.roleFormGroup.markAllAsTouched();
    // if (this.roleFormGroup.valid && !this.roleForm.showActiveError) {
    //   const value = this.roleFormGroup.getRawValue();
    //   const roleDTO: RoleDTO = {
    //     ...value,
    //     id: this.roleId,
    //     businessUnitId: value.businessUnitId || null,
    //     permissions: value.permissions.map((stringValue: string) => Number(stringValue)),
    //   };
    //   this.store.dispatch(new SaveRole(roleDTO));
    // }
    this.emailTemplateCloseDialog();
  }
  public onSmsTemplateSave(): void {     
    this.smsTemplateCloseDialog();
  }
  public onScreenTemplateSave(): void {     
    this.onScreenTemplateCloseDialog();
  }
  private emailTemplateCloseDialog(): void {
    this.store.dispatch(new ShowEmailSideDialog(false));
  }
  private smsTemplateCloseDialog(): void {
    this.store.dispatch(new ShowSmsSideDialog(false));
  }
  private onScreenTemplateCloseDialog(): void {
    this.store.dispatch(new ShowOnScreenSideDialog(false));
  }

}
