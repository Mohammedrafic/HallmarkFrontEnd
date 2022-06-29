import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridComponent, SearchService } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
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
import { CredentialSkillGroup, CredentialSkillGroupPage, CredentialSkillGroupPost } from '@shared/models/skill-group.model';
import {
  GetAllOrganizationSkills,
  GetAssignedSkillsByPage,
  GetCredentialSkillGroup,
  RemoveCredentialSkillGroup,
  SaveUpdateCredentialSkillGroup
} from '../../../store/organization-management.actions';
import { UserState } from 'src/app/store/user.state';
import { Skill, SkillsPage } from '@shared/models/skill.model';

@Component({
  selector: 'app-group-setup',
  templateUrl: './group-setup.component.html',
  styleUrls: ['./group-setup.component.scss'],
  providers: [SearchService]
})
export class GroupSetupComponent extends AbstractGridConfigurationComponent implements OnInit, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('searchGrid') searchGrid: GridComponent;
  @ViewChild('searchInputWithIcon') search: ElementRef;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  @Select(OrganizationManagementState.skillGroups)
  skillGroups$: Observable<CredentialSkillGroupPage>;
  public skillGroups: CredentialSkillGroup[];

  @Select(OrganizationManagementState.allOrganizationSkills)
  allOrganizationSkills$: Observable<Skill[]>;
  public filteredAssignedSkills: Skill[];
  public allAssignedSkills: Skill[];
  public searchDataSource: Skill[];
  public skillsId = new Set<number>();

  skillGroupsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isGridStateInvalid = false;
  isEdit: boolean;
  editedSkillGroupId?: number;

  private reservedMasterSkillIds: number[] = [];
  private unsubscribe$: Subject<void> = new Subject();
  private pageSubject = new Subject<number>();

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
    this.organizationChangedHandler();
    this.skillGroupDataLoadedHandler();
    this.assignedSkillsDataLoadedHandler();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onEditButtonClick(saveSkillGroup: CredentialSkillGroup, event: any): void {
    this.addActiveCssClass(event);
    // reassign search grid data to allAssignedSkills in Edit mode
    this.searchDataSource = this.allAssignedSkills;

    this.skillGroupsFormGroup.setValue({
      name: saveSkillGroup.name,
      skillIds: []
    });

    this.isGridStateInvalid = false;
    this.isEdit = true;
    this.editedSkillGroupId = saveSkillGroup.id;
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
    if (this.skillGroupsFormGroup.dirty) {
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
    } else {
      this.store.dispatch(new ShowSideDialog(false));
      this.clearFormDetails();
      this.removeActiveCssClass();
    }
  }

  onFormSaveClick(): void {
    if (this.skillGroupsFormGroup.valid && this.skillsId.size !== 0) {
      if (this.isEdit) {
        const skillGroup: CredentialSkillGroupPost = {
          id: this.editedSkillGroupId,
          name: this.skillGroupsFormGroup.controls['name'].value,
          skillIds: Array.from(this.skillsId)
        };
        this.store.dispatch(new SaveUpdateCredentialSkillGroup(skillGroup));
        this.store.dispatch(new ShowSideDialog(false));
        this.removeActiveCssClass();
        this.clearFormDetails();
      } else {
        const skillGroup: CredentialSkillGroupPost = {
          name: this.skillGroupsFormGroup.controls['name'].value,
          skillIds: Array.from(this.skillsId)
        };

        this.store.dispatch(new SaveUpdateCredentialSkillGroup(skillGroup));
        this.store.dispatch(new ShowSideDialog(false));
        this.removeActiveCssClass();
        this.clearFormDetails();
      }
    } else {
      this.isGridStateInvalid = this.skillsId.size === 0;
      this.skillGroupsFormGroup.markAllAsTouched();
    }
  }

  onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.pageSubject.next(event.currentPage || event.value);
    }
  }

  selectSkillId(event: any): void {
    if (event.data.length) {
      event.data.forEach((item: any) => {
        if (item) {
          this.skillsId.add(item.id);
        }
      });
    } else if (event.data) {
      this.skillsId.add(event.data.id);
    }

    this.isGridStateInvalid = this.skillsId.size === 0;
  }

  removeSkillId(event: any): void {
    if (event.data.length) {
      event.data.forEach((item: any) => {
        if (item) {
          this.skillsId.delete(item.id);
        }
      });
    } else if (event.data) {
      this.skillsId.delete(event.data.id);
    }

    this.isGridStateInvalid = this.skillsId.size === 0;
  }

  searchSkill(event: any): void {
    this.searchGrid.search((event.target as HTMLInputElement).value);
  }

  private clearFormDetails(): void {
    this.isEdit = false;
    this.editedSkillGroupId = undefined;
    this.skillGroupsFormGroup.reset();
    this.clearSelection(this.searchGrid);
    this.searchDataSource = this.filteredAssignedSkills;
    this.isGridStateInvalid = false;
  }

  private createSkillGroupFormGroup(): void {
    this.skillGroupsFormGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      skillIds: ['']
    });
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.currentPage = 1;
      this.store.dispatch(new GetCredentialSkillGroup());
      this.store.dispatch(new GetAllOrganizationSkills());
    });
  }

  private skillGroupDataLoadedHandler(): void {
    this.skillGroups$.pipe(takeUntil(this.unsubscribe$)).subscribe(savedSkillGroupsPages => {
      if (savedSkillGroupsPages && savedSkillGroupsPages.items) {
        savedSkillGroupsPages.items.forEach(item => {
          let masterSkillIds = item.skills?.map(s => s.id);
          this.reservedMasterSkillIds = masterSkillIds ? masterSkillIds : [];
        });
        this.skillGroups = savedSkillGroupsPages.items;
      }
    });
  }

  private assignedSkillsDataLoadedHandler(): void {
    this.allOrganizationSkills$.pipe(takeUntil(this.unsubscribe$)).subscribe(assignedSkills => {
      if (assignedSkills) {
        this.allAssignedSkills = assignedSkills;
        this.filteredAssignedSkills = assignedSkills.filter(assignedSkill => {
          if (!this.reservedMasterSkillIds.includes(assignedSkill.id)) {
            return assignedSkill;
          }
          return null;
        });
        this.searchDataSource = this.filteredAssignedSkills;
      }
    });
  }
}
