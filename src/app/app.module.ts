import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SidebarModule } from '@syncfusion/ej2-angular-navigations';
import { PagerModule } from '@syncfusion/ej2-angular-grids';
import { RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { enableRipple } from '@syncfusion/ej2-base';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

enableRipple(true);

@NgModule({
  declarations: [AppComponent],
  imports: [
    SidebarModule,
    PagerModule,
    RadioButtonModule,
    TextBoxModule,
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
