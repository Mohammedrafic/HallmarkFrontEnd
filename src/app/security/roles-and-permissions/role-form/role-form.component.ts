import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, distinctUntilChanged, filter, map, Observable, takeWhile } from 'rxjs';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';

import { DrawNodeEventArgs, TreeView, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';

import { BusinessUnit } from '@shared/models/business-unit.model';
import { UsersAssignedToRole } from '@shared/models/user.model';
import { PermissionsTree } from '@shared/models/permission.model';
import { GetUsersAssignedToRole } from 'src/app/store/user.actions';
import { UserState } from 'src/app/store/user.state';

import {
  GetIRPPermissionsTree,
  GetNewRoleBusinessByUnitType,
  GetNewRoleBusinessByUnitTypeSucceeded,
  GetPermissionsTree,
  GetRolesForCopy,
} from '../../store/security.actions';
import { SecurityState } from '../../store/security.state';
import { BUSSINES_DATA_FIELDS, OPRION_FIELDS } from '../roles-and-permissions.constants';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Role } from '@shared/models/roles.model';
import { AgencyStatus } from '@shared/enums/status';

export type RoleTreeField = {
  dataSource: PermissionsTree;
  id: 'id';
  parentID: 'parentId';
  text: 'name';
  hasChildren: 'hasChild';
};

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
})
export class RoleFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() form: FormGroup;
  @Input() roleId: number | null;
  @Input() businessUnits: { text: string | BusinessUnitType; id: number }[];

  @Output() changeUnitId = new EventEmitter<boolean>();

  @ViewChild('tree') tree: TreeViewComponent;
  @ViewChild('showIRPOnlyToggle') showIRPOnlyToggle:ElementRef;

  public newRoleBussinesData: BusinessUnit[];

  @Select(SecurityState.roleTreeField)
  public roleTreeField$: Observable<RoleTreeField>;

  @Select(SecurityState.permissionsTree)
  public permissionsTree$: Observable<PermissionsTree>;

  @Select(SecurityState.permissionsIRPTree)
  public permissionsIRPTree$: Observable<PermissionsTree>;

  @Select(SecurityState.isNewRoleDataLoading)
  public isNewRoleDataLoading$: Observable<boolean>;

  @Select(UserState.usersAssignedToRole)
  usersAssignedToRole$: Observable<UsersAssignedToRole>;

  public usersAssignedToRole: UsersAssignedToRole;
  public copyRoleData$: Observable<Role[]>;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public optionFields = OPRION_FIELDS;
  public copyRoleControl = new FormControl();
  public copyRoleFields = {
    text: 'name',
    value: 'id',
  };

  defaultBusinessValue: any;

  get businessUnitControl(): AbstractControl | null {
    return this.form.get('businessUnitType');
  }

  get permissionsControl(): AbstractControl | null {
    return this.form.get('permissions');
  }

  get businessUnitIdControl(): AbstractControl | null {
    return this.form.get('businessUnitId');
  }

  get showActiveError(): boolean {
    return (
      this.form.get('isActive')?.value === false &&
      (!!this.usersAssignedToRole.userNames.length || this.usersAssignedToRole.hasUsersOutsideVisibility)
    );
  }

  private isAlive = true;
  private notAssignableIds: number[];

  constructor(private store: Store, private actions$: Actions,private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.onBusinessUnitControlChanged();
    this.onRoleTreeFieldChanged();
    this.onBusinessUnitOrIdChange();
    this.onFormChange();
    this.onNewRoleBussinesDataFetched();
    this.onUsersAssignedToRoleFetched();
    this.subOnBusinessUnitControlChange();

    this.copyRoleData$ = this.store.select(SecurityState.copyRoleData)
    .pipe(
      map((roles) => {
        const id = this.form.value.id;
        return id ? roles.filter((role) => role.id !== id) : roles;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['roleId']?.currentValue) {
      this.usersAssignedToRole = { userNames: [], hasUsersOutsideVisibility: false };
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  ngAfterViewInit():void{
    this.showIRPOnlyToggle.nativeElement.style.display='none';
  }
  public toggleActive(): void {
    const activeControl = this.form.get('isActive');
    activeControl?.patchValue(!activeControl.value);
    if (!activeControl?.value) {
      this.store.dispatch(new GetUsersAssignedToRole(this.roleId as number));
    }
  }

  public onSelecting(): void {
    this.updatePermissionValue();
  }

  public dataBound(): void {
    if (this.permissionsControl?.value) {
      this.tree.checkAll(this.permissionsControl.value);
      this.tree.expandAll();
    }
  }

  public drawNode(args: DrawNodeEventArgs): void {
    if (!args.nodeData['isAvailable']) {
      const ele = args.node.querySelector('.e-checkbox-wrapper') as HTMLElement;
      ele.classList.add('e-checkbox-disabled');
    }
  }

  public onApply(): void {
    const permissions = this.store.selectSnapshot(SecurityState.getPermissionsForCopyById(this.copyRoleControl.value));
    this.tree.uncheckAll();
    this.tree.checkAll(permissions);
    this.updatePermissionValue();
  }

  private onBusinessUnitOrIdChange(): void {
    const businessUnitTypeControl = this.form.get('businessUnitType');
    const businessUnitIdControl = this.form.get('businessUnitId');
    
    if (businessUnitTypeControl && businessUnitIdControl) {
      combineLatest([businessUnitTypeControl.valueChanges, businessUnitIdControl.valueChanges])
        .pipe(
          distinctUntilChanged((prev, next) => prev[0] === next[0] && prev[1] === next[1]),
          filter((values) => values.every((value) => typeof value === 'number')),
          takeWhile(() => this.isAlive),
        )
        .subscribe(([type, id]) => {
          this.copyRoleControl.reset();
          this.store.dispatch(new GetRolesForCopy(type, id || ''));
        });
    }
  }

  private updatePermissionValue(): void {
    const roleDataControl = this.form.get('permissions');
    const checkeNodes = this.tree.getAllCheckedNodes();
    const value = this.getAssignableValues(checkeNodes);
    roleDataControl?.patchValue(value);
  }

  private onFormChange(): void {
    this.form.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.form.disabled ? this.copyRoleControl.disable() : this.copyRoleControl.enable();
    });
  }

  private getAssignableValues(rawValue: string[]): number[] {
    return rawValue
      .map((stringId) => {
        const id = Number(stringId);
        return this.notAssignableIds.includes(id) ? NaN : id;
      })
      .filter(Number);
  }

  private onBusinessUnitControlChanged(): void {
    this.businessUnitControl?.valueChanges
      .pipe(
        filter((value) => !!value),
        distinctUntilChanged(),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.store.dispatch(new GetPermissionsTree(value));
        this.store.dispatch(new GetIRPPermissionsTree(value));
        this.store.dispatch(new GetNewRoleBusinessByUnitType(value));
    });
  }

  private onRoleTreeFieldChanged(): void {
    this.roleTreeField$.pipe(takeWhile(() => this.isAlive))
    .subscribe((roleTreeField) => {
      this.notAssignableIds = roleTreeField.dataSource
        .filter(({ isAssignable, isAvailable }) => !isAssignable || !isAvailable)
        .map(({ id }) => id);
    });
  }

  private onNewRoleBussinesDataFetched(): void {
    this.actions$.pipe(
      ofActionSuccessful(GetNewRoleBusinessByUnitTypeSucceeded),
      takeWhile(() => this.isAlive))
    .subscribe(() => {
      const user = this.store.selectSnapshot(UserState.user);
      this.newRoleBussinesData =
      this.store.selectSnapshot(SecurityState.newRoleBussinesData)(user?.businessUnitType as BusinessUnitType);
      if (user?.businessUnitType !== BusinessUnitType.Hallmark) {
        this.defaultBusinessValue = this.newRoleBussinesData[0]?.id;
      }
    });
  }

  private onUsersAssignedToRoleFetched(): void {
    this.usersAssignedToRole$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe((usersAssignedToRole: UsersAssignedToRole) => (this.usersAssignedToRole = usersAssignedToRole));
  }

  private subOnBusinessUnitControlChange(): void {
    this.businessUnitIdControl?.valueChanges
      .pipe(
        filter((value) => !!value),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value: number) => {
        if (this.businessUnitControl?.value === BusinessUnitType.Agency) {
          const selectedRole = this.newRoleBussinesData.find((role) => role.id === value);
          const isAgencyDisable =
            selectedRole?.agencyStatus === AgencyStatus.Inactive ||
            selectedRole?.agencyStatus === AgencyStatus.Terminated;

          this.changeUnitId.emit(isAgencyDisable);
        }
      });
  }
  ShowIsIRPToggle(arg:any){
    if(arg.itemData.isIRPEnabled&&arg.itemData.isVMSEnabled){
      this.showIRPOnlyToggle.nativeElement.style.display='block';
    }
    else{
      this.showIRPOnlyToggle.nativeElement.style.display='none';
    }
  }
  isShowIRPOnly(arg:any){
    var elements:TreeView = this.tree;
    if(arg.checked==true){
      this.permissionsIRPTree$.subscribe((roleTreeField) => {
        elements.fields={
          dataSource:roleTreeField,
          id: 'id',
          parentID: 'parentId',
          text: 'name',
          hasChildren: 'hasChild'
        }
      });
    }
    else{
      this.permissionsTree$.subscribe((roleTreeField) => {
        elements.fields={
          dataSource:roleTreeField.filter(x=>x.includeInIRP==false),
          id: 'id',
          parentID: 'parentId',
          text: 'name',
          hasChildren: 'hasChild'
        }
      });
    }
    this.changeDetectorRef.detectChanges();
  }
 
  static createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(),
      businessUnitType: new FormControl('', [Validators.required]),
      businessUnitId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      isActive: new FormControl(true),
      isShowIRPOnly:new FormControl(false),
      permissions: new FormControl([], [Validators.required]),
    });
  }
}
