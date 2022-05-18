import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, takeWhile } from 'rxjs';

import {
  DeleteAssociateOrganizationsById,
  GetAssociateOrganizationsById,
  UpdateAssociateOrganizationsPage,
} from 'src/app/agency/store/agency.actions';
import { AgencyState } from 'src/app/agency/store/agency.state';
import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GRID_CONFIG } from 'src/app/shared/constants/grid-config';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from 'src/app/shared/constants/messages';
import { AssociateOrganizations, AssociateOrganizationsPage } from 'src/app/shared/models/associate-organizations.model';
import { ConfirmService } from 'src/app/shared/services/confirm.service';
@Component({
  selector: 'app-associated-org-grid',
  templateUrl: './associated-org-grid.component.html',
  styleUrls: ['./associated-org-grid.component.scss'],
})
export class AssociatedOrgGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;

  @Select(AgencyState.associateOrganizationsItems)
  public associateOrganizations$: Observable<AssociateOrganizations[]>;

  @Select(AgencyState.associateOrganizationsPages)
  public associateOrganizationsPages$: Observable<AssociateOrganizationsPage>;

  public openAssosiateOrgDialog = new EventEmitter<boolean>();
  public openEditDialog = new EventEmitter<AssociateOrganizations>();

  private isAlive = true;

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.dispatchNewPage();

    this.actions$
      .pipe(
        ofActionSuccessful(UpdateAssociateOrganizationsPage),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {

        this.dispatchNewPage();
      });
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onFilter(): void {
    //TBI
  }

  public addNew(): void {
    this.openAssosiateOrgDialog.emit(true);
  }

  public onEdit({ index, ...org }: { index: string } & AssociateOrganizations): void {
    this.grid.selectRow(Number(index) + 1);
    this.openEditDialog.emit(org);
  }

  public onEditEnd(): void {
    this.grid.clearRowSelection();
  }

  public onRemove({ index, ...org }: { index: string } & AssociateOrganizations): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        if (org.id) {
          this.store.dispatch(new DeleteAssociateOrganizationsById(org.id));
        }
      });
  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.dispatchNewPage();
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
    this.dispatchNewPage();
  }

  private dispatchNewPage(): void {
    this.store.dispatch(new GetAssociateOrganizationsById(this.currentPage, this.pageSize));
  }
}
