import {Component, OnInit, ElementRef, ViewChild} from "@angular/core";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import {AuthService} from "../../../shared/services/auth.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent implements OnInit {
  sidenavOpen: boolean = true;
  @ViewChild('topMenu') topMenu!: ElementRef;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        // Show loading indicator
      }
      if (event instanceof NavigationEnd) {
        // Hide loading indicator

        if (window.innerWidth < 1200) {
          document.body.classList.remove("g-sidenav-pinned");
          document.body.classList.add("g-sidenav-hidden");
          this.sidenavOpen = false;
        }
      }

      if (event instanceof NavigationError) {
        // Hide loading indicator

        // Present error to user
        console.log(event.error);
      }
    });

  }

  ngOnInit() {
  }
  toggleSidenav() {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
      this.sidenavOpen = false;
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
      this.sidenavOpen = true;
    }
    this.topMenu.nativeElement.hasAttribute('style') ?  this.topMenu.nativeElement.removeAttribute('style') :
      this.topMenu.nativeElement.setAttribute('style', 'margin-left: 190px!important; z-index: 1050;');
  }

  logout() {
    this.auth.logout().subscribe(
      () => {
        this.router.navigate(['/login']).then();
      },
      error => {
        this.toast.error(error.error?.message ?? "An error has occurred. Try again.");
      }
    );
  }
}
