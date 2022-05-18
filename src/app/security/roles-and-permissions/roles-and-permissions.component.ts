import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Role, RoleDTO } from '@shared/models/roles.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable, takeWhile } from 'rxjs';

import { SetHeaderState, ShowSideDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { GetBusinessByUnitType, GetPermissionsTree, SaveRole, SaveRoleSucceeded } from '../store/security.actions';
import { SecurityState } from '../store/security.state';
import { RoleFormComponent } from './role-form/role-form.component';
import { BUSINESS_UNITS_VALUES, BUSSINES_DATA_FIELDS, DISABLED_GROUP, OPRION_FIELDS } from './roles-and-permissions.constants';

const DEFAULT_DIALOG_TITLE = 'Add Role';
const EDIT_DIALOG_TITLE = 'Role';

@Component({
  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss'],
})
export class RolesAndPermissionsComponent implements OnInit, OnDestroy {
  @Select(SecurityState.bussinesData)
  public bussinesData$: Observable<BusinessUnit[]>;

  public businessForm: FormGroup;
  public roleFormGroup: FormGroup;
  public isEditRole = false;
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;

  get dialogTitle(): string {
    return this.isEditRole ? EDIT_DIALOG_TITLE : DEFAULT_DIALOG_TITLE;
  }

  get businessUnitControl(): AbstractControl {
    return this.businessForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.businessForm.get('business') as AbstractControl;
  }

  private isAlive = true;

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {
    this.store.dispatch(new SetHeaderState({ title: 'Security', iconName: 'lock' }));
  }

  ngOnInit(): void {
    this.businessForm = this.generateBusinessForm();
    this.roleFormGroup = RoleFormComponent.createForm();
    this.onBusinessUnitValueChanged();

    const user = this.store.selectSnapshot(UserState.user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(user?.businessUnitId || 0);
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.businessForm.disable();
    }

    this.actions$
      .pipe(ofActionSuccessful(SaveRoleSucceeded))
      .pipe(takeWhile(() => this.isAlive))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
      });
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onAddNewRole(): void {
    this.isEditRole = false;
    this.roleFormGroup.reset();
    this.roleFormGroup.enable();
    this.roleFormGroup.patchValue({
      businessUnitType: this.businessUnitControl.value,
      businessUnitId: this.businessControl.value,
      isActive: true,
    });
    this.disableBussinesUnitForRole();
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onAddCancel(): void {
    if (this.roleFormGroup.dirty) {
      this.confirmService
        .confirm(CANCEL_COFIRM_TEXT)
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  public onSave(): void {
    this.roleFormGroup.markAllAsTouched();
    if (this.roleFormGroup.valid) {
      const value = this.roleFormGroup.getRawValue();
      const roleDTO: RoleDTO = {
        ...value,
        businessUnitId: value.businessUnitId || null,
        permissions: value.permissions.map((stringValue: string) => Number(stringValue)),
      };
      this.store.dispatch(new SaveRole(roleDTO));
    }
  }

  public onEdit({ index, column, foreignKeyData, ...role }: Role & { index: string; column: unknown; foreignKeyData: unknown }): void {
    this.isEditRole = true;
    this.roleFormGroup.reset();
    this.roleFormGroup.enable();

    const editedValue = {
      ...role,
      businessUnitId: role.businessUnitId || 0,
      permissions: role.permissions.map((stringValue: number) => String(stringValue)),
    };
    this.roleFormGroup.patchValue({
      ...editedValue,
    });
    if (role.isDefault) {
      this.roleFormGroup.disable();
    }
    this.disableBussinesUnitForRole();
    this.store.dispatch(new ShowSideDialog(true));
  }

  private generateBusinessForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      business: new FormControl(0),
    });
  }

  private disableBussinesUnitForRole(): void {
    if (this.isBusinessFormDisabled) {
      this.roleFormGroup.get('businessUnitType')?.disable();
      this.roleFormGroup.get('businessUnitId')?.disable();
    }
  }

  private onBusinessUnitValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      this.store.dispatch(new GetBusinessByUnitType(value));

      if (!this.isBusinessFormDisabled) {
        this.businessControl.patchValue(0);
      }
    });
  }
}
