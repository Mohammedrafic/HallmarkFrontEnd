import { Inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, catchError } from 'rxjs';
import { Store } from '@ngxs/store';

import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { LogoutUser } from 'src/app/store/user.actions';
import { AppSettings, APP_SETTINGS, APP_SETTINGS_URL } from 'src/app.settings';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private store: Store,
    @Inject(APP_SETTINGS) private appSettings: AppSettings
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userId = this.store.selectSnapshot(UserState.user)?.id;
    const lastSelectedOrganizationId = this.store.selectSnapshot(UserState.lastSelectedOrganizationId);
    const lastSelectedAgencyId = this.store.selectSnapshot(UserState.lastSelectedAgencyId);
    const isAgency = this.store.selectSnapshot(UserState.lastSelectedOrganizationAgency) === 'Agency';
    const isOrganization = this.store.selectSnapshot(UserState.lastSelectedOrganizationAgency) === 'Organization';

    if (userId) {
      const currentPage = this.store.selectSnapshot(AppState.headerState)?.title || 'Login';
      const headers: { [key: string]: string } = {
        'Einstein-ScreenName': currentPage as string,
        'Einstein-ScreenUrl': this.router.url,
      };

      const { isOrganizationArea, isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);

      if (isOrganizationArea && lastSelectedOrganizationId && isOrganization) {
        headers['selected-businessunit-id'] = lastSelectedOrganizationId.toString();
      }

      if (isAgencyArea && lastSelectedAgencyId && isAgency) {
        headers['selected-businessunit-id'] = lastSelectedAgencyId.toString();
      }

      request = request.clone({ headers: new HttpHeaders(headers) });
    }

    if (request.url === APP_SETTINGS_URL) {
      return next.handle(request);
    }

    return next.handle(this.setUrl(request, this.appSettings.host)).pipe(
      catchError((error: HttpErrorResponse) => {
        /** If we got 401 Error then do log out */
        if (error.status === 401) {
          this.store.dispatch(new LogoutUser());
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }

  private setUrl(request: HttpRequest<any>, url: string): HttpRequest<any> {
    return request.url.startsWith('assets') ? request : request.clone({ url: `${url}${request.url}` });
  }
}

