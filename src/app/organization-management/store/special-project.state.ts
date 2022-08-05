import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { getAllErrors } from '@shared/utils/error.utils';
import { catchError, Observable, of, tap } from 'rxjs';
import { SpecialProject, SpecialProjectPage } from 'src/app/shared/models/special-project.model';
import { GetSpecialProjects } from './special-project.actions';
import { SpecialProjectService } from '@shared/services/special-project.service';

export interface SpecialProjectStateModel {
  specialProjectPage: SpecialProjectPage | null;
}

@State<SpecialProjectStateModel>({
  name: 'specialProjects',
  defaults: {
    specialProjectPage: null
  },
})
@Injectable()
export class SpecialProjectState {

  @Selector()
  static specialProjectPage(state: SpecialProjectStateModel): SpecialProjectPage | null {
    return state.specialProjectPage;
  }

  constructor(private specialProjectService: SpecialProjectService) { }

  @Action(GetSpecialProjects)
  GetSpecialProjects(
    { patchState }: StateContext<SpecialProjectStateModel>,
    {  }: GetSpecialProjects
  ): Observable<SpecialProjectPage> {
    return this.specialProjectService.getSpecialProjects().pipe(
      tap((payload) => {
        patchState({ specialProjectPage: payload });
        return payload;
      })
    );
  }
 
}
