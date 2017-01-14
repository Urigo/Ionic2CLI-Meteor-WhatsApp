import { NgModule, ErrorHandler } from '@angular/core';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AutofocusDirective } from '../directives/autofocus';
import { ChatsPage } from '../pages/chats/chats';
import { ChatsOptionsComponent } from '../pages/chats/chats-options';
import { NewChatComponent } from '../pages/chats/new-chat';
import { LoginPage } from '../pages/login/login';
import { MessagesPage } from '../pages/messages/messages';
import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments'
import { MessagesOptionsComponent } from '../pages/messages/messages-options';
import { ProfilePage } from '../pages/profile/profile';
import { TabsPage } from '../pages/tabs/tabs';
import { VerificationPage } from '../pages/verification/verification';
import { SearchPipe } from '../pipes/search';
import { PictureUploader } from '../services/picture-uploader';
import { MyApp } from './app.component';

@NgModule({
  declarations: [
    AutofocusDirective,
    ChatsOptionsComponent,
    ChatsPage,
    LoginPage,
    MessagesOptionsComponent,
    MessagesPage,
    MessagesAttachmentsComponent,
    MyApp,
    NewChatComponent,
    ProfilePage,
    SearchPipe,
    TabsPage,
    VerificationPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ChatsOptionsComponent,
    ChatsPage,
    LoginPage,
    MessagesOptionsComponent,
    MessagesPage,
    MessagesAttachmentsComponent,
    MyApp,
    NewChatComponent,
    ProfilePage,
    TabsPage,
    VerificationPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    PictureUploader
  ]
})
export class AppModule {}
