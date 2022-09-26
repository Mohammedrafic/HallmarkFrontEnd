import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { DialogComponent, OpenEventArgs } from '@syncfusion/ej2-angular-popups';
import { Observable, skip, takeUntil, debounceTime } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { DialogTitles } from '../../constants';
import { ChatSearchForm, EnterChatEvent, ChatThread } from '../../interfaces';
import { ChatService } from '../../services';
import { Chat } from '../../store/actions';
import { ChatState } from '../../store/state/chat.state';
import { ChatDialogState, ChatSearchType } from './../../enums';

@Component({
  selector: 'app-chat-container',
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatContainerComponent extends Destroyable implements OnInit {
  @ViewChild('chatDialog') chatDialog: DialogComponent;

  public readonly chatStates = ChatDialogState;

  public currentChatState = ChatDialogState.List;

  public searchForm: CustomFormGroup<ChatSearchForm>;

  public title: string = DialogTitles[this.currentChatState];

  public chatTitle: { mainTitle: string, subTitle: string } = {
    mainTitle: '',
    subTitle: ''
  };

  @Select(ChatState.chatDialogState)
  public readonly dialogState$: Observable<boolean>;

  @Select(ChatState.chatDialogView)
  private readonly chatView$: Observable<ChatDialogState>;

  @Select(ChatState.activeThreads)
  public readonly activeThreads$: Observable<ChatThread[]>;

  @Select(ChatState.avaliableParticipants)
  public readonly avaliableParticipants$: Observable<ChatThread[]>;

  constructor(
    private store: Store,
    private chatService: ChatService,
    private cd: ChangeDetectorRef,
  ) {
    super();
    this.searchForm = this.chatService.createForm();
  }

  ngOnInit(): void {
    this.watchForDialogstate();
    this.watchForDialogView();
    this.watchForSearch();
    this.store.dispatch(new Chat.GetUserChatConfig());
  }

  closeChat(): void {
    this.store.dispatch(new Chat.CloseChat());
  }

  preventFocus(event: OpenEventArgs): void {
    event.preventFocus = true;
  }

  addChat(): void {
    this.store.dispatch(new Chat.OpenAddView());
  }

  back(): void {
    this.chatTitle.mainTitle = '';
    this.chatTitle.subTitle = '';
    this.store.dispatch(new Chat.SetCurrentView(ChatDialogState.List));
  }

  enterChatRoom(event: EnterChatEvent): void {
    console.log(event)
    this.chatTitle.mainTitle = event.displayName;
    this.chatTitle.subTitle = event.businessUnitName;
    this.store.dispatch(new Chat.EnterChatRoom(event.id));
  }

  startNewChat(thread: ChatThread): void {
    this.chatTitle.mainTitle = thread.displayName;
    this.chatTitle.subTitle = thread.businessUnitName;
    this.store.dispatch(new Chat.StartNewConversation(thread.userId))
  };

  trackByStringId(idx: number, item: ChatThread): string {
    return item.threadId as string;
  }

  trackById(idx: number, item: ChatThread): string {
    return item.userId;
  }

  private watchForSearch(): void {
    this.searchForm.get('searchCriteria')?.valueChanges
    .pipe(
      debounceTime(1000),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value) => {
      if (this.currentChatState === ChatDialogState.NewChat) {
        this.store.dispatch(new Chat.SearcFor(value, ChatSearchType.Participant));
        this.cd.markForCheck();
      } else if (this.currentChatState === ChatDialogState.List) {
        this.store.dispatch(new Chat.SearcFor(value, ChatSearchType.ActiveThread));
        this.cd.markForCheck();
      }
    });
  }

  private watchForDialogstate(): void {
    this.dialogState$
    .pipe(
      skip(1),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((value) => {
      if (value) {
        this.chatDialog.show();
      } else {
        this.chatDialog.hide();
      }
    });
  }

  private watchForDialogView(): void {
    this.chatView$
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe((currentView) => {
      this.currentChatState = currentView;
      this.title = DialogTitles[this.currentChatState];
      this.cd.markForCheck();
    });
  }
}
