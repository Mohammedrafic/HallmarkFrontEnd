import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { Select, Store } from '@ngxs/store';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { CANCEL_COFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants/messages';
import { filter, Observable } from 'rxjs';
import { ShowSideDialog } from '../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrganizationManagementState } from '../../../store/organization-management.state';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import { Region } from '@shared/models/region.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Location } from '@shared/models/location.model';
import { Department } from '@shared/models/department.model';
import { GetRegions } from '../../../store/organization-management.actions';

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

  public isEdit: boolean;
  public groupMappingFormGroup: FormGroup;
  public regionLocationSkillGroupDropDownFields: FieldSettingsModel = { text: 'name', value: 'id' };

  private formBuilder: FormBuilder;
  private fakeOrganizationId = 2; // TODO: remove after BE implementation

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createForm();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetRegions());
  }

  onEditButtonClick(data: any, event: any): void {
    // TODO need implementation
    this.isEdit = true;
  }

  onRemoveButtonClick(data: any, event: any): void {
    // TODO need implementation
  }

  mapGridData(): void {
    // TODO: need implementation
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    // TODO: need implementation
  }

  onFormCancelClick(): void {
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

  onFormSaveClick(): void {
    // TODO: add save functionality
  }

  private clearFormDetails(): void {
    // TODO: add form reset here
    this.isEdit = false;
    this.groupMappingFormGroup.reset();
  }

  private createForm(): void {
    // TODO: add form creation
    this.groupMappingFormGroup = this.formBuilder.group({
      region: ['', Validators.required],
      location: ['', Validators.required],
      department: ['', Validators.required],
      skillGroup: ['', Validators.required]
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
