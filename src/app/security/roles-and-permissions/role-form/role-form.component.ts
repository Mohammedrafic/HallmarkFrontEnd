import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { BUSINESS_UNITS_VALUES, OPRION_FIELDS } from '../roles-and-permissions.constants';

const mock = [
  { id: 1, name: 'Australia', hasChild: true },
  { id: 2, pid: 1, name: 'New South Wales' },
  { id: 3, pid: 1, name: 'Victoria' },
  { id: 4, pid: 1, name: 'South Australia' },
  { id: 6, pid: 1, name: 'Western Australia' },
  { id: 7, name: 'Brazil', hasChild: true },
  { id: 8, pid: 7, name: 'Paraná' },
  { id: 9, pid: 7, name: 'Ceará' },
  { id: 10, pid: 7, name: 'Acre' },
  { id: 11, name: 'China', hasChild: true },
  { id: 12, pid: 11, name: 'Guangzhou' },
  { id: 13, pid: 11, name: 'Shanghai' },
  { id: 14, pid: 11, name: 'Beijing' },
  { id: 15, pid: 11, name: 'Shantou' },
  { id: 16, name: 'France', hasChild: true },
  { id: 17, pid: 16, name: 'Pays de la Loire' },
  { id: 18, pid: 16, name: 'Aquitaine' },
  { id: 19, pid: 16, name: 'Brittany' },
  { id: 20, pid: 16, name: 'Lorraine' },
  { id: 21, name: 'India', hasChild: true },
  { id: 22, pid: 21, name: 'Assam' },
  { id: 23, pid: 21, name: 'Bihar' },
  { id: 24, pid: 21, name: 'Tamil Nadu' },
  { id: 25, pid: 21, name: 'Punjab' }
];

@Component({
  selector: 'app-role-form',
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
})
export class RoleFormComponent implements OnInit {
  @Input() form: FormGroup;

  @ViewChild('tree') tree: TreeViewComponent;

  public pages: Object[] = mock;
  public treeField: Object = { dataSource: this.pages, id: 'id', parentID: 'pid', text: 'name', hasChildren: 'hasChild' };
  public businessUnits = BUSINESS_UNITS_VALUES;
  public optionFields = OPRION_FIELDS;
  public copyRoleControl = new FormControl();

  constructor() {}

  ngOnInit(): void {}

  public toggleActive(): void {
    const activeControl = this.form.get('isActive');
    activeControl?.patchValue(!activeControl.value);
  }

  public onSelecting(): void {
    const roleDataControl = this.form.get('roleData');
    roleDataControl?.patchValue(this.tree.getAllCheckedNodes());
  }

  public dataBound(): void {
    // TODO: move to roleDate changes
    this.tree.checkAll(['2', '4']);
  }

  static createForm(): FormGroup {
    return new FormGroup({
      businessUnit: new FormControl(''),
      business: new FormControl(''),
      role: new FormControl(''),
      isActive: new FormControl(true),
      roleData: new FormControl([]),
    });
  }
}
