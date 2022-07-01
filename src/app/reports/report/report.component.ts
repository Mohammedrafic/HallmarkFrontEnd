import { BehaviorSubject, switchMap, takeUntil, map, distinctUntilChanged, from, tap } from 'rxjs';
import { Store } from '@ngxs/store';

import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, Injector } from '@angular/core';

import { BaseReportDirective } from './report-types/base-report.directive';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { DIHelper } from '@shared/helpers/DI.helper';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DynamicComponentModel } from '@shared/models/dynamic-component.model';
import { FilteredItem } from '@shared/models/filter.model';
import { ReportTypeEnum } from './enums/report-type.enum';
import { ShowFilterDialog } from '../../store/app.actions';
import { SingleComponentModuleModel } from '@shared/models/single-component-module.model';
import { reportDirectiveDataToken } from './constants/report-directive-data.token';
import { reportTypeToComponentMapper } from './constants/report-type-to-component-mapper';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportComponent extends DestroyableDirective implements OnInit {
  public readonly buttonTypeEnum: typeof ButtonTypeEnum = ButtonTypeEnum;
  public readonly filters$: BehaviorSubject<FilteredItem[]> = new BehaviorSubject<FilteredItem[]>([]);

  public readonly reportComponent$: BehaviorSubject<DynamicComponentModel<BaseReportDirective<unknown>> | null> =
    new BehaviorSubject<DynamicComponentModel<BaseReportDirective<unknown>> | null>(null);

  public constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly injector: Injector,
    private readonly store: Store
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initActivatedRouteParamMapListener();
  }

  public showFilters(): void {
    this.toggleFilterDialog(true);
  }

  private initActivatedRouteParamMapListener(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((paramMap: ParamMap) => paramMap.get('type') as ReportTypeEnum),
        distinctUntilChanged(),
        tap(() => this.resetComponentState()),
        switchMap((type: ReportTypeEnum) => from(reportTypeToComponentMapper[type]())),
        takeUntil(this.destroy$)
      )
      .subscribe((scam: SingleComponentModuleModel<BaseReportDirective<unknown>, unknown>) => {
        this.initReportComponent(scam);
      });
  }

  private resetComponentState(): void {
    this.filters$.next([]);
    this.reportComponent$.next(null);
  }

  private initReportComponent(scam: SingleComponentModuleModel<BaseReportDirective<unknown>, unknown>): void {
    const injector = DIHelper.createInjectorForSCAM(scam, reportDirectiveDataToken, this.injector, {
      filterChangeHandler: (filters: FilteredItem[]) => this.filters$.next(filters),
      filters$: this.filters$,
    });

    this.reportComponent$.next({ component: scam.component, injector });
  }

  private toggleFilterDialog(state: boolean): void {
    this.store.dispatch(new ShowFilterDialog(state));
  }
}
