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

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
  aSub!: Subscription;
  bSub!: Subscription;
  cSub!: Subscription;
  dSub!: Subscription;

  accounts: Account[] = [];
  accountTypes: AccountType[] = [];
  currencies: Currency[] = [];
  expenses: Category[] = [];
  incomes: Category[] = [];

  constructor(private accountService: AccountService,
              private accountTypeService: AccountTypeService,
              private currencyService: CurrencyService,
              private categoryService: CategoryService,
              private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.getAllAccounts();
    this.getAllAccountTypes();
    this.getAllCurrencies();
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
    if (this.dSub) {
      this.dSub.unsubscribe();
    }
  }

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
        console.log(categories)
        // TODO
        this.expenses = categories.filter((category: Category) => category.isExpense === true);
        this.incomes = categories.filter((category: Category) => return category.isExpense === false);
      },
      error => {
        this.toast.error(error.error.message ?? 'Categories are not downloaded.');
      }
    );
  }
}
