// import { Component, OnInit } from '@angular/core';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HtmlEditorService, ImageService, LinkService, RichTextEditorComponent, TableService, ToolbarService, ToolbarType } from '@syncfusion/ej2-angular-richtexteditor';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { BusinessUnit } from '@shared/models/business-unit.model';
//import { toolsRichTextEditor } from '../../alerts.constants';
import { BUSINESS_UNITS_VALUES, BUSINESS_DATA_FIELDS, DISABLED_GROUP, OPRION_FIELDS,toolsRichTextEditor,User_DATA_FIELDS } from '../../alerts.constants';
import { Actions, Select, Store } from '@ngxs/store';
import { GetBusinessByUnitType,GetAllUsersPage } from 'src/app/security/store/security.actions';
import { ClearAlertTemplateState, GetAlertsTemplatePage, GetTemplateByAlertId, GetUserSubscriptionPage, SaveTemplateByAlertId, UpdateTemplateByAlertId } from '@admin/store/alerts.actions';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { AddAlertsTemplateRequest, AlertsTemplate, AlertsTemplateFilters, AlertsTemplatePage, EditAlertsTemplate, EditAlertsTemplateRequest } from '@shared/models/alerts-template.model';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SecurityState } from 'src/app/security/store/security.state';
import { User, UsersPage } from '@shared/models/user.model';
import { AppState } from 'src/app/store/app.state';
import { ShouldDisableUserDropDown } from 'src/app/store/app.actions';
import { AlertsState } from '@admin/store/alerts.state';
import { UserSubscriptionFilters, UserSubscriptionPage } from '@shared/models/user-subscription.model';
import { FilterService } from '@shared/services/filter.service';
import { ChangeEventArgs, FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

//import { GetAllUsersPage, GetBusinessByUnitType } from 'src/app/security/store/security.actions';
@Component({
  selector: 'app-send-group-email',
  templateUrl: './send-group-email.component.html',
  styleUrls: ['./send-group-email.component.scss'],
  providers: [ToolbarService, LinkService, ImageService, HtmlEditorService, TableService]
  
})
export class SendGroupEmailComponent extends AbstractGridConfigurationComponent implements OnInit {
  public tools = toolsRichTextEditor;
  public form: FormGroup;
  @Input() addEditEmailTemplateForm: FormGroup;
  @Input() title: string;
  @Input() alertTitle:string;
  @Input() alertBody:string;
  override selectedItems:any;

  @Input() templateParamsData:{ [key: string]: Object }[];
  @Output() formCancelClicked = new EventEmitter();
  @Output() formSaveClicked = new EventEmitter();

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

  @ViewChild('RTE') public rteObj: RichTextEditorComponent;
  private listboxEle: HTMLElement;
  private editArea: HTMLElement;
  userData:User[];
  public range: Range = new Range();
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public businessDataFields = BUSINESS_DATA_FIELDS;
  public userDataFields = User_DATA_FIELDS;
  private isAlive: boolean = true;
  defaultBusinessValue: any;
  defaultUserValue: any;
  defaultValue: number;
  public userGuid: string = "";
  private filters: UserSubscriptionFilters = {};
  public unsubscribe$: Subject<void> = new Subject();
  public orgStructureData: any;
  public toEmail:string;
  constructor(private actions$: Actions,
    private store: Store,private fb:FormBuilder) {
     
    super();
  }
  get businessUnitControl(): AbstractControl {
    return this.addEditEmailTemplateForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.addEditEmailTemplateForm.get('business') as AbstractControl;
  }
  get usersControl(): AbstractControl {
  
    return this.addEditEmailTemplateForm.get('user') as AbstractControl;
  }
  private dispatchNewPage(user: any, sortModel: any = null, filterModel: any = null): void {
    const { businessUnit } = this.addEditEmailTemplateForm?.getRawValue();
    if (user != 0) {
      this.userGuid = user;
      this.store.dispatch(new GetUserSubscriptionPage(businessUnit || null, user, this.currentPage, this.pageSize, sortModel, filterModel, this.filters));
    }
  }

  receivedData(data:any){
    console.log("da" , data);
    
  }
  ngOnInit(): void {

    this.addEditEmailTemplateForm=this.generateBusinessForm()
    this.onBusinessUnitValueChanged();
    this.onBusinessValueChanged();
    this.onUserValueChanged();
    this.onOrgStructureControlValueChangedHandler();
    const user = this.store.selectSnapshot(UserState.user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.addEditEmailTemplateForm.disable();
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
      if (data != undefined) {
        this.defaultBusinessValue = data[0]?.id;
        if (!this.isBusinessFormDisabled) {
          this.defaultValue = data[0]?.id;
        }
      }
    });
    this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      if (data != undefined) {
          this.userData = data.items;
          this.defaultUserValue = data.items[0]?.id;
        let value = this.addEditEmailTemplateForm.controls['user'].value;
        if (value != this.userData.find((x:any) => x.id == user?.id)?.id) {
          this.addEditEmailTemplateForm.controls['user'].setValue(this.userData.find((x:any) => x.id == user?.id)?.id);
        }
      }
    });

    // this.shouldDisableUserDropDown$.pipe(takeUntil(this.unsubscribe$)).subscribe((disable: boolean) => {
    //   if (disable != undefined && disable == true) {
    //     this.store.dispatch(new ShouldDisableUserDropDown(false));
    //     this.addEditEmailTemplateForm.controls['user'].disable();
    //     this.addEditEmailTemplateForm.controls['business'].disable();
    //     this.addEditEmailTemplateForm.controls['businessUnit'].disable();
    //   }
    // });
  }
  private dispatchUserPage(businessUnitIds: number[]) {
    this.store.dispatch(new GetAllUsersPage(this.businessUnitControl.value, businessUnitIds, this.currentPage, this.pageSize, null, null, true));
  }
  
  public generateBusinessForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      business: new FormControl(0),
      user: new FormControl(0),
      toAddress: new FormControl(''),
      ccMail: new FormControl(''),
      subjectMail: new FormControl(''),
      BodyMail: new FormControl('')

      
    });
  }
  private onBusinessUnitValueChanged(): void {
 
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.userData = [];
      this.dispatchNewPage(null);
      console.log("value" , value);
      
      this.store.dispatch(new GetBusinessByUnitType(value));
      if (value == 1) {
        this.dispatchUserPage([]);
      }
      else {
        this.businessData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
          if (!this.isBusinessFormDisabled && data.length > 0) {
            if (this.addEditEmailTemplateForm.controls['business'].value != data[0].id) {
              this.addEditEmailTemplateForm.controls['business'].setValue(data[0].id);
            }
          }
        });

        this.userData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
          if (data != undefined && this.userData.length > 0) {
            if (this.addEditEmailTemplateForm.controls['user'].value != this.userData[0].id)
              this.addEditEmailTemplateForm.controls['user'].setValue(this.userData[0].id);
          }
        });
      }
    });
  }
  private onBusinessValueChanged(): void {
    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.userData = [];
      this.dispatchNewPage(null);
      let businessUnitIds = [];
      if (value != 0 && value != null) {
        businessUnitIds.push(this.businessControl.value);
      }
      this.dispatchUserPage(businessUnitIds);

    });
  }
  private onUserValueChanged(): void {
    console.log("change")
    this.usersControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      console.log("user value" , value)
      this.dispatchNewPage(value);

    });
  }

  rteCreated(): void {
    if (this.editArea == null) {
      this.editArea = document.querySelector("#defaultRTE .e-content") as HTMLElement;
      // Drop handler    
     // this.editArea.addEventListener("drop", this.dropHandler.bind(this));
    }

    if (this.listboxEle == null) {
      this.listboxEle = document.getElementById('listbox') as HTMLElement;
      // DragStart event binding

      // this.listboxEle.addEventListener("dragstart", function (e: any) {
      //   e.dataTransfer.setData("Text", (e.target as HTMLElement).innerText);
      // });
    }
    this.rteObj.toolbarSettings.type = ToolbarType.Scrollable;
    this.rteObj.toolbarSettings.enableFloating = true;
    this.rteObj.height='300px';
  }
  ngAfterViewInit() {
    this.rteObj.refreshUI();
  }

  dropHandler(e: any): void {
    e.preventDefault();

    if (this.rteObj.inputElement.contains(e.target)) {
      let range: any;
      let getDocument = this.rteObj.contentModule.getDocument?.();
      if (getDocument?.caretRangeFromPoint) {
        range = getDocument?.caretRangeFromPoint(e.clientX, e.clientY);
        this.rteObj.selectRange(range);
      } else if (e.rangeParent) {
        range = getDocument?.createRange();
        range.setStart(e.rangeParent, e.rangeOffset);
        this.rteObj.selectRange(range);
      }
      if (this.rteObj.formatter.getUndoRedoStack?.().length === 0) {
        this.rteObj.formatter.saveData?.();
      }
      let text = e.dataTransfer.getData('Text').replace(/\n/g, '').replace(/\r/g, '').replace(/\r\n/g, '');
      this.rteObj.executeCommand("insertHTML", text);
      this.rteObj.formatter.saveData?.();
      this.rteObj.formatter.enableUndo?.(this.rteObj);
    }
  }

  static createForm(): FormGroup {
    return new FormGroup({
      alertTitle: new FormControl('', [Validators.required]),
      alertBody: new FormControl('', [Validators.required]),
    });
  }
  private onOrgStructureControlValueChangedHandler(): void 
  {

// this.addEditEmailTemplateForm.get('user')?.valueChanges.subscribe((val: any) => {    
//    
//   if (val?.length) {
//     console.log("vall" , val);
    
//   }
  
//          
//    }); 


  }
  onFormCancelClick(): void {
    this.formCancelClicked.emit();
  }
  onSelectProperty(event:any) 
  { 
    alert("User")
    var selectedid = event.itemData.Id; 
    var selectedvalue = event.itemData.Game; 
    var namePArr = { ID: selectedid, Game: selectedvalue }; 
   // this.propertyGroupsAttributes.push(namePArr); 
    //if (!this.onInitial) { 
   // this.listObj.addItem(namePArr); 
   // } 
   //this.onInitial = false; 
} 
public async onChange(args: any) {
  console.log('Change event' ,args);
   let checkedItems:any[]=[]
  let values:any[]= []
  values=args?.value;
   await values.forEach(element => {
  checkedItems.push({id:element})
});
  console.log(checkedItems, 'vv');

   let  results:any=[]
    results = this.userData.filter(({ id: id1 }) => checkedItems.some(({ id: id2 }) => id2 === id1));
    console.log("selected" ,results);
    var data = results.map((t: {
      email: any; "": any; 
})=>t.email);
console.log("Email",data);
var str = data.join(", "); 
console.log("ToEmail",str);
this.toEmail=str;
// this.toMail.setValue({
//  // id: region?.id,
//   toMail: str,


// });
//this.addEditEmailTemplateForm.patchValue({ toMail: str });
}

  onFormSaveClick(): void {
    this.editArea.removeEventListener('drop', this.dropHandler.bind(this));
    this.formSaveClicked.emit();
  }

  
}
