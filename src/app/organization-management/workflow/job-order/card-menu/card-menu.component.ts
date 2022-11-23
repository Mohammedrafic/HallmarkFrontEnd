import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkflowWithDetails } from '@shared/models/workflow.model';
import { UserPermissions } from "@core/enums";
import { Permission } from "@core/interface";


@Component({
  selector: 'app-card-menu',
  templateUrl: './card-menu.component.html',
  styleUrls: ['./card-menu.component.scss']
})
export class CardMenuComponent {
  @Input() cards: WorkflowWithDetails[];
  @Input() userPermission: Permission;
  @Output() addNewWorkflowClick = new EventEmitter;
  @Output() cardClicked = new EventEmitter;

  public readonly userPermissions = UserPermissions;

  public onAddNewWorkflowClick(): void {
    this.addNewWorkflowClick.emit();
  }

  public onCardClick(card: any): void {
    this.cardClicked.emit(card);
  }
}
