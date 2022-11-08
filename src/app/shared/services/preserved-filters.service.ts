import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PreservedFiltersService {
  constructor(private http: HttpClient) {}

  /**
   * Get preserved filters
   * @return string
   */
  public getPreservedFilters(): Observable<{state: string}> {
    return this.http.get<{state: string}>(`/api/filters/state`).pipe(tap((data: any) => data.state));
  }

  /**
   * Set preserved filters
   * @return string
   */
  public setPreservedFilters(payload: string): Observable<string> {
    return this.http.put<string>(`/api/filters/state`, { state: payload });
  }
}
