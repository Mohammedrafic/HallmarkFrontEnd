import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrgInterface } from '@shared/models/org-interface.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-org-interface-configuration',
  templateUrl: './org-interface-configuration.component.html',
  styleUrls: ['./org-interface-configuration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrgInterfaceConfigurationComponent  implements OnInit {

  @Input() selectedOrgLog$: Subject<OrgInterface> = new Subject<OrgInterface>();

  public orgConfigurationFormGroup: FormGroup;
  private unsubscribe$: Subject<void> = new Subject();
  selectedOrgLog:OrgInterface;

  constructor(private formBuilder: FormBuilder,  private readonly cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {

    this.selectedOrgLog$.pipe(takeUntil(this.unsubscribe$)).subscribe((dataSet)=>{
      this.selectedOrgLog = dataSet;
      this.loadOrgConfigurationForm();
      setTimeout(()=> {
        this.orgConfigurationFormGroup.markAsPristine();
        this.cdr.markForCheck();
      },500)
    });

    this.loadOrgConfigurationForm();

  }

  loadOrgConfigurationForm(){
    this.orgConfigurationFormGroup = this.formBuilder.group({
      etlprocessName: [this.selectedOrgLog ? this.selectedOrgLog.etlprocessName : '', [Validators.required]],
      description: [this.selectedOrgLog ? this.selectedOrgLog.description : ''],
      fileExtension: ['', [Validators.required]],
      fileNamePattern: ['', [Validators.required]],
      columnDelimiter: [''],
      hasHeader: [''],
      importAllFilesIntheFolder: [''],
      processSameFileAgain: [''],
      emailNotification: [''],
      sendMailSubject: [''],
      emailRecipientsSuccess: [''],
      emailRecipientsError: [''],
      emailRecipientsCc: [''],
      emailRecipientsBcc: [''],
      regionSpecific: [''],
      cleanImport: [''],
      retentionPeriodInDays: [''],
    });
  }

}
