# Step 10: Lazy-Loading &amp; Filtering

## Lazy-Loading

In this step, we will implement a lazy-loading mechanism in the `MessagesPage`. Lazy loading means that only the necessary data will be loaded once we're promoted to the corresponding view, and it will keep loading, but gradually. In the `MessagesPage` case, we will only be provided with several messages once we enter the view, enough messages to fill all of it, and as we scroll up, we will provided with more messages. This way we can have a smooth experience, without the cost of fetching the entire messages collection. We will start by limiting our `messages` subscription into 30 documents:

[{]: <helper> (diffStep 10.1)

#### [Step 10.1: Added counter for messages publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/92a16c7)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊15┊  });
 ┊16┊16┊});
 ┊17┊17┊
<b>+┊  ┊18┊Meteor.publish(&#x27;messages&#x27;, function(</b>
<b>+┊  ┊19┊  chatId: string,</b>
<b>+┊  ┊20┊  messagesBatchCounter: number): Mongo.Cursor&lt;Message&gt; {</b>
 ┊19┊21┊  if (!this.userId || !chatId) {
 ┊20┊22┊    return;
 ┊21┊23┊  }
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊23┊25┊  return Messages.collection.find({
 ┊24┊26┊    chatId
 ┊25┊27┊  }, {
<b>+┊  ┊28┊    sort: { createdAt: -1 },</b>
<b>+┊  ┊29┊    limit: 30 * messagesBatchCounter</b>
 ┊27┊30┊  });
 ┊28┊31┊});
</pre>

[}]: #

As we said, we will be fetching more and more messages gradually, so we will need to have a counter in the component which will tell us the number of the batch we would like to fetch in our next scroll:

[{]: <helper> (diffStep 10.2)

#### [Step 10.2: Add counter to client side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/263c0da)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊23┊23┊  senderId: string;
 ┊24┊24┊  loadingMessages: boolean;
 ┊25┊25┊  messagesComputation: Subscription;
<b>+┊  ┊26┊  messagesBatchCounter: number &#x3D; 0;</b>
 ┊26┊27┊
 ┊27┊28┊  constructor(
 ┊28┊29┊    navParams: NavParams,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊65┊66┊    this.scrollOffset &#x3D; this.scroller.scrollHeight;
 ┊66┊67┊
 ┊67┊68┊    MeteorObservable.subscribe(&#x27;messages&#x27;,
<b>+┊  ┊69┊      this.selectedChat._id,</b>
<b>+┊  ┊70┊      ++this.messagesBatchCounter</b>
 ┊69┊71┊    ).subscribe(() &#x3D;&gt; {
 ┊70┊72┊      // Keep tracking changes in the dataset and re-render the view
 ┊71┊73┊      if (!this.messagesComputation) {
</pre>

[}]: #

By now, whether you noticed or not, we have some sort of a limitation which we have to solve. Let's say we've fetched all the messages available for the current chat, and we keep scrolling up, the component will keep attempting to fetch more messages, but it doesn't know that it reached the limit. Because of that, we will need to know the total number of messages so we will know when to stop the lazy-loading mechanism. To solve this issue, we will begin with implementing a method which will retrieve the number of total messages for a provided chat:

[{]: <helper> (diffStep 10.3)

#### [Step 10.3: Implement countMessages method on server side](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/49a3ea1)

##### Changed api&#x2F;server&#x2F;methods.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊90┊90┊        type: type
 ┊91┊91┊      })
 ┊92┊92┊    };
<b>+┊  ┊93┊  },</b>
<b>+┊  ┊94┊  countMessages(): number {</b>
<b>+┊  ┊95┊    return Messages.collection.find().count();</b>
 ┊93┊96┊  }
 ┊94┊97┊});
</pre>

[}]: #

Now, whenever we fetch a new messages-batch we will check if we reached the total messages limit, and if so, we will stop listening to the scroll event:

