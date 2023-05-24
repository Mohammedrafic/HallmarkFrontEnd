import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { CdkDragStart } from '@angular/cdk/drag-drop';

import { map, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { OpenPositionService } from '../../services';
import { OpenPositionsList, OpenPositionState, Positions } from '../../interface';
import { InitialDragEvent } from './open-position.constant';

@Component({
  selector: 'app-schedule-open-positions',
  templateUrl: './schedule-open-positions.component.html',
  styleUrls: ['./schedule-open-positions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleOpenPositionsComponent extends Destroyable implements OnInit {
  @Input() candidateId?: number;

  public openPositions: OpenPositionsList[];

  private previousOpenPositionState: OpenPositionsList[];

  constructor(
    private openPositionService: OpenPositionService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForOpenPositions();
  }

  public trackByPosition(_: number, position: OpenPositionsList): string {
    return position.date;
  }

  public trackByCard(_: number, card: Positions): string {
    return card.publicId;
  }

  public dragStart(event: CdkDragStart): void {
    const shiftDate = event.source.data.shiftEndTime.split('T');
    this.openPositionService.setDragEvent({
      action: true,
      date: shiftDate[0],
      candidateId: this.candidateId ?? null,
    });

    this.previousOpenPositionState = JSON.parse(JSON.stringify(this.openPositions));

    if(event.source.data.openPositions > 1) {
      this.openPositionService.updateDragElementCounter(event);
    }
  }

  public dragEnd(): void {
    this.openPositionService.setDragEvent(InitialDragEvent);
    this.openPositions = this.previousOpenPositionState;
    this.cdr.markForCheck();
  }

  private watchForOpenPositions(): void {
    this.openPositionService.getOpenPositionsStream()
      .pipe(
        map((state: OpenPositionState) => this.openPositionService.getOpenPositionsBySelectedSlots(state)),
        map((positions: OpenPositionsList[]) => this.openPositionService.prepareOpenPositions(positions, this.candidateId)),
        takeUntil(this.componentDestroy()),
      ).subscribe((positions: OpenPositionsList[]) => {
        this.openPositions = positions;
        this.cdr.markForCheck();
    });
  }
}
