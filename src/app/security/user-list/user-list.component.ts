import { Component, OnDestroy, OnInit } from '@angular/core';
import { BUSINESS_UNITS_VALUES, BUSSINES_DATA_FIELDS, UNIT_FIELDS, DISABLED_GROUP } from "./user-list.constants";
import { Actions, ofActionSuccessful, Select, Store } from "@ngxs/store";
import { SecurityState } from "../store/security.state";
import { filter, Observable, takeWhile } from "rxjs";
import { BusinessUnit } from "@shared/models/business-unit.model";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { SetHeaderState, ShowSideDialog } from "../../store/app.actions";
import { GetBusinessByUnitType, GetRolePerUser, SaveUser, SaveUserSucceeded } from "../store/security.actions";
import { UserState } from "../../store/user.state";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from "@shared/constants";
import { UserSettingsComponent } from "./add-edit-user/user-settings/user-settings.component";
import { ConfirmService } from "@shared/services/confirm.service";
import { UserDTO, User } from "@shared/models/user-managment-page.model";

const DEFAULT_DIALOG_TITLE = 'Add User';
const EDIT_DIALOG_TITLE = 'Edit User';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  @Select(SecurityState.bussinesData)
  public bussinesUserData$: Observable<BusinessUnit[]>;

  public businessForm: FormGroup;
  public userSettingForm: FormGroup;
  public isEditRole = false;
  public unitFields = UNIT_FIELDS;
  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public isBusinessFormDisabled = false;

  get businessUnitControl(): AbstractControl {
    return this.businessForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.businessForm.get('business') as AbstractControl;
  }

  get dialogTitle(): string {
    return this.isEditRole ? EDIT_DIALOG_TITLE : DEFAULT_DIALOG_TITLE;
  }

  private isAlive = true;

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private actions$: Actions
  ) {
    this.store.dispatch(new SetHeaderState({ title: 'Security', iconName: 'lock' }));
  }

  ngOnInit(): void {
    this.businessForm = this.generateBusinessForm();
    this.userSettingForm = UserSettingsComponent.createForm();
    this.onBusinessUnitValueChanged();

    const user = this.store.selectSnapshot(UserState.user) as User;
    this.disableBusinessControls(user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    this.businessControl.patchValue(this.isBusinessFormDisabled ? user?.businessUnitId : 0);
    this.subscribeOnSucceededUserCreation();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onAddNewUser() {
    this.isEditRole = false;
    this.userSettingForm.reset();
    this.userSettingForm.enable();
    this.userSettingForm.patchValue({
      businessUnitType: this.businessUnitControl.value,
      businessUnitId: this.businessControl.value,
      isDeleted: true,
    });
    this.disableBussinesUnitForRole();
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onAddCancel(): void {
    if (this.userSettingForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.store.dispatch(new ShowSideDialog(false));
        });
    } else {
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  public onSave(): void {
    this.userSettingForm.markAllAsTouched();
    if(this.userSettingForm.valid) {
      const value = this.userSettingForm.getRawValue();
      let userDTO : UserDTO = {
        businessUnitId: value.businessUnitId || null,
        metadata: {...value},
        roleIds: value.roles
      }
      if(this.isEditRole) {
         userDTO = {
          ...userDTO,
           userId: value.id
        }
      }
      this.store.dispatch(new SaveUser(userDTO));
    }
  }

  public onEdit(user: User): void {
    this.isEditRole = true;
    this.userSettingForm.reset();
    this.userSettingForm.enable();

    if(user.roles) {
      const editedUser = {
        ...user,
        roles: [...user.roles],
        businessUnitId: user.businessUnitId || 0,
        emailConfirmation: user.email
      }
      this.userSettingForm.patchValue({
        ...editedUser,
        roles: user.roles.map((role: any) => role.id)
      });
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

  private disableBusinessControls(user: User) {
    if (user?.businessUnitType) {
      this.isBusinessFormDisabled = DISABLED_GROUP.includes(user?.businessUnitType);
      this.isBusinessFormDisabled && this.businessForm.disable();
    }
    if (user?.businessUnitType === BusinessUnitType.MSP) {
      const [Hallmark, ...rest] = this.businessUnits;
      this.businessUnits = rest;
    }
  }

  private disableBussinesUnitForRole(): void {
    if (this.isBusinessFormDisabled) {
      this.userSettingForm.get('businessUnitType')?.disable();
      this.userSettingForm.get('businessUnitId')?.disable();
    }
  }

  private subscribeOnSucceededUserCreation(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(SaveUserSucceeded),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
      });
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
