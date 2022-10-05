import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { filter, map, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { DrawNodeEventArgs, FieldsSettingsModel, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { AssignedCredentialTree } from '@shared/models/credential.model';
import {
  GetAssignedCredentialTree,
  SaveAssignedCredentialValue,
} from '@organization-management/store/credentials.actions';
import { CredentialsState } from '@organization-management/store/credentials.state';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';

const TREEVIEW_FIELDS_CONFIG = {
  id: 'id',
  text: 'name',
  parentID: 'pid',
  hasChildren: 'hasChild',
};

@Component({
  selector: 'app-assign-credential-side',
  templateUrl: './assign-credential-side.component.html',
  styleUrls: ['./assign-credential-side.component.scss', '../../side-dialog/side-dialog.component.scss'],
})
export class AssignCredentialSideComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @Input() openSidebar: Subject<boolean>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('tree') tree: TreeViewComponent;

  @Select(CredentialsState.assignedCredentialTree)
  public assignedCredentialTree$: Observable<AssignedCredentialTree>;

  public targetElement: HTMLElement = document.body;
  public field$: Observable<FieldsSettingsModel>;

  private isDirty = false;

  constructor(private store: Store, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.field$ = this.assignedCredentialTree$.pipe(map((dataSource) => ({ dataSource, ...TREEVIEW_FIELDS_CONFIG })));
  }

  ngAfterViewInit(): void {
    this.openSidebar
      .pipe(
        takeUntil(this.destroy$),
        tap((isOpen) => {
          if (isOpen) {
            this.store.dispatch(new GetAssignedCredentialTree());
            this.sideDialog.show();
          } else {
            this.sideDialog.hide();
          }
        })
      )
      .subscribe();
  }

  public onCancel(): void {
    if (this.isDirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm) => !!confirm))
        .subscribe(() => {
          this.clearAndClose();
        });
    } else {
      this.clearAndClose();
    }
  }

  public onSave(): void {
    if (this.isDirty) {
      const checkeNodes = this.tree.getAllCheckedNodes();
      this.store.dispatch(new SaveAssignedCredentialValue(checkeNodes));
      this.openSidebar.next(false);
    }
  }

  public dataBound(): void {
    this.tree.checkAll(this.getTreeValue());
  }

  public onSelecting(event: {node: HTMLElement}): void {
    if (!event.node.classList.contains('e-level-1')) {
      this.tree.checkAll([event.node])
      this.isDirty = true;
    }
  }

  public drawNode(args: DrawNodeEventArgs): void {
    if (!args.nodeData['isAssignable']) {
      const elem = args.node.querySelector('.e-checkbox-wrapper') as HTMLElement;
      elem.classList.add('e-checkbox-disabled');
    }
  }

  private getTreeValue(): string[] {
    const value = this.store.selectSnapshot(CredentialsState.assignedCredentialTreeValue);
    return value.map((number) => number.toString());
  }

  private clearAndClose(): void {
    this.isDirty = false;
    this.openSidebar.next(false);
  }
}

