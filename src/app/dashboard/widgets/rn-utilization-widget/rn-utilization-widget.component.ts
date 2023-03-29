import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef, Inject, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { RnUtilizationModel } from '../../models/rnutilization.model';
import { GetAllCommitmentByPage } from '../../store/dashboard.actions';
import { DashboardState } from '../../store/dashboard.state';
import { RnUtilizationFormService } from './rn-utilization-widget-service';
import { ACTUALPERDIEMHOURS, DefaultOptionFields, MASKPLACEHOLDER, NOOFPERDIEMORDERS, TARGETPERDIEMHOURS } from './rn-utilization.constants';
import { RnUtilizationForm } from './rn-utilization.interface';
import { GetWorkCommitment } from './rn-utilization.model';

@Component({
  selector: 'app-rn-utilization-widget',
  templateUrl: './rn-utilization-widget.component.html',
  styleUrls: ['./rn-utilization-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RnUtilizationWidgetComponent implements OnInit {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: RnUtilizationModel | undefined;

  private unsubscribe$: Subject<void> = new Subject();

  @Select(DashboardState.commitmentsPage)
  public commitmentsPage$: Observable<GetWorkCommitment[]>;

  public noofPerDiemOrders: string = NOOFPERDIEMORDERS;
  public targetPerDiemhrs: string = TARGETPERDIEMHOURS;
  public actualPerDiemhrs: string = ACTUALPERDIEMHOURS;
  public maskPlaceholder: string = MASKPLACEHOLDER;
  public readonly optionFields = DefaultOptionFields;
  public rnUtilizationform: CustomFormGroup<RnUtilizationForm>;

  public allOption: string = "All";
  public commitmentsPageData$: Observable<GetWorkCommitment[]>;
  public rnUtilizationformgroup: FormGroup;

  constructor(private rnUtilizationService: RnUtilizationFormService, private readonly fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    protected store: Store,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis) {
    this.rnUtilizationform = this.rnUtilizationService.getNursingUtilizationForm();
  }

  ngOnInit(): void {
    this.getWorkCommitment();
  }

  public getWorkCommitment() {
    this.store.dispatch(new GetAllCommitmentByPage())
      .pipe(takeUntil(this.unsubscribe$),)
      .subscribe((result) => {
        let Ids = (result.dashboard.commitmentsPage || []).map((m: { id: number; }) => m.id)
        this.rnUtilizationform.controls['workcommitIds'].setValue(Ids)
      });
  }

  public getNursingPercentage()
  {
  }
  public onWorkcommitmentSelect(event: any) {
   
  }
  public onDatechange(event: any)
  {

  }

}
