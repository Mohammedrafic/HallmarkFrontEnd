import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError, EMPTY, filter, map, Observable, tap } from 'rxjs';
import { Store } from '@ngxs/store';
import { SortChangedEvent } from '@ag-grid-community/core';

import { formatTimeWithSecond } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { OpenJobApiService } from './open-job-api.service';
import { OpenJobsAdapter } from '../adapters';
import { FiltersState, LtaEmployeeDto, OpenJob, OpenJobPage, PerDiemEmployeeDto } from '../interfaces';
import { OrderJobType } from '../enums';
import { AppliedMessage, AppliedWorkflowStep, AvailabilityScheduleType } from '../constants';
import { GetLocalDate } from '../helpers';
import { ShowToast } from '../../../store/app.actions';
import { JobFilterService } from './job-filter.service';

@Injectable()
export class EmployeeService {
  constructor(
    private openJobApiService: OpenJobApiService,
    private store: Store,
    private jobFilterService: JobFilterService
    ) {}

  public sortEmployeeGrid(event: SortChangedEvent): void {
    const columnWithSort = event.columnApi.getColumnState().find((col) => col.sort !== null);
    const orderBy = columnWithSort ? {orderBy: `${columnWithSort.colId} ${columnWithSort.sort}`} : {orderBy: null};

    this.jobFilterService.setFilters(orderBy);
  }

  public getOpenJobs(filters: FiltersState): Observable<OpenJobPage> {
    return this.openJobApiService.getOpenJobsPage(filters).pipe(
      filter((openJobPage: OpenJobPage) => !!openJobPage),
      map((openJobPage: OpenJobPage) => OpenJobsAdapter.adaptOpenJobPage(openJobPage)),
    );
  }

  public applyEmployee(job: OpenJob): Observable<void | Error> {
    const action = this.getEmployeeAction(job);

    return action.pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      tap(() => {
        this.setSuccessResponse();
      }),
    );
  }

  private getEmployeeAction(job: OpenJob): Observable<void> {
    const employeeDto = this.createEmployeeDto(job);

    if (job.orderType === OrderJobType.LTA) {
      return this.openJobApiService.applyLtaEmployee(employeeDto as LtaEmployeeDto);
    }

    return this.openJobApiService.applyPerDiemEmployee(employeeDto as PerDiemEmployeeDto);
  }

  private setSuccessResponse(): void {
    const filters = this.jobFilterService.getFilters();
    this.jobFilterService.setFilters(filters);
    this.store.dispatch(new ShowToast(MessageTypes.Success, AppliedMessage));
  }

  private createEmployeeDto(job: OpenJob): LtaEmployeeDto | PerDiemEmployeeDto {
    if (job.orderType === OrderJobType.LTA) {
      return {
        employeeId: job.employeeId,
        orderId: job.id,
        workflowStepType: AppliedWorkflowStep,
      };
    }

    return {
      employeeScheduledDays: [{
          employeeId: job.employeeId,
          dates: [ job.startDate ],
      }],
      userLocalTime: GetLocalDate(),
      scheduleType: AvailabilityScheduleType,
      startTime: formatDate(job.shiftStartDateTime, formatTimeWithSecond, 'en-US', 'UTC'),
      endTime: formatDate(job.shiftEndDateTime, formatTimeWithSecond, 'en-US', 'UTC'),
      shiftId: null,
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never | Error> {
    if(error.error) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      return error.error;
    }

    return EMPTY;
  }
}
