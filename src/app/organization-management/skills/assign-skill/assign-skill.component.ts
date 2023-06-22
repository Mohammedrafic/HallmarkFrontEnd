import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { SkillsState } from '@organization-management/store/skills.state';
import {
  DrawNodeEventArgs, FieldsSettingsModel, NodeCheckEventArgs, TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { filter, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';

import { GetAssignedSkillTree, SaveAssignedSkillValue } from '@organization-management/store/skills.actions';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { AssignedSkillTreeItem } from '@shared/models/skill.model';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-assign-skill',
  templateUrl: './assign-skill.component.html',
  styleUrls: ['./assign-skill.component.scss'],
})
export class AssignSkillComponent extends DestroyableDirective implements OnInit, AfterViewInit {
  @Input() openSidebar: Subject<boolean>;

  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('tree') tree: TreeViewComponent;

  @Select(SkillsState.assignedSkillTree)
  public assignedSkillTree$: Observable<AssignedSkillTreeItem[]>;

  public targetElement: HTMLElement = document.body;
  public field$: Observable<FieldsSettingsModel>;

  private newSelectedNodes = new Set<HTMLElement>();

  constructor(private store: Store, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.field$ = this.assignedSkillTree$.pipe(map((dataSource) => ({
      dataSource,
      id: 'id',
      text: 'name',
      parentID: 'pid',
      hasChildren: 'hasChild',
    })));
  }

  ngAfterViewInit(): void {
    this.openSidebar
      .pipe(
        takeUntil(this.destroy$),
        tap((isOpen) => {
          if (isOpen) {
            this.store.dispatch(new GetAssignedSkillTree());
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
          filter(Boolean),
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
      const checkedNodes = this.tree.getAllCheckedNodes();
      this.store.dispatch(new SaveAssignedSkillValue(checkedNodes));
      this.clearAndClose();
    }
  }

  public dataBound(): void {
    this.tree.checkAll(this.getTreeValue());
  }

  public onChecked(event: NodeCheckEventArgs): void {
    switch (event.action) {
      case 'check':
        this.newSelectedNodes.add(event.node);
        break;
      case 'uncheck':
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
    const value = this.store.selectSnapshot(SkillsState.assignedSkillTreeValue);
    return value.map((number) => number.toString());
  }

  private clearAndClose(): void {
    this.newSelectedNodes.clear();
    this.openSidebar.next(false);
  }
}
