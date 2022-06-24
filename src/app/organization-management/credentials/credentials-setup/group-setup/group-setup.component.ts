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
  GetAssignedSkillsByPage,
  GetCredentialSkillGroup,
  RemoveCredentialSkillGroup,
  SaveUpdateCredentialSkillGroup
} from '../../../store/organization-management.actions';
import { UserState } from 'src/app/store/user.state';
import { Skill } from '@shared/models/skill.model';

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

  @Select(OrganizationManagementState.skills)
  assignedSkills$: Observable<any>;
  public assignedSkills: Skill[];
  public skillsId = new Set<number>();

  skillGroupsFormGroup: FormGroup;
  formBuilder: FormBuilder;

  isEdit: boolean;
  editedSkillGroupId?: number;

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
    const savedSkillIds: number[] = [];
    const savedSkillIdsIndexes: number[] = [];
    saveSkillGroup.skills?.forEach(savedSkill => {
      const foundAssignedSkill = this.assignedSkills.find(skill => skill.masterSkill?.id === savedSkill.masterSkillId);
      if (foundAssignedSkill) {
        savedSkillIds.push(foundAssignedSkill.id);
        savedSkillIdsIndexes.push(this.assignedSkills.indexOf(foundAssignedSkill));
      }
    });

    this.skillGroupsFormGroup.setValue({
      name: saveSkillGroup.name,
      skillIds: savedSkillIds
    });

    this.searchGrid.selectRows(savedSkillIdsIndexes);
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
    if (this.skillGroupsFormGroup.valid) {
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
  }

  searchSkill(event: any): void {
    this.searchGrid.search((event.target as HTMLInputElement).value);
  }

  private clearFormDetails(): void {
    this.isEdit = false;
    this.editedSkillGroupId = undefined;
    this.skillGroupsFormGroup.reset();
    this.clearSelection(this.searchGrid);
  }

  private createSkillGroupFormGroup(): void {
    this.skillGroupsFormGroup = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      skillIds: ['']
    });
  }

  private organizationChangedHandler(): void {
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.currentPage = 1;
      this.store.dispatch(new GetCredentialSkillGroup());
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, {}));
    });
  }

  private skillGroupDataLoadedHandler(): void {
    this.skillGroups$.pipe(takeUntil(this.unsubscribe$)).subscribe(savedSkillGroupsPages => {
      if (savedSkillGroupsPages && savedSkillGroupsPages.items) {
        this.skillGroups = savedSkillGroupsPages.items;
      }
    });
  }

  private assignedSkillsDataLoadedHandler(): void {
    this.assignedSkills$.pipe(takeUntil(this.unsubscribe$)).subscribe(assignedSkills => {
      if (assignedSkills && assignedSkills.items) {
        this.assignedSkills = assignedSkills.items;
      }
    });
  }
}
