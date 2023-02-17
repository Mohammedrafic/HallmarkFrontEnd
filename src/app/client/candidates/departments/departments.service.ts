import { catchError, EMPTY, Observable, of, Subject } from 'rxjs';
import { SideDialogTitleEnum } from './side-dialog-title.enum';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ShowToast } from '../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { Store } from '@ngxs/store';
import {
  AssignNewDepartment,
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

  public getDepartmentsAssigned(): Observable<DepartmentsPage> {
    const params = {
      pageNumber: GRID_CONFIG.initialPage,
      pageSize: GRID_CONFIG.initialRowsPerPage,
      employeeId: this.candidatesService.employeeId,
    };
    const endpoint = '/api/EmployeeAssignedDepartment/GetAll';

    return this.http.post<DepartmentsPage>(endpoint, params).pipe(
      catchError((errorResponse: HttpErrorResponse) => {
        this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(errorResponse.error)));
        return EMPTY;
      })
    );
  }

  public editAssignedDepartments(formData: EditAssignedDepartment, departmentIds: number[]): Observable<EditAssignedDepartment> {
    const payload = this.createDepartmentPayload(formData, departmentIds);
    //TODO implement HTTP request after providing endpoint on BE  
    return of(payload);
  }

  public assignNewDepartment(formData: AssignNewDepartment): Observable<AssignNewDepartment> {
    const payload = this.createDepartmentPayload(formData);
    //TODO implement HTTP request after providing endpoint on BE  
    return of(payload);
  }

  private createDepartmentPayload(formData: any, departmentIds?: number[]): any {
    if (departmentIds) {
      return {
        startDate: DateTimeHelper.toUtcFormat(formData.startDate),
        endDate: formData.endDate && DateTimeHelper.toUtcFormat(formData.endDate),
        assignedDepartmentIds: departmentIds,
      };
    } else {
      return {
        regionId: formData.region,
        locationId: formData.location,
        departmentId: formData.department,
        startDate: DateTimeHelper.toUtcFormat(formData.startDate),
        endDate: formData.endDate && DateTimeHelper.toUtcFormat(formData.endDate),
      };
    }
  }
}
