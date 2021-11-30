import {Component, HostListener, OnInit} from "@angular/core";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html"
})
export class AdminLayoutComponent implements OnInit {

  isMobileResolution: boolean = false;

  constructor() {
    this.isMobileResolution = window.innerWidth < 1200;
  }
  @HostListener("window:resize", ["$event"])
  isMobile(event: any) {
    this.isMobileResolution = window.innerWidth < 1200;
  }
  ngOnInit() {
  }
}

