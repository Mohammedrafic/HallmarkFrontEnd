import { Injectable } from '@angular/core';
import { CdkDragDrop, CdkDragStart } from '@angular/cdk/drag-drop';

import { Store } from '@ngxs/store';
import { distinctUntilChanged, EMPTY, Observable } from 'rxjs';

import { BaseObservable, DateTimeHelper } from '@core/helpers';
import { MessageTypes } from '@shared/enums/message-types';
import { getTime } from '@shared/utils/date-time.utils';
import {
  DroppedEvent,
  OpenPositionsList,
  OpenPositionState,
  PositionDragEvent,
  Positions,
  ScheduleBook,
} from '../interface';
import {
  DifferentEmployee,
  InitialDragEvent,
  InitialPositionState,
  MissingMatchDate,
} from '../components/schedule-open-positions';
import { ScheduleAttributeKeys } from '../enums';
import { ShowToast } from '../../../store/app.actions';
import { ScheduleApiService } from './schedule-api.service';
import {
  BookingsOverlapsRequest,
  BookingsOverlapsResponse,
} from '../components/replacement-order-dialog/replacement-order.interface';
import { ScheduleFiltersService } from './schedule-filters.service';


@Injectable()
export class OpenPositionService {
  private readonly openPositionsState: BaseObservable<OpenPositionState> =
    new BaseObservable<OpenPositionState>(InitialPositionState);
  private readonly dragEvent: BaseObservable<PositionDragEvent> = new BaseObservable<PositionDragEvent>(InitialDragEvent);

  constructor(
    private store: Store,
    private scheduleApiService: ScheduleApiService,
    private scheduleFiltersService: ScheduleFiltersService,
  ) {}

  public setDragEvent(event: PositionDragEvent): void {
    this.dragEvent.set(event);
  }

  public getDragEventStream(): Observable<PositionDragEvent> {
    return this.dragEvent.getStream().pipe(
      distinctUntilChanged((previous: PositionDragEvent, current: PositionDragEvent) => {
        return previous.date === current.date;
      })
    );
  }

  public updateDragElementCounter(event: CdkDragStart): void {
    const positionIndex = event.source.dropContainer.data.findIndex((element: Positions) => {
      return element.orderId === event.source.data.orderId;
    });

    if(positionIndex !== -1) {
      event.source.dropContainer.data.splice(positionIndex + 1, 0, {
        ...event.source.data,
        openPositions: event.source.data.openPositions - 1,
      });
    }
  }

  public setOpenPosition(key: 'shiftTime' | 'initialPositions', value: OpenPositionsList[] | string | null): void {
    this.openPositionsState.set({
      ...this.openPositionsState.get(),
      [key]: value,
    });
  }

  public clearOpenPositionState(): void {
    this.openPositionsState.set(InitialPositionState);
  }

  public getOpenPositionsStream(): Observable<OpenPositionState> {
    return this.openPositionsState.getStream();
  }

  public getOpenPositionsBySelectedSlots(state: OpenPositionState): OpenPositionsList[] {
    if(state.shiftTime) {
      const [startTime, endTime] = state.shiftTime.split('/');

      return [...this.openPositionsState.get().initialPositions].map((openPositions: OpenPositionsList) => {
        const filteredPositions = this.getFilteredPositions(openPositions.positions, startTime,endTime);
        const totalPositions = filteredPositions?.reduce((acc: number, current: Positions) => {
          return acc + current.openPositions;
        }, 0) || 0;

        return {
          ...openPositions,
          totalOpenPositions: totalPositions,
          positions: filteredPositions,
        };
      }).flat();
    }

    return state.initialPositions;
  }

  public prepareOpenPositions(openPositions: OpenPositionsList[], candidateId?: number): OpenPositionsList[] {
    return openPositions.map((openPosition: OpenPositionsList) => {
      return {
        ...openPosition,
        positions: openPosition.positions.map((position: Positions) => {
          return {
            ...position,
            attributes: this.createAttributes(position),
            candidateId,
          };
        }),
      };
    });
  }

