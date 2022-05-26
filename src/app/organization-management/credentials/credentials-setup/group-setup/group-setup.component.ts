import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridComponent, SearchService } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, of } from 'rxjs';
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
  GetAssignedSkillsByPage,
  GetCredentialSkillGroup,
  RemoveCredentialSkillGroup,
  SaveCredentialSkillGroup,
  UpdateCredentialSkillGroup
} from '../../../store/organization-management.actions';

@Component({
  selector: 'app-group-setup',
  templateUrl: './group-setup.component.html',
  styleUrls: ['./group-setup.component.scss'],
  providers: [SearchService]
})
export class GroupSetupComponent extends AbstractGridConfigurationComponent implements OnInit {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('searchGrid') searchGrid: GridComponent;
  @ViewChild('searchInputWithIcon') search: ElementRef;

  @Input() isActive: boolean = false;

  @Select(OrganizationManagementState.skillGroups)
  skillGroups$: Observable<CredentialSkillGroup[]>;

  @Select(OrganizationManagementState.skills)
  skills$: Observable<any>;
  skillsFields = {
    text: 'masterSkill.skillDescription',
    value: 'id',
  };
  skillsId = new Set<number>();

  skillGroupsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedSkillGroupId?: number;

  get dialogHeader(): string {
    return this.isEdit ? 'Edit' : 'Add';
  }

  get searchTermControl(): AbstractControl | null {
    return this.skillGroupsFormGroup.get('skillIds');
  }

  constructor(private store: Store,
              @Inject(FormBuilder) private builder: FormBuilder,
              private confirmService: ConfirmService) {
    super();
    this.formBuilder = builder;
    this.createSkillGroupFormGroup();
  }

  ngOnInit(): void {
    // this.store.dispatch(new GetCredentialSkillGroup()); // TODO: uncomment after BE fixed
    this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize));
    this.mapGridData();
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
        if (confirm) {
          this.store.dispatch(new RemoveCredentialSkillGroup(skillGroup));
        }
        this.removeActiveCssClass();
      });
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
        this.store.dispatch(new UpdateCredentialSkillGroup(skillGroup));
        this.isEdit = false;
      } else {
        const skillGroup = new CredentialSkillGroup({
          name: this.skillGroupsFormGroup.controls['name'].value,
          skillIds: this.skillGroupsFormGroup.controls['skillIds'].value
        });
        this.store.dispatch(new SaveCredentialSkillGroup(skillGroup));
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

  selectSkillId(event: any): void {
    if (event.data.length) {
      event.data.forEach((item: any) => {
        if (item.data && item.data.masterSkill) {
          this.skillsId.add(item.masterSkill.id);
        }
      });
    } else if (event.data.masterSkill) {
      this.skillsId.add(event.data.masterSkill.id);
    }
  }

  removeSkillId(event: any): void {
    if (event.data.length) {
      event.data.forEach((item: any) => {
        if (item.data && item.data.masterSkill) {
          this.skillsId.delete(item.data.masterSkill.id);
        }
      });
    } else if (event.data.masterSkill) {
      this.skillsId.delete(event.data.masterSkill.id);
    }
  }

  searchSkill(event: any): void {
    this.searchGrid.search((event.target as HTMLInputElement).value);
  }

  private clearFormDetails(): void {
    this.isEdit = false;
    this.editedSkillGroupId = undefined;
    this.skillGroupsFormGroup.reset();
  }

  private createSkillGroupFormGroup(): void {
    this.skillGroupsFormGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      skillIds: ['']
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
