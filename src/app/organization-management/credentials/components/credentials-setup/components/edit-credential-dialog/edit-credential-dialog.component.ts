import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Store } from '@ngxs/store';
import { filter, takeUntil, take, tap, switchMap, of, merge, map } from 'rxjs';

import { CredentialsSetupService } from '@organization-management/credentials/services';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSetupDetails, CredentialSetupGet, CredentialSetupPost } from '@shared/models/credential-setup.model';
import { OverrideCommentsQuestion, OverrideCommentsTitle } from '../../constants';
import { UpdateCredentialSetup } from '@organization-management/store/credentials.actions';
import { ConfirmEventType } from '@shared/enums/confirm-modal-events.enum';
import { CheckboxNames } from '../../interfaces';

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
  @Input() targetElement: HTMLElement;

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
    this.watchForChecboxesState();
    this.watchForSelectedCredential();
  }

  public updateCredential(): void {
    const isCommentsDirty = this.editCredentialForm.get('comments')?.dirty
      || this.editCredentialForm.get('irpComments')?.dirty;

    if (this.editCredentialForm.valid && isCommentsDirty) {
      this.confirmUpdateCredentialSetup();
    } else if (this.editCredentialForm.valid && !isCommentsDirty) {
      const dto = this.setCorrectDate(this.editCredentialForm.getRawValue());
      this.store.dispatch(new UpdateCredentialSetup(dto));
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
        })
        .pipe(
          filter(Boolean),
          takeUntil(this.componentDestroy())
        )
        .subscribe(() => {
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

  private confirmUpdateCredentialSetup(): void {
    this.confirmService.confirmActions(
      OverrideCommentsQuestion,
      {
        title: OverrideCommentsTitle,
        okButtonLabel: 'Yes',
        okButtonClass: 'e-primary',
        cancelButtonLabel: 'No',
      })
      .pipe(
        tap(({ action }) => {
          if (action !== ConfirmEventType.CLOSE) {
            const isConfirmed = action === ConfirmEventType.YES;
            this.editCredentialForm.get('updateOrderCredentials')?.setValue(isConfirmed);
          }
        }),
        switchMap(({ action }) => {
          const dto = this.setCorrectDate(this.editCredentialForm.getRawValue());
          const actionStream$ = action !== ConfirmEventType.CLOSE
            ? this.store.dispatch(new UpdateCredentialSetup(dto))
            : of(true);
          return actionStream$;
        }),
        take(1)
      )
      .subscribe(() => {
        this.closeModal();
      });
  }

  private setCorrectDate(data: CredentialSetupPost): CredentialSetupPost {
    if (data.inactiveDate) {
      data.inactiveDate = DateTimeHelper.setUtcTimeZone(data.inactiveDate);
    }

    return data;
  }

  private watchForChecboxesState(): void {
    let selectedCheckbox: CheckboxNames | null = null;
    const controlNames = ['isActive', 'reqOnboard', 'reqSubmission'];
    const checkboxControls = controlNames.map((name) => {
      return this.editCredentialForm.get(name)?.valueChanges
        .pipe(map((value) => ({ name, value })));
    });

    /**checkbox single selection */
    merge(...checkboxControls)
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((data) => {
        const { name, value } = data as { name: CheckboxNames, value: boolean };

        if (value && selectedCheckbox && selectedCheckbox !== name) {
          this.editCredentialForm.get(selectedCheckbox)?.setValue(false, { emitEvent: false });
        }

        if (value) {
          selectedCheckbox = name;
        }

        if (!value && selectedCheckbox === name) {
          selectedCheckbox = null;
        }
      });
  }
}