  public createPositionBookDto(event: CdkDragDrop<DroppedEvent>): ScheduleBook {
    const scheduleFiltersData = this.scheduleFiltersService.getScheduleFiltersData();
    return {
      employeeBookedDays: [{
        employeeId: event.container.data.scheduleItem.candidate.id,
        bookedDays: [event.container.data.dateItem],
      }],
      perDiemOrderId: event.item.data.orderId ?? null,
      departmentId: scheduleFiltersData?.filters?.departmentsIds ? scheduleFiltersData?.filters?.departmentsIds[0] : '',
      skillId: scheduleFiltersData?.filters?.skillIds ? scheduleFiltersData?.filters?.skillIds[0] : null,
      shiftId: event.item.data.shiftId,
      startTime: getTime(DateTimeHelper.setCurrentUtcDate(event.item.data.shiftStartTime)),
      endTime: getTime(DateTimeHelper.setCurrentUtcDate(event.item.data.shiftEndTime)),
      createOrder: false,
      orientated: event.item.data.attributes?.orientated ?? false,
      critical: event.item.data.attributes?.critical ?? false,
      onCall: event.item.data.attributes?.onCall ??false,
      charge: event.item.data.attributes?.charge ?? false,
      preceptor: event.item.data.attributes?.preceptor ?? false,
      meal: event.item.data.attributes?.meal ?? false,
    };
  }

  public dropElementToDropList(event: CdkDragDrop<DroppedEvent>): Observable<BookingsOverlapsResponse[]> {
    if(event.isPointerOverContainer) {
      const containerCandidateId = event.container.data.scheduleItem.candidate.id;
      const dragElementCandidateId = event.item.data.candidateId;
      const containerData = event.container.data.dateItem;
      const dragElementData = event.item.data.shiftEndTime.split('T')[0];

      if (dragElementCandidateId && dragElementCandidateId !== containerCandidateId) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, DifferentEmployee));
        return EMPTY;
      }

      if(containerData  !== dragElementData) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, MissingMatchDate));
        return EMPTY;
      }

      const request = this.createOverlapsRequest(event);

      return this.scheduleApiService.checkBookingsOverlaps(request);
    }

    return EMPTY;
  }

  private createOverlapsRequest(event: CdkDragDrop<DroppedEvent>): BookingsOverlapsRequest {
    return {
      employeeScheduledDays: [
        {
          employeeId: event.container.data.scheduleItem.candidate.id,
          bookedDays: [event.container.data.dateItem],
        },
      ],
      shiftId: event.item.data.shiftId,
      startTime: getTime(DateTimeHelper.setCurrentUtcDate(event.item.data.shiftStartTime)),
      endTime: getTime(DateTimeHelper.setCurrentUtcDate(event.item.data.shiftEndTime)),
    };
  }

  private getFormattedShiftTime(date: string, isFormatted = true): string {
    if(isFormatted) {
     return date.split('T')[1];
    }

    return DateTimeHelper.setUtcTimeZone(date).split('T')[1];
  }

  private createAttributes(position: Positions): string {
    const attributes = [];

    if(position.onCall) {
      attributes.push(ScheduleAttributeKeys.OC);
    }

    if(position.critical) {
      attributes.push(ScheduleAttributeKeys.CRT);
    }

    return attributes.length ? attributes.join(',') : '';
  }

  private getFilteredPositions(positions: Positions[], startTime: string, endTime: string): Positions[] {
    return positions.filter((position: Positions) => {
      return this.getFormattedShiftTime(position.shiftStartTime, false) === this.getFormattedShiftTime(startTime) &&
        this.getFormattedShiftTime(position.shiftEndTime, false) === this.getFormattedShiftTime(endTime);
    });
  }
}
