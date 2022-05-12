import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Observable, of } from 'rxjs';
import { DetailRowService, GridComponent, PagerComponent, parentsUntil } from '@syncfusion/ej2-angular-grids';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Department } from '@shared/models/department.model';
import { Location } from '@shared/models/location.model';
import { AdminState } from '@admin/store/admin.state';
import { Region } from '@shared/models/region.model';
import { OrganizationSettingsGet } from '@shared/models/organization-settings.model';
import { MockSettings } from '@admin/organization-management/organization-management-content/settings/mock-settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [DetailRowService]
})
export class SettingsComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('gridPager') pager: PagerComponent;

  organizationSettingsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  // TODO: add selector, model
  settings$: Observable<OrganizationSettingsGet[]> = of(MockSettings);

  @Select(AdminState.regions)
  regions$: Observable<Region[]>;

  @Select(AdminState.departments)
  departments$: Observable<Department[]>;

  @Select(AdminState.locationsByRegionId)
  locations$: Observable<Location[]>

  fakeOrganizationId = 2; // TODO: remove after BE implementation

  isRowExpanded = false;
  isSwitchEnabled = false;

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder) {
    super();
    this.formBuilder = builder;
    this.createSettingsForm();
  }

  ngOnInit(): void {
    this.mapGridData();
  }

  onOverrideButtonClick(data: any, event: any): void {
    // TODO: need implementation
  }

  onEditButtonClick(data: any, event: any): void {
    // TODO: need implementation
  }

  onFormCancelClick(): void {
    // TODO: need implementation
  }

  onFormSaveClick(): void {
    // TODO: need implementation
  }

  mapGridData(): void {
    this.settings$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  rowDataBound(args:any){
    // TODO: hide chevron on row if no child records
    // let childrecord = [];
    // if(childrecord.length == 0) {
    //   args.row.querySelector('td').innerHTML=' ';
    //   args.row.querySelector('td').className = 'e-customized-expand-cell';
    // }
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.settings$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  private createSettingsForm(): void {
    this.organizationSettingsFormGroup = this.formBuilder.group({
      attributeName: [{ value: '', disabled: true }, Validators.required],
      regionId: ['', Validators.required],
      locationId: ['', Validators.required],
      departmentId: ['', Validators.required],
      value: [false]
    });
  }

  private getActiveRowsPerPage(): number {
    return parseInt(this.activeRowsPerPageDropDown);
  }

  private getRowsPerPage(data: object[], currentPage: number): object[] {
    return data.slice((currentPage * this.getActiveRowsPerPage()) - this.getActiveRowsPerPage(),
      (currentPage * this.getActiveRowsPerPage()));
  }

  private getLastPage(data: object[]): number {
    return Math.round(data.length / this.getActiveRowsPerPage()) + 1;
  }
}
