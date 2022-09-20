import { Injectable } from '@angular/core';

import { ChatClient } from '@azure/communication-chat';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { ToggleChatDialog } from '@core/actions';
import { DefaultChatState } from '../../constants';
import { ChatDialogState } from '../../enums';
import { ChatThread, UserChatConfig } from '../../interfaces';
import { ChatApiService } from '../../services';
import { Chat } from '../actions';
import { ChatModel } from '../chat.model';

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
    return state.activeThreads;
  }

  @Selector([ChatState])
  static avaliableParticipants(state: ChatModel): ChatThread[] {
    return state.avaliableParticipants;
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
        const chatClient = new ChatClient(response.connectionString,
        new AzureCommunicationTokenCredential(response.accessToken));

        await chatClient.startRealtimeNotifications();

        chatClient.on('chatMessageReceived', () => {
          dispatch(new Chat.UpdateMessages());
        });

        chatClient.on("typingIndicatorReceived", (event: any) => {
          console.log(event, 'eventtttttt')
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
        });
      }),
    );
  }

  @Action(Chat.CreateChatThread)
  CreateChatThread(
    { patchState, dispatch, getState }: StateContext<ChatModel>,
    { userId }: Chat.CreateChatThread,
  ): Observable<string> {
    return this.apiService.createThread(userId)
    .pipe(
      tap((response) => {
        const client = getState().chatClient as ChatClient;
        const threads = client.listChatThreads();
        dispatch(new Chat.SetCurrentView(ChatDialogState.Internal));
      }),
    )
  }

  @Action(Chat.ConnectExistingThread)
  ConnectThread(): void { }

  @Action(Chat.OpenAddView)
  GetParticipants(
    { patchState, dispatch }: StateContext<ChatModel>
  ): Observable<ChatThread[]> {
    return this.apiService.getParticipants()
    .pipe(
      tap((participants) => {

        const parts: ChatThread[] = [...participants, {
          businessUnitName: 'Hallmark',
          displayName: 'Admin',
          threadId: null,
          userId: 'DF013403-9C22-4A36-B028-62F491DB0685',
        }];

        patchState({
          avaliableParticipants: parts,
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
}
