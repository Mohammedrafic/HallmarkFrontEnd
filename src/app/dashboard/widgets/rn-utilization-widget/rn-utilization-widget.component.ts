import { Component, OnInit, Input, ChangeDetectorRef, Inject, ViewChild, ViewChildren } from '@angular/core';
import { CustomFormGroup } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { Select, StateContext, Store } from '@ngxs/store';
import {
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
  of,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { RnUtilizationModel } from '../../models/rnutilization.model';
import {
  FilterNursingWidget,
  GetAllCommitmentByPage,
  GetSkilldata as GetSkillData,
} from '../../store/dashboard.actions';
import { DashboardState } from '../../store/dashboard.state';
import { RnUtilizationFormService } from './rn-utilization-widget-service';
import {
  ACTUALPERDIEMHOURS,
  DefaultOptionFields,
  MASKPLACEHOLDER,
  NOOFPERDIEMORDERS,
  TARGETPERDIEMHOURS,
} from './rn-utilization.constants';
import { RnUtilizationForm } from './rn-utilization.interface';
import {
  GetNursingUtilizationbyByFilters,
  GetNursingWidgetData,
  GetWorkCommitment,
} from '../../models/rn-utilization.model';
import { ProgressBar } from '@syncfusion/ej2-angular-progressbar';
import { FilteredItem } from '@shared/models/filter.model';
import { DashboartFilterDto } from '../../models/dashboard-filter-dto.model';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-rn-utilization-widget',
  templateUrl: './rn-utilization-widget.component.html',
  styleUrls: ['./rn-utilization-widget.component.scss'],
})
export class RnUtilizationWidgetComponent implements OnInit {
  @Input() isLoading: boolean;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() chartData: RnUtilizationModel | undefined;

  @ViewChildren("progressBar")
  public pb: ProgressBar[];

  @Select(DashboardState.commitmentsPage)
  commitmentsPage$: Observable<GetWorkCommitment[]>;
  @Select(DashboardState.nursingSkill)
  nursingSkill$: Observable<GetWorkCommitment[]>;
  @Select(DashboardState.nursingCount)
  nursingCount$: Observable<GetNursingWidgetData>;
  @Select(DashboardState.filteredItems)
  filteredItems$: Observable<FilteredItem[]>;
  @Select(DashboardState.filterData)
  filterData$: Observable<DashboartFilterDto>;

  workcommitmentvalue: number[];
  skillDatavalue: number[];
  noofPerDiemOrders: string = NOOFPERDIEMORDERS;
  targetPerDiemhrs: string = TARGETPERDIEMHOURS;
  actualPerDiemhrs: string = ACTUALPERDIEMHOURS;
  maskPlaceholder: string = MASKPLACEHOLDER;
  rnUtilizationForm: CustomFormGroup<RnUtilizationForm>;
  editMode = false;
  private unsubscribe$: Subject<void> = new Subject();
  targetutilization = 60;
  allOption = 'All';
  readonly optionFields = DefaultOptionFields;
  skillsText = 'All';
  workCommitmentText = 'All';
  dateText = new Date().toLocaleDateString();
  kpiColor: string;
  showProgressBar: boolean;
  percent: number;

  constructor(
    private rnUtilizationService: RnUtilizationFormService,
    private cdr: ChangeDetectorRef,
    private changeDetector : ChangeDetectorRef,
    protected store: Store,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis
  ) {
    this.rnUtilizationForm = this.rnUtilizationService.getNursingUtilizationForm();
  }

  ngOnInit(): void {
    this.getLookups().subscribe(() => {
      this.setupChangeListeners();
      this.cdr.detectChanges();
      this.rnUtilizationForm.updateValueAndValidity();
    });
  }

  getLookups(): Observable<any> {
    const commitmentsLookup = this.store.dispatch(new GetAllCommitmentByPage()).pipe(
      take(1),
      tap((result) => {
        const ids = (result.dashboard.commitmentsPage || []).map((m: { id: number }) => m.id);
        this.rnUtilizationForm.controls['workCommitment'].setValue(ids, { emitEvent: false });
      }),
      takeUntil(this.unsubscribe$)
    );

    const skillsLookup = this.store.dispatch(new GetSkillData()).pipe(
      take(1),
      tap((result) => {
        const ids = (result.dashboard.nursingSkill || []).map((m: { id: number }) => m.id);
        this.rnUtilizationForm.controls['skills'].setValue(ids, { emitEvent: false });
      }),
      takeUntil(this.unsubscribe$)
    );

    return forkJoin([commitmentsLookup, skillsLookup]);
  }

  setupChangeListeners() {
    combineLatest([this.rnUtilizationForm.valueChanges, this.filterData$])
      .pipe(
        takeUntil(this.unsubscribe$),
        distinctUntilChanged(),
        debounceTime(500),
        filter(() => true),
        switchMap(([value, filters]) => {
          const skillsList = this.nursingSkill$.pipe(take(1), takeUntil(this.unsubscribe$));
          const workCommitmentList = this.commitmentsPage$.pipe(take(1), takeUntil(this.unsubscribe$));
          return forkJoin([of(value), of(filters), skillsList, workCommitmentList]);
        }),
        tap(([value,, skillsList, workCommitmentList]) => {
          this.skillsText =
            skillsList.length == value.skills.length
              ? `${this.allOption} (${value.skills.length})` : value.skills.length.toString();
          this.workCommitmentText =
            workCommitmentList.length == value.workCommitment.length
              ? `${this.allOption} (${value.workCommitment.length})` : value.workCommitment.length.toString();
          this.dateText = value.workDate.toLocaleDateString();
        }),
        switchMap(([value, filters]) => {
          const data: GetNursingUtilizationbyByFilters = {
            targetUtilization: value.targetUtilization / 100,
            todayDate: value.workDate,
            skillIds: value.skills,
            workCommitmentIds: value.workCommitment,
            organizationFilter: filters.organizationFilter,
          };
          return this.store.dispatch(new FilterNursingWidget(data));
        })
      )
      .subscribe();

    this.nursingCount$.pipe(
      filter((result) => result != null),
      tap((result) => {
        if (result.noOfPerdiemNursing === 0) {
          //Keep disabled fornow. does not work as intended.
          this.showProgressBar = false;
          return;
        } else {
          this.showProgressBar = false;
          this.changeDetector.detectChanges();
        }
        this.percent = (result.perdayTotalHoursSchedule / result.targetPerdiemNursingHours) * 100;
        //get hex color based on percentage between red and green
        if (this.percent < 30) {
          //red
          this.kpiColor = '#ff0000';
        }
        else if (this.percent > 60) {
          //orange
          this.kpiColor = '#ff8000';
        } else {
          //green
          this.kpiColor = '#00ff00';
        }

        // this.pb[0].refresh()
        console.log('percent', this.percent, 'color', this.kpiColor)
      }),
      takeUntil(this.unsubscribe$),
    )
      .subscribe();
  }
}
