import {
  AfterViewChecked, ChangeDetectionStrategy, Component,
  ElementRef, OnInit, ViewChild
} from '@angular/core';

import { ChatClient, ChatMessage, ChatThreadClient } from '@azure/communication-chat';
import {
  ChatMessageReceivedEvent, CommunicationUserKind, ReadReceiptReceivedEvent,
  TypingIndicatorReceivedEvent
} from '@azure/communication-signaling';
import { PagedAsyncIterableIterator } from '@azure/core-paging';
import { Select } from '@ngxs/store';
import {
  HtmlEditorService, ImageService, LinkService,
  RichTextEditorComponent
} from '@syncfusion/ej2-angular-richtexteditor';
import { debounceTime, fromEvent, Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap, throttleTime } from 'rxjs/operators';

import { ChatMessageType } from '../../enums';
import { ChatHelper, ChatMessagesHelper } from '../../helpers';
import { ChatThread, MessageRequestMeta, ReceivedChatMessage, SyncFusionActionBeginEvent } from '../../interfaces';
import { ChatModel } from '../../store';
import { Chat } from '../../store/actions';
import { ChatState } from '../../store/state/chat.state';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LinkService, ImageService, HtmlEditorService],
})
export class ChatRoomComponent extends ChatMessagesHelper implements OnInit, AfterViewChecked {
  @ViewChild('chatArea', { static: true }) chatArea: ElementRef;

  @ViewChild('textEditor') textEditor: RichTextEditorComponent;

  currentThread: ChatThread | null;

  messages: ReceivedChatMessage[];

  showScrollBtn = false;

  private userDisplayName: string;

  private chatThreadClient: ChatThreadClient | null;

  private readonly typingStream: Subject<void> = new Subject();

  private readReceipts: string[] = [];

  private iterableAsyncMessages: PagedAsyncIterableIterator<ChatMessage[]> | null;

  private preventScrollBottom = false;

  @Select(ChatState.typingIndicator)
  private readonly typing$: Observable<TypingIndicatorReceivedEvent>;

  @Select(ChatState.readEvent)
  private readonly readEvent$: Observable<ReadReceiptReceivedEvent | null>;

  ngOnInit(): void {
    this.userDisplayName = this.store.snapshot().user.user.fullName;
    this.userIdentity = this.store.snapshot().chat.currentUserIdentity;

    this.initChatRoom();
    this.watchForUpdate();
    this.watchForUserTyping();
    this.watchForIncomingTypingEvent();
    this.watchForReadEvent();
    this.watchForScroll();
  }

  ngAfterViewChecked(): void {
    this.scrollBottom();
  }

  sendByCtrlEnterKeys(event: SyncFusionActionBeginEvent) {
    if (
      event && event.originalEvent instanceof KeyboardEvent
      && event.requestType === 'EnterAction' && event.originalEvent.ctrlKey
      ) {
        event.cancel = true;
        this.sendMessage();
    }

  }

  sendByButton(): void {
    this.sendMessage();
  }

  trackKeyPress(): void {
    this.typingStream.next();
  }

  trackById(idx: number, item: ReceivedChatMessage): string {
    return item.id;
  }

  scrollChatBottom(): void {
    this.scrollBottom(true);
  }

  private initChatRoom(): void {
    this.setupChatClient();

    if (this.chatThreadClient) {
      this.initMessages();
    }
  }

