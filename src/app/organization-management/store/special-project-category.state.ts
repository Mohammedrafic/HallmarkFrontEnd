import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { SpecialProjectCategory, SpecialProjectCategoryPage } from 'src/app/shared/models/special-project-category.model';
import {
  GetSpecialProjectCategories, SaveSpecialProjectCategory,
  SaveSpecialProjectCategorySucceeded, SetIsDirtySpecialProjectCategoryForm,
  DeletSpecialProjectCategory,
  DeletSpecialProjectCategorySucceeded,
  GetSpecialProjectCategoryById
} from './special-project-category.actions';
import { SpecialProjectCategoryService } from '@shared/services/special-project-category.service';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from 'src/app/shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { getAllErrors } from '@shared/utils/error.utils';

export interface SpecialProjectCategoryStateModel {
  specialProjectCategoryPage: SpecialProjectCategoryPage | null;
  isSpecialProjectCategoryLoading: boolean,
  specialProjectCategoryEntity: SpecialProjectCategory | null;
}


@State<SpecialProjectCategoryStateModel>({
  name: 'specialProjectCategory',
  defaults: {
    specialProjectCategoryPage: null,
    isSpecialProjectCategoryLoading: false,
    specialProjectCategoryEntity: null
  },
})
@Injectable()
export class SpecialProjectCategoryState {

  @Selector()
  static specialProjectCategoryPage(state: SpecialProjectCategoryStateModel): SpecialProjectCategoryPage | null {
    return state.specialProjectCategoryPage;
  }

  @Selector()
  static isSpecialProjectCategoryLoading(state: SpecialProjectCategoryStateModel): boolean { return state.isSpecialProjectCategoryLoading; }

  @Selector()
  static specialProjectCategoryEntity(state: SpecialProjectCategoryStateModel): SpecialProjectCategory | null {
    return state.specialProjectCategoryEntity;
  }


  constructor(private specialProjectCategoryService: SpecialProjectCategoryService) { }

  @Action(GetSpecialProjectCategories)
  GetSpecialProjectCategories({ patchState }: StateContext<SpecialProjectCategoryStateModel>, { }: GetSpecialProjectCategories): Observable<SpecialProjectCategoryPage> {
    patchState({ isSpecialProjectCategoryLoading: true });
    return this.specialProjectCategoryService.getSpecialProjectCategories().pipe(
      tap((payload) => {
        patchState({ isSpecialProjectCategoryLoading: false, specialProjectCategoryPage: payload });
        return payload;
      })
    );
  }

  @Action(SaveSpecialProjectCategory)
  SaveSpecialProject(
    { dispatch }: StateContext<SpecialProjectCategoryStateModel>,
    { specialProjectCategory }: SaveSpecialProjectCategory
  ): Observable<SpecialProjectCategory | void> {
    return this.specialProjectCategoryService.saveSpecialProjectCategory(specialProjectCategory).pipe(
      tap((order) => {
        dispatch([
          new ShowToast(MessageTypes.Success, specialProjectCategory.id > 0 ? RECORD_MODIFIED : RECORD_ADDED),
          new SaveSpecialProjectCategorySucceeded(),
          new SetIsDirtySpecialProjectCategoryForm(false),
        ]);
        return order;
      }),
      catchError((error) => dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error))))
    );
  }

  @Action(DeletSpecialProjectCategory)
  DeletSpecialProject({ patchState, dispatch }: StateContext<SpecialProjectCategoryStateModel>, { id }: DeletSpecialProjectCategory): Observable<any> {
    patchState({ isSpecialProjectCategoryLoading: true });
    return this.specialProjectCategoryService.removeSpecialProjectCategory(id).pipe(
      tap(() => {
        patchState({ isSpecialProjectCategoryLoading: false });
        const message = 'Special Project category deleted successfully';
        const actions = [new DeletSpecialProjectCategorySucceeded(), new ShowToast(MessageTypes.Success, message)];
        dispatch([...actions, new DeletSpecialProjectCategorySucceeded()]);
      }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Special Project Category cannot be deleted'))))
    );
  }

  @Action(GetSpecialProjectCategoryById)
  GetSpecialProjectsById({ patchState }: StateContext<SpecialProjectCategoryStateModel>, { id }: GetSpecialProjectCategoryById): Observable<SpecialProjectCategory> {
    return this.specialProjectCategoryService.getSpecialProjectCategoryById(id).pipe(
      tap((payload) => {
        patchState({ specialProjectCategoryEntity: payload });
      })
    );
  }
}
