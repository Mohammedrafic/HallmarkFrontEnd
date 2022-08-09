import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Comment } from '@shared/models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentsService {
  public constructor(private readonly httpClient: HttpClient) {}

  public getComments(): Observable<Comment[]> {
    return this.httpClient.get<Comment[]>('/api/Comments');
  }

  public saveComment(comment: Comment): Observable<Comment> {
    return this.httpClient.post<Comment>('/api/Comments', comment);
  }

  public markCommentAsRead(ids: number[]): Observable<void> {
    return this.httpClient.post<void>('/api/Comments/markasread', { ids });
  }
}
