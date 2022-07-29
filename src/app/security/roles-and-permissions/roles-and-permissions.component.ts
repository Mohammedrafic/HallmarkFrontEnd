import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Role, RoleDTO } from '@shared/models/roles.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable, Subject, takeWhile } from 'rxjs';

import { SetHeaderState, ShowFilterDialog, ShowSideDialog, ShowExportDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { GetBusinessByUnitType, GetPermissionsTree, SaveRole, SaveRoleSucceeded } from '../store/security.actions';
import { SecurityState } from '../store/security.state';
import { RoleFormComponent } from './role-form/role-form.component';
import { BUSINESS_UNITS_VALUES, BUSSINES_DATA_FIELDS, DISABLED_GROUP, OPRION_FIELDS } from './roles-and-permissions.constants';

const DEFAULT_DIALOG_TITLE = 'Add Role';
const EDIT_DIALOG_TITLE = 'Edit Role';

@Component({
  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss'],
})
export class RolesAndPermissionsComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('roleForm') roleForm: RoleFormComponent;

  @Select(SecurityState.bussinesData)
  public bussinesData$: Observable<BusinessUnit[]>;

  public exportRoles$ = new Subject<ExportedFileType>();
  public businessForm: FormGroup;
  public roleFormGroup: FormGroup;
  public isEditRole = false;
  public isBusinessFormDisabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public roleId: number | null;
  public filteredItems$ = new Subject<number>();

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
  private existingRoleName: string[];

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {
    super();
    this.store.dispatch(new SetHeaderState({ title: 'Security', iconName: 'lock' }));    
  }

  ngOnInit(): void {
    this.businessForm = this.generateBusinessForm();
    this.roleFormGroup = RoleFormComponent.createForm();
    this.onBusinessUnitValueChanged();

    const user = this.store.selectSnapshot(UserState.user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.businessForm.disable();
    }
    if (user?.businessUnitType === BusinessUnitType.MSP) {
      const [Hallmark, ...rest] = this.businessUnits;
      this.businessUnits = rest;
    }
    this.businessControl.patchValue(this.isBusinessFormDisabled ? user?.businessUnitId : 0);


    this.actions$
      .pipe(
        ofActionSuccessful(SaveRoleSucceeded),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => this.closeDialog());

    this.bussinesData$.pipe(takeWhile(() => this.isAlive)).subscribe((data) => {
      this.existingRoleName = data.map(({ name }) => name);
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
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public onSave(): void {
    this.roleFormGroup.markAllAsTouched();
    if (this.roleFormGroup.valid && !this.roleForm.showActiveError) {
      const value = this.roleFormGroup.getRawValue();
      const roleDTO: RoleDTO = {
        ...value,
        id: this.roleId,
        businessUnitId: value.businessUnitId || null,
        permissions: value.permissions.map((stringValue: string) => Number(stringValue)),
      };
      this.store.dispatch(new SaveRole(roleDTO));
    }
  }

  public onEdit({ index, column, foreignKeyData, id, ...role }: Role & { index: string; column: unknown; foreignKeyData: unknown }): void {
    this.isEditRole = true;
    this.roleId = id as number;
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

    this.roleFormGroup.get('businessUnitType')?.disable();
    this.roleFormGroup.get('businessUnitId')?.disable();
    this.store.dispatch(new ShowSideDialog(true));
  }

  public showFilters(): void {
    this.store.dispatch(new GetPermissionsTree(this.businessUnitControl.value));
    this.store.dispatch(new ShowFilterDialog(true));
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

  private closeDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.roleId = null;
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }
  
  public override defaultExport(fileType: ExportedFileType): void {
    this.exportRoles$.next(fileType);
  }
}
