import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { FileInfo, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Topics } from '@shared/enums/contact-topics';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../shared/models/user.model';
import { UserState } from 'src/app/store/user.state';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, takeUntil } from 'rxjs';
import { ContactUs } from '../../../shared/models/contact-us.model';
import { SaveContactUsForm } from 'src/app/store/contact-us.actions';
import { ContactusState } from 'src/app/store/contact-us.state';
import { ShowCustomSideDialog } from 'src/app/store/app.actions';
import { ContactUsStatus } from '@shared/enums/contact-us-status';


@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss']
})
export class ContactusComponent implements OnInit,AfterViewInit {

  public topics = Topics;
  public uploaderErrorMessageElement: HTMLElement;
  private hasFiles = false;
  public readonly maxFileSize = 2000000; // 2 mb
  public dropElement: HTMLElement;
  public readonly allowedExtensions: string = '.pdf, .doc, .docx, .jpg, .jpeg, .png';
  public disableSaveButton: boolean = false;
  public ContactFormGroup: FormGroup;
  private unsubscribe$: Subject<void> = new Subject();
  file: any;
  files: File[] = [];

  @ViewChild('filesUploader') uploadObj: UploaderComponent;

  @Select(UserState.user)
  user$: Observable<User>;

  @Select(ContactusState.contactSupportEntity)
  contact$: Observable<ContactUs>;

  constructor(private store: Store, private fb: FormBuilder) {
    this.ContactFormGroup = this.fb.group({
      name: new FormControl(''),
      email: new FormControl(''),
      topic: new FormControl(null, Validators.required),
      message: new FormControl(''),
      file: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe((user: User) => {
      if (user) {
        this.ContactFormGroup = this.fb.group({
          name: new FormControl(user.firstName + ' ' + user.lastName),
          email: new FormControl(user.email),
          topic: new FormControl(null, Validators.required),
          message: new FormControl(''),
          file: new FormControl(null),
        });
        this.ContactFormGroup.controls['name'].disable();
        this.ContactFormGroup.controls['email'].disable();

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
    else {
      this.files = [];
      this.file = event.filesData[0];
      this.files.push(this.file.rawFile);
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
    this.hasFiles = false;
    this.uploadObj.clearAll();
    this.file = null;
    this.files = [];
  }

  public saveContactUsForm() {
    if (this.ContactFormGroup.controls['topic'].valid) {
      let contactUs: ContactUs =
      {
        fromMail: this.ContactFormGroup.controls['email'].value,
        subjectMail: this.ContactFormGroup.controls['topic'].value,
        name: this.ContactFormGroup.controls['name'].value,
        bodyMail: this.ContactFormGroup.controls['message'].value,
        status: ContactUsStatus.Pending,
        selectedFile: this.files[0]
      };
      this.store.dispatch(new SaveContactUsForm(contactUs));
      this.contact$.pipe(takeUntil(this.unsubscribe$)).subscribe((contactUs: ContactUs) => {
        this.resetForm();
        this.store.dispatch(new ShowCustomSideDialog(false));
      });
    }
  }

  public cancelContactUsForm() {
    this.resetForm();
    this.store.dispatch(new ShowCustomSideDialog(false));
  }

  private resetForm() {
    this.ContactFormGroup.controls['message'].setValue('');
    this.ContactFormGroup.controls['topic'].setValue(null);
    this.ContactFormGroup.controls['file'].setValue(null);
    this.clearFiles();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dropElement = document.getElementById('files-droparea') as HTMLElement;
		}, 3000);
  }
}
