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
import { Constants } from "../../shared/global/constants";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
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
  formFilter!: FormGroup;

  isNew: boolean = false;
  updateObject!: any;
  closeResult!: string;
  constants = Constants;

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
  ) {}

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

  compareById(v1: any, v2: any) {
    return v1?.id === v2?.id;
  }

  convertDateToString(date: Date): string {
    date.setDate(date.getDate() + 1);
    return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + date.getDate()).slice(-2);
  }

  getUserInfo(): void {
    this.eSub = this.userService.getUser().subscribe(
      user => {
        this.user = user;
        this.userForm = new FormGroup({
          name: new FormControl(this.user?.name ?? ''),
          email: new FormControl(this.user?.email ?? '', [Validators.required, Validators.email])
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
        object ? this.startFormAccountType(object) : this.startFormAccountType();
        break;
      case 'currency':
        object ? this.startFormCurrency(object) : this.startFormCurrency();
        break;
      case 'expense':
        object ? this.startFormCategory(true, object) : this.startFormCategory(true);
        break;
      case 'income':
        object ? this.startFormCategory(false, object) : this.startFormCategory(false);
        break;
      case 'account':
        object ? this.startFormAccount(object) : this.startFormAccount();
        break;
      case 'template':
        object ? this.startFormTemplate(object) : this.startFormTemplate();
        break;
      case 'filter':
        object ? this.startFormFilter(object) : this.startFormFilter();
        break;
    }
    this.modalService.open(content, {windowClass: 'modal-mini', size: 'sm', centered: true}).result.then(() => {
      this.closeResult = 'Closed with: $result';
    }, () => {
      this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  //                         Account Type Operations                         //
  /////////////////////////////////////////////////////////////////////////////

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
      () => {
        this.toast.success('New Account Type was created.');
        this.formAccountType.reset();
        this.formAccountType.enable();
        this.modalService.dismissAll();
        this.getAllAccountTypes();
      },
      error => {
        this.formAccountType.enable();
        this.toast.error(error.errors?.message ?? 'New Account Type is NOT added! Try again.');
      });
  }

  updateAccountType() {
    this.updateObject.name = this.formAccountType.get('accountTypeName')?.value;
    this.updateObject.negative = this.formAccountType.get('accountTypeIsNegative')?.value;
    this.formAccountType.disable();
    this.accountTypeService.update(this.updateObject).subscribe(
      () => {
        this.toast.success('Account Type was updated.');
        this.formAccountType.reset();
        this.formAccountType.enable();
        this.modalService.dismissAll();
        this.getAllAccountTypes();
        this.updateObject = null;
      },
      error => {
        this.formAccountType.enable();
        this.toast.error(error.errors?.message ?? 'Account Type is NOT updated! Try again.')
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
          () => {
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
              text: error.error.message ?? accountType.name + ' is NOT deleted! Try again.',
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
      () => {
        this.toast.success('New Currency was created.');
        this.formCurrency.reset();
        this.formCurrency.enable();
        this.modalService.dismissAll();
        this.getAllCurrencies();
      },
      error => {
        this.formCurrency.enable();
        this.toast.error(error.errors.message ?? 'New Currency is NOT added! Try again.')
      });
  }

  updateCurrency() {
    this.updateObject.name = this.formCurrency.get('currencyName')?.value;
    this.updateObject.icon = this.formCurrency.get('currencyIcon')?.value;
    this.updateObject.base = this.formCurrency.get('currencyBase')?.value;
    this.formCurrency.disable();
    this.currencyService.update(this.updateObject).subscribe(
      () => {
        this.toast.success('Currency was updated.');
        this.formCurrency.reset();
        this.formCurrency.enable();
        this.modalService.dismissAll();
        this.getAllCurrencies();
        this.updateObject = null;
      },
      error => {
        this.formCurrency.enable();
        this.toast.error(error.errors?.message ?? 'Currency is NOT updated! Try again.')
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
          () => {
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
              text: error.error?.message ?? currency.name + ' is NOT deleted! Try again.',
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
        categoryExpense: new FormControl(expense ?? false)
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
      () => {
        this.toast.success('New Category was created.');
        this.formCategory.reset();
        this.formCategory.enable();
        this.modalService.dismissAll();
        this.getAllCategories();
      },
      error => {
        this.formCategory.enable();
        this.toast.error(error.errors.message ?? 'New Category is NOT added! Try again.')
      });
  }

  updateCategory() {
    this.updateObject.name = this.formCategory.get('categoryName')?.value;
    this.updateObject.icon = this.formCategory.get('categoryIcon')?.value;
    this.updateObject.expense = this.formCategory.get('categoryExpense')?.value;
    this.formCategory.disable();
    this.categoryService.update(this.updateObject).subscribe(
      () => {
        this.toast.success('Category was updated.');
        this.formCategory.reset();
        this.formCategory.enable();
        this.modalService.dismissAll();
        this.getAllCategories();
        this.updateObject = null;
      },
      error => {
        this.formCategory.enable();
        this.toast.error(error.errors?.message ?? 'Category is NOT updated! Try again.')
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
          () => {
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
              text: error.error?.message ?? category.name + ' is NOT deleted! Try again.',
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

  getAllAccounts(): void {
    this.aSub = this.accountService.getAll().subscribe(
      accounts => {
        this.accounts = accounts;
      },
      error => {
        this.toast.error(error.error.message ?? 'Accounts are not downloaded.');
      }
    );
  }

  startFormAccount(account?: any) {

    if (account) {
      this.updateObject = account;
      this.formAccount = new FormGroup({
        accountName: new FormControl(account.name, [Validators.required]),
        accountIcon: new FormControl(account.icon, [Validators.required]),
        accountBalance: new FormControl(account.startBalance, [Validators.required]),
        accountDate: new FormControl(account.startDate ? new Date(account.startDate) : null, [Validators.required]),
        accountColor: new FormControl(account.color, [Validators.required]),
        accountCurrency: new FormControl(account.currency, [Validators.required]),
        accountType: new FormControl(account.accountType, [Validators.required]),
        accountLimit: new FormControl(account.creditLimit, [Validators.required])
      });
    } else {
      this.formAccount = new FormGroup({
        accountName: new FormControl('', [Validators.required]),
        accountIcon: new FormControl(null, [Validators.required]),
        accountBalance: new FormControl(0, [Validators.required]),
        accountDate: new FormControl(null, [Validators.required]),
        accountColor: new FormControl('#ffffff', [Validators.required]),
        accountCurrency: new FormControl(null, [Validators.required]),
        accountType: new FormControl(null, [Validators.required]),
        accountLimit: new FormControl(0, [Validators.required])
      });
    }
  }

  addAccount() {
    let account: Account = {
      name: this.formAccount.get('accountName')?.value,
      icon: this.formAccount.get('accountIcon')?.value,
      startBalance: this.formAccount.get('accountBalance')?.value,
      startDate: this.formAccount.get('accountDate')?.value ? this.convertDateToString(this.formAccount.get('accountDate')?.value) :
        this.convertDateToString(new Date()),
      color: this.formAccount.get('accountColor')?.value,
      currency: this.formAccount.get('accountCurrency')?.value,
      accountType: this.formAccount.get('accountType')?.value,
      creditLimit: this.formAccount.get('accountLimit')?.value
    };
    this.formAccount.disable();
    this.accountService.add(account).subscribe(
      () => {
        this.toast.success('New Account was created.');
        this.formAccount.reset();
        this.formAccount.enable();
        this.modalService.dismissAll();
        this.getAllAccounts();
      },
      error => {
        this.formAccount.enable();
        this.toast.error(error.errors.message ?? 'New Account is NOT added! Try again.')
      });
  }

  updateAccount() {
    this.updateObject.name = this.formAccount.get('accountName')?.value;
    this.updateObject.icon = this.formAccount.get('accountIcon')?.value;
    this.updateObject.startBalance = this.formAccount.get('accountBalance')?.value;
    this.updateObject.startDate = this.formAccount.get('accountDate')?.value ? this.convertDateToString(this.formAccount.get('accountDate')?.value) :
      this.convertDateToString(new Date());
    this.updateObject.color = this.formAccount.get('accountColor')?.value;
    this.updateObject.currency = this.formAccount.get('accountCurrency')?.value;
    this.updateObject.accountType = this.formAccount.get('accountType')?.value;
    this.updateObject.creditLimit = this.formAccount.get('accountLimit')?.value;
    this.formAccount.disable();
    this.accountService.update(this.updateObject).subscribe(
      () => {
        this.toast.success('Account was updated.');
        this.formAccount.reset();
        this.formAccount.enable();
        this.modalService.dismissAll();
        this.getAllAccounts();
        this.updateObject = null;
      },
      error => {
        this.formAccount.enable();
        this.toast.error(error.errors?.message ?? 'Account is NOT updated! Try again.')
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
          () => {
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
              text: error.error?.message ?? account.name + ' is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Filters Operations                          //
  /////////////////////////////////////////////////////////////////////////////

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

  startFormFilter(filter?: any) {
    if (filter) {
      this.updateObject = filter;
      this.formFilter = new FormGroup({
        filterName: new FormControl(filter.name, [Validators.required]),
        filterStartDate: new FormControl(filter.startDate ? new Date(filter.startDate) : null),
        filterEndDate: new FormControl(filter.endDate ? new Date(filter.endDate) : null),
        filterRecordType: new FormControl(filter.recordType),
        filterCategories: new FormControl(filter.categories ?? []),
        filterAccounts: new FormControl(filter.accounts ?? [])
      });
    } else {
      this.formFilter = new FormGroup({
        filterName: new FormControl('', [Validators.required]),
        filterStartDate: new FormControl(null),
        filterEndDate: new FormControl(null),
        filterRecordType: new FormControl(null),
        filterCategories: new FormControl([]),
        filterAccounts: new FormControl([])
      });
    }
  }

  addFilter() {
    let filter: Filter = {
      name: this.formFilter.get('filterName')?.value,
      startDate: this.formFilter.get('filterStartDate')?.value ? this.convertDateToString(this.formFilter.get('filterStartDate')?.value) : undefined,
      endDate: this.formFilter.get('filterEndDate')?.value ? this.convertDateToString(this.formFilter.get('filterEndDate')?.value) : undefined,
      recordType: this.formFilter.get('filterRecordType')?.value,
      categories: this.formFilter.get('filterCategories')?.value,
      accounts: this.formFilter.get('filterAccounts')?.value
    };
    this.formFilter.disable();
    this.filterService.add(filter).subscribe(
      () => {
        this.toast.success('New Filter was created.');
        this.formFilter.reset();
        this.formFilter.enable();
        this.modalService.dismissAll();
        this.getAllFilters();
      },
      error => {
        this.formFilter.enable();
        this.toast.error(error.errors.message ?? 'New Filter is NOT added! Try again.')
      });
  }

  updateFilter() {
    this.updateObject.name = this.formFilter.get('filterName')?.value;
    this.updateObject.startDate = this.formFilter.get('filterStartDate')?.value ? this.convertDateToString(this.formFilter.get('filterStartDate')?.value) : undefined;
    this.updateObject.endDate = this.formFilter.get('filterEndDate')?.value ? this.convertDateToString(this.formFilter.get('filterEndDate')?.value) : undefined;
    this.updateObject.recordType = this.formFilter.get('filterRecordType')?.value;
    this.updateObject.categories = this.formFilter.get('filterCategories')?.value;
    this.updateObject.accounts = this.formFilter.get('filterAccounts')?.value;
    this.formFilter.disable();
    this.filterService.update(this.updateObject).subscribe(
      () => {
        this.toast.success('Filter was updated.');
        this.formFilter.reset();
        this.formFilter.enable();
        this.modalService.dismissAll();
        this.getAllFilters();
        this.updateObject = null;
      },
      error => {
        this.formFilter.enable();
        this.toast.error(error.errors?.message ?? 'Filter is NOT updated! Try again.')
      }
    );
  }

  deleteFilter(filter: Filter) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: 'btn btn-success',
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Delete " + filter.name + "?",
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value && filter.id) {
        this.filterService.delete(filter.id).subscribe(
          () => {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: filter.name + ' has been deleted.',
              icon: 'success'
            }).then();
            this.getAllFilters();
          },
          error => {
            swalWithBootstrapButtons.fire({
              title: 'Error!',
              text: error.error?.message ?? filter.name + ' is NOT deleted! Try again.',
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

  getAllTemplates() {
    this.hSub = this.templateService.getAll().subscribe(
      templates => {
        this.templates = templates;
      },
      error => {
        this.toast.error(error.error.message ?? 'Templates are not downloaded.');
      }
    );
  }

  startFormTemplate(template?: any) {
    if (template) {
      this.updateObject = template;
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
    this.templateService.add(template).subscribe(
      () => {
        this.toast.success('New Template was created.');
        this.formTemplate.reset();
        this.formTemplate.enable();
        this.modalService.dismissAll();
        this.getAllTemplates();
      },
      error => {
        this.formTemplate.enable();
        this.toast.error(error.errors.message ?? 'New Template is NOT added! Try again.')
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
      () => {
        this.toast.success('Template was updated.');
        this.formTemplate.reset();
        this.formTemplate.enable();
        this.modalService.dismissAll();
        this.getAllTemplates();
        this.updateObject = null;
      },
      error => {
        this.formTemplate.enable();
        this.toast.error(error.errors?.message ?? 'Template is NOT updated! Try again.')
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
          () => {
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
              text: error.error?.message ?? template.name + ' is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }

}
