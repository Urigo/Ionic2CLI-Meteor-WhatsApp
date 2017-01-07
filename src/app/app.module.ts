import { NgModule, ErrorHandler } from '@angular/core';
import { FileDropModule } from 'angular2-file-drop';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { ImageUploader } from '../services/image-uploader';
import { SearchPipe } from '../pipes/search';
import { ChatsOptionsComponent } from '../pages/chats/chats-options';
import { ChatsPage } from '../pages/chats/chats';
import { LoginPage } from '../pages/login/login';
import { MessagesOptionsComponent } from '../pages/messages/messages-options';
import { MessagesPage } from '../pages/messages/messages';
import { NewChatComponent } from '../pages/chats/new-chat';
import { ProfilePage } from '../pages/profile/profile';
import { TabsPage } from '../pages/tabs/tabs';
import { VerificationPage } from '../pages/verification/verification';

@NgModule({
  declarations: [
    MyApp,
    SearchPipe,
    ChatsOptionsComponent,
    ChatsPage,
    LoginPage,
    MessagesOptionsComponent,
    MessagesPage,
    NewChatComponent,
    ProfilePage,
    TabsPage,
    VerificationPage
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    FileDropModule,
    MomentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ChatsOptionsComponent,
    ChatsPage,
    LoginPage,
    MessagesOptionsComponent,
    MessagesPage,
    NewChatComponent,
    ProfilePage,
    TabsPage,
    VerificationPage
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ImageUploader
  ]
})
export class AppModule {}
