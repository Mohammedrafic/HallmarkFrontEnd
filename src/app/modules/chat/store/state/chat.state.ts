import { Injectable } from '@angular/core';

import { ChatClient, ChatThreadItem, TypingIndicatorReceivedEvent } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ToggleChatDialog, UnreadMessage } from '@core/actions';
import { DefaultChatState } from '../../constants';
import { ChatDialogState, ChatSearchType } from '../../enums';
import { ChatHelper, ThreadsHelper } from '../../helpers';
import { ChatThread, UserChatConfig } from '../../interfaces';
import { ChatApiService } from '../../services';
import { Chat } from '../actions';
import { ChatModel } from '../chat.model';
import { ChatService } from '../../services/chat.service';

@State<ChatModel>({
  name: 'chat',
  defaults: DefaultChatState,
})
@Injectable()
export class ChatState {
  constructor(
    private apiService: ChatApiService,
    private chatService: ChatService,
  ) {}

  @Selector([ChatState])
  static chatDialogState(state: ChatModel): boolean {
    return state.chatOpen;
  }

  @Selector([ChatState])
  static chatDialogView(state: ChatModel): ChatDialogState {
    return state.currentDialogView;
  }

  @Selector([ChatState])
  static activeThreads(state: ChatModel): ChatThread[] {
    return state.displayedThreads;
  }

  @Selector([ChatState])
  static avaliableParticipants(state: ChatModel): ChatThread[] {
    return state.displayedParticipants;
  }

  @Selector([ChatState])
  static typingIndicator(state: ChatModel): TypingIndicatorReceivedEvent | null {
    return state.typingIndicator;
  }

  @Selector([ChatState])
  static userToStart(state: ChatModel): string | null {
    return state.userIdToStart;
  }

  @Action(ToggleChatDialog)
  ToggleChatDialog(
    { patchState, getState }: StateContext<ChatModel>
  ): void {
    const isOpen = getState().chatOpen;

    patchState({
      chatOpen: !isOpen,
    });
  }

  @Action(Chat.SetCurrentView)
  SetCurrentView(
    { patchState }: StateContext<ChatModel>,
    { view }: Chat.SetCurrentView
  ): void {
    patchState({
      currentDialogView: view,
    });
  }

  @Action(Chat.GetUserChatConfig)
  GetConfiguration(
    { patchState, dispatch, getState }: StateContext<ChatModel>
  ): Observable<UserChatConfig> {
    return this.apiService.getChatConfig()
    .pipe(
      tap(async (response) => {
        const chatClient = new ChatClient(response.endpoint,
        new AzureCommunicationTokenCredential(response.accessToken));

        await chatClient.startRealtimeNotifications();

        chatClient.on('chatMessageReceived', () => {  
          dispatch(new Chat.UpdateMessages());
          dispatch(new Chat.SortThreads());
          dispatch(new UnreadMessage());
          
          if (getState().chatOpen) {
            this.chatService.playNotificationSound();
          }
        });

        chatClient.on('typingIndicatorReceived', (event: TypingIndicatorReceivedEvent) => {
          patchState({
            typingIndicator: event,
          }); 
        });

        chatClient.on('chatThreadCreated', () => {
          dispatch(new Chat.GetUserThreads());
        });

        chatClient.on('participantsAdded', () => {
          dispatch(new Chat.GetUserThreads());
        });

        chatClient.on('readReceiptReceived', (event: any) => {
          dispatch(new Chat.UpdateReceipts());
        });

        patchState({
          token: response.accessToken,
          currentUserId: response.userId,
          currentUserIdentity: response.userIdentity,
          chatClient: chatClient,
        });
        
        dispatch(new Chat.GetUserThreads());
      }),
    );
  }

