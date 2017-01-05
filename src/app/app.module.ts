import { NgModule, ErrorHandler } from '@angular/core';
import { FileDropModule } from 'angular2-file-drop';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { SearchPipe } from '../pipes/search';
import { TabsPage } from '../pages/tabs/tabs';
import { ChatsPage } from '../pages/chats/chats';
import { MessagesPage } from '../pages/messages/messages';
import { LoginComponent } from '../pages/auth/login';
import { VerificationComponent } from '../pages/verification/verification';
import { ProfileComponent } from '../pages/profile/profile';
import { ChatsOptionsComponent } from '../pages/chat-options/chat-options';
import { NewChatComponent } from '../pages/new-chat/new-chat';
import { MessagesOptionsComponent } from '../pages/messages-options/messages-options';

@NgModule({
  declarations: [
    MyApp,
    ChatsPage,
    TabsPage,
    MessagesPage,
    LoginComponent,
    VerificationComponent,
    ProfileComponent,
    ChatsOptionsComponent,
    NewChatComponent,
    MessagesOptionsComponent,
    SearchPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    FileDropModule,
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ChatsPage,
    TabsPage,
    MessagesPage,
    LoginComponent,
    VerificationComponent,
    ProfileComponent,
    ChatsOptionsComponent,
    NewChatComponent,
    MessagesOptionsComponent
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
