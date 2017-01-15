import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { ChatsPage } from "../pages/chats/chats";
import { MomentModule } from "angular2-moment";
import { MessagesPage } from "../pages/messages/messages";
import { LoginComponent } from "../pages/auth/login";
import { VerificationComponent } from "../pages/verification/verification";
import { ProfileComponent } from "../pages/profile/profile";
import { ChatsOptionsComponent } from "../pages/chat-options/chat-options";
import { NewChatComponent } from "../pages/new-chat/new-chat";
import { MessagesOptionsComponent } from "../pages/messages-options/messages-options";
import { AgmCoreModule } from 'angular2-google-maps/core';
import {NewLocationMessageComponent} from '../pages/location-message/location-message';
import {AttachmentMenuComponent} from '../pages/attachment-menu/attachment-menu';

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
    NewLocationMessageComponent,
    AttachmentMenuComponent
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
    NewLocationMessageComponent,
    AttachmentMenuComponent
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
