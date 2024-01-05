import { ScheduledIntegrationsListData, ScheduledIntegrationsListModel } from '@admin/organization-integrations/models/IntegrationMonthReportModel';
import { GetScheduledIntegrationsList } from '@admin/store/integrations.actions';
import { IntegrationsState } from '@admin/store/integrations.state';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ScheduledIntegrationsFilterDto } from '@shared/models/integrations.model';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import { Observable } from 'rxjs';

@Component({
  selector: 'scheduled-integrations',
  templateUrl: './scheduled-integrations.component.html',
  styleUrls: ['./scheduled-integrations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScheduledIntegrationsComponent implements OnInit {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;

  public ScheduledIntegrationsListDatas: ScheduledIntegrationsListData;
  public ScheduledIntegrationsListModels: ScheduledIntegrationsListModel[];

  constructor(private store: Store) {
  }

  @Select(IntegrationsState.GetScheduledIntegrationsList)
  ScheduledIntegrationsListData$: Observable<ScheduledIntegrationsListData>;

  ngOnInit(): void {
    this.getNewInterfaceListData();
  }
  ngOnDestroy(): void {
    //@TakeUntilDestroy
  }
  private getNewInterfaceListData() {

    let inputPayload = new ScheduledIntegrationsFilterDto();
    inputPayload.organizationFilter = [{ departmentsIds: [], locationIds: [], regionIds: [], organizationId: 107 }];
    this.store.dispatch(new GetScheduledIntegrationsList(inputPayload));
  }
}
