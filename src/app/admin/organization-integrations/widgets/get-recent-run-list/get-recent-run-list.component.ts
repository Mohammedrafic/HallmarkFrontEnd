import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Input} from '@angular/core';
import { IntegrationFilterDto } from '../../../../shared/models/integrations.model';
import { Select, Store } from '@ngxs/store';
import { IntegrationsState } from '../../../store/integrations.state';
import { GetLast12MonthIntegrationRuns, GetRecentRunsList } from '../../../store/integrations.actions';
import { RecentRunsListModel } from '../../models/RecentRunsListModel';
import { Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'app-get-recent-run-list',
  templateUrl: './get-recent-run-list.component.html',
  styleUrls: ['./get-recent-run-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GetRecentRunListComponent implements OnInit  {
  constructor(private store: Store) {
  }
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false = true;
  @Input() public description: string;
  @Select(IntegrationsState.getRecentRunsList)
  RecentListData$: Observable<RecentRunsListModel[]>

  ngOnInit(): void {
    this.getRecentRunsList();
  }
  private getRecentRunsList()
  {
    let inputPayload = new IntegrationFilterDto();
    inputPayload.interfaceIds = [];
    inputPayload.organizationFilter = [{ departmentsIds: [], locationIds: [], regionIds: [], organizationId: 16 }];
    this.store.dispatch(new GetRecentRunsList(inputPayload));
  }
}
