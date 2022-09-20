import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ChatThread, UserChatConfig, UserThreadsDto } from '../interfaces';

@Injectable()
export class ChatApiService {
  constructor(
    private http: HttpClient,
  ) {}

  public getUserThreads(): Observable<ChatThread[]> {
    return this.http.get<ChatThread[]>('/api/Communication/threads');
  }

  public getParticipants(): Observable<ChatThread[]> {
    return this.http.get<ChatThread[]>('/api/Communication/participants');
  }

  public createThread(id: string): Observable<string> {
    return this.http.post('/api/Communication/startthread', {
      userId: id,
    }, { responseType: 'text' });
  }

  public getChatConfig(): Observable<UserChatConfig> {
    return this.http.get<UserChatConfig>('/api/Communication/config');
  }
}