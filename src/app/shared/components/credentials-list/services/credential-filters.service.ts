import { Injectable } from '@angular/core';

import { BehaviorSubject, takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { DefaultFilters } from '@shared/components/credentials-list/constants';
import { CredentialFilter } from '@shared/models/credential.model';

@Injectable()
export class CredentialFiltersService extends Destroyable {
  public filters$: BehaviorSubject<CredentialFilter> = new BehaviorSubject<CredentialFilter>(DefaultFilters);

  private filters: CredentialFilter;

  constructor() {
    super();
    this.watchForFilters();
  }

  set updateFilters(value: CredentialFilter) {
    this.filters = {
      ...this.filters,
      ...value
    }
  }

  get filtersState(): CredentialFilter {
    return this.filters;
  }

  public clearState(): void {
    this.filters = DefaultFilters;
  }

  private watchForFilters(): void {
    this.filters$.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((value: CredentialFilter) => {
      this.updateFilters = value;
    });
  }
}
