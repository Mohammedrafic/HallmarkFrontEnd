import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, shareReplay, switchMap, take, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

interface IAppSettings {
  API_BASE_URL: string;
}

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  private apiUrl$: Observable<string>;
  private appSettingsUrl = './assets/app.settings.json';
  private isPatientFacilitySpecialRequest: boolean;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let userId = window.localStorage.getItem("AuthKey");
    if (userId){
      request = request.clone({
        // setHeaders: { Authorization: `UserId ${userId}` }
        // setHeaders: { Custom: `UserId ${userId}` }
        headers: request.headers.set('Authorization', `UserId ${userId}`)
      });
    }
    if (request.url === this.appSettingsUrl) {
      return next.handle(request);
    }

    return this.getApiUrl().pipe(
      switchMap((url: string) => {
        return next.handle(this.setUrl(request, url)).pipe(
          catchError(error => {
            return throwError(error);
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
