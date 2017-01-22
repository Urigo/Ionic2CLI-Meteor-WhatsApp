import { Directive, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Directive({
  selector : '[observe]'
})
export class ObserveDirective implements OnInit {
  @Output('observe') observer = new EventEmitter();

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const observe = Observable.fromEvent.bind(Observable, this.el.nativeElement);
    this.observer.emit(observe);
  }
}