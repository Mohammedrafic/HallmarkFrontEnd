import { Subject, Observable } from 'rxjs';

export interface ResizeObserverModel {
  resize$: Observable<ResizeObserverEntry[]>;
  detach: () => void;
}

export class ResizeObserverService {
  public static init(element: HTMLElement): ResizeObserverModel {
    const resizeEventEntries$ = new Subject<ResizeObserverEntry[]>();
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => resizeEventEntries$.next(entries));

    observer.observe(element, { box: 'border-box' });

    return { resize$: resizeEventEntries$, detach: () => observer.disconnect() };
  }
}
