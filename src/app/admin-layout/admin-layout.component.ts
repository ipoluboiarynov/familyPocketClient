import { Component, OnInit, HostListener } from "@angular/core";

@Component({
  selector: "app-admin-layout",
  templateUrl: "./admin-layout.component.html"
})
export class AdminLayoutComponent implements OnInit {
  isMobileResolution: boolean = false;

  constructor() {
    if (window.innerWidth < 1200) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }
  @HostListener("window:resize", ["$event"])
  isMobile(event: any) {
    if (window.innerWidth < 1200) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }
  ngOnInit() {}
}

