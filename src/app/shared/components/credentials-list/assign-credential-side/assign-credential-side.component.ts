import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { filter, map, Observable, take, takeUntil, tap } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import {
  DrawNodeEventArgs,
  FieldsSettingsModel,
  NodeCheckEventArgs,
  TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { AssignedCredentialTree } from '@shared/models/credential.model';
import {
  GetAssignedCredentialTree,
  SaveAssignedCredentialValue,
} from '@organization-management/store/credentials.actions';
import { CredentialsState } from '@organization-management/store/credentials.state';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { CredentialListService } from '@shared/components/credentials-list/services';

const TREEVIEW_FIELDS_CONFIG = {
  id: 'id',
  text: 'name',
  parentID: 'pid',
  hasChildren: 'hasChild',
};

enum NodeCheckEventArgsAction {
  check = 'check',
  uncheck = 'uncheck',
}

@Component({
  selector: 'app-assign-credential-side',
  templateUrl: './assign-credential-side.component.html',
  styleUrls: ['./assign-credential-side.component.scss', '../../side-dialog/side-dialog.component.scss'],
})
export class AssignCredentialSideComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('tree') tree: TreeViewComponent;

  @Select(CredentialsState.assignedCredentialTree)
  public assignedCredentialTree$: Observable<AssignedCredentialTree>;

  public targetElement: HTMLElement = document.body;
  public field$: Observable<FieldsSettingsModel>;

  private newSelectedNodes = new Set<HTMLElement>();

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private credentialListService: CredentialListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.field$ = this.assignedCredentialTree$.pipe(map((dataSource) => ({ dataSource, ...TREEVIEW_FIELDS_CONFIG })));
  }

  ngAfterViewInit(): void {
    this.credentialListService.getAssignCredentialModalStateStream()
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
    if (!!this.newSelectedNodes.size) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
          this.clearAndClose();
        });
    } else {
      this.clearAndClose();
    }
  }

  public onSave(): void {
    if (!!this.newSelectedNodes.size) {
      const checkeNodes = this.tree.getAllCheckedNodes();
      this.store.dispatch(new SaveAssignedCredentialValue(checkeNodes));
      this.clearAndClose();
    }
  }

  public dataBound(): void {
    this.tree.checkAll(this.getTreeValue());
  }

  public onChecked(event: NodeCheckEventArgs): void {
    switch (event.action) {
      case NodeCheckEventArgsAction.check:
        this.newSelectedNodes.add(event.node);
        break;
      case NodeCheckEventArgsAction.uncheck:
        this.newSelectedNodes.delete(event.node);
        break;

      default:
        break;
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
    return value?.map((number) => number.toString());
  }

  private clearAndClose(): void {
    this.newSelectedNodes.clear();
    this.credentialListService.setAssignCredentialModalState(false);
  }
}

