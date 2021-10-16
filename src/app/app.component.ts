import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<p *ngIf="!cookieEnabled" class="top-message">Cookies disabled! Enable cookies in browser settings!</p>' +
    '<router-outlet></router-outlet>'
})
export class AppComponent {
  title = 'familyPocketClient';
  cookieEnabled: boolean = navigator.cookieEnabled;
}