[{]: <helper> (diffStep 10.4)

#### [Step 10.4: Implement actual load more logic](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5622595)

##### Changed src&#x2F;pages&#x2F;messages&#x2F;messages.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 6┊ 6┊import * as moment from &#x27;moment&#x27;;
 ┊ 7┊ 7┊import { _ } from &#x27;meteor/underscore&#x27;;
 ┊ 8┊ 8┊import { MessagesOptionsComponent } from &#x27;./messages-options&#x27;;
<b>+┊  ┊ 9┊import { Subscription, Observable, Subscriber } from &#x27;rxjs&#x27;;</b>
 ┊10┊10┊
 ┊11┊11┊@Component({
 ┊12┊12┊  selector: &#x27;messages-page&#x27;,
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊51┊51┊  ngOnInit() {
 ┊52┊52┊    this.autoScroller &#x3D; this.autoScroll();
 ┊53┊53┊    this.subscribeMessages();
<b>+┊  ┊54┊</b>
<b>+┊  ┊55┊    // Get total messages count in database so we can have an indication of when to</b>
<b>+┊  ┊56┊    // stop the auto-subscriber</b>
<b>+┊  ┊57┊    MeteorObservable.call(&#x27;countMessages&#x27;).subscribe((messagesCount: number) &#x3D;&gt; {</b>
<b>+┊  ┊58┊      Observable</b>
<b>+┊  ┊59┊      // Chain every scroll event</b>
<b>+┊  ┊60┊        .fromEvent(this.scroller, &#x27;scroll&#x27;)</b>
<b>+┊  ┊61┊        // Remove the scroll listener once all messages have been fetched</b>
<b>+┊  ┊62┊        .takeUntil(this.autoRemoveScrollListener(messagesCount))</b>
<b>+┊  ┊63┊        // Filter event handling unless we&#x27;re at the top of the page</b>
<b>+┊  ┊64┊        .filter(() &#x3D;&gt; !this.scroller.scrollTop)</b>
<b>+┊  ┊65┊        // Prohibit parallel subscriptions</b>
<b>+┊  ┊66┊        .filter(() &#x3D;&gt; !this.loadingMessages)</b>
<b>+┊  ┊67┊        // Invoke the messages subscription once all the requirements have been met</b>
<b>+┊  ┊68┊        .forEach(() &#x3D;&gt; this.subscribeMessages());</b>
<b>+┊  ┊69┊    });</b>
 ┊54┊70┊  }
 ┊55┊71┊
 ┊56┊72┊  ngOnDestroy() {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 86┊102┊    });
 ┊ 87┊103┊  }
 ┊ 88┊104┊
<b>+┊   ┊105┊  // Removes the scroll listener once all messages from the past were fetched</b>
<b>+┊   ┊106┊  autoRemoveScrollListener&lt;T&gt;(messagesCount: number): Observable&lt;T&gt; {</b>
<b>+┊   ┊107┊    return Observable.create((observer: Subscriber&lt;T&gt;) &#x3D;&gt; {</b>
<b>+┊   ┊108┊      Messages.find().subscribe({</b>
<b>+┊   ┊109┊        next: (messages) &#x3D;&gt; {</b>
<b>+┊   ┊110┊          // Once all messages have been fetched</b>
<b>+┊   ┊111┊          if (messagesCount !&#x3D;&#x3D; messages.length) {</b>
<b>+┊   ┊112┊            return;</b>
<b>+┊   ┊113┊          }</b>
<b>+┊   ┊114┊</b>
<b>+┊   ┊115┊          // Signal to stop listening to the scroll event</b>
<b>+┊   ┊116┊          observer.next();</b>
<b>+┊   ┊117┊</b>
<b>+┊   ┊118┊          // Finish the observation to prevent unnecessary calculations</b>
<b>+┊   ┊119┊          observer.complete();</b>
<b>+┊   ┊120┊        },</b>
<b>+┊   ┊121┊        error: (e) &#x3D;&gt; {</b>
<b>+┊   ┊122┊          observer.error(e);</b>
<b>+┊   ┊123┊        }</b>
<b>+┊   ┊124┊      });</b>
<b>+┊   ┊125┊    });</b>
<b>+┊   ┊126┊  }</b>
<b>+┊   ┊127┊</b>
 ┊ 89┊128┊  showOptions(): void {
 ┊ 90┊129┊    const popover &#x3D; this.popoverCtrl.create(MessagesOptionsComponent, {
 ┊ 91┊130┊      chat: this.selectedChat
</pre>

[}]: #

## Filter

Now we're gonna implement a search-bar, in the `NewChatComponent`.

Let's start by implementing the logic using `RxJS`. We will use a `BehaviorSubject` which will store the search pattern entered in the search bar, and we will be able to detect changes in its value using the `Observable` API; So whenever the search pattern is being changed, we will update the users list by re-subscribing to the `users` subscription:

[{]: <helper> (diffStep 10.5)

#### [Step 10.5: Implement the search bar logic with RxJS](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/13fcb8d)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 4┊ 4┊import { AlertController, ViewController } from &#x27;ionic-angular&#x27;;
 ┊ 5┊ 5┊import { MeteorObservable } from &#x27;meteor-rxjs&#x27;;
 ┊ 6┊ 6┊import { _ } from &#x27;meteor/underscore&#x27;;
<b>+┊  ┊ 7┊import { Observable, Subscription, BehaviorSubject } from &#x27;rxjs&#x27;;</b>
 ┊ 8┊ 8┊
 ┊ 9┊ 9┊@Component({
 ┊10┊10┊  selector: &#x27;new-chat&#x27;,
 ┊11┊11┊  templateUrl: &#x27;new-chat.html&#x27;
 ┊12┊12┊})
 ┊13┊13┊export class NewChatComponent implements OnInit {
<b>+┊  ┊14┊  searchPattern: BehaviorSubject&lt;any&gt;;</b>
 ┊14┊15┊  senderId: string;
 ┊15┊16┊  users: Observable&lt;User[]&gt;;
 ┊16┊17┊  usersSubscription: Subscription;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊20┊21┊    private viewCtrl: ViewController
 ┊21┊22┊  ) {
 ┊22┊23┊    this.senderId &#x3D; Meteor.userId();
<b>+┊  ┊24┊    this.searchPattern &#x3D; new BehaviorSubject(undefined);</b>
 ┊23┊25┊  }
 ┊24┊26┊
 ┊25┊27┊  ngOnInit() {
<b>+┊  ┊28┊    this.observeSearchBar();</b>
<b>+┊  ┊29┊  }</b>
<b>+┊  ┊30┊</b>
<b>+┊  ┊31┊  updateSubscription(newValue) {</b>
<b>+┊  ┊32┊    this.searchPattern.next(newValue);</b>
<b>+┊  ┊33┊  }</b>
<b>+┊  ┊34┊</b>
<b>+┊  ┊35┊  observeSearchBar(): void {</b>
<b>+┊  ┊36┊    this.searchPattern.asObservable()</b>
<b>+┊  ┊37┊    // Prevents the search bar from being spammed</b>
<b>+┊  ┊38┊      .debounce(() &#x3D;&gt; Observable.timer(1000))</b>
<b>+┊  ┊39┊      .forEach(() &#x3D;&gt; {</b>
<b>+┊  ┊40┊        if (this.usersSubscription) {</b>
<b>+┊  ┊41┊          this.usersSubscription.unsubscribe();</b>
<b>+┊  ┊42┊        }</b>
<b>+┊  ┊43┊</b>
<b>+┊  ┊44┊        this.usersSubscription &#x3D; this.subscribeUsers();</b>
<b>+┊  ┊45┊      });</b>
 ┊27┊46┊  }
 ┊28┊47┊
 ┊29┊48┊  addChat(user): void {
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊39┊58┊    });
 ┊40┊59┊  }
 ┊41┊60┊
