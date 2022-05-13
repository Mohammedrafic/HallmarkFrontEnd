import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { SetHeaderState, ShowSideDialog } from 'src/app/store/app.actions';
import { RoleFormComponent } from './role-form/role-form.component';

const DEFAULT_DIALOG_TITLE = 'Add Role';
const EDIT_DIALOG_TITLE = 'Role';

@Component({
  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss'],
})
export class RolesAndPermissionsComponent {
  public businessUnitControl = new FormControl();
  public businessControl = new FormControl();
  public roleFormGroup = RoleFormComponent.createForm();
  public isEditRole = false;

  get dialogTitle(): string {
    return this.isEditRole ? EDIT_DIALOG_TITLE : DEFAULT_DIALOG_TITLE;
  }

  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: 'Security', iconName: 'lock' }));
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
}
