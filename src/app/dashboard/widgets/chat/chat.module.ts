import { NgModule } from "@angular/core";
import { ChatComponent } from "./chat.component";

@NgModule({
  declarations:[ChatComponent],
  exports: [ChatComponent]
})
export class ChatModule {}
