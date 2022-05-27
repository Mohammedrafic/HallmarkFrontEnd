import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkflowWithDetails } from '@shared/models/workflow.model';


@Component({
  selector: 'app-card-menu',
  templateUrl: './card-menu.component.html',
  styleUrls: ['./card-menu.component.scss']
})
export class CardMenuComponent implements OnInit {
  @Input() cards: WorkflowWithDetails[];
  @Output() addNewWorkflowClick = new EventEmitter;
  @Output() cardClicked = new EventEmitter;

  constructor() { }

  ngOnInit(): void {
  }

  public onAddNewWorkflowClick(): void {
    this.addNewWorkflowClick.emit();
  }

  public onCardClick(card: any): void {
    this.cardClicked.emit(card);
  }
}
