import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, shareReplay, switchMap, take, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { LogoutUser } from 'src/app/store/user.actions';

interface IAppSettings {
  API_BASE_URL: string;
}

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  private apiUrl$: Observable<string>;
  private appSettingsUrl = './assets/app.settings.json';

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private store: Store,
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userId = this.store.selectSnapshot(UserState.user)?.id;

    if (userId) {
      const currentPage = this.store.selectSnapshot(AppState.headerState)?.title || 'Login';
      request = request.clone({
        headers: new HttpHeaders({
          'Authorization': `UserId ${userId}`,
          'Einstein-ScreenName': currentPage as string,
          'Einstein-ScreenUrl': this.router.url,
          'selected-businessunit-id': '2' // TODO: replace with logged/selected org/agency
        })
      });
    } else {
      this.store.dispatch(new LogoutUser());
    }

    if (request.url === this.appSettingsUrl) {
      return next.handle(request);
    }

    return this.getApiUrl().pipe(
      switchMap((url: string) => {
        return next.handle(this.setUrl(request, url)).pipe(
          catchError((error: HttpErrorResponse) => {
            /** If we got 401 Error then do log out */
            if (error.status === 401) {
              this.store.dispatch(new LogoutUser());
            }

            return throwError(() => error);
          })
        );
      })
    );
  }

  private getApiUrl(): Observable<string> {
    if (!this.apiUrl$) {
      this.apiUrl$ = this.httpClient.get<IAppSettings>(this.appSettingsUrl).pipe(
        take(1),
        shareReplay(1), // prevent multiple requests
        map(resp => {
          return resp.API_BASE_URL;
        })
      );
    }
    return this.apiUrl$;
  }

  private setUrl(request: HttpRequest<any>, url: string): HttpRequest<any> {
    return request.clone({ url: `${url}${request.url}` });
  }
}
