import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FileInfo, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { HtmlEditorService,
  ImageService,
  LinkService,
  RichTextEditorComponent,
  TableService,
  ToolbarType } from '@syncfusion/ej2-angular-richtexteditor';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-onboard-candidate-message-dialog',
  templateUrl: './onboard-candidate-message-dialog.component.html',
  styleUrls: ['./onboard-candidate-message-dialog.component.scss'],
  providers: [LinkService, ImageService, HtmlEditorService, TableService],
})
export class OnboardCandidateMessageDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @Input() onBoardMessageEmailTemplateForm: FormGroup;
  @ViewChild('OnboardCandidateEmail') public rteObj: RichTextEditorComponent;
  @Input() title: string;
  @Input() isSend: boolean = true;
  @ViewChild('filesUploaderOnboardEmail') uploadObj: UploaderComponent;
  private unsubscribe$: Subject<void> = new Subject();
  emailSubject: string = '';
  emailBody: string = '';
  fileNameInput: string | undefined;
  public tools : object = {
    items: [
        'Bold', 'Italic', 'Underline', '|',
        'FontName', 'FontSize',  '|','LowerCase', 'UpperCase', '|', 'Undo', 'Redo', '|',
        'Formats', 'Alignments', '|', 'CreateLink',
        'Image', '|']
  };
  public uploaderErrorMessageElement: HTMLElement;
  public readonly maxFileSize = 2000000;
  public file: any;
  public files: File[] = [];
  public readonly allowedExtensions: string = '.pdf, .doc, .docx, .jpg, .jpeg, .png';
  public dropElement: HTMLElement;
  public uploaderstatus:boolean = true;
  @Input() emailTo: any = '';

  constructor() { }

  ngOnInit(): void {
   
  }

  rteCreated(): void {
    this.rteObj.toolbarSettings.type = ToolbarType.Scrollable;
    this.rteObj.toolbarSettings.enableFloating = true;
    this.rteObj.height = '300px';
    this.onBoardMessageEmailTemplateForm.get('emailTo')?.setValue(this.emailTo);
  }

  disableControls(isSend: boolean): void {
    let ele = document.getElementById('richTextEditorDiv') as HTMLElement;
    this.rteObj.enabled = true;
    ele.className = 'rich-text-container-edit'; 
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public browseGroupEmail(): void {
    document
      .getElementById('onboard-attachment-files')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')
      ?.click();
  }

  onFileRemoving(){
    this.uploadObj.clearAll();
  }

  public onFileSelectedGroup(event: SelectedEventArgs): void {
    if (event.filesData[0].statusCode !== '1') {
      this.addFilesValidationMessage(event.filesData[0]);
    } else {
      this.files = [];
      this.file = event.filesData[0];
      this.files.push(this.file.rawFile);
      this.onBoardMessageEmailTemplateForm.controls['fileUpload'].setValue(this.file.rawFile);
    }
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.dropElement = document.getElementById('droparea') as HTMLElement;    
    }, 4000);
  }

}
