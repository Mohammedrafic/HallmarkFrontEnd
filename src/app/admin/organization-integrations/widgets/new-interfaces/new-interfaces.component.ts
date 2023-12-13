import { NewInterfaceListdata } from '@admin/organization-integrations/models/IntegrationMonthReportModel';
import { GetNewInterfaceList } from '@admin/store/integrations.actions';
import { IntegrationsState } from '@admin/store/integrations.state';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { IntegrationFilterDto } from '@shared/models/integrations.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-interfaces',
  templateUrl: './new-interfaces.component.html',
  styleUrls: ['./new-interfaces.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewInterfacesComponent implements OnInit {
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;

  constructor( private store: Store ) {    
  }

  @Select(IntegrationsState.NewInterfaceListState)
  NewInterfaceListState$: Observable<NewInterfaceListdata>;
   
  ngOnInit(): void {
     this.getNewInterfaceListData();     
  }
  ngOnDestroy(): void {
    //@TakeUntilDestroy
  }
  private getNewInterfaceListData()  { 
    let inputPayload = new IntegrationFilterDto();
    inputPayload.interfaceIds = [];
    inputPayload.organizationFilter = [{ departmentsIds: [], locationIds: [], regionIds: [], organizationId: 107 }];
    this.store.dispatch(new GetNewInterfaceList(inputPayload));
  }
}
