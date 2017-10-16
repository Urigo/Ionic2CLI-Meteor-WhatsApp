# Step 11: Testing on Android

## Testing on Android

In this step we're going to test our application on `Android` using `Cordova`.

Firt we will need to install `Gradle` system wide, becuase the latest `Cordova` framework cannot use `Gradle` from `Android Studio`. On `Arch Linux` just install the `gradle` package.

Then we're going to install the `Android SDK`. I suggest you to install `Android Studio` and use the [SDK Manager](https://developer.android.com/studio/intro/update.html#sdk-manager) to download it. On `Arch Linux` just install `android-studio` 
form `AUR`.

The `SDK Manager` will install the `Android SDK` into ```~/Android/Sdk/```.

> *NOTE*: it seems the `SDK Manager` doesn't fetch all the necessary tools which `Cordova` needs, so I had to download [sdk-tools-linux-3859397.zip](https://developer.android.com/studio/index.html) and uncompress it into ```~/Android/Sdk/```.

Now we need to export the `ANDROID_HOME` environment variable and add all the `Android SDK tools` binaries to our `PATH`. On Linux it is as simple as adding:

```
export ANDROID_HOME=~/Android/Sdk/
export PATH=${PATH}:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin
```

to ```~/.bashrc``` and ```~/.bash_profile```. Obviously you will have to log out and log in again in order to update the `PATH`.

Now attach your `Android` smartphone to your computer using the USB cable, enable [USB debug](https://developer.android.com/studio/debug/dev-options.html) and check if it recognizes it:

    $ adb devices

Otherwise you can create a virtual device using [AVD Manager](https://developer.android.com/studio/run/managing-avds.html).

Now we can add the `Android` platform to `Cordova`:

    $ cordova platform add android

Finally we can launch the application on the smartphone:

    $ cordova run android

Our application seems to work properly, but as soon as we will try to log in we will find that something's wrong. To discover what we will first have to learn how to debug a mobile application with an embedded `WebView`.
Let's open `Chromium` in our desktop, then the [Console](https://developers.google.com/web/tools/chrome-devtools/console/#opening_the_console).

Now follow the [istructions](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/) to inspect the `WebView`.

In the `Console` you will find the following error:

```
GET http://localhost:3000/sockjs/info?cb=l8rjuale0e net::ERR_CONNECTION_REFUSED
```

If you open the `Network` tab you will also notice a couple of failed requests to ```http://localhost:3000/sockjs/info```.

Since our `DDP` server doesn't run on the smartphone we will have to tell the `Meteor Client` where to find it:

[{]: <helper> (diffStep 11.2)

#### [Step 11.2: Add meteor-client config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/5b1c6fe)

##### Added meteor-client.config.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
<b>+┊ ┊1┊{</b>
<b>+┊ ┊2┊  &quot;runtime&quot;: {</b>
<b>+┊ ┊3┊    &quot;DDP_DEFAULT_CONNECTION_URL&quot;: &quot;http://192.168.1.156:3000&quot;</b>
<b>+┊ ┊4┊  },</b>
<b>+┊ ┊5┊  &quot;import&quot;: [</b>
<b>+┊ ┊6┊</b>
<b>+┊ ┊7┊  ]</b>
<b>+┊ ┊8┊}</b>
</pre>

[}]: #

[{]: <helper> (diffStep 11.3)

#### [Step 11.3: Update meteor-client:bundle script](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/572abd7)

##### Changed package.json
<pre>
<i>╔══════╗</i>
<i>║ diff ║</i>
<i>╚══════╝</i>
 ┊15┊15┊    &quot;lint&quot;: &quot;ionic-app-scripts lint&quot;,
 ┊16┊16┊    &quot;ionic:build&quot;: &quot;ionic-app-scripts build&quot;,
 ┊17┊17┊    &quot;ionic:serve&quot;: &quot;ionic-app-scripts serve&quot;,
<b>+┊  ┊18┊    &quot;meteor-client:bundle&quot;: &quot;meteor-client bundle -s api -c meteor-client.config.json&quot;</b>
 ┊19┊19┊  },
 ┊20┊20┊  &quot;dependencies&quot;: {
 ┊21┊21┊    &quot;@angular/common&quot;: &quot;4.1.2&quot;,
</pre>

[}]: #

Now let's rebuild the `meteor-client`:

    $ npm run meteor-client:bundle

Next time we will run `cordova run android` everything will work as expected.

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination")

⟸ <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination">PREVIOUS STEP</a> <b>║</b> <a href="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps">NEXT STEP</a> ⟹

[}]: #

