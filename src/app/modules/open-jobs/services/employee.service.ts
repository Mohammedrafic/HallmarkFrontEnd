import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { catchError, EMPTY, filter, map, Observable, tap } from 'rxjs';
import { Store } from '@ngxs/store';
import { SortChangedEvent } from '@ag-grid-community/core';

import { BaseObservable } from '@core/helpers';
import { OpenJob, OpenJobPage } from '@shared/models';
import { OrderJobType } from '@shared/enums';
import { GetLocalDate } from '@shared/helpers';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { OpenJobApiService } from './open-job-api.service';
import { OpenJobsAdapter } from '../adapters';
import {
  FiltersState,
  LtaEmployeeDto,
  PerDiemEmployeeDto,
  UpdateLtaEmployeeDTO,
  WithdrawPerDiemEmployeeDto,
} from '../interfaces';
import { ShowToast } from '../../../store/app.actions';
import { JobFilterService } from './job-filter.service';
import { UserState } from 'src/app/store/user.state';
import { EmployeeWorkflowStep } from '../enums';
import { JobMessages } from '../constants';

@Injectable()
export class EmployeeService {
  private employeeDetailsEvent: BaseObservable<OpenJob | null> = new BaseObservable<OpenJob | null>(null);

  constructor(
    private openJobApiService: OpenJobApiService,
    private store: Store,
    private jobFilterService: JobFilterService
  ) {}

  public setEmployeeDetailsEvent(job: OpenJob | null): void {
    this.employeeDetailsEvent.set(job);
  }

  getEmployeeDetailsEventStream(): Observable<OpenJob | null> {
    return this.employeeDetailsEvent.getStream();
  }

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

  public acceptEmployee(job: OpenJob): Observable<void | Error> {
    return this.openJobApiService.updateLtaEmployee({
      organizationId: this.organizationId,
      jobId: job.jobId as number,
      actualStartDate: job.startDate,
      actualEndDate: job.endDate,
      availableStartDate: job.startDate,
      workflowStepType: EmployeeWorkflowStep.AcceptWorkflowStep,
      orderId: job.id,
      employeeTime: GetLocalDate(),
    }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      tap(() => {
        this.setSuccessResponse(JobMessages.acceptMessage);
      }),
    );
  }

  public rejectEmployee(job: OpenJob): Observable<void | Error> {
    return this.openJobApiService.rejectEmployee({
      organizationId: this.organizationId,
      employeeId: job.jobId as number,
    }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      tap(() => {
        this.setSuccessResponse(JobMessages.rejectMessage);
      }),
    );
  }

  public applyEmployee(job: OpenJob): Observable<void | Error> {
    const action = this.getEmployeeAction(job);

    return action.pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      tap(() => {
        this.setSuccessResponse(JobMessages.appliedMessage);
      }),
    );
  }

  public withdrawEmployee(job: OpenJob): Observable<void | Error> {
    const action = this.getEmployeeWithdrawAction(job);

    return action.pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error)),
      tap(() => {
        this.setSuccessResponse(JobMessages.withdrawnMessage);
      }),
    );
  }

  private get organizationId(): number {
    return this.store.selectSnapshot(UserState.lastSelectedOrganizationId) as number;
  }

  private getEmployeeWithdrawAction(job: OpenJob): Observable<void> {

    const employeeWithdrawDto = this.createEmployeeWithdrawDto(job);

    if (job.orderType === OrderJobType.LTA) {
      return this.openJobApiService.updateLtaEmployee(employeeWithdrawDto as UpdateLtaEmployeeDTO);
    } else if (job.orderType === OrderJobType.PerDiem) {
      return this.openJobApiService.withdrawPerDiemEmployee(employeeWithdrawDto as WithdrawPerDiemEmployeeDto);
    }

    return EMPTY;
  }

  private getEmployeeAction(job: OpenJob): Observable<void> {
    const employeeDto = this.createEmployeeDto(job);

    if (job.orderType === OrderJobType.LTA && job.jobId) {
      return this.openJobApiService.updateLtaEmployee(employeeDto as UpdateLtaEmployeeDTO);
    } else if (job.orderType === OrderJobType.LTA) {
      return this.openJobApiService.applyLtaEmployee(employeeDto as LtaEmployeeDto);
    }

    return this.openJobApiService.applyPerDiemEmployee(employeeDto as PerDiemEmployeeDto);
  }

  private setSuccessResponse(message: string): void {
    const filters = this.jobFilterService.getFilters();
    this.jobFilterService.setFilters(filters);
    this.store.dispatch(new ShowToast(MessageTypes.Success, message));
  }

  private createEmployeeDto(job: OpenJob): LtaEmployeeDto | PerDiemEmployeeDto | UpdateLtaEmployeeDTO {

    if (job.orderType === OrderJobType.LTA && job.jobId) {
      return {
        jobId: job.jobId as number,
        orderId: job.id,
        organizationId: this.organizationId,
        workflowStepType: EmployeeWorkflowStep.AppliedWorkflowStep,
        employeeTime: GetLocalDate(),
      };
    } else if (job.orderType === OrderJobType.LTA) {
      return {
        employeeId: job.employeeId,
        orderId: job.id,
        workflowStepType: EmployeeWorkflowStep.AppliedWorkflowStep,
      };
    }

    return {
      orderId: job.id,
      employeeTime: GetLocalDate(),
    };
  }

  private createEmployeeWithdrawDto(job: OpenJob): UpdateLtaEmployeeDTO | WithdrawPerDiemEmployeeDto {

    if (job.orderType === OrderJobType.LTA) {
      return {
        jobId: job.jobId as number,
        orderId: job.id,
        organizationId: this.organizationId,
        workflowStepType: EmployeeWorkflowStep.WithdrawnWorkflowStep,
        employeeTime: GetLocalDate(),
      };
    }

    return {
      orderId: job.id,
      employeeTime: GetLocalDate(),
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