  private watchForUserTyping(): void {
    this.typingStream.asObservable()
    .pipe(
      filter(() => !!this.chatThreadClient),
      throttleTime(5000),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      (this.chatThreadClient as ChatThreadClient).sendTypingNotification({ senderDisplayName: this.userDisplayName });
    });
  }

  private watchForIncomingTypingEvent(): void {
    this.typing$
    .pipe(
      filter(Boolean),
      filter((event) => event.threadId === this.currentThread?.threadId
      && event.senderDisplayName !== this.userDisplayName),
      tap((event) => {
        this.typingEvent = event;
        this.cd.markForCheck();
      }),
      debounceTime(10000),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.store.dispatch(new Chat.ResetTypingEvent());
      this.typingEvent = null;
      this.cd.markForCheck();
    });
  }

  private watchForReadEvent(): void {
    this.readEvent$
    .pipe(
      filter((event) => event?.threadId === this.threadId
      && (event?.sender as CommunicationUserKind).communicationUserId !== this.userIdentity),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((event) => {
      this.readReceipts = [event?.chatMessageId as string];
      ChatHelper.setReadIndicator(this.messages, this.readReceipts);
      this.cd.markForCheck();
    });
  }

  private watchForScroll(): void {
    fromEvent(this.chatArea.nativeElement, 'scroll')
    .pipe(
      debounceTime(1000),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      const { scrollTop, scrollHeight, clientHeight } = this.chatArea.nativeElement;

      if (scrollTop === 0) {
        this.preventScrollBottom = true;
        this.getMessagesPage();
      }

      if (scrollTop + clientHeight === scrollHeight) {
        this.preventScrollBottom = false;
        this.showScrollBtn = false;
      } else {
        this.preventScrollBottom = true;
      }
      this.cd.markForCheck();
    });
  }

  private setupChatClient(id?: string): void {
    const client = (this.store.snapshot().chat as ChatModel).chatClient as ChatClient;
    this.currentThread = (this.store.snapshot().chat as ChatModel).currentChatRoomData;
    this.threadId = this.currentThread?.threadId as string;
  
    const threadId = id || this.currentThread?.threadId as string;
    this.chatThreadClient = threadId ? client.getChatThreadClient(threadId)
    : null;

    this.iterableAsyncMessages = this.chatThreadClient
    ? this.chatThreadClient.listMessages({ maxPageSize: 50 }).byPage() as PagedAsyncIterableIterator<ChatMessage[]>
    : null;
  }

  private async initMessages(): Promise<void> {
    const messagePage = await this.getAsyncMessagePage();
    
    if (messagePage && messagePage.value && messagePage.value.length) {
      this.setMessages(messagePage as IteratorResult<ChatMessage[]>);
    }
    
    await this.getReceipts();
    ChatHelper.setReadIndicator(this.messages, this.readReceipts);
    this.checkForReceipt();
    this.cd.markForCheck();
  }

  private getAsyncMessagePage(): Promise<IteratorResult<ChatMessage[] | void>> {
    return this.iterableAsyncMessages?.next() as Promise<IteratorResult<ChatMessage[] | void>>;
  }

  private setMessages(result: IteratorResult<ChatMessage[]>): void {
    this.messages = this.createMessages(result.value).reverse();
  }

  private async getReceipts(): Promise<void> {
    this.readReceipts = await this.getReceiptIds(this.chatThreadClient as ChatThreadClient);
  }

  /**
   * Check If read recipt should be sent. Receipt sent only if last message from was not found in receipts
   */
  private checkForReceipt(): void {
    const messagesFrom = this.messages.filter((message) => !message.isCurrentUser);
    const lastMessage = messagesFrom[messagesFrom.length - 1];

    if (lastMessage && !this.readReceipts.includes(lastMessage.id)) {
      this.sendReceipt(lastMessage.id);
    }
  }

  private async sendReceipt(id: string): Promise<void> {
    await (this.chatThreadClient as ChatThreadClient).sendReadReceipt({ chatMessageId: id});
  }

  private scrollBottom(force?: boolean): void {
    if (force || !this.preventScrollBottom) {
      this.chatArea.nativeElement.scrollTop = this.chatArea.nativeElement.scrollHeight;
      this.cd.markForCheck();
    }
  }

  private async sendMessage(): Promise<void> {
    const textContent = this.textEditor.getText();
    
    if (!!textContent && this.chatThreadClient) {
      const meta = this.createMessageRequest();
  
      this.chatThreadClient.sendMessage(meta.req, meta.options);
      this.textEditor.value = '';
    } else if (!!textContent) {
      this.createThreadAndSend();
    }
  }

  private createMessageRequest(): MessageRequestMeta {
    return {
      options: {
        senderDisplayName: this.userDisplayName,
        type: 'text',
      },
      req: {
        content: this.textEditor.getHtml(),
      },
    };
  }

  private createThreadAndSend(): void {
    const userId = this.store.selectSnapshot(ChatState.userToStart) as string;

    this.store.dispatch(new Chat.CreateChatThread(userId))
    .pipe(
      tap(() => { this.setupChatClient((this.store.snapshot().chat as ChatModel).startThreadId); }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      if (!this.currentThread) {
        this.currentThread = {
          userId: '',
          threadId: (this.store.snapshot().chat as ChatModel).startThreadId,
          displayName: '',
          businessUnitName: '',
          lasMessageOn: new Date(),
        };
        this.threadId = '';
        this.cd.markForCheck();
      }
      const reqMeta = this.createMessageRequest();
      (this.chatThreadClient as ChatThreadClient).sendMessage(reqMeta.req, reqMeta.options);
      this.textEditor.value = '';
    });
  }

  protected override setLastMessage(messageEvent: ChatMessageReceivedEvent): void {
    if (messageEvent.type.toLowerCase() === ChatMessageType.Text) {
      const msg: ReceivedChatMessage = {
        id: messageEvent.id,
        sender: messageEvent.senderDisplayName as string,
        message: messageEvent.message as string,
        timestamp: messageEvent.createdOn,
        isCurrentUser: (messageEvent.sender as CommunicationUserKind)?.communicationUserId === this.userIdentity,
        readIndicator: false,
      };

      this.messages.push(msg);
      this.checkForReceipt();
      this.checkForScrollPosition();
      this.typingEvent = null;
      this.cd.markForCheck();
      this.scrollBottom();
    }
  }

  private async getMessagesPage(): Promise<void> {
    const page = await this.getAsyncMessagePage();

    if (page && page.value && page.value.length) {
      const pageMessages = this.createMessages(page.value).reverse();
      this.messages = [...pageMessages, ...this.messages];
      this.cd.markForCheck();
    }
  }

  private createMessages(messages:  ChatMessage[]): ReceivedChatMessage[] {
    const receivedMessages = messages
    .filter((message) => message.type.toLowerCase() === ChatMessageType.Text);

    const newMessages: ReceivedChatMessage[] = [];

    receivedMessages.forEach((message) => {
      const msg: ReceivedChatMessage = {
        id: message.id,
        sender: message.senderDisplayName as string,
        message: message.content?.message as string,
        timestamp: message.createdOn,
        isCurrentUser: (message.sender as CommunicationUserKind)?.communicationUserId === this.userIdentity,
      };
      newMessages.push(msg);
    });

    return newMessages;
  }

  private checkForScrollPosition(): void {
    const { scrollTop, scrollHeight, clientHeight } = this.chatArea.nativeElement;

    if (scrollTop + clientHeight !== scrollHeight) {
      this.showScrollBtn = true;
    }
  }
}
