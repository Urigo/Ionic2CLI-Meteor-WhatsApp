import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { ChatsPage } from "../pages/chats/chats";
import { MomentModule } from "angular2-moment";
import { MessagesPage } from "../pages/messages/messages";
import { LoginComponent } from "../pages/auth/login";
import { VerificationComponent } from "../pages/verification/verification";
import { ProfileComponent } from "../pages/profile/profile";

@NgModule({
  declarations: [
    MyApp,
    ChatsPage,
    TabsPage,
    MessagesPage,
    LoginComponent,
    VerificationComponent,
    ProfileComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
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
    ProfileComponent
  ],
  providers: []
})
export class AppModule {}
