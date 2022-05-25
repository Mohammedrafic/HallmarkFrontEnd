import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants/messages';
import { filter, Observable, of } from 'rxjs';
import { ShowSideDialog } from '../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationManagementState } from '../../../store/organization-management.state';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { Region } from '@shared/models/region.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Location } from '@shared/models/location.model';
import { Department } from '@shared/models/department.model';
import {
  ClearDepartmentList,
  ClearLocationList,
  GetDepartmentsByLocationId,
  GetLocationsByRegionId,
  GetRegions
} from '../../../store/organization-management.actions';
import { Router } from '@angular/router';
import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';
import { SaveCredentialGroupMapping, DeleteCredentialGroupMappingById, SetCredentialSetupFilter, SetNavigationTab } from '../../../store/credentials.actions';
import { CredentialGroupMapping } from '@shared/models/credential-group-mapping.model';
import { MockGroupMapping } from './mock-group-mapping';

@Component({
  selector: 'app-group-mapping',
  templateUrl: './group-mapping.component.html',
  styleUrls: ['./group-mapping.component.scss']
})
export class GroupMappingComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;

  @Input() isActive: boolean = false;

  @Select(OrganizationManagementState.skillGroups)
  skillGroups$: Observable<CredentialSkillGroup[]>;

  @Select(OrganizationManagementState.regions)
  regions$: Observable<Region[]>;

  @Select(OrganizationManagementState.locationsByRegionId)
  locations$: Observable<Location[]>;

  @Select(OrganizationManagementState.departments)
  departments$: Observable<Department[]>;
  departmentFields: FieldSettingsModel = { text: 'departmentName', value: 'departmentId' };

  // @Select(OrganizationManagementState.) // TODO: add state after BE implementation
  groupsData$: Observable<CredentialGroupMapping[]> = of(MockGroupMapping);

  public isEdit: boolean;
  public editRecordId: number | undefined;
  public groupMappingFormGroup: FormGroup;
  public regionLocationSkillGroupDropDownFields: FieldSettingsModel = { text: 'name', value: 'id' };

  private formBuilder: FormBuilder;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store,
              private router: Router,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createForm();
  }

  ngOnInit(): void {
    // TODO: get list for gridData after BE implementation
    this.store.dispatch(new GetRegions());
    // TODO: get Locations by regionId, get departments by locationId
    this.mapGridData();
  }

  public onEditButtonClick(data: any, event: any): void {
    this.isEdit = true;
    this.editRecordId = data.id;
    this.addActiveCssClass(event);

    this.store.dispatch(new GetLocationsByRegionId(data.region.id));
    this.store.dispatch(new GetDepartmentsByLocationId(data.location.id));

    setTimeout(() => {
      this.groupMappingFormGroup.setValue({
        regionId: data.region.id,
        locationId: data.location.id,
        departmentId: data.department.departmentId,
        skillGroupId: data.skillGroup.id
      });
    }, 150);

    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemoveButtonClick(data: any, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) {
          // this.store.dispatch(new DeleteCredentialGroupMappingById()); // TODO: uncomment after BE implementation
        }
        this.removeActiveCssClass();
      });
  }

  public onFormCancelClick(): void {
    this.confirmService
      .confirm(CANCEL_COFIRM_TEXT, {
        title: DELETE_CONFIRM_TITLE,
        okButtonLabel: 'Leave',
        okButtonClass: 'delete-button'
      }).pipe(filter(confirm => !!confirm))
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.clearFormDetails();
        this.removeActiveCssClass();
      });
  }

  public onFormSaveClick(): void {
    if (this.groupMappingFormGroup.valid) {

      let credentialGroupMapping: CredentialGroupMapping = {
        id: this.editRecordId,
        region: {
          id: this.groupMappingFormGroup.controls['regionId'].value
        },
        location: {
          id: this.groupMappingFormGroup.controls['locationId'].value
        },
        department: {
          departmentId: this.groupMappingFormGroup.controls['departmentId'].value
        },
        skillGroup: {
          id: this.groupMappingFormGroup.controls['skillGroupId'].value
        }
      }

      console.log(credentialGroupMapping); // TODO: remove after implementation
      //this.store.dispatch(new SaveCredentialGroupMapping(credentialGroupMapping)); // TODO: uncomment after BE implementation
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
      this.removeActiveCssClass();
    } else {
      this.groupMappingFormGroup.markAllAsTouched();
    }
  }

  public onClearAllFiltersClick(): void {
    // TODO: add implementation
  }

  public onApplyFilterClick(): void {
    // TODO: add implementation
  }

  public onCredentialSetupLinkClick(data: any): void {
    this.store.dispatch(new SetNavigationTab(CredentialsNavigationTabs.Setup));
    this.store.dispatch(new SetCredentialSetupFilter({
      regionId: data.region.id,
      locationId: data.location.id,
      departmentId: data.department.departmentId,
      skillGroupId: data.skillGroup.id
    }));
    this.router.navigateByUrl('admin/organization-management/credentials/setup');
  }

  public onRegionChange(event: any): void {
    if (event.itemData && event.itemData.id) {
      this.store.dispatch(new ClearLocationList());
      this.store.dispatch(new ClearDepartmentList());
      this.store.dispatch(new GetLocationsByRegionId(event.itemData.id));
    }
  }

  public onLocationChange(event: any): void {
    if (event.itemData && event.itemData.id) {
      this.store.dispatch(new GetDepartmentsByLocationId(event.itemData.id));
    }
  }

  public onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.groupsData$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  private clearFormDetails(): void {
    // TODO: add form reset here
    this.isEdit = false;
    this.editRecordId = undefined;
    this.groupMappingFormGroup.reset();
    this.store.dispatch(new ClearLocationList());
    this.store.dispatch(new ClearDepartmentList());
  }

  private mapGridData(): void {
    this.groupsData$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  private createForm(): void {
    // TODO: add form creation
    this.groupMappingFormGroup = this.formBuilder.group({
      regionId: ['', Validators.required],
      locationId: ['', Validators.required],
      departmentId: ['', Validators.required],
      skillGroupId: ['', Validators.required]
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
