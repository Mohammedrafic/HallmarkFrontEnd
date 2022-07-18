import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxMaskModule } from 'ngx-mask';

import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppState } from './store/app.state';

import { ApiInterceptor } from './shared/interceptors/api.interceptor';
import { UserState } from './store/user.state';
import { LoginGuard, UserGuard } from '@shared/guards';
import { MsalModule, MsalRedirectComponent } from '@azure/msal-angular';
import { MSAL_PROVIDERS } from './b2c-auth/b2c-auth.providers';
import { B2cModule } from './b2c-auth/login.module';

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
    NgxMaskModule.forRoot(),
    MsalModule,
    B2cModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    LoginGuard,
    UserGuard,
    ...MSAL_PROVIDERS,
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
})
export class AppModule {}
