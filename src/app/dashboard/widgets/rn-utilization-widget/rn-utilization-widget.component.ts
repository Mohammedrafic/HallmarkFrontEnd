import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef, Inject, OnChanges, SimpleChange } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { GlobalWindow } from '@core/tokens';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil, takeWhile } from 'rxjs';
import { RnUtilizationModel } from '../../models/rnutilization.model';
import { FilterNursingWidget, GetAllCommitmentByPage, GetSkilldata } from '../../store/dashboard.actions';
import { DashboardState } from '../../store/dashboard.state';
import { RnUtilizationFormService } from './rn-utilization-widget-service';
import { ACTUALPERDIEMHOURS, DefaultOptionFields, MASKPLACEHOLDER, NOOFPERDIEMORDERS, TARGETPERDIEMHOURS } from './rn-utilization.constants';
import { RnUtilizationForm } from './rn-utilization.interface';
import { GetNursingWidgetData, GetWorkCommitment } from "../../models/rn-utilization.model";

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
  public workcommitIds: FormGroup;
  public SkillIds: FormGroup;
  @Select(DashboardState.commitmentsPage)
  public commitmentsPage$: Observable<GetWorkCommitment[]>;
  public workcommitmentvalue: string;
  public skillDatavalue: string;
  @Select(DashboardState.nursingSkill)
  public nursingSkill$: Observable<GetWorkCommitment[]>;
  @Select(DashboardState.nursingCount)
  public nursingCount$: Observable<GetNursingWidgetData>;

  public noofPerDiemOrders: string = NOOFPERDIEMORDERS;
  public targetPerDiemhrs: string = TARGETPERDIEMHOURS;
  public actualPerDiemhrs: string = ACTUALPERDIEMHOURS;
  public maskPlaceholder: string = MASKPLACEHOLDER;
  public readonly optionFields = DefaultOptionFields;
  public rnUtilizationform: CustomFormGroup<RnUtilizationForm>;
  private isAlive = true;
  public targetutilization:number = 60;
  public allOption: string = "All";
  public rnUtilizationformgroup: FormGroup;
  public nursingCountdata: any;

  constructor(private rnUtilizationService: RnUtilizationFormService, private readonly fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    protected store: Store,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis) {
    this.rnUtilizationform = this.rnUtilizationService.getNursingUtilizationForm();
  }

  get WorkCommitmentIdControl(): AbstractControl {
    return this.workcommitIds.get('workcommitId') as AbstractControl;
  }

  get SkillIDControl(): AbstractControl {
    return this.SkillIds.get('skill') as AbstractControl;
  }

  ngOnInit(): void {
    this.getWorkCommitment();
    this.getSkillsData();
    this.workcommitIds = this.generateWorkCommitForm();
    this.SkillIds = this.generateSkillForm();
    this.onWorkCommitmentValueChanged();
    this.onSkillValueChanged();
  }

  public generateWorkCommitForm(){
    return new FormGroup({
      workcommitId: new FormControl(0),
    });
  }

  public generateSkillForm(){
    return new FormGroup({
      skill : new FormControl(0)
    });
  }

  public getWorkCommitment() {

    this.store.dispatch(new GetAllCommitmentByPage())
      .pipe(takeUntil(this.unsubscribe$),)
      .subscribe((result) => {
        let Ids = (result.dashboard.commitmentsPage || []).map((m: { id: number; }) => m.id)
        this.WorkCommitmentIdControl.setValue(Ids);
      });

   
  }

  public getSkillsData() {
    this.store.dispatch(new GetSkilldata())
    .pipe(takeUntil(this.unsubscribe$)).
    subscribe((result) => {
      let Ids = (result.dashboard.nursingSkill || []).map((m: { id: number; }) => m.id)
      this.SkillIDControl.setValue(Ids);
    });
  }

  private onWorkCommitmentValueChanged(): void {
    this.WorkCommitmentIdControl.valueChanges
    .pipe(takeWhile(() => this.isAlive)).
    subscribe((value) => {
      this.workcommitmentvalue = value.join();
      this.onDataChange('');
    });
  }

  private onSkillValueChanged(): void {
    this.SkillIDControl.valueChanges
    .pipe(takeWhile(() => this.isAlive)).
    subscribe((value) => {
      this.skillDatavalue = value.join();
      this.onDataChange('');
    });
  }

  
  public onDataChangefortarget(event:any){
    this.targetutilization = event.target.value;
    this.onDataChange("");
  }


  public onDataChange(event:any) {
    if(event != ""){
      this.rnUtilizationform.controls["workDate"].setValue(event.value);
    }
    var data = {
      targetUtilization : this.targetutilization,
      todayDate : this.rnUtilizationform.controls["workDate"].value,
      skillIDs : this.skillDatavalue,
      workCommitmentIds : this.workcommitmentvalue
    }
    this.store.dispatch(new FilterNursingWidget(data))
    .pipe(takeUntil(this.unsubscribe$)).
    subscribe((result) => {
      this.nursingCountdata = result.dashboard.nursingCount;
      this.cdr.detectChanges();
  });
  }
}
