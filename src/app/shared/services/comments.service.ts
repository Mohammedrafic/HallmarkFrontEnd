import { catchError, Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Comment } from '@shared/models/comment.model';
import { Store } from '@ngxs/store';
import { UserState } from 'src/app/store/user.state';
import { BusinessUnitType } from '@shared/enums/business-unit-type';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  public constructor(private readonly httpClient: HttpClient, private store: Store) {}

  public getComments(commentContainerId: number, isExternal: boolean | null): Observable<Comment[]> {
    const user = this.store.selectSnapshot(UserState.user);
    return this.httpClient.post<Comment[]>(
      '/api/Comments/filter', 
      { commentContainerId, isExternal, isAgency: user?.businessUnitType === BusinessUnitType.Agency }
    ).pipe(catchError(() => of([])));
  }

  public saveComment(comment: Comment): Observable<Comment> {
    return this.httpClient.post<Comment>('/api/Comments', { comments: [ comment ] });
  }

  public saveCommentsBulk(comments: Comment[]): Observable<Comment> {
    return this.httpClient.post<Comment>('/api/Comments', { comments });
  }

  public markCommentAsRead(ids: number[]): Observable<void> {
    return this.httpClient.post<void>('/api/Comments/markasread', { ids });
  }
}
