import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';

import { map, Observable } from 'rxjs';

import { DeviceTypeResolution } from '@core/interface';
import { BreakpointQuery } from '@shared/enums/media-query-breakpoint.enum';


@Injectable({
  providedIn: 'root',
})
export class BreakpointObserverService {
  private mediaQueryBreakpoints = [
    BreakpointQuery.DESKTOP_LG_MAX,
    BreakpointQuery.DESKTOP_LG_MIN,
    BreakpointQuery.DESKTOP_SM_MAX,
    BreakpointQuery.DESKTOP_SM_MIN,
    BreakpointQuery.TABLET_MAX,
    BreakpointQuery.TABLET_MIN,
    BreakpointQuery.MOBILE_MAX,
    BreakpointQuery.MOBILE_MIN,
  ];

  constructor(private readonly breakpointObserver: BreakpointObserver) {}

  private listenMediaQueryBreakpoints(): Observable<DeviceTypeResolution> {
    return this.breakpointObserver.observe(this.mediaQueryBreakpoints).pipe(
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
}
