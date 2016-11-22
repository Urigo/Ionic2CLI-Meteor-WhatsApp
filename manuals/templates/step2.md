## First Ionic Component

Now that we're finished with the initial setup, we can start building our app.

An application created by Ionic's CLI will have a very clear methodology. The app is made out of pages, each page is made out of 3 files:

- `.html` - A view template file written in HTML based on Angular2's new [template engine](angular.io/docs/ts/latest/guide/template-syntax.html).
- `.scss` - A stylesheet file written in a CSS pre-process language called [SASS](sass-lang.com).
- `.ts` - A script file written in Typescript.

By default, the application will be created with 3 pages - `about`, `home` and `contact`. Since our app's flow doesn't contain any of them, we first gonna clean them up by running the following commands:

    $ rm -rf src/pages/about
    $ rm -rf src/pages/home
    $ rm -rf src/pages/contact

And we need to remove their usage from the tabs container:

{{{diff_step 2.2}}}

And remove them from the module definition:

{{{diff_step 2.1}}}

And let's change the actual tabs to show the tabs we want:

{{{diff_step 2.3}}}

We defined 4 tabs: `chats`, `contacts`, `favorites` and `recents`. In this tutorial we want to focus only on the messaging system, therefore we only gonna implement the chats tab, the rest is just for the layout.

If you will take a closer look at the view template we've just defined, you can see that one of the tab's attributes is wrapped with \[square brackets\]. This is part of Angular2's new template syntax and what it means is that the property called `root` of the HTML element is bound to the `chatsTabRoot` property of the component.

Our next step is to implement the `chats` tab - first let's start by adding `moment` as a dependency - we will use it soon:

    $ npm install --save moment

Let's go ahead and implement the chats component, let's start with it's view (just a stub, we will later implement):

{{{diff_step 2.5}}}

Once creating an Ionic page it's recommended to use the following layout:

- &lt;ion-header&gt; - The header of the page. Will usually contain content that should be bounded to the top like navbar.
- &lt;ion-content&gt; - The content of the page. Will usually contain it's actual content like text.
- &lt;ion-footer&gt; - The footer of the page. Will usutally contain content that should be bounded to the bottom like toolbars.

And now we will implement the actual Component:

{{{diff_step 2.6}}}

The logic is simple. 

Once the component is created we gonna define dummy chats just so we can test our view. As you can see we're using a package called [Moment](momentjs.com) to fabricate some date data. 

We use `Observable.of` which is a shortcut for creating an Observable with a single value.

Now let's add the new Component to the module definition so Angular 2 will know that the Component exists:

{{{diff_step 2.7}}}

And let's add it to the `TabsPage` which is the page that manages our tabs:

{{{diff_step 2.8}}}

And add the tab definition to the view, so the tab we create will be linked to the new Component:

{{{diff_step 2.9}}}

## TypeScript Interfaces

Now, because we use TypeScript, we can defined our types and use then in our app, and in most of the IDEs you will get a better auto-complete and developing experience.

So in our application, at the moment, we have two models: `Chat` and `Message`, so let's create the TypeScript definition for them.

The file extension should be `.d.ts` - this is the way to tell TypeScript that the file does not contain any login - only interfaces.

We will locate it under `/models/` directory, and later we will see how we can share those model definitions in both server side and client side.

So let's create the definitions file:

{{{diff_step 2.10}}}

Note that we declared our interface inside a module called `api/models/whatsapp-models` - so we will be able to import the models from that path.

And we need to add this definition to our TypeScript config (`tsconfig.json`), so it would be available in our code:

{{{diff_step 2.11}}}

Now, let's use our new model in the `ChatsPage`:

{{{diff_step 2.12}}}

## Ionic Themes
 
Ionic provides use a theme engine in order to define style faster and more efficient. 

The theme definition file is located in `src/theme/variable.scss`, and at the moment we will just add a new theme color, called `whatsapp`:

{{{diff_step 2.13}}}

And now we will be able to use the new color anywhere in any Ionic Component by adding `color="whatsapp"` to the Component.

{{{diff_step 2.14}}}

So let's add it to the view of the `ChatsPage`, and we will also use some more Ionic Components along with Angular 2 features:

{{{diff_step 2.15}}}

We use `ion-list` which Ionic translate into a list, and use `ion-item` for each one of the items in the list, and we also added to the view some images and text for each chat item.

> We use `ngFor` along with the `async` Pipe because we will use RxJS and Observables in the tutorial!

Now, in order to finish our theming and styling, let's create a stylesheet file for our Component:

{{{diff_step 2.16}}}

> In Ionic 2, there is no need to load each specific style file - Ionic loads any style file under the `app` folder.

## External Angular 2 Modules

Ionic 2 application works just like any other Angular 2 application, which means we can use any external packages that we need. 

For example, we will add a usage with `angular2-moment` package, that adds useful Pipes we can use in our view, in order to manipulate the display of Date variables.

So let's add this package first:

    $ npm install --save angular2-moment
    
Now we need to tell our Angular 2 application to load that external module, so it would be available for use:
    
{{{diff_step 2.18}}}
    
And let's use a Pipe from that package it in the view:
    
{{{diff_step 2.19}}}
    
## Ionic Touch Events
    
Ionic provides us special Component's which handles touch events, for example: slide, tap and pinch. 

We can use those in our view, let's add a sliding button that will show us more functionality for each chat.

We add a remove button for each chat, so let's do it:

{{{diff_step 2.20}}}

And bind the event handler to the Component (we will implement the remove feature later): 

{{{diff_step 2.21}}}
