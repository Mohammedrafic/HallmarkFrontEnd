import { Subject } from 'rxjs';

export function TakeUntilDestroy(constructor: Function): void {
  const originalDestroy = constructor.prototype.ngOnDestroy;

  if (typeof originalDestroy !== 'function') {
    console.warn(`${constructor.name} is using @TakeUntilDestroy but does not implement OnDestroy`);
  }

  constructor.prototype.componentDestroy = function (): object {
    this.takeUntilDestroy$ = this.takeUntilDestroy$ || new Subject();

    return this.takeUntilDestroy$.asObservable();
  };

  constructor.prototype.ngOnDestroy = function (...args: unknown[]): void {
    if (typeof originalDestroy === 'function') {
      originalDestroy.apply(this, args);
    }

    if (this.takeUntilDestroy$) {
      this.takeUntilDestroy$.next();
      this.takeUntilDestroy$.complete();
    }
  };
}
