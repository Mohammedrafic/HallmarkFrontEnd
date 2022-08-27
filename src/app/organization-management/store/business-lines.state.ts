import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { BusinessLines, BusinessLinesDtoModel } from '@shared/models/business-line.model';
import { BusinessLineService } from '@shared/services/business-line.service';
import { Observable, tap } from 'rxjs';
import { SaveBusinessLine, DeleteBusinessLine, GetBusinessLines, GetAllBusinessLines } from './business-lines.action';

interface BusinessLinesStateModel {
  businessLines: BusinessLinesDtoModel | null;
  allBusinessLines: BusinessLines[];
}

@State<BusinessLinesStateModel>({
  name: 'businesslines',
  defaults: {
    businessLines: null,
    allBusinessLines: [],
  },
})
@Injectable()
export class BusinessLinesState {
  @Selector()
  static businessLines(state: BusinessLinesStateModel): BusinessLines[]{
    return state.businessLines?.items || [];
  }

  @Selector()
  static totalCount(state: BusinessLinesStateModel): number {
    return state.businessLines?.totalCount || 0;
  }

  @Selector()
  static allBusinessLines(state: BusinessLinesStateModel): BusinessLines[] {
    return state.allBusinessLines;
  }

  constructor(private readonly businessLineService: BusinessLineService) {}

  @Action(GetBusinessLines)
  private getBusinessLines({ patchState }: StateContext<BusinessLinesStateModel>, { currentPage, pageSize }: GetBusinessLines): Observable<BusinessLinesDtoModel> {
    return this.businessLineService.getBusinessLines(currentPage, pageSize).pipe(
      tap((payload) => {
        patchState({ businessLines: payload });
        return payload;
      })
    );
  }

  @Action(SaveBusinessLine)
  private saveBusinessLine({ dispatch }: StateContext<BusinessLinesStateModel>, { businessLine }: SaveBusinessLine) {
    return this.businessLineService.saveBusinessLine(businessLine).pipe(
      tap((payload) => {

        dispatch(new GetBusinessLines());
        return payload;
      })
    );
  }

  @Action(DeleteBusinessLine)
  private deleteBusinessLine({ dispatch }: StateContext<BusinessLinesStateModel>, { id }: DeleteBusinessLine) {
    return this.businessLineService.deleteBusinessLine(id).pipe(
      tap(() => {
        dispatch(new GetBusinessLines());
      })
    );
  }

  @Action(GetAllBusinessLines)
  private getAllBusinessLines({ patchState }: StateContext<BusinessLinesStateModel>) {
    return this.businessLineService.getAllBusinessLines().pipe(
      tap((payload) => {
        patchState({ allBusinessLines: payload });
        return payload;
      })
    );
  }
}
