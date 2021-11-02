import {Component, OnInit, ElementRef, ViewChild} from "@angular/core";
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import {AuthService} from "../../../shared/services/auth.service";
import {ToastrService} from "ngx-toastr";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AccountType} from "../../../shared/models/AccountType";
import Swal from "sweetalert2";
import {RecordService} from "../../../shared/services/record.service";
import {Record} from "../../../shared/models/Record";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent implements OnInit {
  sidenavOpen: boolean = true;
  @ViewChild('topMenu') topMenu!: ElementRef;

  isNew!: boolean;
  formRecord!: FormGroup;
  closeResult!: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService,
    private recordService: RecordService,
    private modalService: NgbModal
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

  open(content: any) {
    this.startFormRecord();
    this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
      this.closeResult = 'Closed with: $result';
    }, (reason: any) => {
      this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  //                            Record Operations                            //
  /////////////////////////////////////////////////////////////////////////////

  startFormRecord() {
    this.formRecord = new FormGroup({
      recordType: new FormControl(null, [Validators.required]),
      recordAmount: new FormControl(null, [Validators.required]),
      recordCurrency: new FormControl(null, [Validators.required]),
      recordAccount: new FormControl(null, [Validators.required]),
      recordCategory: new FormControl(null, [Validators.required]),
      recordDate: new FormControl(null, [Validators.required]),
      recordComment: new FormControl(null, [Validators.maxLength(100)])
    });
  }

  addRecord() {
    let record: Record = {
      type: this.formRecord.get('recordType')?.value,
      amount: this.formRecord.get('recordAmount')?.value,
      currencyId: this.formRecord.get('recordCurrency')?.value,
      accountId: this.formRecord.get('recordAccount')?.value,
      categoryId: this.formRecord.get('recordCategory')?.value,
      date: this.formRecord.get('recordDate')?.value,
      comment: this.formRecord.get('recordComment')?.value

    };
    this.formRecord.disable();
    this.recordService.add(record).subscribe(
      result => {
        this.toast.success('New Record was created.');
        this.formRecord.reset();
        this.formRecord.enable();
        this.modalService.dismissAll();
      },
      error => {
        this.formRecord.enable();
        this.toast.error(error.errors?.message?? 'New Record was NOT added! Try again.');
      });
  }
}
