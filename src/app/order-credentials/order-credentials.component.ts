import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter } from 'rxjs';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { AddOrderCredentialFormComponent } from './components/add-order-credential-form/add-order-credential-form.component';
import { EditOrderCredentialFormComponent } from './components/edit-order-credential-form/edit-order-credential-form.component';
import { IOrderCredential, IOrderCredentialItem } from './types';

@Component({
  selector: 'app-order-credentials',
  templateUrl: './order-credentials.component.html',
  styleUrls: ['./order-credentials.component.scss'],
})
export class OrderCredentialsComponent implements OnChanges {
  @ViewChild('addCred') addCred: AddOrderCredentialFormComponent;
  @ViewChild('editCred') editCred: EditOrderCredentialFormComponent;
  @Input() credentials: IOrderCredentialItem[];
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

  ngOnChanges(changes: SimpleChanges): void {
    const { credentials } = changes;
    if (credentials) {
      credentials.currentValue.forEach((cred: IOrderCredentialItem) => this.updateGroups(cred, true));
    }
  }

  public addNew(): void {
    this.credentialFormHeader = 'Add Credential';
    this.isEditMode = false;
    this.showForm = true;
    this.store.dispatch(new ShowSideDialog(true));
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
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
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
      this.credentialsGroups.forEach((element) => {
        element.items = [];
      });
      this.credentials.forEach((cred) => {
        this.updateGroups(cred);
      });
      this.credentialsGroups = this.credentialsGroups.filter((element) => element.items.length);
      this.credentialDeleted.emit(Object.assign({}, { ...credToDelete }));
    }
  }

  private editExistedCred(data?: IOrderCredentialItem): void {
    const cred = data || (this.CredentialForm.getRawValue() as IOrderCredentialItem);
    this.updateExistedCredInGrid(cred);
    this.credentialChanged.emit(Object.assign({}, { ...cred }));
    this.isEditMode = false;
  }

  private updateExistedCredInGrid(cred: IOrderCredentialItem): void {
    const existedCredGroup = this.credentialsGroups.find(this.byType(cred)) as IOrderCredential;
    const existedCred = existedCredGroup.items.find(this.byCredentilaId(cred)) as IOrderCredentialItem;
    Object.assign(existedCred, cred);
    existedCredGroup.items = [...existedCredGroup.items];
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
    this.updateGroups(value);
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

  private updateGroups(cred: IOrderCredentialItem, areDepartmentSkillChanged?: boolean): void {
    const existedCredGroup = this.credentialsGroups.find(this.byType(cred)) as IOrderCredential;
    if (existedCredGroup) {
      if (areDepartmentSkillChanged) {
        existedCredGroup.items = [cred];
      } else {
        existedCredGroup.items = [...existedCredGroup.items, cred];
      }
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
      totalPages: 1,
    };
  }

  private handleOnCancel(): void {
    this.CredentialForm.reset();
    this.addCred && this.addCred.clearGridSelection();
    this.showForm = false;
    this.store.dispatch(new ShowSideDialog(false));
    this.formSubmitted = false;
  }

  // helpers
  private byType(target: IOrderCredentialItem) {
    return (iter: IOrderCredential) => iter.type === target.credentialType;
  }

  private byCredentilaId(target: IOrderCredentialItem) {
    return (iter: IOrderCredentialItem) => iter.credentialId === target.credentialId;
  }
}
