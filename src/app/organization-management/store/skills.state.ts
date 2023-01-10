import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { ShowToast } from '../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_CANNOT_BE_SAVED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';
import { AssignedCredentialTree } from '@shared/models/credential.model';
import { AssignedSkillTree, ListOfSkills } from '@shared/models/skill.model';
import { SkillsService } from '@shared/services/skills.service';
import { GetAssignedSkillTree, GetFilteredAssignedSkillsByOrganization, SaveAssignedSkillValue } from '@organization-management/store/skills.actions';

export interface SkillsStateModel {
  assignedSkillTreeData: AssignedSkillTree | null,
  filteredAssignedSkills: ListOfSkills[] | null,
}

@State<SkillsStateModel>({
  name: 'skills',
  defaults: {
    assignedSkillTreeData: null,
    filteredAssignedSkills: null,
  }
})
@Injectable()
export class SkillsState {
  @Selector()
  static assignedSkillTree(state: SkillsStateModel): AssignedCredentialTree { return state.assignedSkillTreeData?.treeItems || []; }

  @Selector()
  static assignedSkillTreeValue(state: SkillsStateModel): string[] { return state.assignedSkillTreeData?.assignedSkillIds || []; }

  @Selector()
  static filteredAssignedSkills(state: SkillsStateModel): ListOfSkills[] | null {
    return state.filteredAssignedSkills;
  }

  constructor(private skillsService: SkillsService) {}

  @Action(GetAssignedSkillTree)
  GetAssignedSkillTree({ patchState }: StateContext<SkillsStateModel>): Observable<AssignedSkillTree> {
    return this.skillsService.getAssignedSkillsTree().pipe(tap((response) => {
      const assignedSkillIds = response.treeItems.filter((data) => !data.hasChild && !data.isAssignable).map(({id}) => id)
      const assignedSkillTreeData = {
        treeItems: response.treeItems,
        assignedSkillIds: assignedSkillIds
      }
      patchState({ assignedSkillTreeData });
    }));
  }

  @Action(GetFilteredAssignedSkillsByOrganization)
  GetFilteredAssignedSkillsByOrganization({ patchState }: StateContext<SkillsStateModel>): Observable<ListOfSkills[]> {
    return this.skillsService.getFilteredAssignedOrgSkills().pipe(tap((filteredAssignedSkills) => {
      patchState({ filteredAssignedSkills });
    }));
  }

  @Action(SaveAssignedSkillValue)
  SaveAssignedSkillValue({ dispatch, getState }: StateContext<SkillsStateModel>, { payload }: SaveAssignedSkillValue): Observable<number[] | void> {
    const { assignedSkillTreeData } = getState();
    const newSelectedSkillIds = [payload, assignedSkillTreeData?.assignedSkillIds!].reduce((newSkills, stateSkills) => newSkills.filter(skill => !stateSkills.includes(skill)));
    const newValue = (assignedSkillTreeData?.treeItems || []).filter(item => !item.hasChild && newSelectedSkillIds.includes(item.id)).map(item => item.cid);
    return this.skillsService.saveAssignedSkillValue(newValue).pipe(tap((response) => {
        dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED))
      }),
      catchError((error: any) => dispatch(new ShowToast(MessageTypes.Error, error && error.error ? getAllErrors(error.error) : RECORD_CANNOT_BE_SAVED))));
  }
}
