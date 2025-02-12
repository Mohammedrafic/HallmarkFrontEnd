import { HttpClient } from '@angular/common/http';
import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { filter, take } from 'rxjs';

import { GlobalWindow } from '@core/tokens';
import { Location } from '@angular/common';

@Injectable()
export class CustomErrorHandler extends ErrorHandler {
  constructor(
    private http: HttpClient,
    private location: Location,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override handleError(error: any): void {
    super.handleError(error);
    
    if (error.message.includes('ChunkLoadError')) {
      this.http.get<boolean>('/api/FeaturesConfiguration/IsEnabled/uiAppReloadOnDeploy')
      .pipe(
        take(1),
        filter((flagEnabled) => flagEnabled),
      ).subscribe(() => {
        if (confirm('Application new version available. Load New Version?')) {
          this.location.go('/');
          this.globalWindow.location.reload();
        }
      });
    }
    console.error(error);
  }
}
 