  @Action(Chat.GetUserThreads)
  GetThreads({ patchState, getState }: StateContext<ChatModel>): Observable<ChatThread[]> {
    return this.apiService.getUserThreads()
    .pipe(
      tap(async (threadsDto) => {
        const client = getState().chatClient as ChatClient;
        const iterableThreadItems = client.listChatThreads();
        const threadItems: ChatThreadItem[] = [];

        for await (const item of iterableThreadItems) {
          threadItems.push(item);
        }

        ThreadsHelper.addLastMessageDate(threadsDto, threadItems);
        ThreadsHelper.sortThreadsByLastMessage(threadsDto);

        patchState({
          activeThreads: threadsDto,
          displayedThreads: threadsDto,
        });
      }),
    );
  }

  @Action(Chat.CreateChatThread)
  CreateChatThread(
    { patchState, dispatch, getState }: StateContext<ChatModel>,
    { userId }: Chat.CreateChatThread,
  ): Observable<void> {
    let threadId: string;

    return this.apiService.createThread(userId)
    .pipe(
      tap((response) => { threadId = response }),
      switchMap(() => dispatch(new Chat.GetUserThreads())),
      tap(() => {
        const threads = getState().activeThreads;
        const currentThread = threads.find((thread) => thread.threadId === threadId);

        patchState({
          currentChatRoomData: currentThread,
        });
      })
    )
  }

  @Action(Chat.OpenAddView)
  GetParticipants(
    { patchState, dispatch }: StateContext<ChatModel>
  ): Observable<ChatThread[]> {

    return this.apiService.getParticipants()
    .pipe(
      tap((participants) => {
        patchState({
          avaliableParticipants: participants,
          displayedParticipants: participants,
        });

        dispatch(new Chat.SetCurrentView(ChatDialogState.NewChat));
      }),
    )
  }

  @Action(Chat.EnterChatRoom)
  EnterChatRoom(
    { patchState, getState, dispatch }: StateContext<ChatModel>,
    { threadId }: Chat.EnterChatRoom,
  ): void {
    const thread = getState().activeThreads.find((thread) => thread.threadId === threadId);
    
    patchState({
      currentChatRoomData: thread,
    });

    dispatch(new Chat.SetCurrentView(ChatDialogState.Internal));
  }

  @Action(Chat.UpdateMessages)
  UpdateAllMessages(): void {}

  @Action(Chat.StartNewConversation)
  StartNewConversation(
    { patchState, dispatch }: StateContext<ChatModel>,
    { userId }: Chat.StartNewConversation,
  ): void {
      patchState({
        currentChatRoomData: null,
        userIdToStart: userId,
      });

    dispatch(new Chat.SetCurrentView(ChatDialogState.Internal));
  }

  @Action(Chat.CloseChat)
  CloseChatDialog({ patchState }: StateContext<ChatModel>): void {
    patchState({
      chatOpen: false,
    });
  }

  @Action(Chat.SearcFor)
  SearchForItems(
    { patchState, getState }: StateContext<ChatModel>,
    { searchText, searchType }: Chat.SearcFor,
  ): void {
    if (searchType === ChatSearchType.Participant) {
      const participants = getState().avaliableParticipants;
      const foundByTearm = !searchText ? participants : ChatHelper.findThreads(participants, searchText);

      patchState({
        displayedParticipants: foundByTearm,
      });
    }

    if (searchType === ChatSearchType.ActiveThread) {
      const threads = getState().activeThreads;
      const foundByTearm = !searchText ? threads : ChatHelper.findThreads(threads, searchText);

      patchState({
        displayedThreads: foundByTearm,
      });
    }
  }

  @Action(Chat.SortThreads)
  async SortThreads({ getState, patchState }: StateContext<ChatModel>): Promise<void> {
    const threads = getState().activeThreads;
    const client = getState().chatClient as ChatClient;
    const iterableThreadItems = client.listChatThreads();
    const threadItems: ChatThreadItem[] = [];

    for await (const item of iterableThreadItems) {
      threadItems.push(item);
    }

    ThreadsHelper.addLastMessageDate(threads, threadItems);
    ThreadsHelper.sortThreadsByLastMessage(threads);

    patchState({
      activeThreads: threads,
      displayedThreads: threads,
    });
  }

  @Action(Chat.UpdateReceipts)
  UpdateReceipts(): void {}

  @Action(UnreadMessage)
  UnreadMessage(): void {}
}
