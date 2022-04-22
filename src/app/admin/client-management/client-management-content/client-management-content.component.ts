import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { FreezeService, GridComponent, PageSettingsModel, SortService } from '@syncfusion/ej2-angular-grids';
import { Observable } from 'rxjs';
import { ORDERS_GRID_CONFIG } from 'src/app/client/client.config';
import { Status, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { OrganizationPage } from 'src/app/shared/models/organization.model';
import { SetHeaderState } from 'src/app/store/app.actions';
import { GetOrganizationsByPage } from '../../store/admin.actions';
import { AdminState } from '../../store/admin.state';

@Component({
  selector: 'app-client-management-content',
  templateUrl: './client-management-content.component.html',
  styleUrls: ['./client-management-content.component.scss'],
  providers: [SortService, FreezeService]
})
export class ClientManagementContentComponent implements OnInit, AfterViewInit {

  public pageSettings: PageSettingsModel = ORDERS_GRID_CONFIG.gridPageSettings;
  public allowPaging = ORDERS_GRID_CONFIG.isPagingEnabled;
  public gridHeight = ORDERS_GRID_CONFIG.gridHeight;
  public rowsPerPageDropDown = ORDERS_GRID_CONFIG.rowsPerPageDropDown;
  public activeRowsPerPageDropDown = ORDERS_GRID_CONFIG.rowsPerPageDropDown[0];

  public initialSort = {
    columns: [
      { field: 'name', direction: 'Ascending' }
    ]
  };

  public resizeSettings = { mode: 'Auto' };

  public readonly statusEnum = Status;

  public currentPage = 1;
  public pageSize = 30;

  readonly ROW_HEIGHT = 64;

  @Select(AdminState.organizations)
  organizations$: Observable<OrganizationPage>;

  @ViewChild('grid')
  public grid: GridComponent;

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    store.dispatch(new SetHeaderState({title: 'Organization List'}));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize));
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = this.ROW_HEIGHT;
  }

  public navigateToOrganizationForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  //TODO: create a pipe
  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }
}
