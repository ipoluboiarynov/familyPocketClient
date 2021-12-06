import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
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
import {ConvertDateService} from "../../../shared/services/convertDate.service";
import {TemplateService} from "../../../shared/services/template.service";
import {Subscription} from "rxjs";
import {Template} from "../../../shared/models/Template";
import {RatesService} from "../../../shared/services/rates.service";
import {Rates} from "../../../shared/models/Rates";
import {SharedService} from "../../../shared/services/shared.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html"
})
export class NavbarComponent implements OnInit, OnDestroy {
  sidenavOpen: boolean = true;
  @ViewChild('topMenu') topMenu!: ElementRef;
  @ViewChild('amountTo') amountTo!: ElementRef;

  isNew!: boolean;
  formRecord!: FormGroup;
  formTransfer!: FormGroup;
  closeResult!: string;
  accounts: Account[] = [];
  categories: Account[] = [];
  templates: Template[] = [];
  isCollapsedTemplates: boolean = true;
  rates!: Rates;

  aSub!: Subscription;
  bSub!: Subscription;
  cSub!: Subscription;

  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastrService,
    private recordService: RecordService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private modalService: NgbModal,
    private convertDateService:  ConvertDateService,
    private templateService: TemplateService,
    private ratesService: RatesService,
    private sharedService: SharedService
  ) {
    this.sharedService.changeEmitted$.subscribe(result => {
      if (!result.source) {
        return
      }
      if (result.content && result.content === 'onInit') {
        this.ngOnInit();
      }
    });

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
    this.uploadRates();
    this.getAllTemplates();
    this.getAllAccounts();
    this.getAllCategories();
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
    if (this.bSub) {
      this.bSub.unsubscribe();
    }
    if (this.cSub) {
      this.cSub.unsubscribe();
    }
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

  open(content: any, name?: string) {
    if (name && name == 'transfer') {
      this.startFormTransfer();
    }
    if (name && name == 'record') {
      this.startFormRecord();
    }
    this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then(() => {
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
      recordDate: this.formRecord.get('recordDate')?.value ? this.convertDateService.convertDateToString(this.formRecord.get('recordDate')?.value) :
        this.convertDateService.convertDateToString(new Date()),
      comment: this.formRecord.get('recordComment')?.value

    };
    this.formRecord.disable();
    this.recordService.add(record).subscribe(
      () => {
        this.formRecord.reset();
        this.formRecord.enable();
        this.modalService.dismissAll();
        this.toast.success('New Record was created.');
        this.sharedService.emitChange({source: 'navbar', content: 'onInit'});
        this.ngOnInit();
      },
      () => {
        this.formRecord.enable();
        this.toast.error('New Record was NOT added! Try again.');
      });
  }

  /////////////////////////////////////////////////////////////////////////////
  //                            Template Operations                          //
  /////////////////////////////////////////////////////////////////////////////

  getAllTemplates() {
    this.bSub = this.templateService.getAll().subscribe(
      templates => {
      this.templates = templates;
    },
      error => {
      this.toast.error('Templates NOT downloaded! ' + error.statusText ?? '');
      });
  }

  deleteTemplate(template: Template) {
    let id = template.id;
    if (id) {
      this.cSub = this.templateService.delete(id).subscribe(
        () => {
          this.getAllTemplates();
        },
        error => {
          this.toast.error("Template NOT deleted! " + error.statusText ?? '');
        });
    }
  }

  setTemplate(template: Template) {
    template.recordType ? this.formRecord.get('recordType')?.setValue(template.recordType) : '';
    template.category ? this.formRecord.get('recordCategory')?.setValue(template.category) : '';
    template.account ? this.formRecord.get('recordAccount')?.setValue(template.account) : '';
    template.amount ? this.formRecord.get('recordAmount')?.setValue(template.amount) : '';
    template.name ? this.formRecord.get('recordComment')?.setValue(template.name) : '';
    this.isCollapsedTemplates = true;
  }

  /////////////////////////////////////////////////////////////////////////////
  //                            Account Operations                           //
  /////////////////////////////////////////////////////////////////////////////

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

  startFormTransfer() {
    this.formTransfer = new FormGroup({
      transferDate: new FormControl(null, [Validators.required]),
      transferFromAccount: new FormControl(null, [Validators.required]),
      transferToAccount: new FormControl(null, [Validators.required]),
      transferFromAmount: new FormControl(null, [Validators.required]),
      transferToAmount: new FormControl(null, [Validators.required])
    });

    this.formTransfer.get('transferToAmount')?.disable();
  }

  makeTransfer() {
    if (
      !this.formTransfer.get('transferFromAccount')?.value &&
      !this.formTransfer.get('transferToAccount')?.value &&
      !this.formTransfer.get('transferFromAmount')?.value &&
      !this.formTransfer.get('transferToAmount')?.value
    ) {
      return;
    }

    let fromRecord: Record = {
      recordDate: this.formTransfer.get('transferDate')?.value ? this.convertDateService.convertDateToString(this.formTransfer.get('transferDate')?.value) :
        this.convertDateService.convertDateToString(new Date()),
      recordType: 'TR_OUT',
      account: this.formTransfer.get('transferFromAccount')?.value,
      amount: this.formTransfer.get('transferFromAmount')?.value
    };

    let toRecord: Record = {
      recordDate: this.formTransfer.get('transferDate')?.value ? this.convertDateService.convertDateToString(this.formTransfer.get('transferDate')?.value) :
        this.convertDateService.convertDateToString(new Date()),
      recordType: 'TR_IN',
      account: this.formTransfer.get('transferToAccount')?.value,
      amount: this.formTransfer.get('transferToAmount')?.value
    };

    if (toRecord.account.name === fromRecord.account.name) {
      this.formTransfer.reset();
      this.modalService.dismissAll();
      this.toast.error('Cannot be transferred from the same account!');
      return;
    }

    if (this.convertDateService.convertStringToDate(toRecord.recordDate) > new Date()) {
      this.formTransfer.reset();
      this.modalService.dismissAll();
      this.toast.error('Date cannot be later than today!');
      return;
    }

    this.formTransfer.disable();
    this.recordService.addTransfer(fromRecord, toRecord).subscribe(
      () => {
        this.formTransfer.reset();
        this.formTransfer.enable();
        this.modalService.dismissAll();
        this.toast.success('Transfer added.');
        this.sharedService.emitChange({source: 'navbar', content: 'onInit'});
        this.ngOnInit();
    },
      () => {
        this.formRecord.enable();
        this.toast.error("Transfer NOT created!");

      });
  }

  uploadRates() {
    this.ratesService.getRates().then(
      (rates) => {
        this.rates = rates;
      });
  }

  onFormChange(event: any) {
    let accountFrom = this.formTransfer.get('transferFromAccount');
    let accountTo = this.formTransfer.get('transferToAccount');
    let amountFrom = this.formTransfer.get('transferFromAmount');
    let amountTo = this.formTransfer.get('transferToAmount');

    if (accountFrom?.value && accountTo?.value) {
      if (accountFrom?.value.currency.name != accountTo?.value.currency.name) {
        if (event.target.id && event.target.value && event.target.value > 0 && event.target.id === 'amountToAccount') {
          amountTo?.setValue(event.target.value);
        } else {
          let amount = Math.round(this.convertCurrency(amountFrom?.value, accountFrom?.value, accountTo?.value) * 100) / 100;
          amountTo?.setValue(amount);
        }
        amountTo?.disabled ? amountTo?.enable() : '';
      } else {
        amountTo?.setValue(amountFrom?.value);
        amountTo?.enabled ? amountTo?.disable() : '';
      }
    }
  }

  convertCurrency(amount: number, accountFrom: Account, accountTo: Account): number {
    if (accountFrom && accountFrom.currency && accountTo && accountTo.currency && this.rates) {
      let rates_array = Object.entries(this.rates.rates);
      let found_rateFrom = rates_array.find(rate => rate[0] === accountFrom.currency.name);
      let found_rateTo = rates_array.find(rate => rate[0] === accountTo.currency.name);
      if (found_rateFrom && found_rateFrom[1] && typeof found_rateFrom[1] === 'number' &&
        found_rateTo && found_rateTo[1] && typeof found_rateTo[1] === 'number') {
        return amount * found_rateTo[1] / found_rateFrom[1];
      }
    }
    return 0;
  }
}
