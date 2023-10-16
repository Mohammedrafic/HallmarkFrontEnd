import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { OutsideZone } from '@core/decorators';

import { Store } from '@ngxs/store';
import { filter, map, switchMap, takeUntil } from 'rxjs';


import { OpenJobPage } from '@shared/models';
import { Destroyable } from '@core/helpers';
import { SetHeaderState, ShowFilterDialog } from 'src/app/store/app.actions';

import { FiltersState, PreservedFilters } from '../../interfaces';
import { MyJobsFilterService } from '../../services/my-jobs-filter.service';
import { MyJobsService } from '../../services/my-jobs.service';

@Component({
  selector: 'app-my-jobs-container',
  templateUrl: './my-jobs-container.component.html',
  styleUrls: ['./my-jobs-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyJobsContainerComponent extends Destroyable implements OnInit {
  myJobsPage: OpenJobPage;
  showFilterDialog = false;
  appliedFiltersAmount = 0;

  constructor(
    private store: Store,
    private filterService: MyJobsFilterService,
    private myJobsService: MyJobsService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private readonly ngZone: NgZone,
  ) {
    super();
    store.dispatch(new SetHeaderState({ title: 'My Jobs', iconName: 'list' }));
  }


  ngOnInit(): void {
    this.watchForPreservedFilters();
    this.watchForFilterState();
  }

  showFilters(): void {
    this.showFilterDialog = true;
    this.showFilterDialogAction();
    this.cdr.markForCheck();
  }

  changeFiltersAmount(amount: number): void {
    this.appliedFiltersAmount = amount;
  }

  closeFilterDialog(): void {
    this.showFilterDialog = false;
  }

  @OutsideZone
  private showFilterDialogAction(): void {
    //This part of code need to correctly open filters dialog
    setTimeout(() => {
      this.store.dispatch(new ShowFilterDialog(true));
    }, 100);
  }

  private watchForPreservedFilters(): void {
    this.activatedRoute.data.pipe(
      map((data: Data)  => data['preservedFilters']),
      takeUntil(this.componentDestroy()),
    ).subscribe((preservedFilters: PreservedFilters) => {
      const { filters, appliedFiltersAmount } = preservedFilters;

      this.filterService.setFilters(filters);
      this.appliedFiltersAmount = appliedFiltersAmount;
    });
  }

  private watchForFilterState(): void {
    this.filterService.getFilterStateStream().pipe(
      filter((filters: FiltersState) => !!filters),
      map((filters: FiltersState) => this.filterService.prepareOrderTypeField(filters)),
      switchMap((filters: FiltersState) => this.myJobsService.getMyJobs(filters)),
      takeUntil(this.componentDestroy()),
    ).subscribe((openJobPage: OpenJobPage) => {
      this.myJobsPage = openJobPage;
      this.cdr.markForCheck();
    });
  }
}
