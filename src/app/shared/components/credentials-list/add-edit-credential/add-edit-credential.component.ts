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
  OptionFields,
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
import {
  CredentialInputConfig,
  CredentialListConfig,
  SelectedSystemsFlag,
} from '@shared/components/credentials-list/interfaces';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { UserState } from '../../../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { AppState } from '../../../../store/app.state';

@Component({
  selector: 'app-add-edit-credential',
  templateUrl: './add-edit-credential.component.html',
  styleUrls: ['./add-edit-credential.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddEditCredentialComponent extends Destroyable implements OnInit {
  @Input() public disableButton: boolean;
  @Input() public isCredentialSettings = false;

  @Input() set systemFlags(systems: SelectedSystemsFlag) {
    this.isCurrentMspUser();
    this.selectedSystem = systems;
    this.initCredentialForm();
    this.initDialogConfig();
    this.changeDetection.markForCheck();
  }

  @Input() set editCredential(credential: Credential) {
    if (credential) {
      this.selectedCredential = credential;
      this.isEdit = true;
      this.setDialogTitle();
      this.disableFieldOnEdit(!!credential.isMasterCredential);
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
  public isEdit = false;
  public dialogConfig: CredentialListConfig[];
  public selectedSystem: SelectedSystemsFlag;
  public isMspUser = false;
  public isIrpFlagEnabled = false;

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
    this.watchForCredentialTypes();
    this.watchForIrpCheckbox();
  }

  public saveCredential(): void {
    if(this.isCredentialSettings) {
      this.saveCredentialForSettings();
    } else {
      this.saveCredentialForMasterData();
    }
  }

  public closeCredentialDialog(): void {
    if (this.credentialForm.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
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
    return config.title;
  }

  public trackByIndex(index: number, config: CredentialInputConfig): string {
    return config.field;
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
      this.dialogConfig = CredentialsDialogConfig(this.showIrpFields(), this.isCredentialSettings);
  }

  private initCredentialForm(): void {
    this.credentialForm = this.credentialListService.createCredentialForm(
      this.showIrpFields(),
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
    });
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
    if(this.showIrpFields()) {
      return this.credentialForm.get('includeInIRP')?.value
        || this.credentialForm.get('includeInVMS')?.value;
    } else {
      return true;
    }
  }

  private showIrpFields(): boolean {
    return this.selectedSystem.isIRP &&
      this.selectedSystem.isVMS &&
      this.isIrpFlagEnabled &&
      !this.isMspUser;
  }

  private isCurrentMspUser(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.isMspUser = user?.businessUnitType === BusinessUnitType.MSP;
    this.isIrpFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }

  private saveCredentialForSettings(): void {
    if (this.credentialForm.valid && this.isSystemSelected()) {
      const credential: Credential = {
        ...this.credentialForm.getRawValue(),
        includeInVMS: this.credentialForm.get('includeInVMS')?.value ?? this.selectedSystem.isVMS,
        includeInIRP: this.credentialForm.get('includeInIRP')?.value ?? this.selectedSystem.isIRP,
      };

      this.store.dispatch(new SaveCredential(credential));
      this.credentialForm.reset();
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, ErrorMessageForSystem));
      this.credentialForm.markAllAsTouched();
    }
  }

  private saveCredentialForMasterData(): void {
    if (this.credentialForm.valid) {
      const credential: Credential = {
        ...this.credentialForm.getRawValue(),
      };

      this.store.dispatch(new SaveCredential(credential));
      this.credentialForm.reset();
    } else {
      this.credentialForm.markAllAsTouched();
    }
  }
}
