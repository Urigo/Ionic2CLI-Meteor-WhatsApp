import { NgModule, ErrorHandler } from '@angular/core';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { ChatsPage } from '../pages/chats/chats';
import { NewChatComponent } from '../pages/chats/new-chat';
import { ChatsOptionsComponent } from '../pages/chats/chats-options';
import { LoginPage } from '../pages/login/login';
import { MessagesPage } from '../pages/messages/messages';
import { MessagesOptionsComponent } from '../pages/messages/messages-options';
import { ProfilePage } from '../pages/profile/profile';
import { VerificationPage } from '../pages/verification/verification';
import { PhoneService } from '../services/phone';
import { MyApp } from './app.component';

@NgModule({
  declarations: [
    MyApp,
    ChatsPage,
    MessagesPage,
    LoginPage,
    VerificationPage,
    ProfilePage,
    ChatsOptionsComponent,
    NewChatComponent,
    MessagesOptionsComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ChatsPage,
    MessagesPage,
    LoginPage,
    VerificationPage,
    ProfilePage,
    ChatsOptionsComponent,
    NewChatComponent,
    MessagesOptionsComponent
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    PhoneService
  ]
})
export class AppModule {}
