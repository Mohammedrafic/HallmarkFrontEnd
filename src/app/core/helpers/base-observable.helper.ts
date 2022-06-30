import { BehaviorSubject, Observable } from 'rxjs';

export class BaseObservable<T> {
  private subject: BehaviorSubject<T>;

  constructor(init: T) {
    this.subject = new BehaviorSubject<T>(init);
  }

  get(): T {
    return this.subject.getValue();
  }

  set(value: T): void {
    this.subject.next(value);
  }

  getStream(): Observable<T> {
    return this.subject.asObservable();
  }
}
