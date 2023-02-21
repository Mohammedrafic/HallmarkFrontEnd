import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { CHANGES_SAVED } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { Observable,tap } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';
import { OrientationSetting } from '../models/orientation.model';

@Injectable()
export class OrientationService {
  constructor(
    private store: Store,
    private http: HttpClient,
  ) {}

  public saveOrientation(params: any): void {
    
  }

  public getOrientationSetting(): Observable<OrientationSetting> {
    return this.http.get<OrientationSetting>('/api/OrientationSettings');
  }

  public saveOrientationSetting(setting: OrientationSetting): Observable<void> {
    return this.http.post<void>('/api/OrientationSettings', setting).pipe(tap(() => {
      this.store.dispatch(new ShowToast(MessageTypes.Success, CHANGES_SAVED));
    }));
  }
}