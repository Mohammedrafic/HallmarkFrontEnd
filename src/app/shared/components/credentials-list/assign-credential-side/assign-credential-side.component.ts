import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';

const stubData = [
  { id: 1, name: 'India', hasChild: true, expanded: true },
  { id: 2, pid: 1, name: 'Assam' },
  { id: 3, pid: 1, name: 'Bihar' },
  { id: 4, pid: 1, name: 'Tamil Nadu' },
  { id: 6, pid: 1, name: 'Punjab' },
  { id: 7, name: 'Brazil', hasChild: true },
  { id: 8, pid: 7, name: 'Paraná' },
  { id: 9, pid: 7, name: 'Ceará' },
  { id: 10, pid: 7, name: 'Acre' },
  { id: 11, name: 'France', hasChild: true },
  { id: 12, pid: 11, name: 'Pays de la Loire' },
  { id: 13, pid: 11, name: 'Aquitaine' },
  { id: 14, pid: 11, name: 'Brittany' },
  { id: 15, pid: 11, name: 'Lorraine' },
  { id: 16, name: 'Australia', hasChild: true },
  { id: 17, pid: 16, name: 'New South Wales' },
  { id: 18, pid: 16, name: 'Victoria' },
  { id: 19, pid: 16, name: 'South Australia' },
  { id: 20, pid: 16, name: 'Western Australia' },
  { id: 21, name: 'China', hasChild: true },
  { id: 22, pid: 21, name: 'Guangzhou' },
  { id: 23, pid: 21, name: 'Shanghai' },
  { id: 24, pid: 21, name: 'Beijing' },
  { id: 25, pid: 21, name: 'Shantou' },
];

@Component({
  selector: 'app-assign-credential-side',
  templateUrl: './assign-credential-side.component.html',
  styleUrls: ['./assign-credential-side.component.scss', '../../side-dialog/side-dialog.component.scss'],
})
export class AssignCredentialSideComponent extends DestroyableDirective implements AfterViewInit {
  @Input() openSidebar: Subject<boolean>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('tree') tree: TreeViewComponent;

  public targetElement: HTMLElement = document.body;
  public countries: Object[] = stubData;
  public field: Object = {
    dataSource: this.countries,
    id: 'id',
    text: 'name',
    parentID: 'pid',
    hasChildren: 'hasChild',
  };

  private isDirty = false;

  ngAfterViewInit(): void {
    this.openSidebar
      .pipe(
        takeUntil(this.destroy$),
        tap((isOpen) => (isOpen ? this.sideDialog.show() : this.sideDialog.hide()))
      )
      .subscribe();
  }

  public onCancel(): void {
    this.openSidebar.next(false);
  }

  public onSave(): void {}

  public dataBound(): void {
    this.tree.expandAll();
  }

  public onSelecting(): void {
    this.isDirty = true;
  }
}

