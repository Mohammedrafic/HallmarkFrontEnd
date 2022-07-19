import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';

export const GlobalWindow: InjectionToken<Window> = new InjectionToken<Window>('GLOBAL_WINDOW',
  {
    factory: () => {
      const { defaultView } = inject(DOCUMENT);

      if (!defaultView) {
        throw new Error('Window is not available');
      }
      return defaultView;
    },
  });
