import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { Credential } from "@shared/models/credential.model";
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, take } from 'rxjs';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { AddOrderCredentialFormComponent } from './components/add-order-credential-form/add-order-credential-form.component';
import { EditOrderCredentialFormComponent } from './components/edit-order-credential-form/edit-order-credential-form.component';
import { IOrderCredential, IOrderCredentialItem } from './types';

@Component({
  selector: 'app-order-credentials',
  templateUrl: './order-credentials.component.html',
  styleUrls: ['./order-credentials.component.scss'],
})
export class OrderCredentialsComponent {
  @ViewChild('addCred') addCred: AddOrderCredentialFormComponent;
  @ViewChild('editCred') editCred: EditOrderCredentialFormComponent;
  @Input() credentials: IOrderCredentialItem[];
  @Input() includeInIRP = false;
  @Input() isActive = false;
  @Output() credentialChanged: EventEmitter<IOrderCredentialItem> = new EventEmitter();
  @Output() credentialDeleted: EventEmitter<IOrderCredentialItem> = new EventEmitter();

  public credentialsGroups: IOrderCredential[] = [];
  public credentialFormHeader: string;
  public isEditMode: boolean;
  public CredentialForm: FormGroup;
  public formSubmitted = false;
  public showForm = false;

  constructor(private store: Store, private fb: FormBuilder, private confirmService: ConfirmService) {
    this.CredentialForm = this.fb.group({
      credentialId: new FormControl(0),
      credentialType: new FormControl('', [Validators.required]),
      credentialName: new FormControl('', [Validators.required]),
      comment: new FormControl(''),
      reqForSubmission: new FormControl(false),
      reqForOnboard: new FormControl(false),
      optional: new FormControl(false),
    });
  }

  public addNew(): void {
    this.credentialFormHeader = 'Add Credential';
    this.isEditMode = false;
    this.showForm = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public prePopulateData(data: Credential): void {
    const { comment = '', reqSubmission = false, reqOnboard = false, optional = false } = data;
    this.CredentialForm.patchValue({
      comment,
      reqForSubmission: reqSubmission,
      reqForOnboard: reqOnboard,
      optional,
    });
  }

  public onEdit(credential: IOrderCredentialItem): void {
    this.credentialFormHeader = 'Edit Credential';
    this.isEditMode = true;
    const { credentialId, credentialName, credentialType, comment, reqForSubmission, reqForOnboard, optional } =
      credential;
    this.CredentialForm.setValue({
      credentialId,
      credentialName,
      credentialType,
      comment,
      reqForSubmission,
      reqForOnboard,
      optional,
    });
    this.CredentialForm.get('credentialType')?.disable();
    this.CredentialForm.get('credentialName')?.disable();
    this.showForm = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onDialogCancel(): void {
    if ((!this.isEditMode && this.addCred?.form.dirty) || (this.isEditMode && this.editCred?.form.dirty)) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1),
        ).subscribe(() => {
          this.handleOnCancel();
        });
    } else {
      this.handleOnCancel();
    }
  }

  public onDialogOk(): void {
    this.formSubmitted = true;
    if (this.CredentialForm.valid) {
      if (this.isEditMode) {
        this.editExistedCred();
      } else {
        this.addNewCred();
      }
      this.resetToDefault();
      this.formSubmitted = false;
      this.showForm = false;
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  public onUpdate(data: IOrderCredentialItem): void {
    this.editExistedCred(data);
  }

  public onDelete(credentialId: number): void {
    const credToDelete = this.credentials.find((cred) => cred.credentialId === credentialId) as IOrderCredentialItem;
    if (credToDelete) {
      const index = this.credentials.indexOf(credToDelete);
      this.credentials.splice(index, 1);
      this.credentialDeleted.emit(Object.assign({}, { ...credToDelete }));
      this.credentials = [...this.credentials];
    }
  }

  private editExistedCred(data?: IOrderCredentialItem): void {
    const cred = data || (this.CredentialForm.getRawValue() as IOrderCredentialItem);
    this.updateCredList(cred);
    this.credentialChanged.emit(Object.assign({}, { ...cred }));
    this.isEditMode = false;
  }


  private resetToDefault(): void {
    this.CredentialForm.setValue({
      credentialId: 0,
      credentialName: '',
      credentialType: '',
      comment: '',
      reqForSubmission: false,
      reqForOnboard: false,
      optional: false,
    });
  }

  private addNewCred(): void {
    const value = this.CredentialForm.getRawValue();
    this.credentialChanged.emit(Object.assign({}, { ...value }, { id: 0, orderId: 0 }));
    this.updateCredList(value);
  }

  private updateCredList(cred: IOrderCredentialItem): void {
    const isExist = this.credentials.find(this.byCredentilaId(cred));
    if (!isExist) {
      this.credentials.push(cred);
    }
    this.credentials = [...this.credentials];
  }


  private handleOnCancel(): void {
    this.CredentialForm.reset();
    this.addCred && this.addCred.clearGridSelection();
    this.showForm = false;
    this.store.dispatch(new ShowSideDialog(false));
    this.formSubmitted = false;
  }

  private byCredentilaId(target: IOrderCredentialItem) {
    return (iter: IOrderCredentialItem) => iter.credentialId === target.credentialId;
  }
}
