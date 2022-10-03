import { Injectable } from '@angular/core';

import { ChatMessageReceivedEvent } from '@azure/communication-signaling';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class ChatMediatorService {
  private readonly messageMediator: Subject<ChatMessageReceivedEvent> = new Subject();

  getMessageMediatorStream(): Observable<ChatMessageReceivedEvent> {
    return this.messageMediator.asObservable();
  }

  notifyMessageReceived(message: ChatMessageReceivedEvent): void {
    this.messageMediator.next(message);
  }
}
