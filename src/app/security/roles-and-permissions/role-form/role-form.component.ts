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

import { DrawNodeEventArgs, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { DataManager, Query } from '@syncfusion/ej2-data';

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
  @ViewChild('showIRPOnlyToggle') showIRPOnlyToggle: ElementRef;

  public newRoleBussinesData: BusinessUnit[];

  @Select(SecurityState.roleTreeField)
  public roleTreeField$: Observable<RoleTreeField>;


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
  IsIrp: any = false;
  IsVMS: any = false;
  IsShowIRPVMS: any = false;
  IsVMSChecked: boolean = true;
  IsIRPChecked: boolean = true;
  public toggle: boolean = false;
  public fields = {
    dataSource: null, id: 'id', text: 'name', parentID: 'parentId', hasChildren: 'hasChild', htmlAttributes: 'htmlAttributes'
  }
  public treeData: PermissionsTree;
  public treeSource: PermissionsTree;

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

  constructor(private store: Store, private actions$: Actions, private changeDetectorRef: ChangeDetectorRef) { }

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

  ngAfterViewInit(): void {
    this.roleTreeField$.pipe(
      takeWhile(() => this.isAlive)
    ).subscribe((roleTreeField) => {
      this.treeData = roleTreeField.dataSource;
      this.treeSource = this.treeData;

      if (this.newRoleBussinesData != null && this.newRoleBussinesData != undefined) {
        var data = this.businessUnitIdControl?.value;
        var selectedBussinessUnit = this.newRoleBussinesData.filter(x => x.id == data);
        this.IsIrp = selectedBussinessUnit[0]?.isIRPEnabled;
        this.IsVMS = selectedBussinessUnit[0]?.isVMSEnabled;
        this.IsShowIRPVMS = this.IsIrp && this.IsVMS;
        this.form.controls["VMS"]?.setValue(true);
        this.form.controls["IRP"]?.setValue(true);
      }
      this.changeDataSource(this.treeData);
    });
  }
  public changeDataSource(data: any) {
    for (let i = 0; i < data.length; i++) {
      let dataId = data[i]["id"].toString();
      if (this.tree.checkedNodes.indexOf(dataId) > -1 && this.permissionsControl?.value?.indexOf(dataId) === -1)
        this.permissionsControl.value.push(dataId)
    }
    this.tree.fields = {
      dataSource: data, id: 'id', text: 'name', parentID: 'parentId', hasChildren: 'hasChild'

    }

  }
  public OnChangeVMS(arg: any) {
    if (arg.checked) 
      this.IsVMSChecked=true;
    else
    this.IsVMSChecked=false;
    this.setTreeFilter();
    this.changeDetectorRef.detectChanges();
  }

  public OnChangeIRP(arg: any) {
    if (arg.checked) 
      this.IsIRPChecked=true;
    else
    this.IsIRPChecked=false;
    this.setTreeFilter();
    this.changeDetectorRef.detectChanges();
  }
public setTreeFilter()
{
   if(this.IsVMSChecked && !this.IsIRPChecked){
    this.treeData = this.treeSource.filter(x => x.includeInVMS);
  }
  else if(!this.IsVMSChecked && this.IsIRPChecked){
    this.treeData = this.treeSource.filter(x => x.includeInIRP);
  }
  else{
    this.treeData = this.treeSource;
  }
  this.tree.fields = {
    dataSource: this.treeData, id: 'id', text: 'name', parentID: 'parentId', hasChildren: 'hasChild'
  }
}
  public toggleActive(): void {
    const activeControl = this.form.get('isActive');
    activeControl?.patchValue(!activeControl.value);
    if (!activeControl?.value) {
      this.store.dispatch(new GetUsersAssignedToRole(this.roleId as number));
    }
  }
  public getFilterItems(fList: any, list: any): any[] {
    let nodes = [];
    nodes.push(fList["id"]);
    let query2 = new Query().where('id', 'equal', fList["parentId"], false);
    let fList1 = new DataManager(list).executeLocal(query2);
    if (fList1.length != 0) {
      let pNode = this.getFilterItems(fList1[0], list);
      for (let i = 0; i < pNode.length; i++) {
        if (nodes.indexOf(pNode[i]) == -1 && pNode[i] != null)
          nodes.push(pNode[i]);
      }
      return nodes;
    }
    return nodes;
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
          this.store.dispatch(new GetPermissionsTree(type, id));
          this.store.dispatch(new GetRolesForCopy(type, id || ''));
        });
    }
  }

  public updatePermissionValue(): void {
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
        this.defaultBusinessValue = this.newRoleBussinesData.filter(x => x.id == this.businessUnitIdControl?.value);
        this.IsIrp = this.defaultBusinessValue[0]?.isIRPEnabled;
        this.IsVMS = this.defaultBusinessValue[0]?.isVMSEnabled;
        this.IsShowIRPVMS = this.IsIrp && this.IsVMS;
        this.defaultBusinessValue = this.defaultBusinessValue[0]?.id;

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

  static createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(),
      businessUnitType: new FormControl('', [Validators.required]),
      businessUnitId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      isActive: new FormControl(true),
      IRP: new FormControl(true),
      VMS: new FormControl(true),
      permissions: new FormControl([], [Validators.required]),
    });
  }
}
