import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, NgZone } from '@angular/core';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { GridReadyEvent } from '@ag-grid-community/core';
import {
  ClearAlertTemplateState,
  GetAlertsTemplatePage,
  GetTemplateByAlertId,
  SaveTemplateByAlertId,
  UpdateTemplateByAlertId
} from '@admin/store/alerts.actions';
import {
  AddAlertsTemplateRequest,
  AlertsTemplate,
  AlertsTemplateFilters,
  AlertsTemplatePage,
  EditAlertsTemplate,
  EditAlertsTemplateRequest
} from '@shared/models/alerts-template.model';
import { AlertsState } from '@admin/store/alerts.state';
import { SetHeaderState, ShowEmailSideDialog, ShowOnScreenSideDialog, ShowSmsSideDialog, ShowToast } from 'src/app/store/app.actions';
import { ButtonRendererComponent } from '@shared/components/button/button-renderer/button-renderer.component';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { AlertsEmailTemplateFormComponent } from './alerts-email-template-form/alerts-email-template-form.component';
import { BUSINESS_DATA_FIELDS, DISABLED_GROUP, OPRION_FIELDS, toolsRichTextEditor } from '../alerts.constants';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
import { AlertChannel } from '../alerts.enum';
import { AlertsSmsTemplateFromComponent } from './alerts-sms-template-from/alerts-sms-template-from.component';
import { AlertsOnScreenTemplateFormComponent } from './alerts-on-screen-template-form/alerts-on-screen-template-form.component';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SecurityState } from 'src/app/security/store/security.state';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { GetBusinessByUnitType } from 'src/app/security/store/security.actions';
import { UserState } from 'src/app/store/user.state';
import { GRID_CONFIG, RECORD_ADDED, RECORD_MODIFIED, USER_ALERTS_PERMISSION } from '@shared/constants';
import { CustomNoRowsOverlayComponent } from '@shared/components/overlay/custom-no-rows-overlay/custom-no-rows-overlay.component';
import { MessageTypes } from '@shared/enums/message-types';
import { AppState } from '../../../store/app.state';
import { BUSINESS_UNITS_VALUES } from '@shared/constants/business-unit-type-list';
import { OutsideZone } from '@core/decorators';

