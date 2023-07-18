import { Injectable } from '@angular/core';
import { BaseObservable } from '@core/helpers';

import { Observable } from 'rxjs';

import { WorkflowWithDetails } from '@shared/models/workflow.model';

@Injectable()
export class WorkflowStateService {
  private readonly selectedCard: BaseObservable<WorkflowWithDetails | null> =
    new BaseObservable<WorkflowWithDetails | null>(null);

  public getSelectedCard(): WorkflowWithDetails | null {
    return this.selectedCard.get();
  }

  public setSelectedCard(card: WorkflowWithDetails): void {
    this.selectedCard.set(card);
  }

  public getCardStream(): Observable<WorkflowWithDetails | null> {
    return this.selectedCard.getStream();
  }

  public unselectCards(card: WorkflowWithDetails[]): WorkflowWithDetails[] {
    return card.map((flow: WorkflowWithDetails) => {
      flow.isActive = false;
      return flow;
    });
  }
}
