import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { formatDate, PhoneMask, SEND_EMAIL, SEND_EMAIL_REQUIRED, ZipCodeMask } from '@shared/constants';
import { COUNTRIES } from '@shared/constants/countries-list';
import { BehaviorSubject, Observable, distinctUntilChanged, takeUntil } from 'rxjs';
import { CanadaStates, Country, UsaStates } from '@shared/enums/states';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { TakeUntilDestroy } from '@core/decorators';
import { Select, Store } from '@ngxs/store';
import { UserState } from 'src/app/store/user.state';
import { FormGroup } from '@angular/forms';
import { ShowGroupEmailSideDialog, ShowToast } from 'src/app/store/app.actions';
import { User } from '@shared/models/user-managment-page.model';
import { SendGroupEmailRequest } from '@shared/models/group-email.model';
import { EmployeeGroupMailComponent } from '../../employee-group-mail/employee-group-mail.component';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { MessageTypes } from '@shared/enums/message-types';
import { GroupMailStatus, OrganizationUserType } from '@admin/alerts/group-email.enum';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { SendGroupEmail } from '@admin/store/alerts.actions';
import { RichTextEditorComponent } from '@syncfusion/ej2-angular-richtexteditor';
@Component({
  selector: 'app-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss'],
})
@TakeUntilDestroy
export class ContactDetailsComponent extends AbstractContactDetails implements OnInit,OnDestroy {
  public readonly formatDate = formatDate;
  public readonly phoneMask = PhoneMask;
  public readonly zipCodeMask = ZipCodeMask;
  public readonly countries = COUNTRIES;
  public isSourceValidated:boolean =false
  isFormInvalid: boolean = false;
  public readonly maxFileSize = 2000000; // 2 mb
  @ViewChild('RTEGroupEmail') public rteObj: RichTextEditorComponent;
  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrgId$: Observable<number>;
  @ViewChild(EmployeeGroupMailComponent, { static: true }) employeeEmailTemplateForm: EmployeeGroupMailComponent;

  
  @Select(RejectReasonState.sourcingReasons)
  public sourcing$: Observable<any>;

  @Output() stateData = new EventEmitter<any>();
   public isSend:boolean=false
public id:any;

  public readonly addressFieldSettings = { text: 'text', value: 'id' };
  public businessUnitId:number;
  public groupEmailTemplateForm:FormGroup;
  public states$: BehaviorSubject<string[]>;
  public userObj: User | null;
  public templateEmailTitle:string ="Employee"

  protected componentDestroy: () => Observable<unknown>;

  constructor(
    protected override cdr: ChangeDetectorRef, private store: Store,
    protected override candidateProfileFormService: CandidateProfileFormService,
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    this.sourcing$.pipe(takeUntil(this.destroy$)).subscribe((data:any) => {
      if (data != null) {
        this.isSourceValidated = data.issourcing
      }
    });
    super.ngOnInit();
    this.setCountryState();
    this.listenCountryChanges();
    this.lastSelectedOrgId$.pipe().subscribe((data:number)=>{
      this.businessUnitId =data;
    })
    this.groupEmailTemplateForm = EmployeeGroupMailComponent.createForm();
    
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private setCountryState(): void {
    const { country } = this.candidateForm.value ?? Country.USA;
    this.states$ = new BehaviorSubject(country === Country.USA ? UsaStates : CanadaStates);
  }

  private listenCountryChanges(): void {
    this.candidateForm.get('country')?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil((this.componentDestroy()))
    ).subscribe((country: Country) => {
      this.states$.next(country === Country.USA ? UsaStates : CanadaStates);
      this.candidateForm.get('state')?.reset();
    });
  }
  onGroupEmailFormSendClick(){
   
    if(this.candidateForm.get("personalEmail")?.value){
      this.groupEmailTemplateForm.controls['emailTo'].setValue(this.candidateForm.get("personalEmail")?.value);
      this.groupEmailTemplateForm.controls['emailTo'].disable();
      this.store.dispatch(new ShowGroupEmailSideDialog(true));
      this.isSend=true;
    }else{
      this.store.dispatch(new ShowToast(MessageTypes.Error, "Email Required"));
    }

  }

   onCCFieldKeyup() {
    this.isFormInvalid = false;
  }
  public onGroupEmailAddCancel(): void {
    this.groupEmailCloseDialog();
  }
  private groupEmailCloseDialog(): void {
    this.store.dispatch(new ShowGroupEmailSideDialog(false));
  }

  public onGroupEmailSend(): void {

    if (this.employeeEmailTemplateForm.emailBody != '' && this.groupEmailTemplateForm.get("emailTo")?.value != '' && this.groupEmailTemplateForm.get("emailSubject")?.value != '') {
      const formValues = this.groupEmailTemplateForm.getRawValue();
      const sendGroupEmailDto: SendGroupEmailRequest = {
        businessUnitId: this.businessUnitId,
        bodyMail: formValues.emailBody,
        subjectMail: formValues.emailSubject,
        toList: formValues.emailTo == undefined ? "" : formValues.emailTo,
        cCList: formValues.emailCc == undefined ? "" : formValues.emailCc,
        bCCList: "",
        status: GroupMailStatus.Pending,
        fromMail: this.userObj?.email == undefined ? "" : this.userObj?.email,
        selectedFile: formValues.fileUpload,
        businessUnitType: BusinessUnitType.Organization,
        userType: OrganizationUserType.Employees,
        selectedBusinessUnitId: ""
      };
      this.store.dispatch(new SendGroupEmail(sendGroupEmailDto));
      this.store.dispatch(new ShowGroupEmailSideDialog(false));
      this.store.dispatch(new ShowToast(MessageTypes.Success,SEND_EMAIL));
    }
    else {
      let controlNames = "";
      let isAre = " is ";
      let field = "Field ";
      if (this.groupEmailTemplateForm.get("emailBody")?.value == '') {
        controlNames = "Email To";
        //this.groupEmailTemplateForm.isFormInvalid = true;
      }
      if (this.groupEmailTemplateForm.get("emailSubject")?.value == '') {
        controlNames = controlNames == "" ? "Email Subject" : controlNames + ",Email Subject";
      }
      if (this.groupEmailTemplateForm.get("emailBody")?.value== '') {
        controlNames = controlNames == "" ? "Email Body" : controlNames + ",Email Body";
      }
      if (controlNames.indexOf(",") > 0) {
        isAre = " are "
        field = "Fields "
      }
      this.store.dispatch(new ShowToast(MessageTypes.Error,field+controlNames+isAre+ SEND_EMAIL_REQUIRED));
    }
  }
}

