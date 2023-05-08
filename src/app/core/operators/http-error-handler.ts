import { HttpErrorResponse } from '@angular/common/http';

import { Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngxs/store';

import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';

export function handleHttpError<T>(store: Store) {
  return (source: Observable<T>) =>
    source.pipe(
      catchError((error: HttpErrorResponse) => {
        store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
        return EMPTY;
      })
    );
}
