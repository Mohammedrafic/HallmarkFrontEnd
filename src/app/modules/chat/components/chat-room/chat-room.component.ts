import { AfterViewChecked, ChangeDetectionStrategy, Component,
  ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { ChatClient, ChatThreadClient, SendMessageOptions, SendMessageRequest } from '@azure/communication-chat';
import { CommunicationUserKind } from '@azure/communication-signaling';

import { ChatThread, ReceivedChatMessage } from '../../interfaces';
import { ChatModel } from '../../store';
import { ChatMessagesHelper } from '../../helpers';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatRoomComponent extends ChatMessagesHelper implements OnInit, AfterViewChecked {
  @ViewChild('chatArea') chatArea: ElementRef;

  public currentThread: ChatThread | null;

  public messages: ReceivedChatMessage[];

  public chatform: FormGroup;

  private chatThreadClient: ChatThreadClient;

  private userDisplayName: string;

  private userIdentity: string;

  ngOnInit(): void {
    this.chatform = this.fb.group({
      chatMessage: [null, [Validators.maxLength(1500)]],
    });

    this.initMessages();
    this.watchForUpdate();

    this.userDisplayName = this.store.snapshot().user.user.fullName;
    this.userIdentity = this.store.snapshot().chat.currentUserIdentity;
  }

  ngAfterViewChecked(): void {
    this.scrollBottom();
  }

  sendByButton(): void {
    this.sendMessage();
  }

  sendBykeyPress(event: Event): void {
    if ((event as KeyboardEvent).ctrlKey) {
      this.sendMessage();
    }
  }

  private initMessages(): void {
    const client = (this.store.snapshot().chat as ChatModel).chatClient as ChatClient;
    this.currentThread = (this.store.snapshot().chat as ChatModel).currentChatRoomData;

    this.chatThreadClient = client.getChatThreadClient(this.currentThread?.threadId as string);
    
    this.updateMessages();
  }

  override async updateMessages(): Promise<void> {
    const newMessages: ReceivedChatMessage[] = [];
    const iterableAsync = this.chatThreadClient.listMessages();
    
    for await (const message of iterableAsync) {
      if (message.type === 'text') {
  
        const msg: ReceivedChatMessage = {
          sender: message.senderDisplayName as string,
          message: message.content?.message as string,
          timestamp: message.createdOn,
          isCurrentUser: (message.sender as CommunicationUserKind)?.communicationUserId === this.userIdentity,
        };
        newMessages.push(msg);
      }
    }

    this.messages = newMessages.map((item) => ({ ...item })).reverse();
    this.cd.markForCheck();

    if (this.chatArea) {
      this.scrollBottom();
    }
  }

  private scrollBottom(): void {
    this.chatArea.nativeElement.scrollTop = this.chatArea.nativeElement.scrollHeight;
  }

  private async sendMessage(): Promise<void> {
    if (this.chatform.get('chatMessage')?.value) {
      const req: SendMessageRequest = {
        content: this.chatform.get('chatMessage')?.value,
      };

      const options: SendMessageOptions = {
        senderDisplayName: this.userDisplayName,
        type: 'text',
      };
  
      this.chatThreadClient.sendMessage(req, options);
      this.chatform.get('chatMessage')?.reset();
    }
  }
}
