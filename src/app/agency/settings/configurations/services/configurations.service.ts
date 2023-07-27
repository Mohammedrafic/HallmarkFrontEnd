import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, catchError, of, tap } from 'rxjs';
import { Store } from '@ngxs/store';
import { Configuration, ConfigurationDTO } from '@shared/models/organization-settings.model';
import { Injectable } from '@angular/core';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_MODIFIED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';

@Injectable()
export class ConfigurationsService {
  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  public getAllConfigurations(): Observable<Configuration[]> {
    return this.http.get<Configuration[]>(`/api/AgencySettings/All`);
  }

  public saveConfiguration(payload: ConfigurationDTO): Observable<void> {
    return this.http.post<void>(`/api/AgencySettings`, payload)
            .pipe(
              tap(() => {
                this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
              }),
              catchError((error: HttpErrorResponse) => {
                return this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
              }),
            );
  }
}
