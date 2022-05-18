import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridComponent, PagerComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import {
  AbstractGridConfigurationComponent
} from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { OrganizationManagementState } from '../../../store/organization-management.state';
import { ShowSideDialog } from '../../../../store/app.actions';
import {
  CANCEL_COFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE
} from '@shared/constants/messages';
import { ConfirmService } from '@shared/services/confirm.service';
import { CredentialSkillGroup } from '@shared/models/skill-group.model';
import {
  GetAssignedSkillsByPage, GetCredentialSkillGroup,
  RemoveCredentialSkillGroup,
  SaveCredentialSkillGroup,
  UpdateCredentialSkillGroup
} from '../../../store/organization-management.actions';

@Component({
  selector: 'app-group-setup',
  templateUrl: './group-setup.component.html',
  styleUrls: ['./group-setup.component.scss']
})
export class GroupSetupComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;

  @Input() isActive: boolean = false;

  @Select(OrganizationManagementState.skillGroups)
  skillGroups$: Observable<CredentialSkillGroup[]>;

  @Select(OrganizationManagementState.skills)
  skills$: Observable<any>;
  skillsFields = {
    text: 'masterSkill.skillDescription',
    value: 'id',
  };

  skillGroupsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedSkillGroupId?: number;

  private fakeOrganizationId = 2; // TODO: remove after BE implementation
  private skillGroupPathName = 'admin/organization-management/credentials/groups-setup';

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createSkillGroupFormGroup();
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCredentialSkillGroup(this.fakeOrganizationId));
    this.mapGridData();
    // this.store.dispatch(new GetAssignedSkillsByPage(1, 30));
  }

  onEditButtonClick(skillGroup: CredentialSkillGroup, event: any): void {
    this.addActiveCssClass(event);
    this.skillGroupsFormGroup.setValue({
      name: skillGroup.name,
      skillIds: skillGroup.skills.map((item: any) => item.id)
    });
    this.isEdit = true;
    this.editedSkillGroupId = skillGroup.id;
    this.store.dispatch(new ShowSideDialog(true));
  }

  onRemoveButtonClick(skillGroup: CredentialSkillGroup, event: any): void {
    this.addActiveCssClass(event);
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button'
      })
      .subscribe((confirm) => {
        if (confirm) { // TODO: add verification to prevent remove if skillGroup is used elsewhere
          this.store.dispatch(new RemoveCredentialSkillGroup(skillGroup, this.fakeOrganizationId));
        }
      });
    this.removeActiveCssClass();
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
    if (this.skillGroupsFormGroup.valid) {
      if (this.isEdit) {
        const skillGroup = new CredentialSkillGroup({
          id: this.editedSkillGroupId,
          skillIds: this.skillGroupsFormGroup.controls['skillIds'].value
        });
        this.store.dispatch(new UpdateCredentialSkillGroup(skillGroup, this.fakeOrganizationId)); // TODO: remove fakeOrganizationId after BE implementation
        this.isEdit = false;
      } else {
        const skillGroup = new CredentialSkillGroup({
          name: this.skillGroupsFormGroup.controls['name'].value,
          organizationId: this.fakeOrganizationId,
          skillIds: this.skillGroupsFormGroup.controls['skillIds'].value
        });
        this.store.dispatch(new SaveCredentialSkillGroup(skillGroup, this.fakeOrganizationId));  // TODO: remove fakeOrganizationId after BE implementation
        this.store.dispatch(new ShowSideDialog(false));
        this.skillGroupsFormGroup.reset();
        this.removeActiveCssClass();
      }
    } else {
      this.skillGroupsFormGroup.markAllAsTouched();
    }
  }

  onRowsDropDownChanged(): void {
    this.grid.pageSettings.pageSize = this.pageSizePager = this.getActiveRowsPerPage();
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.skillGroups$.subscribe(data => {
        this.gridDataSource = this.getRowsPerPage(data, event.currentPage || event.value);
        this.currentPagerPage = event.currentPage || event.value;
      });
    }
  }

  mapGridData(): void {
    this.skillGroups$.subscribe(data => {
      this.lastAvailablePage = this.getLastPage(data);
      this.gridDataSource = this.getRowsPerPage(data, this.currentPagerPage);
      this.totalDataRecords = data.length;
    });
  }

  private clearFormDetails(): void {
    this.isEdit = false;
    this.editedSkillGroupId = undefined;
    this.skillGroupsFormGroup.reset();
  }

  private createSkillGroupFormGroup(): void {
    this.skillGroupsFormGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      skillIds: ['', Validators.required]
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
