import { ChangeDetectorRef, Component, Input, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Actions } from '@ngxs/store';
import { DashboardService } from '../../services/dashboard.service';
import { GlobalWindow } from '@core/tokens';
import {  AgencyPositionModel } from '../../models/agency-position.model';

@Component({
  selector: 'app-agencyposition-widget',
  templateUrl: './agencyposition-widget.component.html',
  styleUrls: ['./agencyposition-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgencypositionWidgetComponent implements OnInit {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public agencyData: AgencyPositionModel | undefined;
  public agencydata:any;
  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService,private actions$: Actions, private cdr: ChangeDetectorRef,
              @Inject(GlobalWindow) protected readonly globalWindow : WindowProxy & typeof globalThis) {}

  ngOnInit(): void {
     this.agencydata = this.agencyData;
  }
  
  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }
  public toSourceContent(orgId:number): void {
    this.dashboardService.redirectToUrl('client/order-management/',undefined);
  }
}
