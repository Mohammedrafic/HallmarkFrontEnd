import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Store } from '@ngxs/store';
import { DASHBOARD_FILTER_STATE } from '@shared/constants';
import { SetLastSelectedOrganizationAgencyId } from 'src/app/store/user.actions';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

@Component({
  selector: 'app-cleared-to-start',
  templateUrl: './cleared-to-start.component.html',
  styleUrls: ['./cleared-to-start.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClearedToStartComponent implements OnInit {

  @Input() public chartData: any | undefined ;
  @Input() isDarkTheme: boolean | false;
  @Input() description: string;
  @Input() public isLoading: boolean;

  private mousePosition = {
    x: 0,
    y: 0,
  };

  constructor(private store: Store,private readonly dashboardService: DashboardService) { }

  ngOnInit(): void {

  }

  public defineMousePosition($event: MouseEvent): void {
    this.mousePosition.x = $event.screenX;
    this.mousePosition.y = $event.screenY;
  }
  public navigateUrl(event: MouseEvent,status:any,value:string){
    let candidatesStatusDataSet:any = []

    if((value=='total' && status.total !== 0) || (value=='cleared' && status.clearToStart !== 0)) 
    {
    let lastSelectedOrganizationId = window.localStorage.getItem("lastSelectedOrganizationId");
    let filteredList = JSON.parse(window.localStorage.getItem(DASHBOARD_FILTER_STATE) as string) || [];
    if (filteredList.length > 0) {
      let organizations = filteredList.filter((ele: any) => ele.column == "organizationIds").sort((a: any, b: any) => a.value - b.value);
      if (organizations.length > 0 && organizations[0].value != lastSelectedOrganizationId) {
        this.store.dispatch(
          new SetLastSelectedOrganizationAgencyId({
            lastSelectedAgencyId: null,
            lastSelectedOrganizationId: organizations[0].value
          })
        );
      }
    }
    window.localStorage.setItem("orderTypeFromDashboard", JSON.stringify(true));
    candidatesStatusDataSet.push({"value":CandidatStatus.OnBoard});
    candidatesStatusDataSet.push({"value":CandidatStatus.Accepted});
    window.localStorage.setItem("candidateStatusListFromDashboard",JSON.stringify(candidatesStatusDataSet));

    if(value=="total")
    {
      window.localStorage.setItem("clearedtostarttotal",JSON.stringify(status.total));
      window.localStorage.setItem("cleatedtostartdate",JSON.stringify(status.dateRanges));

    }else{
      window.localStorage.setItem("clearedtostart",JSON.stringify(status.clearToStart));
      window.localStorage.setItem("cleatedtostartdate",JSON.stringify(status.dateRanges));
    }

      this.dashboardService.redirectToUrlWithActivePositions('client/order-management');
    }
   }
  
}
