import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Store } from '@ngxs/store';
import { filter, takeUntil } from 'rxjs';

import { CredentialsSetupService } from '@organization-management/credentials/services';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { Destroyable } from '@core/helpers';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetupDetails, CredentialSetupGet } from '@shared/models/credential-setup.model';
import {
  UpdateCredentialSetup,
} from '@organization-management/store/credentials.actions';

@Component({
  selector: 'app-edit-credential-dialog',
  templateUrl: './edit-credential-dialog.component.html',
  styleUrls: ['./edit-credential-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCredentialDialogComponent extends Destroyable implements OnInit {
  @Input() isIRPAndVMSEnabled = false;
  @Input() isCredentialIRP = false;
  @Input() permission = false;

  @Output() closeEditDialog: EventEmitter<void> = new EventEmitter<void>();

  public editCredentialForm: FormGroup;

  constructor(
    private credentialsSetupService: CredentialsSetupService,
    private confirmService: ConfirmService,
    private store: Store,
  ) {
    super();
    this.initEditCredentialForm();
  }

  ngOnInit(): void {
    this.watchForSelectedCredential();
  }

  public updateCredential(): void {
    if (this.editCredentialForm.valid) {
      this.store.dispatch(new UpdateCredentialSetup(this.editCredentialForm.getRawValue()));
      this.closeModal();
    } else {
      this.editCredentialForm.markAllAsTouched();
    }
  }

  public closeDialog(): void {
    if (this.editCredentialForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.closeModal();
      });
    } else {
      this.closeModal();
    }
  }

  private watchForSelectedCredential(): void {
    this.credentialsSetupService.getSelectedCredentialStream().pipe(
      filter((credential: CredentialSetupGet | CredentialSetupDetails) => !!Object.keys(credential).length),
      takeUntil(this.componentDestroy())
    ).subscribe((credential: CredentialSetupGet | CredentialSetupDetails) => {
      this.credentialsSetupService.irpCommentFieldSettings(this.editCredentialForm, this.isCredentialIRP);
      this.credentialsSetupService.populateCredentialSetupForm(
        this.editCredentialForm,
        credential as CredentialSetupGet,
        this.isCredentialIRP,
      );
    });
  }

  private closeModal(): void {
    this.editCredentialForm.reset();
    this.closeEditDialog.emit();
  }

  private initEditCredentialForm(): void {
    this.editCredentialForm = this.credentialsSetupService.createCredentialsSetupForm();
  }
}
