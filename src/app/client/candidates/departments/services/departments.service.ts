import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Store } from '@ngxs/store';
import { catchError, EMPTY, Observable, of, Subject } from 'rxjs';

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

  public constructor(private http: HttpClient, private store: Store, private candidatesService: CandidatesService) {}

  public getSideDialogTitle$(): Observable<string> {
    return this.sideDialogTitle$.asObservable();
  }

  public setSideDialogTitle(title: SideDialogTitleEnum): void {
    this.sideDialogTitle$.next(title);
  }

  public getDepartmentsAssigned(filters?: DepartmentFilterState): Observable<DepartmentsPage> {
    const params = {
      pageNumber: GRID_CONFIG.initialPage,
      pageSize: GRID_CONFIG.initialRowsPerPage,
      employeeId: this.candidatesService.employeeId,
      ...(filters && filters),
    };
    const endpoint = '/api/EmployeeAssignedDepartment/GetAll';

    return this.http.post<DepartmentsPage>(endpoint, params).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public deleteAssignedDepartments(departmentIds: number[]): Observable<void> {
    //TODO implement HTTP request after providing endpoint on BE
    return of();
  }

  public editAssignedDepartments(
    formData: EditAssignedDepartment,
    departmentIds: number[]
  ): Observable<EditAssignedDepartment> {
    const { oriented, homeCostCenter, orientedStartDate } = formData;
    const payload = {
      startDate: formData.startDate && DateTimeHelper.toUtcFormat(formData.startDate),
      endDate: formData.endDate && DateTimeHelper.toUtcFormat(formData.endDate),
      assignedDepartmentIds: departmentIds,
      ...(orientedStartDate && { orientedStartDate: DateTimeHelper.toUtcFormat(orientedStartDate) }),
      ...(homeCostCenter && { homeCostCenter }),
      ...(oriented && { oriented }),
    };

    //TODO implement HTTP request after providing endpoint on BE
    return of(payload);
  }

  public assignNewDepartment(formData: AssignNewDepartment): Observable<AssignNewDepartment> {
    const payload = {
      regionId: formData.regionId,
      locationId: formData.locationId,
      departmentId: formData.departmentId,
      startDate: DateTimeHelper.toUtcFormat(formData.startDate),
      endDate: formData.endDate && DateTimeHelper.toUtcFormat(formData.endDate),
    };

    //TODO implement HTTP request after providing endpoint on BE
    return of(payload);
  }
}
