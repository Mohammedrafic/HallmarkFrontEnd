import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { IOrderCredential, IOrderCredentialItem } from './types';

@Component({
  selector: 'app-order-credentials',
  templateUrl: './order-credentials.component.html',
  styleUrls: ['./order-credentials.component.scss']
})
export class OrderCredentialsComponent implements OnInit {
  @Input() credentials: IOrderCredentialItem[];
  @Output() credentialChanged: EventEmitter<IOrderCredentialItem> = new EventEmitter();

  public credentialsGroups: IOrderCredential[] = [];
  public credentialFormHeader: string;
  public isEditMode: boolean;
  public CredentialForm: FormGroup;
  public formSubmitted = false;

  constructor(private store: Store, private fb: FormBuilder) {
    this.CredentialForm = this.fb.group({
      credentialId: new FormControl(0),
      credentialType: new FormControl('', [ Validators.required ]),
      credentialName: new FormControl('', [ Validators.required ]),
      comment: new FormControl(''),
      reqForSubmission: new FormControl(false),
      reqForOnboard: new FormControl(false),
      optional: new FormControl(false),
    });
  }

  ngOnInit(): void {
    this.credentials.forEach(cred => {
      this.updateGroups(cred);
    });
  }

  public addNew(): void {
    this.credentialFormHeader = 'Add Credential';
    this.isEditMode = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onEdit(credential: IOrderCredentialItem): void {
    this.credentialFormHeader = 'Edit Credential';
    this.isEditMode = true;
    const {
      credentialId,
      credentialName,
      credentialType,
      comment,
      reqForSubmission,
      reqForOnboard,
      optional
    } = credential;
    this.CredentialForm.setValue({
      credentialId,
      credentialName,
      credentialType,
      comment,
      reqForSubmission,
      reqForOnboard,
      optional
    });
    this.CredentialForm.get('credentialType')?.disable();
    this.CredentialForm.get('credentialName')?.disable();
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onDialogCancel(): void {
    this.CredentialForm.reset();
    this.store.dispatch(new ShowSideDialog(false));
    this.formSubmitted = false;
  }

  public onDialogOk(): void {
    this.formSubmitted = true;
    if (this.CredentialForm.valid) {
      this.onSave();
      this.resetToDefault();
      this.formSubmitted = false;
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  private resetToDefault(): void {
    this.CredentialForm.setValue({
      credentialId: 0,
      credentialName: '',
      credentialType: '',
      comment: '',
      reqForSubmission: false,
      reqForOnboard: false,
      optional: false
    });
  }

  private onSave(): void {
    const { value } = this.CredentialForm;
    this.updateGroups(value);
    this.credentialChanged.emit(Object.assign({}, {...value}, { id: 0, orderId: 0 }));
    this.updateCredList(value);
  }

  private updateCredList(value: IOrderCredentialItem): void {
    const isExist = this.credentials.find(({ credentialId }) => value.credentialId === credentialId);
    if (!isExist) {
      this.credentials.push(value);
    }
    this.credentials = [...this.credentials];
  }

  private updateGroups(cred: IOrderCredentialItem): void {
    const existedCredGroup = this.credentialsGroups.find(({ type }) => type === cred.credentialType) as IOrderCredential;
    if (existedCredGroup) {
      existedCredGroup.items.push(cred);
      existedCredGroup.items = [...existedCredGroup.items];
      existedCredGroup.totalCount = existedCredGroup.items.length;
    } else {
      this.credentialsGroups.push(this.createGroup(cred));
    }
  }

  private createGroup(value: IOrderCredentialItem): IOrderCredential {
    return {
      type: value.credentialType,
      items: [value],
      totalCount: 1,
      totalPages: 1
    };
  }
}
