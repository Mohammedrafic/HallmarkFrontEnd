import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { Role, RoleDTO } from '@shared/models/roles.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { filter, Observable, Subject, take, takeWhile } from 'rxjs';

import { SetHeaderState, ShowFilterDialog, ShowSideDialog, ShowExportDialog } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';
import { GetBusinessByUnitType, GetBusinessIdDetails, GetPermissionsTree, SaveRole, SaveRoleSucceeded } from '../store/security.actions';
import { SecurityState } from '../store/security.state';
import { RoleFormComponent } from './role-form/role-form.component';
import { AddRolesDialogTitle, BUSSINES_DATA_FIELDS,
  EditRolesDialogTitle, OPRION_FIELDS } from './roles-and-permissions.constants';
import { RolesGridComponent } from './roles-grid/roles-grid.component';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { BUSINESS_UNITS_VALUES, BUSINESS_UNITS_VALUES_USERS_ROLES } from '@shared/constants/business-unit-type-list';
import { User } from '@shared/models/user.model';
import { GetBusinessUnitIdDetails } from '@shared/models/user-managment-page.model';

@Component({
  selector: 'app-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss'],
})
export class RolesAndPermissionsComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild('roleForm') roleForm: RoleFormComponent;
  @ViewChild(RolesGridComponent, { static: false }) childC: RolesGridComponent;

  @Select(SecurityState.bussinesData)
  public bussinesData$: Observable<BusinessUnit[]>;

  @Select(SecurityState.businessIdDetails)
  public businessUnitIdDetails$: Observable<GetBusinessUnitIdDetails>;

  public exportRoles$ = new Subject<ExportedFileType>();
  public businessForm: FormGroup;
  public roleFormGroup: FormGroup;
  public isEditRole = false;
  public isBusinessFormDisabled = false;
  public isBusinessDisabledForNewRole = false;
  public isOrgLogin = false;
  public isIRPEnabled = false;
  public businessUnits = BUSINESS_UNITS_VALUES_USERS_ROLES;
  public optionFields = OPRION_FIELDS;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public roleId: number | null;
  public filteredItems$ = new Subject<number>();
  public agencyActionsAllowed = false;
  public userbusinessUnitId: number | null;
  public user: User;

  get dialogTitle(): string {
    return this.isEditRole ? EditRolesDialogTitle : AddRolesDialogTitle;
  }

  get businessUnitControl(): AbstractControl {
    return this.businessForm.get('businessUnit') as AbstractControl;
  }

  get businessControl(): AbstractControl {
    return this.businessForm.get('business') as AbstractControl;
  }

  private isAlive = true;
  private existingRoleName: string[];

  constructor(protected override store: Store, private actions$: Actions, private confirmService: ConfirmService) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'Roles and Permissions', iconName: 'lock' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.businessForm = this.generateBusinessForm();
    this.roleFormGroup = RoleFormComponent.createForm();
    const user = this.store.selectSnapshot(UserState.user);
    this.user = this.store.selectSnapshot(UserState.user) as User;
    this.userbusinessUnitId = user?.businessUnitId != null ? user?.businessUnitId : 0;
    this.onBusinessUnitValueChanged();
    this.onBusinessIdValueChanged()
    this.businessUnitControl.patchValue(user?.businessUnitType);

    if (user?.businessUnitType !== BusinessUnitType.Hallmark && user?.businessUnitType !== BusinessUnitType.MSP) {
      this.isBusinessDisabledForNewRole = true;
      this.businessForm.disable();
    }

    if (user?.businessUnitType === BusinessUnitType.MSP) {
      this.businessUnits = this.businessUnits.filter((item) => item.id !== BusinessUnitType.Hallmark);
    }
    if(user?.businessUnitType === BusinessUnitType.Organization){
      let orgEmpBusinessIDs =[BusinessUnitType.Organization,BusinessUnitType.Employee]
      this.businessUnits = this.businessUnits.filter((item) => orgEmpBusinessIDs.includes(item.id));  
      this.isOrgLogin=true
    }

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

  public addRole(): void {
    this.isEditRole = false;
    this.roleFormGroup.reset();
    this.roleFormGroup.enable();
    this.roleFormGroup.patchValue({
      businessUnitType: this.businessUnitControl.value,
      businessUnitId: this.businessControl.value?.length > 0 ? this.businessControl.value[0] : null ,
      isActive: true,
      isShowIRPOnly: false
    });
    this.disableBussinesUnitForRole();
    if(this.isOrgLogin && this.isIRPEnabled) {
      this.businessControl.patchValue([this.userbusinessUnitId]);
      this.roleFormGroup.get('businessUnitId')?.disable({emitEvent:false});
      this.roleFormGroup.get('businessUnitType')?.enable({emitEvent:false});
    }
    this.store.dispatch(new ShowSideDialog(true));
  }

  public cancelRolesChanges(): void {
    if (this.roleFormGroup.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public onChangeUnitId(event: boolean): void {
    this.agencyActionsAllowed = event;
  }

  public saveRole(): void {
    this.roleForm.updatePermissionValue();
    this.roleFormGroup.markAllAsTouched();
    if (this.roleFormGroup.valid && !this.roleForm.showActiveError) {
      const value = this.roleFormGroup.getRawValue();
      const roleDTO: RoleDTO = {
        ...value,
        id: this.roleId,
        businessUnitId: value.businessUnitId || null,
        permissions: value.permissions.map((stringValue: string) => Number(stringValue)),
      };
      this.store.dispatch(new SaveRole(roleDTO)).pipe(
        takeWhile(() => this.isAlive)
      ).subscribe(() => {
        if (this.childC.gridApi) {
          this.childC.dispatchNewPage();
        }
      });
    }
  }

  public editRole({
    index,
    column,
    foreignKeyData,
    id,
    ...role
  }: Role & { index: string; column: unknown; foreignKeyData: unknown }): void {
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
    if(this.isOrgLogin) {
      this.roleFormGroup.get('businessUnitId')?.disable();
    }
    this.store.dispatch(new ShowSideDialog(true));
  }

  private generateBusinessForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(),
      business: new FormControl(0),
    });
  }

  private disableBussinesUnitForRole(): void {
    if (this.isBusinessDisabledForNewRole) {
      this.roleFormGroup.get('businessUnitType')?.disable();
    }
  }

  private onBusinessUnitValueChanged(): void {
    this.businessUnitControl.valueChanges
    .pipe(takeWhile(() => this.isAlive)).
    subscribe((value) => {
     this.store.dispatch(new GetBusinessByUnitType(value)).pipe(
       takeWhile(() => this.isAlive)
     ).subscribe(() => {
        this.businessControl?.setValue(null);
        if (this.isBusinessDisabledForNewRole||this.isOrgLogin) {
          this.businessControl.patchValue([this.userbusinessUnitId]);
        }
        if(this.isOrgLogin) {
          this.businessControl.patchValue([this.userbusinessUnitId]);
          this.businessForm.get('business')?.disable();
          this.roleFormGroup.get('businessUnitId')?.disable();
        }
      });
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

  private onBusinessIdValueChanged(): void {
    this.businessControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe((value) => {
      if (this.user?.businessUnitType == BusinessUnitType.Organization) {
        value && this.store.dispatch(new GetBusinessIdDetails(value));
        this.businessUnitIdDetails$.pipe(takeWhile(() => this.isAlive)).subscribe((value: GetBusinessUnitIdDetails) => {
          if (value != null) {
            if(value.isIRPEnabled){
              this.isIRPEnabled=true;
              this.businessForm.get("businessUnit")?.enable({emitEvent:false})
            }else{
              this.businessForm.get("businessUnit")?.disable({emitEvent:false})
            }
          }
        })
      }

    });
  }
}
