import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Comment } from '@shared/models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  public constructor(private readonly httpClient: HttpClient) {}

  public getComments(commentContainerId: number, isExternal: boolean | null, isAgency: boolean): Observable<Comment[]> {
    return this.httpClient.post<Comment[]>('/api/Comments/filter', { commentContainerId, isExternal, isAgency });
  }

  public saveComment(comment: Comment): Observable<Comment> {
    return this.httpClient.post<Comment>('/api/Comments', { comments: [ comment ] });
  }

  public markCommentAsRead(ids: number[]): Observable<void> {
    return this.httpClient.post<void>('/api/Comments/markasread', { ids });
  }
}
