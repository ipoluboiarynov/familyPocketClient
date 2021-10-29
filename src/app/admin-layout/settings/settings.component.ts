import {Component, OnDestroy, OnInit} from '@angular/core';
import {AccountService} from "../../shared/services/account.service";
import {ToastrService} from "ngx-toastr";
import {Account} from "../../shared/models/Account";
import {AccountTypeService} from "../../shared/services/accountType.service";
import {AccountType} from "../../shared/models/AccountType";
import {Subscription} from "rxjs";
import {CurrencyService} from "../../shared/services/currency.service";
import {Currency} from "../../shared/models/Currency";
import {Category} from "../../shared/models/Category";
import {CategoryService} from "../../shared/services/category.service";
import {User} from "../../shared/models/User";
import {UserService} from "../../shared/services/user.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Filter} from "../../shared/models/Filter";
import {FilterService} from "../../shared/services/filter.service";
import {Template} from "../../shared/models/Template";
import {TemplateService} from "../../shared/services/template.service";
import {Rates} from "../../shared/models/Rates";
import {RatesService} from "../../shared/services/rates.service";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
  CURRENCY_ICONS = [
    {name: '&#xf155; &nbsp; Dollar', value: 'fas fa-dollar-sign'},
    {name: '&#xf153; &nbsp; Euro', value: 'fas fa-euro-sign'},
    {name: '&#xf154; &nbsp; Pound', value: 'fas fa-pound-sign'},
    {name: '&#xf158; &nbsp; Ruble', value: 'fas fa-ruble-sign'},
    {name: '&#xf156; &nbsp; Rupee', value: 'fas fa-rupee-sign'},
    {name: '&#xf157; &nbsp; Yen', value: 'fas fa-yen-sign'},
    {name: '&#xf159; &nbsp; Won', value: 'fas fa-won-sign'},
    {name: '&#xf51e; &nbsp; Other', value: 'fas fa-coins'}
  ];

  CATEGORY_ICONS = [
    {name: '&#xf291; &nbsp; Shopping Basket', value: 'fas fa-shopping-basket'},
    {name: '&#xf2db; &nbsp; Microchip', value: 'fas fa-microchip'},
    {name: '&#xf53a; &nbsp; Money Bill Wave', value: 'fas fa-money-bill-wave'},
    {name: '&#xf2f1; &nbsp; Sync Alt', value: 'fas fa-sync-alt'},
    {name: '&#xf06b; &nbsp; Gifts', value: 'fas fa-gift'},
    {name: '&#xf44b; &nbsp; Dumbbell', value: 'fas fa-dumbbell'},
    {name: '&#xf4c0; &nbsp; Hand Holding', value: 'fas fa-hand-holding-usd'},
    {name: '&#xf295; &nbsp; Percent', value: 'fas fa-percent'},
    {name: '&#xf2e7; &nbsp; Utensils', value: 'fas fa-utensils'},
    {name: '&#xf805; &nbsp; Hamburger', value: 'fas fa-hamburger'},
    {name: '&#xf818; &nbsp; Pizza-slice', value: 'fas fa-pizza-slice'},
    {name: '&#xf810; &nbsp; Ice-cream', value: 'fas fa-ice-cream'},
    {name: '&#xf4d8; &nbsp; Seedling', value: 'fas fa-seedling'},
    {name: '&#xf5d7; &nbsp; Bone', value: 'fas fa-bone'},
    {name: '&#xf44e; &nbsp; Football-ball', value: 'fas fa-football-ball'},
    {name: '&#xf553; &nbsp; T-shirt', value: 'fas fa-tshirt'},
    {name: '&#xf19d; &nbsp; Graduation-cap', value: 'fas fa-graduation-cap'},
    {name: '&#xf1b9; &nbsp; Car', value: 'fas fa-car'},
    {name: '&#xf77d; &nbsp; Baby-carriage', value: 'fas fa-baby-carriage'},
    {name: '&#xf3cd; &nbsp; Mobile', value: 'fas fa-mobile-alt'},
    {name: '&#xf1eb; &nbsp; Wifi', value: 'fas fa-wifi'},
    {name: '&#xf7d9; &nbsp; Tools', value: 'fas fa-tools'},
    {name: '&#xf015; &nbsp; Home', value: 'fas fa-home'},
    {name: '&#xf0e7; &nbsp; Bolt', value: 'fas fa-bolt'},
    {name: '&#xf6c0; &nbsp; Baby', value: 'fas fa-baby'}
  ];

  ACCOUNT_ICONS = [
    {name: '&#xf555; &nbsp; Wallet', value: 'fas fa-wallet'},
    {name: '&#xf66f; &nbsp; Landmark', value: 'fas fa-landmark'},
    {name: '&#xf09d; &nbsp; Credit Card', value: 'far fa-credit-card'},
    {name: '&#xf51e; &nbsp; Coins', value: 'fas fa-coins'},
    {name: '&#xf4d3; &nbsp; Piggy-bank', value: 'fas fa-piggy-bank'},
    {name: '&#xf1f1; &nbsp; Master card', value: 'fab fa-cc-mastercard'},
    {name: '&#xf1f4; &nbsp; Visa', value: 'fab fa-cc-visa'},
    {name: '&#xf555; &nbsp; Pay Pal', value: 'fab fa-cc-paypal'},
    {name: '&#xf416; &nbsp; Apple Pay', value: 'fab fa-cc-apple-pay'},
    {name: '&#xf1f3; &nbsp; Amex', value: 'fab fa-cc-amex'},
    {name: '&#xf1f2; &nbsp; Discover', value: 'fab fa-cc-discover'},
    {name: '&#xf42d; &nbsp; Amazon Pay', value: 'fab fa-cc-amazon-pay'}
  ];

  RECORD_TYPES = [
    {id: 0, name: 'INCOME'},
    {id: 1, name: 'EXPENSE'},
    {id: 2, name: 'TRANSFER'}
  ];

  aSub!: Subscription;
  bSub!: Subscription;
  cSub!: Subscription;
  dSub!: Subscription;
  eSub!: Subscription;
  fSub!: Subscription;
  gSub?: Subscription;
  hSub?: Subscription;

  accounts: Account[] = [];
  accountTypes: AccountType[] = [];
  currencies: Currency[] = [];
  categories: Category[] = [];
  expenses: Category[] = [];
  incomes: Category[] = [];
  filters: Filter[] = [];
  templates: Template[] = [];
  rates!: Rates;
  currencyList: string[] = [];
  user: User | null = null;

  userForm!: FormGroup;
  formAccountType!: FormGroup;
  formCurrency!: FormGroup;
  formCategory!: FormGroup;
  formAccount!: FormGroup;
  formTemplate!: FormGroup;

  isNew: boolean = false;
  updateObject!: any;

  constructor(private accountService: AccountService,
              private accountTypeService: AccountTypeService,
              private currencyService: CurrencyService,
              private categoryService: CategoryService,
              private filterService: FilterService,
              private templateService: TemplateService,
              private userService: UserService,
              private toast: ToastrService,
              private ratesService: RatesService,
              private modalService: NgbModal
  ) { }

  closeResult!: string;

  ngOnInit(): void {
    this.getAllAccounts();
    this.getAllAccountTypes();
    this.getAllCurrencies();
    this.getAllCategories();
    this.getAllFilters();
    this.getAllTemplates();
    this.getUserInfo();
    this.uploadRates();
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
    if (this.dSub) {
      this.dSub.unsubscribe();
    }
    if (this.eSub) {
      this.eSub.unsubscribe();
    }
    if (this.fSub) {
      this.fSub.unsubscribe();
    }
    if (this.gSub) {
      this.gSub.unsubscribe();
    }
    if (this.hSub) {
      this.hSub.unsubscribe();
    }
  }

  getAllAccounts(): void {
    let today = new Date();
    let todayString = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    this.aSub = this.accountService.getAll(todayString).subscribe(
      accounts => {
        this.accounts = accounts;
      },
      error => {
        this.toast.error(error.error.message ?? 'Accounts are not downloaded.');
      }
    );
  }

  getAllAccountTypes(): void {
    this.bSub = this.accountTypeService.getAll().subscribe(
      accountTypes => {
        this.accountTypes = accountTypes;
      },
      error => {
        this.toast.error(error.error.message ?? 'Account Types are not downloaded.');
      }
    );
  }

  getAllCurrencies(): void {
    this.cSub = this.currencyService.getAll().subscribe(
      currencies => {
        this.currencies = currencies;
      },
      error => {
        this.toast.error(error.error.message ?? 'Currencies are not downloaded.');
      }
    );
  }

  getAllCategories(): void {
    this.dSub = this.categoryService.getAll().subscribe(
      categories => {
        this.categories = categories;
        this.expenses = categories.filter((category: Category) => category.expense);
        this.incomes = categories.filter((category: Category) => !category.expense);
      },
      error => {
        this.toast.error(error.error.message ?? 'Categories are not downloaded.');
      }
    );
  }

  getUserInfo(): void {
    this.eSub = this.userService.getUser().subscribe(
      user => {
        this.user = user;
        this.userForm = new FormGroup({
          name: new FormControl(this.user?.name?? ''),
          email: new FormControl(this.user?.email?? '', [Validators.required, Validators.email])
        });
      },
      error => {
        this.toast.error(error.error.message ?? 'User info is not downloaded.');
      }
    );
  }

  changeProfile() {
    if (this.user && this.userForm.valid && this.userForm.touched) {
      this.user.email = this.userForm.get('email')?.value;
      this.user.name = this.userForm.get('name')?.value;
      console.log(this.user);
      this.fSub = this.userService.updateUser(this.user).subscribe(
        newUser => {
          this.toast.success('User was successfully updated!')
          this.user = newUser;
        },
        error => {
          this.toast.error(error.error.message ?? 'User was not updated!');
        });
    }
  }

  getAllFilters() {
    this.gSub = this.filterService.getAll().subscribe(
      filters => {
        this.filters = filters;
      },
      error => {
        this.toast.error(error.error.message ?? 'Filters are not downloaded.');
      }
    );
  }

  getAllTemplates() {
    this.hSub = this.templateService.getAll().subscribe(
      templates => {
        console.log(templates)
        this.templates = templates;
      },
      error => {
        this.toast.error(error.error.message ?? 'Templates are not downloaded.');
      }
    );
  }

  uploadRates() {
    this.ratesService.getRates().then(
      (rates) => {
        this.rates = rates;
         Object.entries(rates.rates).map(rate => {
           this.currencyList.push(rate[0]);
        });
      });
  }

  open(content: any, type: string, object?: object) {
    object ? this.isNew = false : this.isNew = true;
    switch (type) {
      case 'accountType':
        object? this.startFormAccountType(object) : this.startFormAccountType();
        break;
      case 'currency':
        object? this.startFormCurrency(object) : this.startFormCurrency();
        break;
      case 'expense':
        object? this.startFormCategory(true, object) : this.startFormCategory(true);
        break;
      case 'income':
        object? this.startFormCategory(false, object) : this.startFormCategory(false);
        break;
      case 'account':
        object? this.startFormAccount(object) : this.startFormAccount();
        break;
      case 'template':
        object? this.startFormTemplate(object) : this.startFormTemplate();
        break;
    }
    this.modalService.open(content, { windowClass: 'modal-mini', size: 'sm', centered: true }).result.then((result) => {
      // console.log(result);
        this.closeResult = 'Closed with: $result';
      }, (reason: any) => {
        this.closeResult = 'Dismissed $this.getDismissReason(reason)';
      });
  }

  /////////////////////////////////////////////////////////////////////////////
  //                         Account Type Operations                         //
  /////////////////////////////////////////////////////////////////////////////

  startFormAccountType(accountType?: any) {
    if (accountType) {
      this.updateObject = accountType;
      this.formAccountType = new FormGroup({
        accountTypeName: new FormControl(accountType.name, [Validators.required, Validators.maxLength(20)]),
        accountTypeIsNegative: new FormControl(accountType.negative)
      });
    } else {
      this.formAccountType = new FormGroup({
        accountTypeName: new FormControl('', [Validators.required, Validators.maxLength(20)]),
        accountTypeIsNegative: new FormControl(false)
      });
    }
  }

  addAccountType() {
    let accountType: AccountType = {
      name: this.formAccountType.get('accountTypeName')?.value,
      negative: this.formAccountType.get('accountTypeIsNegative')?.value
    };
    this.formAccountType.disable();
    this.accountTypeService.add(accountType).subscribe(
      result => {
          this.toast.success('New Account Type was created.');
          this.formAccountType.reset();
          this.formAccountType.enable();
          this.modalService.dismissAll();
          this.getAllAccountTypes();
      },
      error => {
        this.formAccountType.enable();
        this.toast.error(error.errors?.message?? 'New Account Type is NOT added! Try again.');
      });
  }

  updateAccountType() {
    this.updateObject.name = this.formAccountType.get('accountTypeName')?.value;
    this.updateObject.negative = this.formAccountType.get('accountTypeIsNegative')?.value;
    this.formAccountType.disable();
    this.accountTypeService.update(this.updateObject).subscribe(
      value => {
        this.toast.success('Account Type was updated.');
        this.formAccountType.reset();
        this.formAccountType.enable();
        this.modalService.dismissAll();
        this.getAllAccountTypes();
        this.updateObject = null;
      },
      error => {
        this.formAccountType.enable();
        this.toast.error(error.errors?.message?? 'Account Type is NOT updated! Try again.')
      }
    );
  }

  deleteAccountType(accountType: AccountType) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: 'btn btn-success',
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Delete " + accountType.name + "?",
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value && accountType.id) {
        this.accountTypeService.delete(accountType.id).subscribe(
          value => {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: accountType.name + ' has been deleted.',
              icon: 'success'
            }).then();
            this.getAllAccountTypes();
          },
          error => {
            swalWithBootstrapButtons.fire({
              title: 'Error!',
              text: error.error.message?? accountType.name + ' is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Currency Operations                         //
  /////////////////////////////////////////////////////////////////////////////

  startFormCurrency(currency?: any) {
    if (currency) {
      this.updateObject = currency;
      this.formCurrency = new FormGroup({
        currencyName: new FormControl(currency.name, [Validators.required]),
        currencyIcon: new FormControl(currency.icon, [Validators.required]),
        currencyBase: new FormControl(currency.base)
      });
    } else {
      this.formCurrency = new FormGroup({
        currencyName: new FormControl('', [Validators.required]),
        currencyIcon: new FormControl('', [Validators.required]),
        currencyBase: new FormControl(false)
      });
    }
  }

  addCurrency() {
    let currency: Currency = {
      name: this.formCurrency.get('currencyName')?.value,
      icon: this.formCurrency.get('currencyIcon')?.value,
      base: this.formCurrency.get('currencyBase')?.value
    };
    this.formCurrency.disable();
    this.currencyService.add(currency).subscribe(
      result => {
        this.toast.success('New Currency was created.');
        this.formCurrency.reset();
        this.formCurrency.enable();
        this.modalService.dismissAll();
        this.getAllCurrencies();
      },
      error => {
        this.formCurrency.enable();
        this.toast.error(error.errors.message?? 'New Currency is NOT added! Try again.')
      });
  }

  updateCurrency() {
    this.updateObject.name = this.formCurrency.get('currencyName')?.value;
    this.updateObject.icon = this.formCurrency.get('currencyIcon')?.value;
    this.updateObject.base = this.formCurrency.get('currencyBase')?.value;
    this.formCurrency.disable();
    this.currencyService.update(this.updateObject).subscribe(
      value => {
        this.toast.success('Currency was updated.');
        this.formCurrency.reset();
        this.formCurrency.enable();
        this.modalService.dismissAll();
        this.getAllCurrencies();
        this.updateObject = null;
      },
      error => {
        this.formCurrency.enable();
        this.toast.error(error.errors?.message?? 'Currency is NOT updated! Try again.')
      }
    );
  }

  deleteCurrency(currency: Currency) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: 'btn btn-success',
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Delete " + currency.name + "?",
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value && currency.id) {
        this.currencyService.delete(currency.id).subscribe(
          value => {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: currency.name + ' has been deleted.',
              icon: 'success'
            }).then();
            this.getAllCurrencies();
          },
          error => {
            swalWithBootstrapButtons.fire({
              title: 'Error!',
              text: error.error?.message?? currency.name + ' is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Category Operations                         //
  /////////////////////////////////////////////////////////////////////////////

  startFormCategory(expense?: boolean, category?: any) {
    if (category) {
      this.updateObject = category;
      this.formCategory = new FormGroup({
        categoryName: new FormControl(category.name, [Validators.required]),
        categoryIcon: new FormControl(category.icon, [Validators.required]),
        categoryExpense: new FormControl(category.expense)
      });
    } else {
      this.formCategory = new FormGroup({
        categoryName: new FormControl('', [Validators.required]),
        categoryIcon: new FormControl('', [Validators.required]),
        categoryExpense: new FormControl(expense?? false)
      });
    }
  }

  addCategory() {
    let category: Category = {
      name: this.formCategory.get('categoryName')?.value,
      icon: this.formCategory.get('categoryIcon')?.value,
      expense: this.formCategory.get('categoryExpense')?.value
    };
    this.formCategory.disable();
    this.categoryService.add(category).subscribe(
      result => {
        this.toast.success('New Category was created.');
        this.formCategory.reset();
        this.formCategory.enable();
        this.modalService.dismissAll();
        this.getAllCategories();
      },
      error => {
        this.formCategory.enable();
        this.toast.error(error.errors.message?? 'New Category is NOT added! Try again.')
      });
  }

  updateCategory() {
    this.updateObject.name = this.formCategory.get('categoryName')?.value;
    this.updateObject.icon = this.formCategory.get('categoryIcon')?.value;
    this.updateObject.expense = this.formCategory.get('categoryExpense')?.value;
    this.formCategory.disable();
    this.categoryService.update(this.updateObject).subscribe(
      value => {
        this.toast.success('Category was updated.');
        this.formCategory.reset();
        this.formCategory.enable();
        this.modalService.dismissAll();
        this.getAllCategories();
        this.updateObject = null;
      },
      error => {
        this.formCategory.enable();
        this.toast.error(error.errors?.message?? 'Category is NOT updated! Try again.')
      }
    );
  }

  deleteCategory(category: Category) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: 'btn btn-success',
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Delete " + category.name + "?",
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value && category.id) {
        this.categoryService.delete(category.id).subscribe(
          value => {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: category.name + ' has been deleted.',
              icon: 'success'
            }).then();
            this.getAllCategories();
          },
          error => {
            swalWithBootstrapButtons.fire({
              title: 'Error!',
              text: error.error?.message?? category.name + ' is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Account Operations                          //
  /////////////////////////////////////////////////////////////////////////////

  startFormAccount(account?: any) {

    if (account) {
      this.updateObject = account;
      this.formAccount = new FormGroup({
        accountName: new FormControl(account.name, [Validators.required]),
        accountIcon: new FormControl(account.icon, [Validators.required]),
        accountBalance: new FormControl(account.startBalance, [Validators.required]),
        accountDate: new FormControl(account.startDate, [Validators.required]),
        accountColor: new FormControl(account.color, [Validators.required]),
        accountCurrency: new FormControl(account.currency, [Validators.required]),
        accountType: new FormControl(account.accountType, [Validators.required]),
        accountLimit: new FormControl(account.creditLimit, [Validators.required])
      });
    } else {
      this.formAccount = new FormGroup({
        accountName: new FormControl('', [Validators.required]),
        accountIcon: new FormControl('', [Validators.required]),
        accountBalance: new FormControl(0, [Validators.required]),
        accountDate: new FormControl('', [Validators.required]),
        accountColor: new FormControl('#ffffff', [Validators.required]),
        accountCurrency: new FormControl('', [Validators.required]),
        accountType: new FormControl('', [Validators.required]),
        accountLimit: new FormControl(0, [Validators.required])
      });
    }
  }

  addAccount() {
    let account: Account = {
      name: this.formAccount.get('accountName')?.value,
      icon: this.formAccount.get('accountIcon')?.value,
      startBalance: this.formAccount.get('accountBalance')?.value,
      startDate: this.formAccount.get('accountDate')?.value,
      color: this.formAccount.get('accountColor')?.value,
      currency: this.formAccount.get('accountCurrency')?.value,
      accountType: this.formAccount.get('accountType')?.value,
      creditLimit: this.formAccount.get('accountLimit')?.value
    };
    console.log(account);
    this.formAccount.disable();
    this.accountService.add(account).subscribe(
      result => {
        this.toast.success('New Account was created.');
        this.formAccount.reset();
        this.formAccount.enable();
        this.modalService.dismissAll();
        this.getAllAccounts();
      },
      error => {
        this.formAccount.enable();
        this.toast.error(error.errors.message?? 'New Account is NOT added! Try again.')
      });
  }

  updateAccount() {
    this.updateObject.name = this.formAccount.get('accountName')?.value;
    this.updateObject.icon = this.formAccount.get('accountIcon')?.value;
    this.updateObject.startBalance = this.formAccount.get('accountBalance')?.value;
    this.updateObject.startDate = this.formAccount.get('accountDate')?.value;
    this.updateObject.color = this.formAccount.get('accountColor')?.value;
    this.updateObject.currency = this.formAccount.get('accountCurrency')?.value;
    this.updateObject.accountType = this.formAccount.get('accountType')?.value;
    this.updateObject.creditLimit = this.formAccount.get('accountLimit')?.value;
    this.formAccount.disable();
    this.accountService.update(this.updateObject).subscribe(
      value => {
        this.toast.success('Account was updated.');
        this.formAccount.reset();
        this.formAccount.enable();
        this.modalService.dismissAll();
        this.getAllAccounts();
        this.updateObject = null;
      },
      error => {
        this.formAccount.enable();
        this.toast.error(error.errors?.message?? 'Account is NOT updated! Try again.')
      }
    );
  }

  deleteAccount(account: Account) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: 'btn btn-success',
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Delete " + account.name + "?",
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value && account.id) {
        this.accountService.delete(account.id).subscribe(
          value => {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: account.name + ' has been deleted.',
              icon: 'success'
            }).then();
            this.getAllAccounts();
          },
          error => {
            swalWithBootstrapButtons.fire({
              title: 'Error!',
              text: error.error?.message?? account.name + ' is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Templates Operations                        //
  /////////////////////////////////////////////////////////////////////////////

  startFormTemplate(template?: any) {
    if (template) {
      this.updateObject = template;
      console.log(template.recordType)
      this.formTemplate = new FormGroup({
        templateName: new FormControl(template.name, [Validators.required]),
        templateCategory: new FormControl(template.category),
        templateAccount: new FormControl(template.account),
        templateRecordType: new FormControl(template.recordType),
        templateAmount: new FormControl(template.amount)
      });
    } else {
      this.formTemplate = new FormGroup({
        templateName: new FormControl('', [Validators.required]),
        templateCategory: new FormControl(null),
        templateAccount: new FormControl(null),
        templateRecordType: new FormControl(null),
        templateAmount: new FormControl(0.00)
      });
    }
  }

  addTemplate() {
    let template: Template = {
      name: this.formTemplate.get('templateName')?.value,
      category: this.formTemplate.get('templateCategory')?.value,
      account: this.formTemplate.get('templateAccount')?.value,
      recordType: this.formTemplate.get('templateRecordType')?.value,
      amount: this.formTemplate.get('templateAmount')?.value
    };
    this.formTemplate.disable();
    console.log(template)
    this.templateService.add(template).subscribe(
      result => {
        this.toast.success('New Template was created.');
        this.formTemplate.reset();
        this.formTemplate.enable();
        this.modalService.dismissAll();
        this.getAllTemplates();
      },
      error => {
        this.formTemplate.enable();
        this.toast.error(error.errors.message?? 'New Template is NOT added! Try again.')
      });
  }

  updateTemplate() {
    this.updateObject.name = this.formTemplate.get('templateName')?.value;
    this.updateObject.category = this.formTemplate.get('templateCategory')?.value;
    this.updateObject.account = this.formTemplate.get('templateAccount')?.value;
    this.updateObject.recordType = this.formTemplate.get('templateRecordType')?.value;
    this.updateObject.amount = this.formTemplate.get('templateAmount')?.value;
    this.formTemplate.disable();
    this.templateService.update(this.updateObject).subscribe(
      value => {
        this.toast.success('Template was updated.');
        this.formTemplate.reset();
        this.formTemplate.enable();
        this.modalService.dismissAll();
        this.getAllTemplates();
        this.updateObject = null;
      },
      error => {
        this.formTemplate.enable();
        this.toast.error(error.errors?.message?? 'Template is NOT updated! Try again.')
      }
    );
  }

  deleteTemplate(template: Template) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: 'btn btn-success',
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Delete " + template.name + "?",
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value && template.id) {
        this.templateService.delete(template.id).subscribe(
          value => {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: template.name + ' has been deleted.',
              icon: 'success'
            }).then();
            this.getAllTemplates();
          },
          error => {
            swalWithBootstrapButtons.fire({
              title: 'Error!',
              text: error.error?.message?? template.name + ' is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }


}
