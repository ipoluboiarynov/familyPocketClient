import {AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SpinnerService} from "./shared/services/spinner.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements AfterViewChecked {
  title = 'familyPocketClient';
  cookieEnabled: boolean = navigator.cookieEnabled;
  spinner!: SpinnerService;

  constructor(private spinnerService: SpinnerService,
              private cdr: ChangeDetectorRef) {}

  ngAfterViewChecked(): void {
    this.spinner = this.spinnerService;
    this.cdr.detectChanges();
  }

}
