import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Observable, takeWhile } from 'rxjs';

import { SetHeaderState, ShowSideDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { GetBusinessByUnitType } from '../store/security.actions';
import { SecurityState } from '../store/security.state';
import { RoleFormComponent } from './role-form/role-form.component';
import { BUSINESS_UNITS_VALUES, DISABLED_GROUP, OPRION_FIELDS } from './roles-and-permissions.constants';

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
  public bussinesDataFields = {
    text: 'name',
    value: 'id',
  };

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

  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: 'Security', iconName: 'lock' }));
  }

  ngOnInit(): void {
    this.businessForm = this.generateBusinessForm();
    this.roleFormGroup = RoleFormComponent.createForm();
    this.onBusinessUnitValueChanged();

    const user = this.store.selectSnapshot(UserState.user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(user?.businessUnitId);
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.businessForm.disable();
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onAddNewRole(): void {
    this.isEditRole = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onAddCancel(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  public onSave(): void {
    const value = this.roleFormGroup.getRawValue();
    console.log(value);
    this.store.dispatch(new ShowSideDialog(false));
  }

  public onEdit(data: unknown): void {
    this.isEditRole = true;
    this.store.dispatch(new ShowSideDialog(true));
  }

  private generateBusinessForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      business: new FormControl(0),
    });
  }

  private onBusinessUnitValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      const newRoleBusinessUnitControl = this.roleFormGroup.get('businessUnit');
      newRoleBusinessUnitControl?.patchValue(value);
      this.store.dispatch(new GetBusinessByUnitType(value));

      if (!this.isBusinessFormDisabled) {
        this.businessControl.patchValue(0);
      }
    });
  }
}