<b>+┊  ┊61┊  subscribeUsers(): Subscription {</b>
 ┊43┊62┊    // Fetch all users matching search pattern
<b>+┊  ┊63┊    const subscription &#x3D; MeteorObservable.subscribe(&#x27;users&#x27;, this.searchPattern.getValue());</b>
 ┊45┊64┊    const autorun &#x3D; MeteorObservable.autorun();
 ┊46┊65┊
<b>+┊  ┊66┊    return Observable.merge(subscription, autorun).subscribe(() &#x3D;&gt; {</b>
 ┊48┊67┊      this.users &#x3D; this.findUsers();
 ┊49┊68┊    });
 ┊50┊69┊  }
</pre>

[}]: #

Note how we used the `debounce` method to prevent subscription spamming. Let's add the template for the search-bar in the `NewChat` view, and bind it to the corresponding data-models and methods in the component:

[{]: <helper> (diffStep 10.6)

#### [Step 10.6: Update usage](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/98991cd)

##### Changed src&#x2F;pages&#x2F;chats&#x2F;new-chat.html
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 1┊ 1┊&lt;ion-header&gt;
<b>+┊  ┊ 2┊  &lt;ion-toolbar *ngIf&#x3D;&quot;searching&quot; color&#x3D;&quot;whatsapp&quot;&gt;</b>
<b>+┊  ┊ 3┊    &lt;ion-searchbar</b>
<b>+┊  ┊ 4┊      autofocus</b>
<b>+┊  ┊ 5┊      class&#x3D;&quot;seach-bar&quot;</b>
<b>+┊  ┊ 6┊      color&#x3D;&quot;whatsapp&quot;</b>
<b>+┊  ┊ 7┊      [showCancelButton]&#x3D;&quot;true&quot;</b>
<b>+┊  ┊ 8┊      (ionInput)&#x3D;&quot;updateSubscription($event.target.value); searching &#x3D; true;&quot;</b>
<b>+┊  ┊ 9┊      (ionClear)&#x3D;&quot;updateSubscription(undefined); searching &#x3D; false;&quot;&gt;</b>
<b>+┊  ┊10┊      &lt;/ion-searchbar&gt;</b>
<b>+┊  ┊11┊  &lt;/ion-toolbar&gt;</b>
<b>+┊  ┊12┊</b>
<b>+┊  ┊13┊  &lt;ion-toolbar *ngIf&#x3D;&quot;!searching&quot; color&#x3D;&quot;whatsapp&quot;&gt;</b>
 ┊ 3┊14┊    &lt;ion-title&gt;New Chat&lt;/ion-title&gt;
 ┊ 4┊15┊
 ┊ 5┊16┊    &lt;ion-buttons left&gt;
</pre>
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 7┊18┊    &lt;/ion-buttons&gt;
 ┊ 8┊19┊
 ┊ 9┊20┊    &lt;ion-buttons end&gt;
<b>+┊  ┊21┊      &lt;button ion-button class&#x3D;&quot;search-button&quot; (click)&#x3D;&quot;searching &#x3D; true&quot;&gt;&lt;ion-icon name&#x3D;&quot;search&quot;&gt;&lt;/ion-icon&gt;&lt;/button&gt;</b>
 ┊11┊22┊    &lt;/ion-buttons&gt;
 ┊12┊23┊  &lt;/ion-toolbar&gt;
 ┊13┊24┊&lt;/ion-header&gt;
</pre>

[}]: #

