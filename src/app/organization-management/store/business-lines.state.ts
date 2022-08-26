import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { BusinessLines } from '@shared/models/business-line.model';
import { BusinessLineService } from '@shared/services/business-line.service';
import { Observable, tap } from 'rxjs';
import { SaveBusinessLine, DeleteBusinessLine, GetBusinessLines } from './business-lines.action';

interface BusinessLinesStateModel {
  businessLines: BusinessLines[];
}

@State<BusinessLinesStateModel>({
  name: 'businesslines',
  defaults: {
    businessLines: [],
  },
})
@Injectable()
export class BusinessLinesState {
  @Selector()
  static businessLines(state: BusinessLinesStateModel): BusinessLines[] {
    return state.businessLines;
  }

  constructor(private readonly businessLineService: BusinessLineService) {}

  @Action(GetBusinessLines)
  private getBusinessLines({ patchState }: StateContext<BusinessLinesStateModel>): Observable<BusinessLines[]> {
    return this.businessLineService.getBusinessLines().pipe(
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
        console.error('hhhh');

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
}
