import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef, Inject, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GlobalWindow } from '@core/tokens';
import { Actions, Select, Store } from '@ngxs/store';
import { AbstractPermissionGrid } from '@shared/helpers/permissions/abstract-permission-grid';
import { Observable } from 'rxjs';
import { BusinessUnitType } from '../../../shared/enums/business-unit-type';
import { UserState } from '../../../store/user.state';
import { RnUtilizationModel } from '../../models/rnutilization.model';
import { DashboardService } from '../../services/dashboard.service';
import { GetAllCommitmentByPage } from '../../store/dashboard.actions';
import { DashboardState } from '../../store/dashboard.state';
import { DefaultOptionFields } from './rn-utilization.constants';
import { GetWorkCommitment } from './rn-utilization.model';

@Component({
  selector: 'app-rn-utilization-widget',
  templateUrl: './rn-utilization-widget.component.html',
  styleUrls: ['./rn-utilization-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RnUtilizationWidgetComponent   implements OnInit {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: RnUtilizationModel | undefined;
  
  @Select(DashboardState.commitmentsPage)
  public commitmentsPage$: Observable<GetWorkCommitment[]>;

  public noofPerDiemOrders:string=" No. of active RNs as per the Employee Dept. Details screen.";
  public targetPerDiemhrs:string="(Annual working hours divided by no. of days in current year) * Utilization * No. of active RNs.";
  public actualPerDiemhrs:string="Actual no. of hours scheduled for RNs in the given date";
  public readonly optionFields = DefaultOptionFields;
  public allOption: string = "All";
  public commitmentsPageData$: Observable<GetWorkCommitment[]>;
  rnUtilizationformgroup: FormGroup;
  
  constructor(private readonly dashboardService: DashboardService, private readonly fb: FormBuilder,
    private actions$: Actions, 
    private cdr: ChangeDetectorRef,
    protected store: Store,
    @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis) { 
      const user = this.store.selectSnapshot(UserState.user);
      if (user?.businessUnitType != null && user?.businessUnitType == BusinessUnitType.Agency) {
        
      }  }
 
   ngOnInit(): void {
    this.rnUtilizationformgroup=this.fb.group({
      workDate: [new Date()],
      workcommitIds: []
    })
    this.store.dispatch(new GetAllCommitmentByPage())
    .pipe()
    .subscribe((result) => {
     let Ids=(result.dashboard.commitmentsPage||[]).map((m: { id: number; })=>m.id)
     this.rnUtilizationformgroup.controls['workcommitIds'].setValue(Ids)
    });
  }
  public toSourceContent(orgname: string): void {
   
  }
  public toTimesheetcontent(orgId : number):void{
    
  }
  public defineMousePosition($event: MouseEvent): void {
  
  }
}
