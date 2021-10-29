import { Component, OnInit } from "@angular/core";
import {Category} from "../../../shared/models/Category";

let misc: any = {
  sidebar_mini_active: true
};

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent implements OnInit {
  categories!: Category[];

  constructor() {}

  ngOnInit() {
    this.categories = [
      {name: 'Expense 1', icon: 'ni-atom', expense: true, userId: 2},
      {name: 'Expense 2', icon: 'ni-badge', expense: true, userId: 2},
      {name: 'Expense 3', icon: 'ni-basket', expense: true, userId: 2},
      {name: 'Expense 4', icon: 'ni-air-baloon', expense: true, userId: 2},
      {name: 'Expense 5', icon: 'ni-briefcase-24', expense: true, userId: 2},
      {name: 'Expense 6', icon: 'ni-box-2', expense: true, userId: 2},
      {name: 'Income 1', icon: 'ni-cart', expense: false, userId: 2},
      {name: 'Income 2', icon: 'ni-chart-pie-35', expense: false, userId: 2},
      {name: 'Income 3', icon: 'ni-compass-04', expense: false, userId: 2}
    ];
  }

  onMouseEnterSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
    }
  }
  onMouseLeaveSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
    }
  }
  minimizeSidebar() {
    const sidenavToggler = document.getElementsByClassName(
      "sidenav-toggler"
    )[0];
    const body = document.getElementsByTagName("body")[0];
    if (body.classList.contains("g-sidenav-pinned")) {
      misc.sidebar_mini_active = true;
    } else {
      misc.sidebar_mini_active = false;
    }
    if (misc.sidebar_mini_active === true) {
      body.classList.remove("g-sidenav-pinned");
      body.classList.add("g-sidenav-hidden");
      sidenavToggler.classList.remove("active");
      misc.sidebar_mini_active = false;
    } else {
      body.classList.add("g-sidenav-pinned");
      body.classList.remove("g-sidenav-hidden");
      sidenavToggler.classList.add("active");
      misc.sidebar_mini_active = true;
    }
  }
}
