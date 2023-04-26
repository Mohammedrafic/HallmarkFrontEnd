import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { filter, map, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { OpenPositionService } from '../../services';
import { OpenPositionsList, OpenPositionState, Positions } from '../../interface';

@Component({
  selector: 'app-schedule-open-positions',
  templateUrl: './schedule-open-positions.component.html',
  styleUrls: ['./schedule-open-positions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleOpenPositionsComponent extends Destroyable implements OnInit {
  public openPositions: OpenPositionsList[];

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

  private watchForOpenPositions(): void {
    this.openPositionService.getOpenPositionsStream()
      .pipe(
        filter((state: OpenPositionState) => !!state.initialPositions.length),
        map((state: OpenPositionState) => this.openPositionService.getOpenPositionsBySelectedSlots(state)),
        map((positions: OpenPositionsList[]) => this.openPositionService.prepareOpenPositions(positions)),
        takeUntil(this.componentDestroy()),
      ).subscribe((positions: OpenPositionsList[]) => {
        this.openPositions = positions;
        this.cdr.markForCheck();
    });
  }
}
