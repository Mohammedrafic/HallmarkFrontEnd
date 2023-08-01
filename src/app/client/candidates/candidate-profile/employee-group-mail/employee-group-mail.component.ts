import { GetDocumentDownloadDeatils, GetDocumentPreviewDeatils } from '@admin/store/alerts.actions';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, ChangeDetectorRef, AfterViewInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DownloadDocumentDetail } from '@shared/models/group-email.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FileInfo, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ShowDocPreviewSideDialog } from 'src/app/store/app.actions';
import {
  PdfViewerComponent,
  MagnificationService,
  NavigationService,
  TextSelectionService,
  AnnotationService,
  ToolbarService,
} from '@syncfusion/ej2-angular-pdfviewer';
import { AlertsState } from '@admin/store/alerts.state';
import { toolsRichTextEditor } from '@admin/alerts/alerts.constants';
@Component({
  selector: 'app-employee-group-mail',
  templateUrl: './employee-group-mail.component.html',
  styleUrls: ['./employee-group-mail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeGroupMailComponent  extends AbstractGridConfigurationComponent
implements OnInit, AfterViewInit, OnDestroy{
  @Input() groupEmailTemplateForm: FormGroup;
  @Input() emailSubject: string;
  @Input() emailBody: string;
  @Input() emailTo: string | null;
  @Input() emailCc: string | null;
  @Input() isSend: boolean = true;
  @Input() fileName: string | null;
  @Input() isFormInvalid: boolean = false;
  @Input() fileNameInput: string | undefined;
  public service: string = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';
  public tools = toolsRichTextEditor;
  public readonly maxFileSize = 2000000; // 2 mb
  public dropElement: HTMLElement;
  public readonly allowedExtensions: string = '.pdf, .doc, .docx, .jpg, .jpeg, .png';
  public uploaderErrorMessageElement: HTMLElement;
  public file: any;
  public files: File[] = [];
  public commonFields: FieldSettingsModel = { text: 'name', value: 'value' };
  public userType: any = [];
  public filteredUserType: any = [];
  public downloadedFileName: string = '';
  public dialogWidth: string = '434px';
  public previewUrl: SafeResourceUrl | null;
  public isImage: boolean = false;
  public isWordDoc: boolean = false;
  public isPdf: boolean = false;
  public pdfDocumentPath: string = "";
  public previewTitle: string = "Document Preview";
  public isExcel: boolean = false;
  fileAsBase64: string;
  faDownload = faDownload as IconProp;
  @ViewChild('pdfViewer', { static: true })
  public pdfViewer: PdfViewerComponent;
  @ViewChild('filesUploaderGroupEmail') uploadObj: UploaderComponent;
  public templateEmailTitle: string = "Employee Email"
  public unsubscribe$: Subject<void> = new Subject();
  public id: any;
  private isAlive: boolean = true;
  public uploaderstatus:boolean = true;

  
  @Select(AlertsState.documentDownloadDetail)
  documentDownloadDetail$: Observable<DownloadDocumentDetail>;
  
  constructor(private actions$: Actions,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private orderManagementContentService: OrderManagementContentService,private route: ActivatedRoute,private router :Router) {
super();
}
  ngOnInit(): void {
  }


  public onFileSelectedGroup(event: SelectedEventArgs): void {
    if (event.filesData[0].statusCode !== '1') {
      this.addFilesValidationMessage(event.filesData[0]);
    } else {
      this.files = [];
      this.file = event.filesData[0];
      this.files.push(this.file.rawFile);
      this.groupEmailTemplateForm.controls['fileUpload'].setValue(this.file.rawFile);
    }
  }

  public browseGroupEmail(): void {
    document
      .getElementById('group-attachment-files')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')
      ?.click();
  }

  private addFilesValidationMessage(file: FileInfo) {
    requestAnimationFrame(() => {
      this.uploaderErrorMessageElement = document.getElementsByClassName('e-validation-fails')[0] as HTMLElement;
      if (this.uploaderErrorMessageElement) {
        this.uploaderErrorMessageElement.innerText =
          file.size > this.maxFileSize
            ? 'The file exceeds the limitation, max allowed 2 MB.'
            : 'The file should be in pdf, doc, docx, jpg, jpeg, png format.';
      }
    });
  }
  static createForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      emailCc: new FormControl('', [emailsValidator()]),
      emailTo: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      emailSubject: new FormControl('', [Validators.required]),
      emailBody: new FormControl('', [Validators.required]),
      fileUpload: new FormControl(null),
    });
  }
  public openpdf(id: any) {
    this.downloadedFileName = '';
    const downloadFilter = {
      Id: id,
    }

    this.store.dispatch(new GetDocumentPreviewDeatils(downloadFilter)).pipe(takeUntil(this.unsubscribe$)).subscribe((val) => {
      if (val) {
        var data = val?.null?.documentPreviewDetail;
        if (data != null) {
          if (this.downloadedFileName != data.fileName) {
            this.downloadedFileName = data.fileName;
            if (data.fileAsBase64 && data.fileAsBase64 != '') {
              this.getPreviewUrl(data);
              this.dialogWidth = "1000px";
              this.store.dispatch(new ShowDocPreviewSideDialog(true));
            }
            this.changeDetectorRef.markForCheck();
          }
        }
      }
    });
  }


  load(url: string) {
    this.pdfViewer?.load(url, '');
  }

  getPreviewUrl(file: any) {
    let extension = (file != null) ? file.extension : null;
    switch (extension) {
      case '.pdf':
        this.previewUrl = '';
        this.isPdf = true;
        this.load(`data:application/pdf;base64,${file.fileAsBase64}`);
        break;
      case '.jpg':
        this.isImage = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpg;base64,${file.fileAsBase64}`
        );
        break;
      case '.jpeg':
        this.isImage = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/jpg;base64,${file.fileAsBase64}`
        );
        break;
      case '.png':
        this.isImage = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `data:image/png;base64,${file.fileAsBase64}`
        );
        break;
      case '.docx':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      case '.doc':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      case '.xlsx':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      case '.xls':
        this.isWordDoc = true;
        this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://view.officeapps.live.com/op/embed.aspx?src=' + file.sasUrl);
        break;
      default:

    }
    this.changeDetectorRef.markForCheck();
  }

  setDocumentMimeTypeDefaults() {
    this.isPdf = false;
    this.isWordDoc = false;
    this.isImage = false;
    this.isExcel = false;
    this.previewUrl = '';
    this.fileAsBase64 = '';
  }

  public onClosePreview(): void {
    this.setDocumentMimeTypeDefaults();
    this.previewUrl = null;
    this.downloadedFileName = '';
    this.changeDetectorRef.markForCheck();
    this.store.dispatch(new ShowDocPreviewSideDialog(false));
  }


  public downloadfile(docId: any) {
    this.setDocumentMimeTypeDefaults();
    const downloadFilter = {
      Id: docId,
    }
    this.store.dispatch(new GetDocumentDownloadDeatils(downloadFilter));
    this.documentDownloadDetail$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: DownloadDocumentDetail) => {
        if (data) {
          if (this.downloadedFileName != data.fileName) {
            this.downloadedFileName = data.fileName;
            this.createLinkToDownload(data.fileAsBase64, data.fileName, data.contentType);
          }
        }
      });
    this.changeDetectorRef.markForCheck();
  }
  createLinkToDownload(base64String: string, fileName: string, contentType: string) {
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      const byteChar = atob(base64String);
      const byteArray = new Array(byteChar.length);
      for (let i = 0; i < byteChar.length; i++) {
        byteArray[i] = byteChar.charCodeAt(i);
      }
      const uIntArray = new Uint8Array(byteArray);
      const blob = new Blob([uIntArray], { type: contentType });
      (window.navigator as any).msSaveOrOpenBlob(blob, `${fileName}`);
    } else {
      const source = `data:${contentType};base64,${base64String}`;
      const link = document.createElement('a');
      link.href = source;
      link.download = `${fileName}`;
      link.click();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dropElement = document.getElementById('droparea') as HTMLElement;
    }, 4000);
  }

  onFileRemoving(){
    this.uploadObj.clearAll();
  }

  onCCFieldKeyup() {
    this.isFormInvalid = false;
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.isAlive = false;
  }
}


export function emailsValidator(): ValidatorFn {
  function validateEmails(emails: string) {
    return (emails.split(',')
      .map(email => Validators.email(<AbstractControl>{ value: email.trim() }))
      .find(_ => _ !== null) === undefined);
  }

  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === '' || !control.value || validateEmails(control.value)) {
      return null
    }
    return { emails: true };
  }
  
}
