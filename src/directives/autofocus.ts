import { AfterContentInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector : '[autofocus]'
})
export class AutofocusDirective implements AfterContentInit {
  constructor(private el: ElementRef) {}

  private get input(): HTMLInputElement {
    return <HTMLInputElement>this.el.nativeElement.querySelector('input');
  }

  ngAfterContentInit() {
    const input = this.input;

    if (input) {
      if (!input.hasAttribute('tabindex')) input.setAttribute('tabindex', '0');
      input.focus();
    }
  }
}