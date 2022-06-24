import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { FreezeService, GridComponent, SortService } from '@syncfusion/ej2-angular-grids';
import { Observable, Subject, throttleTime } from 'rxjs';
import { Status, STATUS_COLOR_GROUP } from 'src/app/shared/enums/status';
import { Organization, OrganizationPage } from 'src/app/shared/models/organization.model';
import { SetHeaderState, ShowExportDialog } from 'src/app/store/app.actions';
import { ExportOrganizations, GetOrganizationsByPage } from '../../store/admin.actions';
import { AdminState } from '../../store/admin.state';

@Component({
  selector: 'app-client-management-content',
  templateUrl: './client-management-content.component.html',
  styleUrls: ['./client-management-content.component.scss'],
  providers: [SortService, FreezeService]
})
export class ClientManagementContentComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {

  private pageSubject = new Subject<number>();

  public columnsToExport: ExportColumn[] = [
    { text:'Organization Name', column: 'OrganizationName'},
    { text:'Organization Status', column: 'OrganizationStatus'},
    { text:'City', column: 'City'},
    { text:'Contact', column: 'Contact'},
    { text:'Phone', column: 'Phone'} 
  ];
  public fileName: string;
  public defaultFileName: string;

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
    this.idFieldName = 'organizationId';
    this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize));
    this.pageSubject.pipe(throttleTime(1)).subscribe((page) => {
      this.currentPage = page;
      this.store.dispatch(new GetOrganizationsByPage(this.currentPage, this.pageSize));
    });
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = this.ROW_HEIGHT;
  }

  public override customExport(): void {
    this.defaultFileName = 'Organization List ' + this.generateDateTime(this.datePipe);
    this.fileName = this.defaultFileName;
    this.store.dispatch(new ShowExportDialog(true));
  }

  public closeExport() {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.defaultFileName = 'Organization List ' + this.generateDateTime(this.datePipe);
    this.store.dispatch(new ExportOrganizations(new ExportPayload(
      fileType,
      { ids: this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null },
      options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
      null,
      options?.fileName || this.defaultFileName
    )));
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
