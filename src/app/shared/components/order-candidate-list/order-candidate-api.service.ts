import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EMPTY, map, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { IrpOrderCandidate, IrpOrderCandidateDto, OrderCandidateJob } from '@shared/models/order-management.model';
import { PageOfCollections } from '@shared/models/page.model';
import { AdaptIrpCandidates } from './order-candidate-list.utils';
import {
  CancelIrpCandidateDto,
  CandidateDetails,
  ClosePositionDto,
  CreateIrpCandidateDto,
  JobDetailsDto,
  UpdateIrpCandidateDto,
} from '@shared/components/order-candidate-list/interfaces';
import { ShowToast } from '../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { GetQueryParams } from '@core/helpers';

@Injectable()
export class OrderCandidateApiService {
  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getIrpCandidates(orderId: number): Observable<PageOfCollections<IrpOrderCandidate>> {
    return this.http.get<PageOfCollections<IrpOrderCandidateDto>>(`/api/IRPOrders/${orderId}/candidates`)
    .pipe(
      map((response) => AdaptIrpCandidates(response))
    );
  }

  getIrpCandidateDetails(orderId: number, employeeId: number): Observable<CandidateDetails> {
    return this.http.get<CandidateDetails>(`/api/IRPApplicants/applicantInitData`, {
      params: {
        orderId: orderId,
        employeeId: employeeId,
      },
    });
  }

  cancelIrpCandidate(payload: CancelIrpCandidateDto): Observable<void> {
    return this.http.post<void>('/api/IRPApplicants/cancel', payload);
  }

  updateIrpCandidate(payload: UpdateIrpCandidateDto): Observable<void> {
    return this.http.put<void>('/api/IRPApplicants/update', payload);
  }

  createIrpCandidate(payload: CreateIrpCandidateDto): Observable<void> {
    return this.http.post<void>('/api/IRPApplicants/create', payload);
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));

    return EMPTY;
  }

  closeIrpPosition(payload: ClosePositionDto): Observable<void> {
    return this.http.post<void>('/api/AppliedCandidates/closePosition', payload);
  }

  getPositionDetails(jobDetails: JobDetailsDto): Observable<OrderCandidateJob> {
    return this.http.get<OrderCandidateJob>('/api/AppliedCandidates/candidateJob', {
      params: GetQueryParams<JobDetailsDto>(jobDetails),
    });
  }
}
