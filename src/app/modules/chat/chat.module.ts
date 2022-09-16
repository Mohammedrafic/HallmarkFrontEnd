
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DialogModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { X } from 'angular-feather/icons';
import { TextBoxAllModule } from '@syncfusion/ej2-angular-inputs';
import { NgxsModule } from '@ngxs/store';

import { ChatSummaryComponent } from './components/chat-summary/chat-summary.component';
import { ChatContainerComponent } from './containers/chat-container/chat-container.component';
import { ChatApiService, ChatCommunicationService, ChatService } from './services';
import { ChatState } from './store/state/chat.state';


@NgModule({
  imports: [
    CommonModule,
    DialogModule,
    FeatherModule.pick({X}),
    ButtonModule,
    TextBoxAllModule,
    NgxsModule.forFeature([ChatState]),
  ],
  declarations: [
    ChatContainerComponent,
    ChatSummaryComponent,
  ],
  providers: [
    ChatApiService,
    ChatCommunicationService,
    ChatService,
  ],
})
export class ChatModule {}