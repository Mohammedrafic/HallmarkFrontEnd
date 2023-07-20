import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractContactDetails } from '@client/candidates/candidate-profile/candidate-details/abstract-contact-details';
import { formatDate, PhoneMask, ZipCodeMask } from '@shared/constants';
import { COUNTRIES } from '@shared/constants/countries-list';
import { BehaviorSubject, Observable, takeUntil } from 'rxjs';
import { CanadaStates, Country, UsaStates } from '@shared/enums/states';
import { CandidateProfileFormService } from '@client/candidates/candidate-profile/candidate-profile-form.service';
import { TakeUntilDestroy } from '@core/decorators';
import { Select, Store } from '@ngxs/store';
import { UserState } from 'src/app/store/user.state';
import { ActivatedRoute, Router } from '@angular/router';
import {  FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import {  ShowGroupEmailSideDialog, ShowToast } from 'src/app/store/app.actions';
import {
  PdfViewerComponent,
  MagnificationService,
  NavigationService,
  TextSelectionService,
  AnnotationService,
  ToolbarService,
} from '@syncfusion/ej2-angular-pdfviewer';
import { User } from '@shared/models/user-managment-page.model';
import { SendGroupEmailRequest } from '@shared/models/group-email.model';
import { EmployeeGroupMailComponent } from '../../employee-group-mail/employee-group-mail.component';
import { CandidateListState } from '@shared/components/candidate-list/store/candidate-list.state';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { GetSourcingReasons } from '@organization-management/store/reject-reason.actions';
import { MessageTypes } from '@shared/enums/message-types';
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
  @Select(UserState.lastSelectedOrganizationId)
  lastSelectedOrgId$: Observable<number>;

  
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
    protected override cdr: ChangeDetectorRef,private router: Router,   private store: Store,
    protected override candidateProfileFormService: CandidateProfileFormService,    private route: ActivatedRoute, private sanitizer: DomSanitizer,
  ) {
    super(cdr, candidateProfileFormService);
  }

  public override ngOnInit(): void {
    this.store.dispatch(new GetSourcingReasons());
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
      takeUntil((this.componentDestroy()))
    ).subscribe((country: Country) => {
      this.states$.next(country === Country.USA ? UsaStates : CanadaStates);
      this.candidateForm.get('state')?.reset();
    });
  }
  onGroupEmailFormSendClick(){
    this.isSend=true;
    this.store.dispatch(new ShowGroupEmailSideDialog(true));
    //this.router.navigate(['alerts/group-email'],{ queryParams: { redirectFromEmployee: true , businessUnitType: BusinessUnitType.Organization,businessUnit: this.businessUnitId,userType:OrganizationUserType.Employees,employeeId:parseInt(this.route.snapshot.paramMap.get('id') as string) } });
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
    this.store.dispatch(new ShowToast(MessageTypes.Success,"Mail Send Successfully"));
    // this.groupEmailTemplateForm.markAllAsTouched();
    // if (this.groupEmailTemplateForm.invalid) {
    //   this.isFormInvalid = true;
    //   return;
    // }
    // if (this.groupEmailTemplateForm.get("emailBody")?.value != '' && this.groupEmailTemplateForm.get("emailTo")?.value != '' && this.groupEmailTemplateForm.get("emailSubject")?.value != '') {
    //   const formValues = this.groupEmailTemplateForm.getRawValue();
    //   let businessUnitId: number | null = null;
    //   if (formValues.businessUnit == 4)
    //     businessUnitId = formValues.businesses[0]
    //   if (formValues.businessUnit == 3)
    //     businessUnitId = formValues.business == 0 ? null : formValues.business
    //   const sendGroupEmailDto: SendGroupEmailRequest = {
    //     businessUnitId: businessUnitId,
    //     bodyMail: formValues.emailBody,
    //     subjectMail: formValues.emailSubject,
    //     toList: formValues.emailTo == undefined ? "" : formValues.emailTo,
    //     cCList: formValues.emailCc == undefined ? "" : formValues.emailCc,
    //     bCCList: "",
    //     status: GroupMailStatus.Pending,
    //     fromMail: this.userObj?.email == undefined ? "" : this.userObj?.email,
    //     selectedFile: formValues.fileUpload,
    //     businessUnitType: formValues.businessUnit == 0 ? null : formValues.businessUnit,
    //     userType: formValues.userType
    //   };
    //   this.store.dispatch(new SendGroupEmail(sendGroupEmailDto));

    // }
    // else {
    //   // let controlNames = "";
    //   // let isAre = " is ";
    //   // let field = "Field ";
    //   // if (this.groupEmailTemplateForm.emailTo == '') {
    //   //   controlNames = "Email To";
    //   //   this.groupEmailTemplateForm.isFormInvalid = true;
    //   // }
    //   // if (this.groupEmailTemplateForm.emailSubject == '') {
    //   //   controlNames = controlNames == "" ? "Email Subject" : controlNames + ",Email Subject";
    //   // }
    //   // if (this.groupEmailTemplateForm.emailBody == '') {
    //   //   controlNames = controlNames == "" ? "Email Body" : controlNames + ",Email Body";
    //   // }
    //   // if (controlNames.indexOf(",") > 0) {
    //   //   isAre = " are "
    //   //   field = "Fields "
    //   // }
    //   //this.store.dispatch(new ShowToast(MessageTypes.Error,field+controlNames+isAre+ SEND_EMAIL_REQUIRED));
    // }
  }
}

