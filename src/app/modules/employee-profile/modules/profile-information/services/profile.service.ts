import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { catchError, EMPTY, map, Observable, of } from 'rxjs';

import { DropdownOption } from '@core/interface';
import { sortBy } from '@shared/helpers/sort-array.helper';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { COUNTRIES } from '@shared/constants/countries-list';
import { ShowToast } from 'src/app/store/app.actions';

import { ProfileInformationAdapter } from '../adapters/profile-information.adapter';
import { AssignedSkillDTO, EmployeeDTO } from '../interfaces';
import { ProfileApiService } from './profile-api.service';

@Injectable()
export class ProfileService {

  constructor(
    private profileApiService: ProfileApiService,
    private store: Store,
  ) { }

  getEmployee(id: number): Observable<EmployeeDTO> {
    return this.profileApiService.getEmployee(id)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          return EMPTY;
        })
      );
  }

  getAssignedSkills(): Observable<DropdownOption[]> {
    return this.profileApiService.getAssignedSkills()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          return of([]);
        }),
        map((response) => ProfileInformationAdapter.adaptAssignedSkills(response as AssignedSkillDTO[])),
      );
  }

  getCountries(): DropdownOption[] {
    return ProfileInformationAdapter.adaptCountries(COUNTRIES);
  }

  getStates(): Observable<string[]> {
    return this.profileApiService.getStates()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          return of([]);
        }),
        map((data) => sortBy(data as string[])),
      );
  }

  getEmployeePhoto(id: number): Observable<Blob> {
    return this.profileApiService.getEmployeePhoto(id)
      .pipe(catchError(() => EMPTY));
  }

  private handleError(error: HttpErrorResponse): void {
    const errorMessage = error?.error ? getAllErrors(error.error) : 'Unknown error';
    this.store.dispatch(new ShowToast(MessageTypes.Error, errorMessage));
  }
}
