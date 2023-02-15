import { Injectable } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

import { map, Observable } from 'rxjs';

import { DeviceTypeResolution } from '@core/interface';
import { BreakpointQuery } from '@shared/enums/media-query-breakpoint.enum';
import { MediaQueryBreakpoints } from '@core/constants/media-query-breakpoints';


@Injectable({
  providedIn: 'root',
})
export class BreakpointObserverService {

  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  private listenMediaQueryBreakpoints(): Observable<DeviceTypeResolution> {
    return this.breakpointObserver.observe(MediaQueryBreakpoints).pipe(
      map(({ breakpoints }) => {
        return {
          isDesktopLarge: breakpoints[BreakpointQuery.DESKTOP_LG_MAX] && breakpoints[BreakpointQuery.DESKTOP_LG_MIN],
          isDesktopSmall: breakpoints[BreakpointQuery.DESKTOP_SM_MAX] && breakpoints[BreakpointQuery.DESKTOP_SM_MIN],
          isTablet: breakpoints[BreakpointQuery.TABLET_MAX] && breakpoints[BreakpointQuery.TABLET_MIN],
          isMobile: breakpoints[BreakpointQuery.MOBILE_MAX] && breakpoints[BreakpointQuery.MOBILE_MIN],
        };
      })
    );
  }

  public getBreakpointMediaRanges(): Observable<DeviceTypeResolution> {
    return this.listenMediaQueryBreakpoints();
  }

  public listenBreakpoint(breakpoint: BreakpointQuery[]): Observable<BreakpointState> {
    return this.breakpointObserver.observe(breakpoint);
  }
}
