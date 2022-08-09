import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { Comment } from '@shared/models/comment.model';
import { GetComments, MarkCommentAsRead, SaveComment } from './comments.actions';
import { CommentsService } from '@shared/services/comments.service';

export interface CommentsStateModel {
  comments: Comment[];
}

@State<CommentsStateModel>({
  name: 'comments',
  defaults: {
    comments: [],
  },
})
@Injectable()
export class CommentsState {
  @Selector()
  static comments(state: CommentsStateModel): Comment[] {
    return state.comments;
  }

  constructor(private commentsService: CommentsService) {}

  @Action(GetComments)
  GetBillRateOptions({ patchState }: StateContext<CommentsStateModel>): Observable<Comment[]> {
    return this.commentsService.getComments().pipe(
      tap((payload) => {
        patchState({ comments: payload });
        return payload;
      })
    );
  }

  @Action(SaveComment)
  SaveComment({ }: StateContext<CommentsStateModel>, { comment }: SaveComment): Observable<Comment> {
    return this.commentsService.saveComment(comment).pipe(
      tap((payload) => {
        return payload;
      })
    );
  }

  @Action(MarkCommentAsRead)
  MarkCommentAsRead({ }: StateContext<CommentsStateModel>, { ids }: MarkCommentAsRead): Observable<void> {
    return this.commentsService.markCommentAsRead(ids);
  }
}
