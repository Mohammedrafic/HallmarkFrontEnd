import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrgInterface } from '@shared/models/org-interface.model';
import { Subject, filter, takeUntil } from 'rxjs';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';

@Component({
  selector: 'app-org-interface-configuration',
  templateUrl: './org-interface-configuration.component.html',
  styleUrls: ['./org-interface-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgInterfaceConfigurationComponent  implements OnInit {

  @Input() selectedOrgLog$: Subject<OrgInterface> = new Subject<OrgInterface>();
  @Input() onClearClick$: Subject<boolean> = new Subject<boolean>();
  @Input() onSaveClick$: Subject<boolean> = new Subject<boolean>();
  @Output() public onCloseEvent: EventEmitter<void> = new EventEmitter<void>();

  public orgConfigurationFormGroup: FormGroup;
  private unsubscribe$: Subject<void> = new Subject();
  selectedOrgLog:OrgInterface;
  faInfoCircle = faInfoCircle as IconProp;
  emailNotificationFlag:boolean = false;

  constructor(private formBuilder: FormBuilder, private confirmService: ConfirmService,  private readonly cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {

    this.selectedOrgLog$.pipe(takeUntil(this.unsubscribe$)).subscribe((dataSet)=>{
      this.selectedOrgLog = dataSet;
      this.emailNotificationFlag = dataSet.emailNotification;
      this.loadOrgConfigurationForm();
      setTimeout(()=> {
        this.orgConfigurationFormGroup.markAsPristine();
        this.cdr.markForCheck();
      },500)
    });

    this.onSaveClick$.pipe(takeUntil(this.unsubscribe$)).subscribe((saveFlag)=>{
      if(saveFlag){
      }
    });

    this.onClearClick$.pipe(takeUntil(this.unsubscribe$)).subscribe((clearFlag)=>{
      if(clearFlag){
        if (this.orgConfigurationFormGroup.dirty) {
          this.confirmService.confirm(CANCEL_CONFIRM_TEXT, {title: DELETE_CONFIRM_TITLE,okButtonLabel: 'Leave',okButtonClass: 'delete-button' })
            .pipe(filter(confirm => !!confirm),
            takeUntil(this.unsubscribe$))
            .subscribe((confirm) => {
              if (confirm) {
                this.orgConfigurationFormGroup?.reset();
                this.emailNotificationFlag = this.selectedOrgLog.emailNotification;
                this.loadOrgConfigurationForm();
                this.onCloseEvent.emit();
              }
            });
        }else{
          this.orgConfigurationFormGroup?.reset();
          this.emailNotificationFlag = this.selectedOrgLog.emailNotification;
          this.loadOrgConfigurationForm();
          this.onCloseEvent.emit();
        }

      }
    });

    this.loadOrgConfigurationForm();

  }

  onEmailSwitcher(event: { checked: boolean }): void {
    this.emailNotificationFlag= event.checked;
  }

  loadOrgConfigurationForm(){
    this.orgConfigurationFormGroup = this.formBuilder.group({
      etlprocessName: [this.selectedOrgLog ? this.selectedOrgLog.etlprocessName : '', [Validators.required]],
      description: [this.selectedOrgLog ? this.selectedOrgLog.description : ''],
      fileExtension: [this.selectedOrgLog ? this.selectedOrgLog.fileExtension : '', [Validators.required]],
      fileNamePattern: [this.selectedOrgLog ? this.selectedOrgLog.fileNamePattern : '', [Validators.required]],
      columnDelimiter: [this.selectedOrgLog ? this.selectedOrgLog.columnDelimiter : ''],
      hasHeader: [this.selectedOrgLog ? this.selectedOrgLog.hasHeader : ''],
      importAllFilesIntheFolder: [this.selectedOrgLog ? this.selectedOrgLog.importAllFilesIntheFolder : ''],
      processSameFileAgain: [this.selectedOrgLog ? this.selectedOrgLog.processSameFileAgain : ''],
      emailNotification: [this.selectedOrgLog ? this.selectedOrgLog.emailNotification : ''],
      sendMailSubject: [this.selectedOrgLog ? this.selectedOrgLog.sendMailSubject : ''],
      emailRecipientsSuccess: [this.selectedOrgLog ? this.selectedOrgLog.emailRecipientsSuccess : ''],
      emailRecipientsError: [this.selectedOrgLog ? this.selectedOrgLog.emailRecipientsError : ''],
      emailRecipientsCc: [this.selectedOrgLog ? this.selectedOrgLog.emailRecipientsCc : ''],
      emailRecipientsBcc: [this.selectedOrgLog ? this.selectedOrgLog.emailRecipientsBcc : ''],
      regionSpecific: [this.selectedOrgLog ? this.selectedOrgLog.regionSpecific : ''],
      cleanImport: [this.selectedOrgLog ? this.selectedOrgLog.cleanImport : ''],
      retentionPeriodInDays: [this.selectedOrgLog ? this.selectedOrgLog.retentionPeriodInDays : ''],
    });
  }

}
