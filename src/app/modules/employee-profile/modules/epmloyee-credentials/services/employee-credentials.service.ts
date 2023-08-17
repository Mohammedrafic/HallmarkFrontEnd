import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { catchError, EMPTY, Observable } from 'rxjs';

import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { ShowToast } from 'src/app/store/app.actions';

import { EmployeeCredentialsPage, EmployeeCredentialsRequestParams } from '../interfaces';
import { EmployeeCredentialsApiService } from './employee-credentials-api.service';

@Injectable()
export class EmployeeCredentialsService {

  constructor(
    private credentialsApiService: EmployeeCredentialsApiService,
    private store: Store,
  ) { }

  getEmployeeCredentials(params: EmployeeCredentialsRequestParams): Observable<EmployeeCredentialsPage> {
    return this.credentialsApiService.getEmployeeCredentials(params)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError(error);
          return EMPTY;
        })
      );
  }

  private handleError(error: HttpErrorResponse): void {
    const errorMessage = error?.error ? getAllErrors(error.error) : 'Unknown error';
    this.store.dispatch(new ShowToast(MessageTypes.Error, errorMessage));
  }
}
