import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';

import { filter, map, switchMap, takeUntil } from 'rxjs';
import { Store } from '@ngxs/store';

import { OpenJob, OpenJobPage } from '@shared/models';
import { OutsideZone } from '@core/decorators';
import { Destroyable } from '@core/helpers';
import { SetHeaderState, ShowFilterDialog } from '../../../../store/app.actions';
import { EmployeeService, JobFilterService } from '../../services';
import { FiltersState, PreservedFilters } from '../../interfaces';

@Component({
  selector: 'app-open-job-container',
  templateUrl: './open-job-container.component.html',
  styleUrls: ['./open-job-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenJobContainerComponent extends Destroyable implements OnInit {
  public openJobsPage: OpenJobPage;
  public showFilterDialog = false;
  public appliedFiltersAmount = 0;
  public showEmployeeDetailsDialog = false;
  public selectedEmployeeDetails: OpenJob | null;

  constructor(
    private store: Store,
    private employeeService: EmployeeService,
    private jobFilterService: JobFilterService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private readonly ngZone: NgZone,
    ) {
    super();
    store.dispatch(new SetHeaderState({ title: 'Open Jobs', iconName: 'briefcase' }));
  }

  ngOnInit(): void {
    this.watchForPreservedFilters();
    this.watchForFilterState();
    this.watchForEmployeeDetails();
  }

  public showFilters(): void {
    this.showFilterDialog = true;
    this.showFilterDialogAction();
    this.cdr.markForCheck();
  }

  public changeFiltersAmount(amount: number): void {
    this.appliedFiltersAmount = amount;
  }

  public closeFilterDialog(): void {
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
      const {filters, appliedFiltersAmount} = preservedFilters;

      this.jobFilterService.setFilters(filters);
      this.appliedFiltersAmount = appliedFiltersAmount;
    });
  }

  private watchForEmployeeDetails(): void {
    this.employeeService.getEmployeeDetailsEventStream().pipe(
      takeUntil(this.componentDestroy()),
    ).subscribe((job: OpenJob | null) => {
      this.selectedEmployeeDetails = job;
      this.showEmployeeDetailsDialog = !!job;
      this.cdr.markForCheck();
    });
  }

  private watchForFilterState(): void {
    this.jobFilterService.getFilterStateStream().pipe(
      filter((filters: FiltersState) => !!filters),
      map((filters: FiltersState) => this.jobFilterService.prepareOrderTypeField(filters)),
      switchMap((filters: FiltersState) => this.employeeService.getOpenJobs(filters)),
      takeUntil(this.componentDestroy()),
    ).subscribe((openJobPage: OpenJobPage) => {
      this.openJobsPage = openJobPage;
      this.cdr.markForCheck();
    });
  }
}
