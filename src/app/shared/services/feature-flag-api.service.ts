import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { FeatureFlagsModel, FeatureFlagsNames } from '@shared/models/feature-flags.model';

/**
 * Service to check Feature Flags.
 * 1) Please add/update name in "FeatureFlagsNames" type before you going to use it.
 * 2) Provide service to the needed module to use it.
 */
@Injectable()
export class FeatureFlagApiService {
  constructor(private http: HttpClient) {
  }

  /**
   * getAllFeatureFlags() - Use to get all Feature Flags and their values
   */
  getAllFeatureFlags(): Observable<FeatureFlagsModel> {
    return this.http.get<FeatureFlagsModel>('/api/FeaturesConfiguration');
  }

  /**
   * checkFeatureFlag() - Use to get Feature Flag value by its name
   * @flagName - Feature Flag Name
   */
  checkFeatureFlag(flagName: FeatureFlagsNames): Observable<boolean> {
    return this.http.get<boolean>(`/api/FeaturesConfiguration/IsEnabled/${flagName}`);
  }
}
