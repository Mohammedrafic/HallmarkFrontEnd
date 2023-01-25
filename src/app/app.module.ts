import { LoadingInterceptor } from './core/interceptors/spinner.interceptor';
import { Spinnermodule } from './core/components/spinner/spinner.module';
import { ErrorHandler, NgModule } from '@angular/core';
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
import { B2cModule } from './b2c-auth/b2c-auth.module';
import { RejectReasonState } from '@organization-management/store/reject-reason.state';
import { Overlay } from '@angular/cdk/overlay';
import { ContactusState } from './store/contact-us.state';
import { PreservedFiltersState } from './store/preserved-filters.state';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomErrorHandler } from '@core/interceptors';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    Spinnermodule,

    //STORE
    NgxsModule.forRoot([AppState, UserState, RejectReasonState, ContactusState, PreservedFiltersState]),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    // In case you don't have Redux DevTools uncomment import below.
    // NgxsLoggerPluginModule.forRoot({
    //   disabled: environment.production,
    // }),
    NgxMaskModule.forRoot(),

    // B2C
    MsalModule,
    B2cModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    LoginGuard,
    UserGuard,
    ...MSAL_PROVIDERS,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    Overlay,
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandler,
    },
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
})
export class AppModule {}
