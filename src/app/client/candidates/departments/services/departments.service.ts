import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Store } from '@ngxs/store';
import { catchError, Observable, Subject, switchMap, throwError, filter } from 'rxjs';

import { SideDialogTitleEnum } from '../side-dialog-title.enum';
import {
  DepartmentFilterState,
  DepartmentHierarchy,
  DepartmentPayload,
  DepartmentsPage,
} from '@client/candidates/departments/departments.model';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { ASSIGN_HOME_COST_CENTER, GRID_CONFIG, WARNING_TITLE } from '@shared/constants';
import { DepartmentHelper } from '../helpers/department.helper';
import { ConfirmService } from '@shared/services/confirm.service';
import { handleHttpError } from '@core/operators';

@Injectable()
export class DepartmentsService {
  private sideDialogTitle$: Subject<SideDialogTitleEnum> = new Subject<SideDialogTitleEnum>();

  private baseUrl = '/api/EmployeeAssignedDepartment';

  public employeeWorkCommitmentId: number;
  public showAllDepartments = false;

  public constructor(
    private http: HttpClient,
    private store: Store,
    private candidatesService: CandidatesService,
    private confirmService: ConfirmService
  ) {}

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
      ...(!this.showAllDepartments && { employeeWorkCommitmentId: this.employeeWorkCommitmentId }),
      ...(filters && filters),
    };

    return this.http.post<DepartmentsPage>(`${this.baseUrl}/GetAll`, params).pipe(handleHttpError(this.store));
  }

  public deleteAssignedDepartments(
    departmentIds: number[] | null,
    filters: DepartmentFilterState | null
  ): Observable<void> {
    const params = {
      ids: departmentIds,
      employeeWorkCommitmentId: this.showAllDepartments ? null : this.employeeWorkCommitmentId,
      employeeId: this.candidatesService.employeeId,
      ...(filters && filters),
    };
    return this.http.post<void>(`${this.baseUrl}/delete`, params).pipe(handleHttpError(this.store));
  }

  public editAssignedDepartments(
    formData: DepartmentPayload,
    departmentIds: number[] | null,
    filters?: DepartmentFilterState | null,
    createReplacement?: boolean,
  ): Observable<DepartmentPayload> {
    const payload = DepartmentHelper.editDepartmentPayload(
      formData,
      departmentIds,
      this.employeeWorkCommitmentId,
      this.candidatesService.employeeId as number,
      this.showAllDepartments,
      filters,
      createReplacement,
    );
    return this.editDepartment(payload).pipe(handleHttpError(this.store));
  }

  public assignNewDepartment(formData: DepartmentPayload): Observable<DepartmentPayload> {
    const payload = DepartmentHelper.newDepartmentPayload(formData, this.employeeWorkCommitmentId);
    return this.addDepartment(payload).pipe(handleHttpError(this.store));
  }

  public getAssignedDepartmentHierarchy(id: number): Observable<DepartmentHierarchy> {
    return this.http.get<DepartmentHierarchy>(`${this.baseUrl}/hierarchy/${id}`);
  }

  private handleHomeCostCenter<T>(source: Observable<T>): Observable<T> {
    return this.confirmService
      .confirm(ASSIGN_HOME_COST_CENTER, {
        title: WARNING_TITLE,
        okButtonLabel: 'Yes',
        okButtonClass: 'ok-button',
      })
      .pipe(filter(Boolean))
      .pipe(switchMap(() => source));
  }

  private editDepartment(payload: DepartmentPayload): Observable<DepartmentPayload> {
    return this.http.put<DepartmentPayload>(`${this.baseUrl}`, payload).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        const forceUpdate = errorResponse.error['errors'].ForceUpdate && errorResponse.error.status === 400;
        return forceUpdate
          ? this.handleHomeCostCenter(
              this.http.put<DepartmentPayload>(`${this.baseUrl}`, { ...payload, forceUpdate: true })
            )
          : throwError(() => errorResponse);
      })
    );
  }

  private addDepartment(payload: DepartmentPayload): Observable<DepartmentPayload> {
    return this.http.post<DepartmentPayload>(`${this.baseUrl}`, payload).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        const forceUpdate = errorResponse.error['errors'].ForceUpdate && errorResponse.error.status === 400;
        return forceUpdate
          ? this.handleHomeCostCenter(
              this.http.post<DepartmentPayload>(`${this.baseUrl}`, { ...payload, forceUpdate: true })
            )
          : throwError(() => errorResponse);
      })
    );
  }
}
