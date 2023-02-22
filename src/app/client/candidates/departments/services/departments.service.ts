import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Store } from '@ngxs/store';
import { catchError, EMPTY, Observable, Subject } from 'rxjs';

import { SideDialogTitleEnum } from '../side-dialog-title.enum';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import {
  AssignNewDepartment,
  DepartmentFilterState,
  DepartmentsPage,
  EditAssignedDepartment,
} from '@client/candidates/departments/departments.model';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { GRID_CONFIG } from '@shared/constants';
import { DateTimeHelper } from '@core/helpers';

@Injectable()
export class DepartmentsService {
  private sideDialogTitle$: Subject<SideDialogTitleEnum> = new Subject<SideDialogTitleEnum>();

  private baseUrl = '/api/EmployeeAssignedDepartment';

  public constructor(private http: HttpClient, private store: Store, private candidatesService: CandidatesService) {}

  public getSideDialogTitle$(): Observable<string> {
    return this.sideDialogTitle$.asObservable();
  }

  public setSideDialogTitle(title: SideDialogTitleEnum): void {
    this.sideDialogTitle$.next(title);
  }

  public getDepartmentsAssigned(filters?: DepartmentFilterState | null): Observable<DepartmentsPage> {
    const params = {
      pageNumber: GRID_CONFIG.initialPage,
      pageSize: GRID_CONFIG.initialRowsPerPage,
      employeeId: this.candidatesService.employeeId,
      ...(filters && filters),
    };

    return this.http.post<DepartmentsPage>(`${this.baseUrl}/GetAll`, params).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public deleteAssignedDepartments(departmentIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/delete`, departmentIds).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public editAssignedDepartments(
    formData: EditAssignedDepartment,
    departmentIds: number[]
  ): Observable<EditAssignedDepartment> {
    const { startDate, endDate, homeCostCenter, orientedStartDate, isOriented, employeeWorkCommitmentId } = formData;
    const payload = {
      employeeWorkCommitmentId: employeeWorkCommitmentId,
      startDate: startDate && DateTimeHelper.toUtcFormat(startDate),
      endDate: endDate && DateTimeHelper.toUtcFormat(endDate),
      ids: departmentIds,
      ...(orientedStartDate && { orientedStartDate: DateTimeHelper.toUtcFormat(orientedStartDate) }),
      ...(homeCostCenter && { homeCostCenter }),
      ...(isOriented && { isOriented }),
    };

    return this.http.put<EditAssignedDepartment>(`${this.baseUrl}`, payload).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public assignNewDepartment(formData: AssignNewDepartment): Observable<AssignNewDepartment> {
    const { regionId, locationId, departmentId, startDate, endDate } = formData;
    const payload = {
      regionId: regionId,
      locationId: locationId,
      departmentId: departmentId,
      startDate: startDate && DateTimeHelper.toUtcFormat(startDate),
      endDate: endDate && DateTimeHelper.toUtcFormat(endDate),
    };

    return this.http.post<AssignNewDepartment>(`${this.baseUrl}`, payload).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public getAssignedDepartmentHierarchy(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/hierarchy/${id}`)
  }
}
