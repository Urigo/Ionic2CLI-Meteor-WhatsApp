import { ErrorHandler, NgModule } from '@angular/core';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AutofocusDirective } from '../directives/autofocus';
import { ChatsPage } from '../pages/chats/chats';
import { ChatsOptionsComponent } from '../pages/chats/chats-options';
import { NewChatComponent } from '../pages/chats/new-chat';
import { LoginPage } from '../pages/login/login';
import { MessagesPage } from '../pages/messages/messages';
import { MessagesAttachmentsComponent } from '../pages/messages/messages-attachments'
import { MessagesOptionsComponent } from '../pages/messages/messages-options';
import { ShowPictureComponent } from '../pages/messages/show-picture';
import { ProfilePage } from '../pages/profile/profile';
import { TabsPage } from '../pages/tabs/tabs';
import { VerificationPage } from '../pages/verification/verification';
import { SearchPipe } from '../pipes/search';
import { PictureService } from '../services/picture';
import { MyApp } from './app.component';
import { AgmCoreModule } from 'angular2-google-maps/core';
import { NewLocationMessageComponent } from '../pages/location-message/location-message';

@NgModule({
  declarations: [
    AutofocusDirective,
    ChatsOptionsComponent,
    ChatsPage,
    LoginPage,
    MessagesAttachmentsComponent,
    MessagesOptionsComponent,
    MessagesPage,
    MyApp,
    NewChatComponent,
    ProfilePage,
    SearchPipe,
    ShowPictureComponent,
    TabsPage,
    VerificationPage,
    NewLocationMessageComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    MomentModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ChatsOptionsComponent,
    ChatsPage,
    LoginPage,
    MessagesAttachmentsComponent,
    MessagesOptionsComponent,
    MessagesPage,
    MyApp,
    NewChatComponent,
    ProfilePage,
    ShowPictureComponent,
    TabsPage,
    VerificationPage,
    NewLocationMessageComponent
  ],
  providers: [
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    PictureService
  ]
})
export class AppModule {}
