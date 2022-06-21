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
  SaveCredentialSkillGroup,
  UpdateCredentialSkillGroup
} from '../../../store/organization-management.actions';
import { UserState } from 'src/app/store/user.state';

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
    this.organizationId$.pipe(takeUntil(this.unsubscribe$)).subscribe(id => {
      this.currentPage = 1;
      this.store.dispatch(new GetCredentialSkillGroup());
      this.store.dispatch(new GetAssignedSkillsByPage(this.currentPage, this.pageSize, {}));
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onEditButtonClick(skillGroup: CredentialSkillGroup, event: any): void {
    this.addActiveCssClass(event);
    this.skillGroupsFormGroup.setValue({
      name: skillGroup.name,
      skillIds: skillGroup.skills?.map((item: any) => item.id)
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
        this.store.dispatch(new UpdateCredentialSkillGroup(skillGroup));
        this.isEdit = false;
      } else {
        const skillGroup: CredentialSkillGroupPost = {
          name: this.skillGroupsFormGroup.controls['name'].value,
          skillIds: Array.from(this.skillsId)
        };

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
        if (item && item.masterSkill) {
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
        if (item && item.masterSkill) {
          this.skillsId.delete(item.masterSkill.id);
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
}
