import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { filter, Observable, takeWhile } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { DrawNodeEventArgs, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';

import { BusinessUnit } from '@shared/models/business-unit.model';
import { PermissionsTree } from '@shared/models/permission.model';

import { GetNewRoleBusinessByUnitType, GetPermissionsTree } from '../../store/security.actions';
import { SecurityState } from '../../store/security.state';
import { BUSINESS_UNITS_VALUES, BUSSINES_DATA_FIELDS, OPRION_FIELDS } from '../roles-and-permissions.constants';

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
export class RoleFormComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;

  @ViewChild('tree') tree: TreeViewComponent;

  @Select(SecurityState.newRoleBussinesData)
  public newRoleBussinesData$: Observable<BusinessUnit[]>;

  @Select(SecurityState.roleTreeField)
  public roleTreeField$: Observable<RoleTreeField>;

  @Select(SecurityState.isNewRoleDataLoading)
  public isNewRoleDataLoading$: Observable<boolean>;

  public businessUnits = BUSINESS_UNITS_VALUES;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public optionFields = OPRION_FIELDS;
  public copyRoleControl = new FormControl();

  get businessUnitControl(): AbstractControl | null {
    return this.form.get('businessUnitType');
  }

  get permissionsControl(): AbstractControl | null {
    return this.form.get('permissions');
  }

  private isAlive = true;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.onBusinessUnitControlChanged();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public toggleActive(): void {
    const activeControl = this.form.get('isActive');
    activeControl?.patchValue(!activeControl.value);
  }

  public onSelecting(): void {
    const roleDataControl = this.form.get('permissions');
    roleDataControl?.patchValue(this.tree.getAllCheckedNodes());
  }

  public dataBound(): void {
    if (this.permissionsControl?.value) {
      this.tree.checkAll(this.permissionsControl.value);
    }
  }

  public drawNode(args: DrawNodeEventArgs): void {
    // TDI After BE Changes
    // if (!args.nodeData['isAvailable']) {
    //   let ele: any = args.node.querySelector('.e-checkbox-wrapper');
    //   ele.classList.add('e-checkbox-disabled');
    // }
  }

  private onBusinessUnitControlChanged(): void {
    this.businessUnitControl?.valueChanges
      .pipe(
        filter((value) => !!value),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.store.dispatch(new GetPermissionsTree(value));
        this.store.dispatch(new GetNewRoleBusinessByUnitType(value));
      });
  }

  static createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(),
      businessUnitType: new FormControl('', [Validators.required]),
      businessUnitId: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      isActive: new FormControl(true),
      permissions: new FormControl([], [Validators.required]),
    });
  }
}
