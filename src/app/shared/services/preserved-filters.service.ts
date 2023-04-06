import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { PreservedFiltersByPage } from '@core/interface/preserved-filters.interface';
import { GlobalWindow } from '@core/tokens';
import { FilterPageName } from '@core/enums/filter-page-name.enum';

@Injectable({
  providedIn: 'root',
})
export class PreservedFiltersService {
  constructor(
    private http: HttpClient,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis
  ) {}

  /**
   * Get preserved filters
   * @return string
   */
  //TODO remove after implementing preserving filters by page
  public getPreservedFilters(): Observable<{ state: string }> {
    return this.http.get<{ state: string }>(`/api/filters/state`).pipe(tap((data: any) => data.state));
  }

  /**
   * Set preserved filters
   * @return string
   */
  //TODO remove after implementing preserving filters by page
  public setPreservedFilters(payload: string): Observable<string> {
    return this.http.put<string>(`/api/filters/state`, { state: payload });
  }

  public getPreservedFilterState(pageName: FilterPageName): Observable<PreservedFiltersByPage<unknown>> {
    const params = {
      pageName,
    };
    return this.http.get<PreservedFiltersByPage<string>>(`/api/Filters/state`, { params }).pipe(
      map((data) => {
        return { ...data, state: JSON.parse(data.state || 'null'), dispatch: true };
      })
    );
  }

  public saveFiltersByPageName(pageName: FilterPageName, filters: unknown): Observable<PreservedFiltersByPage<unknown>> {
    const params = {
      state: JSON.stringify(filters),
      pageName,
    };
    return this.http.put<PreservedFiltersByPage<string>>(`/api/Filters/state`, params).pipe(
      map((data) => {
        return { ...data, state: JSON.parse(data.state || 'null'), dispatch: false };
      })
    );
  }

  public clearPageFilters(pageName: FilterPageName): Observable<unknown> {
    return this.http.delete(`/api/Filters/state/${pageName}`);
  }
}
