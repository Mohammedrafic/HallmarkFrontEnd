import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportColumn } from '@shared/models/export.model';
import { FreezeService, GridComponent, PageSettingsModel, SortService } from '@syncfusion/ej2-angular-grids';
import { debounceTime, Observable, Subject } from 'rxjs';
import { ORDERS_GRID_CONFIG } from 'src/app/client/client.config';
import { Status, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { Organization, OrganizationPage } from 'src/app/shared/models/organization.model';
import { SetHeaderState, ShowExportDialog } from 'src/app/store/app.actions';
import { GetOrganizationsByPage } from '../../store/admin.actions';
import { AdminState } from '../../store/admin.state';

@Component({
  selector: 'app-client-management-content',
  templateUrl: './client-management-content.component.html',
  styleUrls: ['./client-management-content.component.scss'],
  providers: [SortService, FreezeService]
})
export class ClientManagementContentComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {

  private pageSubject = new Subject<number>();

  public initialSort = {
    columns: [
      { field: 'createUnder.name', direction: 'Ascending' }
    ]
  };

  public columnsToExport: ExportColumn[] = [
    { text:'Organization Name', column: 'createUnder.name'},
    { text:'Organization Status', column: 'generalInformation.status'},
    { text:'City', column: 'generalInformation.city'},
    { text:'Contact', column: 'contactDetails.0.contactPerson'},
    { text:'Phone', column: 'contactDetails.0.phoneNumberExt'}
  ];
  public fileName: string;

  public readonly statusEnum = Status;

  readonly ROW_HEIGHT = 64;

  @Select(AdminState.organizations)
  organizations$: Observable<OrganizationPage>;

  @ViewChild('grid')
  public grid: GridComponent;

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe) {
    super();
    this.idFieldName = 'organizationId';
    this.fileName = 'Organizations ' + datePipe.transform(Date.now(),'MM/dd/yyyy');
    store.dispatch(new SetHeaderState({ title: 'Organization List', iconName: 'file-text' }));
  }

  ngOnInit(): void {
    this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(debounceTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize));
    });
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = this.ROW_HEIGHT;
  }

  public override customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport() {
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: any): void {
    this.store.dispatch(new ShowExportDialog(false));
    this.clearSelection(this.grid);
  }

  public navigateToOrganizationForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  //TODO: create a pipe
  public getChipCssClass(status: string): string {
    const found = Object.entries(STATUS_COLOR_GROUP).find(item => item[1].includes(status));
    return found ? found[0] : 'e-default';
  }

  public editOrganization(data: Organization): void {
    this.router.navigate(['./edit', data.organizationId], { relativeTo: this.route });
  }
}
