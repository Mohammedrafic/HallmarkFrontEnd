import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppState } from './store/app.state';

import { enableRipple } from '@syncfusion/ej2-base';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from './shared/interceptors/api.interceptor';
import { UserState } from './store/user.state';
import { LoginGuard, ShellGuard } from '@shared/guards';

enableRipple(true);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,

    //STORE
    NgxsModule.forRoot([
      AppState,
      UserState
    ]),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    LoginGuard,
    ShellGuard
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
