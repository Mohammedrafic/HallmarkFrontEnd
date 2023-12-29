import { Component, OnInit, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { GlobalWindow } from '@core/tokens';
import { Store } from '@ngxs/store';
import { DashboardService } from '../../services/dashboard.service';
import { AgencyTImesheetsummaryModel } from '../../models/agency-timesheet-summary.models';
import { FilteredItem } from '@shared/models/filter.model';
import { timesheetsummarystatus } from './agency-timesheet-summary.enum';

@Component({
  selector: 'app-agency-timesheet-summary',
  templateUrl: './agency-timesheet-summary.component.html',
  styleUrls: ['./agency-timesheet-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgencyTimesheetSummaryComponent extends AbstractPermissionGrid {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public chartData: AgencyTImesheetsummaryModel | undefined;
  public agencydata: any;
  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private readonly dashboardService: DashboardService, protected override store: Store,
    @Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis,
  ) {
    super(store);
  }

  ngOnChanges(): void {
    this.agencydata = this.chartData;
  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }

  public toSourceContent(orgname: any): void {
    if(orgname=== timesheetsummarystatus.Incomplete)
    {
      this.globalWindow.localStorage.setItem("agencytimeSheetincomplete", JSON.stringify(orgname));

    }
    else{
      this.globalWindow.localStorage.setItem("agencytimeSheetSummary", JSON.stringify(orgname));

    }
    const dashboardFilterState = this.globalWindow.localStorage.getItem('dashboardFilterState') || 'null';

    const items = JSON.parse(dashboardFilterState) as FilteredItem[] || [];
    if (items.length > 0) {
      this.dashboardService.redirectToUrlWithAgencyposition('agency/timesheets', items[0].organizationId, "setOrg");
    }
    else {
      this.dashboardService.redirectToUrl('agency/timesheets');

    }

  }
}
