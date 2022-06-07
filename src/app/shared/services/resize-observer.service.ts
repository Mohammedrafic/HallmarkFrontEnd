import { Subject, debounceTime, Observable } from 'rxjs';

export interface ResizeObserverModel {
  resize$: Observable<ResizeObserverEntry[]>;
  detach: () => void;
}

export class ResizeObserverService {
  public static init(element: HTMLElement): ResizeObserverModel {
    const resizeEventEntries$ = new Subject<ResizeObserverEntry[]>();
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => resizeEventEntries$.next(entries));

    observer.observe(element);

    return { resize$: resizeEventEntries$.pipe(debounceTime(10)), detach: () => observer.disconnect() };
  }
}
