import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AddEditUserComponent } from 'src/app/security/user-list/add-edit-user/add-edit-user.component';
import { BUSSINES_DATA_FIELDS, UNIT_FIELDS, DISABLED_GROUP } from './user-list.constants';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { SecurityState } from '../store/security.state';
import { filter, map, Observable, Subject, takeWhile } from 'rxjs';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { SetHeaderState, ShowExportDialog, ShowSideDialog, ShowToast } from '../../store/app.actions';
import {
  ChangeBusinessUnit,
  GetBusinessByUnitType,
  GetBusinessIdDetails,
  GetRolePerUser,
  ImportUsers,
  SaveUser,
  SaveUserSucceeded,
} from '../store/security.actions';
import { UserState } from '../../store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { UserSettingsComponent } from './add-edit-user/user-settings/user-settings.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { UserDTO, User, GetBusinessUnitIdDetails } from '@shared/models/user-managment-page.model';
import { take } from 'rxjs/operators';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { UserGridComponent } from './user-grid/user-grid.component';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { BUSINESS_UNITS_VALUES, BUSINESS_UNITS_VALUES_USERS_ROLES } from '@shared/constants/business-unit-type-list';
import { MessageTypes } from '@shared/enums/message-types';

const DEFAULT_DIALOG_TITLE = 'Add User';
const EDIT_DIALOG_TITLE = 'Edit User';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild(AddEditUserComponent) addEditUserComponent: AddEditUserComponent;
  @ViewChild(UserGridComponent) userGridComponent: UserGridComponent;
  @ViewChild('uploadUsers') uploadUsersRef: HTMLInputElement;

  @Select(SecurityState.businessUserData)
  public businessUserData$: Observable<(type: number) => BusinessUnit[]>;

  @Select(SecurityState.newBusinessDataPerUser)
  public newBusinessDataPerUser$: Observable<(type: number) => BusinessUnit[]>;

  @Select(SecurityState.businessIdDetails)
  public businessUnitIdDetails$: Observable<GetBusinessUnitIdDetails>;

  public exportUsers$ = new Subject<ExportedFileType>();
  public businessForm: FormGroup;
  public userSettingForm: FormGroup;
  public isEditRole = false;
  public unitFields = UNIT_FIELDS;
  public businessUnits = BUSINESS_UNITS_VALUES_USERS_ROLES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public isBusinessFormDisabled = false;
  public createdUser: User | null;
  public agencyActionsAllowed = false;
  public importAllowed = false;
  public dispatch: boolean = false;
  public isIRPOrg: boolean = false;
  public isCreateEmp: boolean = false;
  public user: User;

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
    protected override store: Store,
    private confirmService: ConfirmService,
    private actions$: Actions,
  ) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'Users', iconName: 'lock' }));
    this.importAllowed = this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.Hallmark;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.businessForm = this.generateBusinessForm();
    this.userSettingForm = UserSettingsComponent.createForm();
    this.onBusinessUnitValueChanged();
    this.onBusinessIdValueChanged();

    const user = this.store.selectSnapshot(UserState.user) as User;
    this.user =this.store.selectSnapshot(UserState.user) as User;
    this.disableBusinessControls(user);
    this.businessUnitControl.patchValue(user?.businessUnitType);
    if(user?.businessUnitType !=BusinessUnitType.Organization){
      this.businessControl.patchValue(this.isBusinessFormDisabled  ? user?.businessUnitId :  0);
    }else{
      this.businessControl.patchValue(user?.businessUnitId);
      this.businessForm.get('business')?.disable({emitEvent:false})
    }
 
    this.subscribeOnSucceededUserCreation();
    this.subOnChangeUnit();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    this.createdUser = null;
  }

  get bussinesUserData$(): Observable<BusinessUnit[]> {
    return this.businessUserData$.pipe(map((fn) => fn(this.businessUnitControl?.value)));
  }

  public onAddNewUser() {
    this.createdUser = null;
    this.isEditRole = false;
    this.userSettingForm.reset();
    this.userSettingForm.enable();
    this.userSettingForm.patchValue({
      businessUnitType: this.businessUnitControl.value,
      businessUnitId: this.businessControl.value,
      isDeleted: true,
    });
    this.disableBussinesUnitForRole();
    if(this.user?.businessUnitType == BusinessUnitType.Organization &&this.isIRPOrg){
      this.userSettingForm.get('businessUnitType')?.enable({emitEvent: false});
      this.userSettingForm.get('businessUnitId')?.disable({emitEvent: false});
    }
   
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
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => this.closeDialog());
    } else {
      this.closeDialog();
    }
  }


  public onSave(): void {
    let empId: number = 6;
    this.userSettingForm.markAllAsTouched();
    if (this.userSettingForm.valid) {
      const value = this.userSettingForm.getRawValue();
        let userDTO: UserDTO = {
          businessUnitId: value.businessUnitId || null,
          metadata: {
            ...value,
            isDeleted: !value.isDeleted,
          },
          roleIds: value.roles,
        };
        if (this.isEditRole) {
          userDTO = {
            ...userDTO,
            userId: value.id,
          };
        }
      try{
        value.roles.forEach((x : number) => {
          if(x == empId){
            if(value.phoneNumber != null){
              this.dispatch = true;
              this.store.dispatch(new SaveUser(userDTO));
            } else {
              this.store.dispatch(new ShowToast(MessageTypes.Error, "Phone Number is Required"));
            }
            throw "break";
          } else {
            this.dispatch = true;
          }
        });
        if(this.dispatch){
          this.store.dispatch(new SaveUser(userDTO));
        }
      } catch(e){
      }

    }
  }

  public onEdit(user: User): void {
    this.addEditUserComponent.tab.refresh();
    setTimeout(() => {
      this.isEditRole = true;
      this.createdUser = user;
      this.userSettingForm.reset();
      this.userSettingForm.enable();
      this.disableMailFormGroup();

      if (user.roles) {
        const editedUser = {
          ...user,
          roles: [...user.roles],
          isDeleted: !user.isDeleted,
          businessUnitId: user.businessUnitId || 0,
          emailConfirmation: user.email,
        };
        this.userSettingForm.patchValue({
          ...editedUser,
          roles: user.roles?.map((role: any) => role.id),
        }, {emitEvent: false});
      }

      this.subscribeOnFieldsChanges(user);
      this.disableBussinesUnitForRole();
      this.store.dispatch(new ShowSideDialog(true));
    });
  }

  public uploadUsers(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file: File = element.files?.[0] as File;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.store.dispatch(new ImportUsers(formData));
    }
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType): void {
    this.exportUsers$.next(fileType);
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
      this.businessUnits = this.businessUnits.filter((item) => item.id !== BusinessUnitType.Hallmark);
    }
    if(user?.businessUnitType === BusinessUnitType.Organization){
      this.businessForm.get('business')?.setValue(user.businessUnitId);
    
    }
  }

  private subOnChangeUnit(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(ChangeBusinessUnit),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value: { isChangeUnit: boolean }) => {
        this.agencyActionsAllowed = value.isChangeUnit;
      });
  }

  private disableBussinesUnitForRole(): void {
    if (this.isBusinessFormDisabled) {
      this.userSettingForm.get('businessUnitType')?.disable({emitEvent: false});
      this.userSettingForm.get('businessUnitId')?.disable({emitEvent: false});
    }
  }

  private subscribeOnSucceededUserCreation(): void {
    this.actions$
      .pipe(
        ofActionSuccessful(SaveUserSucceeded),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        let datasource = this.userGridComponent.createServerSideDatasource();
        this.userGridComponent.gridApi.setServerSideDatasource(datasource);
        this.closeDialog()
      }
        );
  }

  private onBusinessUnitValueChanged(): void {
    this.businessUnitControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      value && this.store.dispatch(new GetBusinessByUnitType(value));
      if (!this.isBusinessFormDisabled && this.user?.businessUnitType != BusinessUnitType.Organization) {
        this.businessControl.patchValue(0);
      }
    });
  }

  private subscribeOnFieldsChanges(user: User) {
    if (user.businessUnitType !== BusinessUnitType.Hallmark) {
      this.newBusinessDataPerUser$.pipe(take(2)).subscribe(() => {
        this.userSettingForm.get('businessUnitId')?.setValue(user.businessUnitId, {emitEvent: false});
      });
    }

    this.store
      .dispatch(
        new GetRolePerUser(
          user.businessUnitType ? user.businessUnitType : 0,
          user.businessUnitId ? [user.businessUnitId] : []
        )
      ).pipe(takeWhile(() => this.isAlive))
      .subscribe(() => {
        this.userSettingForm.get('roles')?.setValue(user.roles?.map((role: any) => role.id));
      });
  }

  private closeDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.userSettingForm.reset();
    this.userSettingForm.enable();
    this.createdUser = null;
    if(this.businessUnitControl.value==BusinessUnitType.Employee){
      this.store.dispatch(new GetBusinessByUnitType(this.businessUnitControl.value));
    }
  }

  private disableMailFormGroup(): void {
    this.userSettingForm.get('email')?.disable();
    this.userSettingForm.get('emailConfirmation')?.disable();
  }

  private onBusinessIdValueChanged(): void {
    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      value && this.store.dispatch(new GetBusinessIdDetails(value));
      this.businessUnitIdDetails$.pipe(takeWhile(() => this.isAlive)).subscribe((value:GetBusinessUnitIdDetails) => {
      if(value !=null){
        this.isIRPOrg = value.isIRPEnabled
        this.isCreateEmp = value.isCreateEmployee
        if(this.user?.businessUnitType == BusinessUnitType.Organization){
          if(this.isIRPOrg){
            let orgEmpBusinessIDs =[BusinessUnitType.Organization,BusinessUnitType.Employee]
            this.businessUnits = this.businessUnits.filter((item) => orgEmpBusinessIDs.includes(item.id)); 
            this.businessForm.get('businessUnit')?.enable({emitEvent:false});
          }else{
            this.businessForm.disable({emitEvent:false});
          }
        }
      }
      })
    });
  }
  ChangeBusinessUnitID(){
    alert("ChangeBusinessUnitType-")
  }
}
