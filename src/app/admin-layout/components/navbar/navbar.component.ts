import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {Event, NavigationEnd, NavigationError, NavigationStart, Router} from '@angular/router';
import {AuthService} from "../../../shared/services/auth.service";
import {ToastrService} from "ngx-toastr";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RecordService} from "../../../shared/services/record.service";
import {Record} from "../../../shared/models/Record";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AccountService} from "../../../shared/services/account.service";
import {CategoryService} from "../../../shared/services/category.service";
import {Account} from "../../../shared/models/Account";

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
  accounts: Account[] = [];
  categories: Account[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService,
    private recordService: RecordService,
    private accountService: AccountService,
    private categoryService: CategoryService,
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
    this.getAllAccounts();
    this.getAllCategories();
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
    this.auth.logout();
    this.router.navigate(['/login']).then();
  }

  open(content: any) {
    this.startFormRecord();
    this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
      this.closeResult = 'Closed with: $result';
    }, (reason: any) => {
      this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    });
  }

  compareById(v1: any, v2: any) {
    return v1?.id === v2?.id;
  }

  getAllCategories() {
    this.categoryService.getAll().subscribe(
      categories => {
        this.categories = categories;
      },
      error => {
        this.toast.error(error.error.message ?? 'Categories are not downloaded.');
      }
    );
  }

  getAllAccounts() {
    this.accountService.getAll().subscribe(
      accounts => {
        this.accounts = accounts;
      },
      error => {
        this.toast.error(error.error.message ?? 'Accounts are not downloaded.');
      }
    );
  }

  convertDateToString(date: Date): string {
    date.setDate(date.getDate() + 1);
    return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
  }

  /////////////////////////////////////////////////////////////////////////////
  //                            Record Operations                            //
  /////////////////////////////////////////////////////////////////////////////

  startFormRecord() {
    this.formRecord = new FormGroup({
      recordType: new FormControl(null, [Validators.required]),
      recordAmount: new FormControl(null, [Validators.required]),
      recordAccount: new FormControl(null, [Validators.required]),
      recordCategory: new FormControl(null, [Validators.required]),
      recordDate: new FormControl(new Date(), [Validators.required]),
      recordComment: new FormControl(null, [Validators.maxLength(100)])
    });
  }

  addRecord() {
    let record: Record = {
      recordType: this.formRecord.get('recordType')?.value,
      amount: this.formRecord.get('recordAmount')?.value,
      account: this.formRecord.get('recordAccount')?.value,
      category: this.formRecord.get('recordCategory')?.value,
      recordDate: this.formRecord.get('recordDate')?.value ? this.convertDateToString(this.formRecord.get('recordDate')?.value) :
        this.convertDateToString(new Date()),
      comment: this.formRecord.get('recordComment')?.value

    };
    this.formRecord.disable();
    this.recordService.add(record).subscribe(
      result => {
        this.toast.success('New Record was created.');
        this.formRecord.reset();
        this.formRecord.enable();
        this.modalService.dismissAll();
        window.location.reload();
      },
      error => {
        this.formRecord.enable();
        this.toast.error(error.errors?.message?? 'New Record was NOT added! Try again.');
      });
  }
}
