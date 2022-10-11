import { Component, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { FileInfo, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Topics } from '@shared/enums/contact-topics';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../shared/models/user.model';
import { UserState } from 'src/app/store/user.state';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, takeUntil } from 'rxjs';
import { TextBoxComponent } from '@syncfusion/ej2-angular-inputs';


@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss']
})
export class ContactusComponent implements OnInit {
  
public topics=Topics;
public uploaderErrorMessageElement: HTMLElement;
private filesDetails: Blob[] = [];
private hasFiles = false;
private removeFiles = false;
public readonly maxFileSize = 2000000; // 2 mb
public dropElement: HTMLElement;
public readonly allowedExtensions: string = '.pdf, .doc, .docx, .jpg, .jpeg, .png';
public disableSaveButton:boolean=false;
public ContactFormGroup: FormGroup;
private unsubscribe$: Subject<void> = new Subject();

@ViewChild('filesUploader') uploadObj: UploaderComponent;

@Select(UserState.user)
user$: Observable<User>;

  constructor(private store: Store,private fb: FormBuilder) {
    this.ContactFormGroup = this.fb.group({
      name: new FormControl(''),
      email: new FormControl(''),
      topic: new FormControl(null),
      message: new FormControl(''),
      file: new FormControl(null),
    });
   }

  ngOnInit(): void {
    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe((user: User) => {
      if (user) {
        this.ContactFormGroup = this.fb.group({
          name: new FormControl(user.firstName+' '+ user.lastName),
          email: new FormControl(user.email),
          topic: new FormControl(null),
          message: new FormControl(''),
          file: new FormControl(null),
        });

      }
    });
  }
  
  public browse(): void {
    document
      .getElementById('contact-attachment-files')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')
      ?.click();
  }
  public onFileSelected(event: SelectedEventArgs): void {
    if (event.filesData[0].statusCode !== '1') {
      this.addFilesValidationMessage(event.filesData[0]);
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
  public clearFiles(): void {
    this.removeFiles = true;
    this.hasFiles = false;
    this.filesDetails = [];
    this.uploadObj.clearAll();
  }

  get disableClearButton(): boolean {
    return !this.uploadObj?.filesData.length && !this.hasFiles;
  }

}