Now we will modify the `users` subscription to accept the search-pattern, which will be used as a filter for the result-set;

[{]: <helper> (diffStep 10.7)

#### [Step 10.7: Add search pattern to the publication](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/6ba758c)

##### Changed api&#x2F;server&#x2F;publications.ts
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊ 3┊ 3┊import { Messages } from &#x27;./collections/messages&#x27;;
 ┊ 4┊ 4┊import { Chats } from &#x27;./collections/chats&#x27;;
 ┊ 5┊ 5┊
<b>+┊  ┊ 6┊Meteor.publishComposite(&#x27;users&#x27;, function(</b>
<b>+┊  ┊ 7┊  pattern: string</b>
<b>+┊  ┊ 8┊): PublishCompositeConfig&lt;User&gt; {</b>
 ┊ 7┊ 9┊  if (!this.userId) {
 ┊ 8┊10┊    return;
 ┊ 9┊11┊  }
 ┊10┊12┊
<b>+┊  ┊13┊  let selector &#x3D; {};</b>
<b>+┊  ┊14┊</b>
<b>+┊  ┊15┊  if (pattern) {</b>
<b>+┊  ┊16┊    selector &#x3D; {</b>
<b>+┊  ┊17┊      &#x27;profile.name&#x27;: { $regex: pattern, $options: &#x27;i&#x27; }</b>
<b>+┊  ┊18┊    };</b>
<b>+┊  ┊19┊  }</b>
<b>+┊  ┊20┊</b>
<b>+┊  ┊21┊  return {</b>
<b>+┊  ┊22┊    find: () &#x3D;&gt; {</b>
<b>+┊  ┊23┊      return Users.collection.find(selector, {</b>
<b>+┊  ┊24┊        fields: { profile: 1 },</b>
<b>+┊  ┊25┊        limit: 15</b>
<b>+┊  ┊26┊      });</b>
 ┊14┊27┊    }
<b>+┊  ┊28┊  };</b>
 ┊16┊29┊});
 ┊17┊30┊
 ┊18┊31┊Meteor.publish(&#x27;messages&#x27;, function(
</pre>

[}]: #

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/android-testing" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/privacy")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/privacy">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/android-testing">NEXT STEP</a> ⟹

[}]: #

