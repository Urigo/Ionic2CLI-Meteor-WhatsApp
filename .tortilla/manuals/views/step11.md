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

We will have to fix the failed-to-restore-cordova-plugin-statusbar issue:

[{]: <helper> (diffStep "11.2")

#### [Step 11.2: Fix failed-to-restore-cordova-plugin-statusbar issue](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/033887b9)

##### Changed package.json
```diff
@@ -36,7 +36,7 @@
 ┊36┊36┊    "cordova-plugin-device": "^1.1.4",
 ┊37┊37┊    "cordova-plugin-ionic-webview": "^1.1.15",
 ┊38┊38┊    "cordova-plugin-splashscreen": "^4.0.3",
-┊39┊  ┊    "cordova-plugin-statusbar": "git+https://github.com/apache/cordova-plugin-statusbar.git",
+┊  ┊39┊    "cordova-plugin-statusbar": "https://github.com/apache/cordova-plugin-statusbar.git",
 ┊40┊40┊    "cordova-plugin-whitelist": "^1.3.1",
 ┊41┊41┊    "ionic-angular": "3.7.1",
 ┊42┊42┊    "ionic-plugin-keyboard": "^2.2.1",
```
```diff
@@ -76,4 +76,4 @@
 ┊76┊76┊      "android"
 ┊77┊77┊    ]
 ┊78┊78┊  }
-┊79┊  ┊}🚫↵
+┊  ┊79┊}
```

[}]: #

> Next time we will run `cordova platform add android` it will overwrite our `package.json` and we will have to re-edit it.

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

[{]: <helper> (diffStep "11.3")

#### [Step 11.3: Add meteor-client config](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/7e4b7d0e)

##### Added meteor-client.config.json
```diff
@@ -0,0 +1,8 @@
+┊ ┊1┊{
+┊ ┊2┊  "runtime": {
+┊ ┊3┊    "DDP_DEFAULT_CONNECTION_URL": "http://meteor.linuxsystems.it:3000"
+┊ ┊4┊  },
+┊ ┊5┊  "import": [
+┊ ┊6┊
+┊ ┊7┊  ]
+┊ ┊8┊}
```

[}]: #

> You will have to change `meteor.linuxsystems.it` with your own IP or at least put an entry for it into your `/etc/hosts` file.

[{]: <helper> (diffStep "11.4")

#### [Step 11.4: Update meteor-client:bundle script](https://github.com/Urigo/Ionic2CLI-Meteor-WhatsApp/commit/f090eb08)

##### Changed package.json
```diff
@@ -15,7 +15,7 @@
 ┊15┊15┊    "lint": "ionic-app-scripts lint",
 ┊16┊16┊    "ionic:build": "ionic-app-scripts build",
 ┊17┊17┊    "ionic:serve": "ionic-app-scripts serve",
-┊18┊  ┊    "meteor-client:bundle": "meteor-client bundle -s api"
+┊  ┊18┊    "meteor-client:bundle": "meteor-client bundle -s api -c meteor-client.config.json"
 ┊19┊19┊  },
 ┊20┊20┊  "dependencies": {
 ┊21┊21┊    "@angular/common": "4.4.3",
```

[}]: #

Now let's rebuild the `meteor-client`:

    $ npm run meteor-client:bundle

Next time we will run `cordova run android` everything will work as expected.

[{]: <helper> (navStep nextRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps" prevRef="https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination")

| [< Previous Step](https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination) | [Next Step >](https://angular-meteor.com/tutorials/whatsapp2/ionic/google-maps) |
|:--------------------------------|--------------------------------:|

[}]: #

