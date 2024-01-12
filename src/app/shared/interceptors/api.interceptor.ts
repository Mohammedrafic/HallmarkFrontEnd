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
import { BusinessUnitType } from '../enums/business-unit-type';

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
    const lastSelectedMspId = this.store.selectSnapshot(UserState.lastSelectedMspId);
    const isAgency = this.store.selectSnapshot(UserState.lastSelectedOrganizationAgency) === 'Agency';
    const isOrganization = this.store.selectSnapshot(UserState.lastSelectedOrganizationAgency) === 'Organization';
    const isMsp = this.store.selectSnapshot(UserState.lastSelectedOrganizationAgency) === 'MSP';

    if (userId) {
      const currentPage = this.store.selectSnapshot(AppState.headerState)?.title || 'Login';
      const headers: { [key: string]: string } = {
        'Einstein-ScreenName': currentPage as string,
        'Einstein-ScreenUrl': this.router.url,
      };

      const { isOrganizationArea, isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
      const { isMSPArea } = this.store.selectSnapshot(AppState.isMspArea);
      const { isAdminArea } = this.store.selectSnapshot(AppState.isAdminArea);

      if (isOrganizationArea) {
        headers['selected-businessunit-type'] = BusinessUnitType.Organization.toString();
      }
      else if (isAgencyArea) {
        headers['selected-businessunit-type'] = BusinessUnitType.Agency.toString();
      }
      else if (isAdminArea) {
        headers['selected-businessunit-type'] = BusinessUnitType.Hallmark.toString();
      }
      else {
        headers['selected-businessunit-type'] = '0';
      }

      if(request.headers.has('selected-businessunit-id')) {
        headers['selected-businessunit-id'] = request.headers.get('selected-businessunit-id') as string;
      }
      
      if (isMSPArea && lastSelectedMspId && isMsp) {
        headers['selected-businessunit-id'] = lastSelectedMspId.toString();
      }

      if (isOrganizationArea && lastSelectedOrganizationId && isOrganization) {
        headers['selected-businessunit-id'] = lastSelectedOrganizationId.toString();
      }

      if (isAgencyArea && lastSelectedAgencyId && isAgency) {
        headers['selected-businessunit-id'] = lastSelectedAgencyId.toString();
      }
      request = request.clone({ headers: new HttpHeaders(headers) });
    }

    const sanitizedRequest = this.trimRequest(request);

    if (sanitizedRequest.url === APP_SETTINGS_URL) {
      return next.handle(sanitizedRequest);
    }

    return next.handle(this.setUrl(sanitizedRequest, this.appSettings.host)).pipe(
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

  private trimRequest(req: HttpRequest<any>): HttpRequest<any> {
    if (req.body && typeof req.body === 'object') {
      //We have some objects that are not properly built, we need a clean escape for cases like that.
      try {
        const trimmedBody = this.trimObjectStrings(req.body);
        return req.clone({ body: trimmedBody });
      } catch (e) {
        return req;
      }
    }
    return req;
  }

  private isString = (value: string): value is string => typeof value === 'string';

  private trimObjectStrings = (obj: any): any => {
    if (typeof obj === 'object') {
      for (const key in obj) {
        const value = obj[key];
        if (this.isString(value)) {
          obj[key] = value.replace(/^\s+|\s+$/g, '');
        } else if (typeof value === 'object') {
          obj[key] = this.trimObjectStrings(value);
        }
      }
    }
    return obj;
  };
}

