import { Injectable } from '@angular/core';

import { ChatClient, ChatThreadCreatedEvent, TypingIndicatorReceivedEvent } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { ToggleChatDialog } from '@core/actions';
import { DefaultChatState } from '../../constants';
import { ChatDialogState, ChatSearchType } from '../../enums';
import { ChatThread, UserChatConfig } from '../../interfaces';
import { ChatApiService } from '../../services';
import { Chat } from '../actions';
import { ChatModel } from '../chat.model';
import { switchMap } from 'rxjs/operators';

@State<ChatModel>({
  name: 'chat',
  defaults: DefaultChatState,
})
@Injectable()
export class ChatState {
  constructor(
    private apiService: ChatApiService,
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
        });

        chatClient.on("typingIndicatorReceived", (event: TypingIndicatorReceivedEvent) => {
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
  GetThreads({ patchState }: StateContext<ChatModel>): Observable<ChatThread[]> {
    return this.apiService.getUserThreads()
    .pipe(
      tap((threadsDto) => {
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
  StartConversation(
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

      if (!searchText) {
        patchState({
          displayedParticipants: participants,
        });
      } else {
        const foundByTearm = participants.filter((participant) => participant.displayName.toLowerCase()
        .includes(searchText.toLowerCase())
        || participant.businessUnitName.toLowerCase().includes(searchText.toLowerCase()));

        patchState({
          displayedParticipants: foundByTearm,
        });
      }
    } else if (searchType === ChatSearchType.ActiveThread) {

      const threads = getState().activeThreads;

      if (!searchText) {
        patchState({
          displayedThreads: threads,
        });
      }  else {
        const foundByTearm = threads.filter((thread) => thread.displayName.toLowerCase()
        .includes(searchText.toLowerCase())
        || thread.businessUnitName.toLowerCase().includes(searchText.toLowerCase()));

        patchState({
          displayedThreads: foundByTearm,
        });
      }
    }
  }
}
