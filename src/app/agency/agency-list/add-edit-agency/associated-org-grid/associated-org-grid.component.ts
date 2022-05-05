import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Observable, Subject } from 'rxjs';
import { GetAssociateOrganizationsById } from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GRID_CONFIG } from 'src/app/shared/constants/grid-config';
import { AssociateOrganizations } from 'src/app/shared/models/associate-organizations.model';
@Component({
  selector: 'app-associated-org-grid',
  templateUrl: './associated-org-grid.component.html',
  styleUrls: ['./associated-org-grid.component.scss'],
})
export class AssociatedOrgGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {
  @ViewChild('grid') grid: GridComponent;

  @Select(AgencyState.associateOrganizationsItems)
  public associateOrganizations$: Observable<AssociateOrganizations[]>;

  public openAssosiateOrgDialog = new EventEmitter<boolean>();

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
   this.store.dispatch(new GetAssociateOrganizationsById(this.currentPage, this.pageSize));
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public onFilter(): void {
    //TBI
  }

  public addNew(): void {
    this.openAssosiateOrgDialog.emit(true);
  }

  public onEdit({ index }: { index: string } & AssociateOrganizations): void {
    this.grid.selectRow(Number(index) + 1);
  }

  public onRemove(data: unknown): void {
    //TBI
  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }
}
