import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import {
  CredentialTypeId,
  DialogHeight,
  ErrorMessageForSystem,
  IrpCommentField,
  OptionFields
} from '@shared/components/credentials-list/constants';
import { CredentialsDialogConfig, DialogTitle } from '@shared/components/credentials-list/helpers';
import { FieldType } from '@core/enums';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { CredentialType } from '@shared/models/credential-type.model';
import { Destroyable } from '@core/helpers';
import { CredentialListService } from '@shared/components/credentials-list/services';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { SaveCredential } from '@organization-management/store/organization-management.actions';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';
import { PermissionService } from '../../../../security/services/permission.service';
import { Credential } from '@shared/models/credential.model';
import { CredentialInputConfig, CredentialListConfig } from '@shared/components/credentials-list/interfaces';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';

@Component({
  selector: 'app-add-edit-credential',
  templateUrl: './add-edit-credential.component.html',
  styleUrls: ['./add-edit-credential.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditCredentialComponent extends Destroyable implements OnInit {
  @Input() disableButton: boolean;
  @Input() isCredentialSettings: boolean = false;
  @Input() isIRPFlagEnabled: boolean = false;

  @Input() set editCredential(credential: Credential) {
    if (credential) {
      this.selectedCredential = credential;
      this.isEdit = true;
      this.setDialogTitle();
      this.disableFieldOnEdit(!!credential.isMasterCredential)
      this.credentialForm.patchValue(credential);
      this.changeDetection.markForCheck();
    }
  }

  @Output() handleCloseDialog = new EventEmitter<FormGroup>();

  public credentialForm: FormGroup;
  public readonly dialogHeight: string = DialogHeight;
  public readonly optionFields: FieldSettingsModel = OptionFields;
  public readonly FieldTypes = FieldType;
  public title: string;
  public isEdit: boolean = false;
  public dialogConfig: CredentialListConfig[];

  private selectedCredential: Credential;

  @Select(OrganizationManagementState.credentialTypes)
  public credentialTypes$: Observable<CredentialType[]>;

  constructor(
    private changeDetection: ChangeDetectorRef,
    private credentialListService: CredentialListService,
    private confirmService: ConfirmService,
    private store: Store,
    private route: ActivatedRoute,
    private permissionService: PermissionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.setDialogTitle();
    this.initDialogConfig();
    this.watchForCredentialTypes();
    this.initCredentialForm();
    this.watchForIrpCheckbox();
  }

  public saveCredential(): void {
    if (this.credentialForm.valid && this.isSystemSelected()) {
      this.store.dispatch(new SaveCredential(this.credentialForm.getRawValue()));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, ErrorMessageForSystem));
      this.credentialForm.markAllAsTouched();
    }
  }

  public closeCredentialDialog(): void {
    if (this.credentialForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(
          filter(Boolean),
          takeUntil(this.componentDestroy())
        ).subscribe(() => {
          this.handleCloseDialog.emit(this.credentialForm);
        });
    } else {
      this.handleCloseDialog.emit(this.credentialForm);
    }

    this.isEdit = false;
    this.setDialogTitle();
  }

  public trackByTitle(index: number, config: CredentialListConfig): string {
    return index + config.title
  }

  public trackByIndex(index: number, config: CredentialInputConfig): string {
    return index + config.field;
  }

  private watchForCredentialTypes(): void {
    this.credentialTypes$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((credentialTypes: CredentialType[]) => {
      this.dialogConfig.forEach((config: CredentialListConfig) => {
        const selectedConfigField = this.getConfigField(config, CredentialTypeId);
        if (selectedConfigField) {
          selectedConfigField.dataSource = credentialTypes;
          this.changeDetection.markForCheck();
        }
      });
    });
  }

  private initDialogConfig(): void {
    this.dialogConfig = CredentialsDialogConfig(this.isCredentialSettings, this.isIRPFlagEnabled);
  }

  private initCredentialForm(): void {
    this.credentialForm = this.credentialListService.createCredentialForm(
      this.isIRPFlagEnabled,
      this.isCredentialSettings
    );
  }

  private setDialogTitle(): void {
    this.title = `${DialogTitle(this.isEdit)} Credential`;
  }

  private disableFieldOnEdit(isMasterCredential: boolean): void {
    const { canEdit } = this.route.snapshot.data;

    if (!canEdit) {
      const havePermission = !isMasterCredential &&
        this.permissionService.checkPermisionSnapshot(PermissionTypes.ManuallyAddCredential);

      this.disableFormControl(havePermission);
    }
  }

  private watchForIrpCheckbox(): void {
    this.credentialForm.get('includeInIRP')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: boolean) => {
      this.dialogConfig.forEach((config: CredentialListConfig) => {
        const selectedConfigField = this.getConfigField(config, IrpCommentField);

        if (selectedConfigField) {
          selectedConfigField.show = value;
          this.changeDetection.markForCheck();
        }
      });

      this.setRemoveFormControl(value);
    })
  }

  private getConfigField(config: CredentialListConfig, field: string): CredentialInputConfig {
    return config.fields.find((itm: CredentialInputConfig) => itm.field === field) as CredentialInputConfig;
  }

  private setRemoveFormControl(value: boolean): void {
    if (value) {
      this.credentialListService.addControlToForm(
        this.credentialForm,
        IrpCommentField,
        this.selectedCredential?.irpComment ?? null
      );
    } else {
      this.credentialListService.removeControlFromForm(this.credentialForm, IrpCommentField);
    }
  }

  private disableFormControl(permission: boolean): void {
    if (!permission) {
      this.credentialForm.get('credentialTypeId')?.disable();
      this.credentialForm.get('name')?.disable();
    }
  }

  private isSystemSelected(): boolean {
    return this.credentialForm.get('includeInIRP')?.value || this.credentialForm.get('includeInVMS')?.value;
  }
}
