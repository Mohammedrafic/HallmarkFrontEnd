import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngxs/store';
import { Resolve } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { SetAgencyVisibilityFlag } from 'src/app/security/store/security.actions';

@Injectable({ providedIn: 'root' })
export class AgencyVisibilityFlagResolverService implements Resolve<boolean> {
  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  /**
   * Resolver designed to work only with one feature flag,
   * can be easly modified to use multiple flags.
   */
  resolve(): Observable<boolean> {
    return this.http.get<boolean>(`/api/FeaturesConfiguration/IsEnabled/AgencyVisibility`)
    .pipe(
      tap((value) => {
        this.store.dispatch(new SetAgencyVisibilityFlag(value));
      }),
    );
  }
}