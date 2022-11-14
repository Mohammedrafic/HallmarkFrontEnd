import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Store } from '@ngxs/store';
import { SetIrpFlag } from 'src/app/store/app.actions';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  /**
   * Service designed to work only with one feature flag,
   * can be easly modified to use multiple flags.
   */
  getFeatureFlag(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<boolean>(`/api/FeaturesConfiguration/IsEnabled/IRP`)
      .subscribe({
        next: (value) => {
          this.store.dispatch(new SetIrpFlag(value));
          resolve();
        },
        error: () => {
          console.error('Can not load features flag configuration');
          resolve();
        },
      });
    });
  }
}
