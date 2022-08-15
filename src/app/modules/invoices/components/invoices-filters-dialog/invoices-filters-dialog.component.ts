import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PageOfCollections } from '@shared/models/page.model';
import { FiltersDialogHelper } from '@core/helpers/filters-dialog.helper';

import { InvoicesState } from '../../store/state/invoices.state';
import { InvoiceFilterColumns, InvoiceRecord, InvoicesFilterState } from '../../interfaces';
import { InvoicesModel } from '../../store/invoices.model';

@Component({
  selector: 'app-invoices-filters-dialog',
  templateUrl: './invoices-filters-dialog.component.html',
  styleUrls: ['./invoices-filters-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesFiltersDialogComponent extends
  FiltersDialogHelper<InvoiceFilterColumns, InvoicesFilterState, InvoicesModel>
  implements OnInit, OnChanges {
  @Select(InvoicesState.invoicesData)
  public invoicesData$: Observable<PageOfCollections<InvoiceRecord> | null>;

  ngOnInit(): void {
    this.initFormGroup();
    this.initFiltersColumns(InvoicesState.invoiceFiltersColumns);
    this.startRegionsWatching();
    this.startLocationsWatching();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['activeTabIdx'].firstChange) {
      this.clearAllFilters(false);
    }
  }
}