@Component({
  selector: 'app-template',
  templateUrl: './alerts-template.component.html',
  styleUrls: ['./alerts-template.component.scss']
})
export class AlertsTemplateComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @Output() editEmailTemplateEvent = new EventEmitter();
  @Output() editSmsTemplateEvent = new EventEmitter();
  @Output() editOnScreenTemplateEvent = new EventEmitter();
  public tools = toolsRichTextEditor;
  targetElement: HTMLElement = document.body;
  public alertTemplateType: string;
  public alertChannel:AlertChannel;
  public alertTemplate:AlertsTemplate;
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
  @ViewChild(AlertsEmailTemplateFormComponent, { static: true }) emailTemplateForm: AlertsEmailTemplateFormComponent;
  @ViewChild(AlertsSmsTemplateFromComponent, { static: true }) smsTemplateForm: AlertsSmsTemplateFromComponent;
  @ViewChild(AlertsOnScreenTemplateFormComponent, { static: true }) onScreenTemplateForm: AlertsOnScreenTemplateFormComponent;
  private subTitle: string;
  public emailTemplateFormGroup: FormGroup;
  public smsTemplateFormGroup: FormGroup;
  public onScreenTemplateFormGroup: FormGroup;
  @Select(AlertsState.AlertsTemplatePage)
  public alertsTemplatePage$: Observable<AlertsTemplatePage>;
  @Select(AlertsState.TemplateByAlertId)
  public editAlertsTemplate$: Observable<EditAlertsTemplate>;
  @Select(AlertsState.UpdateTemplateByAlertId)
  public updateTemplateByAlertId$: Observable<EditAlertsTemplate>;
  @Select(AlertsState.SaveTemplateByAlertId)
  public saveTemplateByAlertId$: Observable<EditAlertsTemplate>;

  @Select(AppState.isDarkTheme)
  isDarkTheme$: Observable<boolean>;

  public editAlertTemplateData: EditAlertsTemplate = {
    id: 0,
    alertId: 0,
    alertChannel: AlertChannel.Email,
    businessUnitId: BusinessUnitType.Hallmark,
    alertTitle: '',
    alertBody: '',
    toList: '',
    cCList: '',
    bCCList: '',
    parameters: []
  };
  public templateParamsData: { [key: string]: Object }[] = [];
  public unsubscribe$: Subject<void> = new Subject();
  get templateEmailTitle(): string {
    return "Email Template for Alert : " + this.subTitle;
  }
  get templateSmsTitle(): string {
    return "SMS Template for Alert : " + this.subTitle;
  }
  get templateOnScreenTitle(): string {
    return "OnScreen Template for Alert : " + this.subTitle;
  }
  private gridApi: any;
  private gridColumnApi: any;
  private isAlive = true;
  private filters: AlertsTemplateFilters = {};
  public title: string = "Notification Templates";
  public export$ = new Subject<ExportedFileType>();
  public totalRecordsCount: number;
  public getdata:any;
  public showtoast:boolean = true;

  defaultValue: any;
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
  defaultColDef: any;
  itemList: Array<AlertsTemplate> | undefined;

  get businessUnitControl(): AbstractControl {
    return this.businessForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.businessForm.get('business') as AbstractControl;
  }
  public readonly gridConfig: typeof GRID_CONFIG = GRID_CONFIG;

  constructor(private actions$: Actions,
    private readonly ngZone: NgZone,
    private store: Store) {
    super();
    store.dispatch(new SetHeaderState({ title: this.title, iconName: 'lock' }));
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
        field: 'alertId',
        hide: true
      },
      {
        headerName: 'Notfication Description',
        field: 'alertTitle',
        filter: 'agTextColumnFilter',
        filterParams: {
          buttons: ['reset'],
          debounceMs: 1000,
          suppressAndOrCondition: true,
        }
      },
      {
        headerName: 'Status',
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
        headerName: 'Onscreen Template',
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

    ];

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
    this.businessForm = this.generateBusinessForm();
    this.onBusinessUnitValueChanged();
    this.onBusinessValueChanged();
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
    this.emailTemplateFormGroup = AlertsEmailTemplateFormComponent.createForm();
    this.smsTemplateFormGroup = AlertsSmsTemplateFromComponent.createForm();
    this.onScreenTemplateFormGroup = AlertsOnScreenTemplateFormComponent.createForm();
    this.editAlertsTemplate$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      this.templateParamsData = [];
      if (data != undefined) {
        data.alertId=this.alertTemplate?.alertId;
        data.alertChannel=this.alertChannel;
        this.editAlertTemplateData = data;
        if (data.parameters != undefined) {
          data.parameters.forEach((paramter: string) => {
            this.templateParamsData.push({
              text: paramter,
              id: paramter,
              "htmlAttributes": { draggable: true }
            })
          });
        }
        this.UpdateForm(data);
      }
    });
    this.updateTemplateByAlertId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
      if (data != undefined && data!=null) {
        if (data.alertChannel == AlertChannel.Email) {
          this.emailTemplateCloseDialog();
        }
        else if (data.alertChannel == AlertChannel.SMS) {
          this.smsTemplateCloseDialog();
        }
        else if (data.alertChannel == AlertChannel.OnScreen) {
          this.onScreenTemplateCloseDialog();
        }

        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      }
    });
      this.saveTemplateByAlertId$.pipe(takeUntil(this.unsubscribe$)).subscribe((data: any) => {
        if (data != undefined && data!=null) {
          if (data.alertChannel == AlertChannel.Email) {
            this.emailTemplateCloseDialog();
          }
          else if (data.alertChannel == AlertChannel.SMS) {
            this.smsTemplateCloseDialog();
          }
          else if (data.alertChannel == AlertChannel.OnScreen) {
            this.onScreenTemplateCloseDialog();
          }
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
      });
  }
  public onEmailTemplateEdit(data: any): void {
    this.alertChannel=AlertChannel.Email;
    this.alertTemplateType = AlertChannel[AlertChannel.Email];
    this.onEdit(data.rowData);
  }
  public onSmsTemplateEdit(data: any): void {
    this.alertChannel=AlertChannel.SMS;
    this.alertTemplateType = AlertChannel[AlertChannel.SMS];
    this.onEdit(data.rowData);
  }
  public onScreenTemplateEdit(data: any): void {
    this.alertChannel=AlertChannel.OnScreen;
    this.alertTemplateType = AlertChannel[AlertChannel.OnScreen];
    this.onEdit(data.rowData);
  }

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.showLoadingOverlay();
    let datasource = this.createServerSideDatasource();
    params.api.setServerSideDatasource(datasource);
  }
  createServerSideDatasource() {
    let self = this;
    return {
      getRows: function (params: any) {
        setTimeout(() => {
          let postData = {
            pageNumber: params.request.endRow / self.paginationPageSize,
            pageSize: self.paginationPageSize,
            sortFields: params.request.sortModel
          };
          let filter: any;
          let jsonString = JSON.stringify(params.request.filterModel);
          if (jsonString != "{}") {
            let updatedJson = jsonString.replace("operator", "logicalOperator");
            filter = JSON.parse(updatedJson);
          }
          else filter = null;

          let sort = postData.sortFields.length > 0 ? postData.sortFields : null;
          self.dispatchNewPage(sort, filter);

          self.alertsTemplatePage$.pipe(takeUntil(self.unsubscribe$)).subscribe((data: any) => {
            self.itemList = data?.items;
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
  private dispatchNewPage(sortModel: any = null, filterModel: any = null): void {
    this.getdata = this.store.dispatch(new GetAlertsTemplatePage(this.businessUnitControl.value, this.businessControl.value == 0 ? null : this.businessControl.value, this.currentPage, this.pageSize, sortModel, filterModel, this.filters));
    this.getErrorAlert();
  }
  private dispatchEditAlertTemplate(alertId: number, alertChannel: AlertChannel,businessUnitId:number|null): void {
    this.store.dispatch(new GetTemplateByAlertId(alertId, alertChannel,businessUnitId));
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
  public onEdit({ index, column, foreignKeyData, alertId, ...alertsTemplate }: AlertsTemplate & { index: string; column: unknown; foreignKeyData: unknown }): void {
    this.subTitle = alertsTemplate.alertTitle;
    this.alertTemplate={alertId, ...alertsTemplate };
    let businessUnitId=this.businessControl.value==0?null:this.businessControl.value;
    if (this.alertTemplateType === AlertChannel[AlertChannel.Email]) {
      this.emailTemplateForm.addEditEmailTemplateForm.reset();
      this.SetEditData(alertId, AlertChannel.Email,businessUnitId);
      this.emailTemplateForm.rteCreated();
      this.store.dispatch(new ShowEmailSideDialog(true));
    }
    else if (this.alertTemplateType === AlertChannel[AlertChannel.SMS]) {
      this.smsTemplateForm.addEditSmsTemplateForm.reset();
      this.SetEditData(alertId, AlertChannel.SMS,businessUnitId);
      this.smsTemplateForm.rteCreated();
      this.store.dispatch(new ShowSmsSideDialog(true));
    }
    else if (this.alertTemplateType === AlertChannel[AlertChannel.OnScreen]) {
      this.onScreenTemplateForm.addEditOnScreenTemplateForm.reset();
      this.SetEditData(alertId, AlertChannel.OnScreen,businessUnitId);
      this.onScreenTemplateForm.rteCreated();
      this.store.dispatch(new ShowOnScreenSideDialog(true));
    }

  }
  public onEmailTemplateAddCancel(): void {
    this.emailTemplateCloseDialog();
  }
  public onSmsTemplateAddCancel(): void {
    this.smsTemplateCloseDialog();
  }
  public onScreenTemplateAddCancel(): void {
    this.onScreenTemplateCloseDialog();
  }

  public onEmailTemplateSave(): void {
    this.emailTemplateFormGroup.markAllAsTouched();
    if (this.emailTemplateFormGroup.valid && this.emailTemplateFormGroup.errors == null) {
      const formValues = this.emailTemplateFormGroup.getRawValue();
      if (this.editAlertTemplateData.id == 0) {
        const emailAddTemplateDto: AddAlertsTemplateRequest = {
          alertId: this.editAlertTemplateData.alertId,
          businessUnitId: this.businessControl.value==0?null:this.businessControl.value,
          alertBody: formValues.alertBody,
          alertChannel: this.editAlertTemplateData.alertChannel,
          alertTitle: formValues.alertTitle,
          toList: this.editAlertTemplateData.toList == undefined ? '' : this.editAlertTemplateData.toList,
          cCList: this.editAlertTemplateData.cCList == undefined ? '' : this.editAlertTemplateData.cCList,
          bCCList: this.editAlertTemplateData.bCCList == undefined ? '' : this.editAlertTemplateData.bCCList
        };
        this.store.dispatch(new SaveTemplateByAlertId(emailAddTemplateDto));
      }
      else {
        const updateEmailTemplateDto: EditAlertsTemplateRequest = {
          id: this.editAlertTemplateData.id,
          alertBody: formValues.alertBody,
          alertChannel: this.editAlertTemplateData.alertChannel,
          alertTitle: formValues.alertTitle,
          toList: this.editAlertTemplateData.toList == undefined ? '' : this.editAlertTemplateData.toList,
          cCList: this.editAlertTemplateData.cCList == undefined ? '' : this.editAlertTemplateData.cCList,
          bCCList: this.editAlertTemplateData.bCCList == undefined ? '' : this.editAlertTemplateData.bCCList
        };
        this.store.dispatch(new UpdateTemplateByAlertId(updateEmailTemplateDto));
      }
    }
  }

  public onSmsTemplateSave(): void {
    this.smsTemplateFormGroup.markAllAsTouched();
    if (this.smsTemplateFormGroup.valid && this.smsTemplateFormGroup.errors == null) {
      const formValues = this.smsTemplateFormGroup.getRawValue();
      if (this.editAlertTemplateData.id == 0) {
        const smsAddTemplateDto: AddAlertsTemplateRequest = {
          alertId: this.editAlertTemplateData.alertId,
          businessUnitId: this.businessControl.value==0?null:this.businessControl.value,
          alertBody: formValues.alertBody?.replace(/<[^>]*>/g, ''),
          alertChannel: this.editAlertTemplateData.alertChannel,
          alertTitle: this.editAlertTemplateData.alertTitle == undefined?"":this.editAlertTemplateData.alertTitle,
          toList: this.editAlertTemplateData.toList == undefined ? '' : this.editAlertTemplateData.toList,
          cCList: this.editAlertTemplateData.cCList == undefined ? '' : this.editAlertTemplateData.cCList,
          bCCList: this.editAlertTemplateData.bCCList == undefined ? '' : this.editAlertTemplateData.bCCList
        };
        this.store.dispatch(new SaveTemplateByAlertId(smsAddTemplateDto));
      }
      else {
        const smsUpdateTemplateDto: EditAlertsTemplateRequest = {
          id: this.editAlertTemplateData.id,
          alertBody: formValues.alertBody?.replace(/<[^>]*>/g, ''),
          alertChannel: this.editAlertTemplateData.alertChannel,
          alertTitle: this.editAlertTemplateData.alertTitle == undefined?"":this.editAlertTemplateData.alertTitle,
          toList: this.editAlertTemplateData.toList == undefined ? '' : this.editAlertTemplateData.toList,
          cCList: this.editAlertTemplateData.cCList == undefined ? '' : this.editAlertTemplateData.cCList,
          bCCList: this.editAlertTemplateData.bCCList == undefined ? '' : this.editAlertTemplateData.bCCList
        };
        this.store.dispatch(new UpdateTemplateByAlertId(smsUpdateTemplateDto));
      }
    }

  }

  public onScreenTemplateSave(): void {
    this.onScreenTemplateFormGroup.markAllAsTouched();
    if (this.onScreenTemplateFormGroup.valid && this.onScreenTemplateFormGroup.errors == null) {
      const formValues = this.onScreenTemplateFormGroup.getRawValue();
      if (this.editAlertTemplateData.id == 0) {
        const onScreenAddTemplateDto: AddAlertsTemplateRequest = {
          alertId: this.editAlertTemplateData.alertId,
          businessUnitId: this.businessControl.value==0?null:this.businessControl.value,
          alertBody: formValues.alertBody,
          alertChannel: this.editAlertTemplateData.alertChannel,
          alertTitle: formValues.alertTitle,
          toList: this.editAlertTemplateData.toList == undefined ? '' : this.editAlertTemplateData.toList,
          cCList: this.editAlertTemplateData.cCList == undefined ? '' : this.editAlertTemplateData.cCList,
          bCCList: this.editAlertTemplateData.bCCList == undefined ? '' : this.editAlertTemplateData.bCCList
        };
        this.store.dispatch(new SaveTemplateByAlertId(onScreenAddTemplateDto));
      }
      else {
        const onScreenUpdateTemplateDto: EditAlertsTemplateRequest = {
          id: this.editAlertTemplateData.id,
          alertBody: formValues.alertBody,
          alertChannel: this.editAlertTemplateData.alertChannel,
          alertTitle: formValues.alertTitle,
          toList: this.editAlertTemplateData.toList == undefined ? '' : this.editAlertTemplateData.toList,
          cCList: this.editAlertTemplateData.cCList == undefined ? '' : this.editAlertTemplateData.cCList,
          bCCList: this.editAlertTemplateData.bCCList == undefined ? '' : this.editAlertTemplateData.bCCList
        };
        this.store.dispatch(new UpdateTemplateByAlertId(onScreenUpdateTemplateDto));
       }
    }

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
  private SetEditData(alertId: number, alertChannel: AlertChannel,businessUnitId:number |null): void {
    this.dispatchEditAlertTemplate(alertId, alertChannel,businessUnitId);
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
      if (value == 1) {
        this.dispatchNewPage();
      }
    });
  }
  private onBusinessValueChanged(): void {
    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
        this.dispatchNewPage();
    });
  }

  private UpdateForm(data:any):void
  {
    if (this.alertTemplateType === AlertChannel[AlertChannel.Email]) {
      this.emailTemplateForm.alertBody=data.alertBody;
      this.emailTemplateForm.alertTitle=data.alertTitle;
    }
    else if (this.alertTemplateType === AlertChannel[AlertChannel.SMS]) {
      this.smsTemplateForm.alertBody=data.alertBody;
      this.smsTemplateForm.alertTitle=data.alertTitle;
    }
    else if (this.alertTemplateType === AlertChannel[AlertChannel.OnScreen]) {
      this.onScreenTemplateForm.alertBody=data.alertBody;
      this.onScreenTemplateForm.alertTitle=data.alertTitle;
    }

  }
  @OutsideZone
  getErrorAlert(){
    setTimeout(()=> {
      this.getdata.subscribe((data:any)=> {
        if(data.null.alertsTemplatePage == undefined && this.showtoast == true){
          this.store.dispatch(new ShowToast(MessageTypes.Error, USER_ALERTS_PERMISSION));
          this.showtoast = false;
        }
      });
    },3000)
  }

}
