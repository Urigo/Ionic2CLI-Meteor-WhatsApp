declare module 'meteor/meteor' {
  namespace Meteor {
    function publishComposite(
      name: string,
      config: PublishCompositeConfig<any> | PublishCompositeConfig<any>[]
    ): void;

    function publishComposite(
      name: string,
      configFunc: (...args: any[]) =>
        PublishCompositeConfig<any> | PublishCompositeConfig<any>[]
    ): void;
  }
}