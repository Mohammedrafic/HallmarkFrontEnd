import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { WorkflowNavigationTabs } from '@organization-management/workflow/enumns';

@Component({
  selector: 'app-card-menu',
  templateUrl: './card-menu.component.html',
  styleUrls: ['./card-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardMenuComponent {
  @Input() cards: WorkflowWithDetails[];
  @Input() userPermission = true;
  @Input() selectedTab: WorkflowNavigationTabs;

  @Output() createNewWorkflowAction: EventEmitter<void> = new EventEmitter();
  @Output() selectCardAction: EventEmitter<WorkflowWithDetails> = new EventEmitter();

  public readonly navigationTabs = WorkflowNavigationTabs;

  public createNewWorkflow(): void {
    this.createNewWorkflowAction.emit();
  }

  public selectCard(card: WorkflowWithDetails): void {
    this.selectCardAction.emit(card);
  }
}
