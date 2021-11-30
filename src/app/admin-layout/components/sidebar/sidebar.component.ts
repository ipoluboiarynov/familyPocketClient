import {Component, OnDestroy, OnInit} from "@angular/core";
import {Category} from "../../../shared/models/Category";
import {SharedService} from "../../../shared/services/shared.service";
import {Filter} from "../../../shared/models/Filter";
import {Account} from "../../../shared/models/Account";
import {ConvertDateService} from "../../../shared/services/convertDate.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FilterService} from "../../../shared/services/filter.service";
import {Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {EmitData} from "../../../shared/models/EmitData";
import { Constants } from "../../../shared/global/constants";

let misc: any = {
  sidebar_mini_active: true
};

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent implements OnInit, OnDestroy {

  formFilter!: FormGroup;
  total_balance: number = 0;
  constants = Constants;
  categories: Category[] = [];
  accounts: Account[] = [];
  filters: Filter[] = [];
  expenses: any[] = [];
  incomes: any[] = [];
  settings: any[] = [
    {name: 'Account Types', icon: 'fas fa-sitemap', count: null},
    {name: 'Accounts', icon: 'fas fa-landmark', count: null},
    {name: 'Currencies', icon: 'fas fa-globe', count: null},
    {name: 'Records', icon: 'fas fa-clipboard-list', count: null},
    {name: 'Categories', icon: 'fas fa-cubes', count: null},
    {name: 'Filters', icon: 'fas fa-funnel-dollar', count: null},
    {name: 'Templates', icon: 'fas fa-toolbox', count: null}
  ];
  filter: Filter = {
    name: 'no filter'
  };
  dateRange: (Date | undefined)[] | undefined;
  statisticsLabel: string = '';

  showDashboardSource: boolean = false;
  showSettingsSource: boolean = false;
  showRecordsSource: boolean = false;
  showStatisticsSource: boolean = false;

  isCollapsedCategories: boolean = true;
  isCollapsedAccounts: boolean = true;
  isCollapsedFilters: boolean = true;

  aSub!: Subscription;
  bSub!: Subscription;
  cSub!: Subscription;
  minimizedSidebar: boolean = false;
  sidebarFixed: boolean = false;

  constructor(private sharedService: SharedService,
              private convertDateService: ConvertDateService,
              private filterService: FilterService,
              private toast: ToastrService) {
    sharedService.changeEmitted$.subscribe(result => {
      if (!result.source) {return}
      if (result.content && result.content === 'onInit') {
        this.ngOnInit();
      }
      // From Dashboard Page
      if (result.source === 'dashboard') {
        this.showDashboardSource = true;
        this.showRecordsSource = false;
        this.showStatisticsSource = false;
        this.showSettingsSource = false;
        if (result.content) {
          // this.categories = result.object;
          if (result.content.name === 'accounts') {
            this.accounts =  result.content.body.accounts;
            this.total_balance = result.content.body.total;
          }
        }

      }

      // From Settings Page
      if (result.source === 'settings') {
        this.showDashboardSource = false;
        this.showRecordsSource = false;
        this.showStatisticsSource = false;
        this.showSettingsSource = true;
        if (result.content) {
          this.settings.forEach(setting => {
            if (setting.name == result.content.name) {
              setting.count = +result.content.body;
            }
          });
        }
      }
      // From Records Page
      if (result.source && result.source === 'records') {
        this.showDashboardSource = false;
        this.showRecordsSource = true;
        this.showStatisticsSource = false;
        this.showSettingsSource = false;
        if (result.content) {
          if (result.content.name === 'filter') {
            this.filter = result.content.body;
            this.initForm(this.filter);
            if (this.filter.startDate) {
              this.dateRange = this.convertDateService.convertStringToRange(this.filter.startDate, this.filter.endDate ?? null);
            }
          }
          if (result.content.name === 'categories') {
            this.categories = result.content.body;
          }
          if (result.content.name === 'accounts') {
            this.accounts = result.content.body;
          }
        }
      }
      // From Statistics Page
      if (result.source && result.source === 'statistics') {
        this.showDashboardSource = false;
        this.showRecordsSource = false;
        this.showStatisticsSource = true;
        this.showSettingsSource = false;
        if (result.content) {
          if (result.content.name == 'records') {
            this.incomes = result.content.body.incomes;
            this.expenses = result.content.body.expenses;
          }
          if (result.content.name == 'label') {
            this.statisticsLabel = result.content.body;
          }
        }
      }
    });
  }

  ngOnInit() {
    this.initForm(this.filter);
    this.getAllFilters();
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

  onMouseEnterSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
      this.minimizedSidebar = false;
    }
  }
  onMouseLeaveSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
      this.minimizedSidebar = true;
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
      this.sidebarFixed = true;
      this.isCollapsedAccounts = true;
      this.isCollapsedCategories = true;
      this.isCollapsedFilters = true;

    } else {
      body.classList.add("g-sidenav-pinned");
      body.classList.remove("g-sidenav-hidden");
      sidenavToggler.classList.add("active");
      misc.sidebar_mini_active = true;
      this.sidebarFixed = false;
    }
  }

  initForm(filter: Filter | undefined) {
    if (filter) {
      if (this.formFilter) {this.formFilter.reset()}
      this.formFilter = new FormGroup({
        name: new FormControl(this.filter.name, [Validators.required]),
        range: new FormControl(this.filter.startDate ? this.convertDateService.convertStringToRange(this.filter.startDate, this.filter.endDate ?? null) : null),
        type: new FormControl(this.filter.recordType ?? ''),
        accounts: new FormControl(this.filter.accounts ?? []),
        categories: new FormControl(this.filter.categories ?? [])
      });
    }
  }

  checkboxToggle(b: boolean, type: string) {
    if (type == 'account') {
      if (b) {
        this.filter.accounts = this.accounts;
        this.formFilter.get('accounts')?.setValue(this.filter.accounts);
      } if (!b) {
        delete this.filter.accounts;
        this.formFilter.removeControl('accounts');
      }
    }
    if (type == 'category') {
      if (b) {
        this.filter.categories = this.categories;
        this.formFilter.get('categories')?.setValue(this.filter.categories);
      } else {
        delete this.filter.categories;
        this.formFilter.removeControl('categories');
      }
    }
  }

  sendFilter(filter?: Filter) {
    if (filter) {
      filter.startDate = filter.startDate?.split('T')[0];
      filter.endDate = filter.endDate?.split('T')[0];
      let emitData: EmitData = {source: 'sidebar', content: {name: 'filter', body: filter}};
      this.sharedService.emitChange(emitData);
      return;
    }
    this.filter.name = this.formFilter.get('name')?.value ?? 'no name';
    this.formFilter.value.type ? this.filter.recordType = this.formFilter.get('type')?.value : delete this.filter.recordType;
    this.formFilter.value.accounts ? this.filter.accounts = this.formFilter.get('accounts')?.value : delete this.filter.accounts;
    this.formFilter.value.categories ? this.filter.categories = this.formFilter.get('categories')?.value : delete this.filter.categories;

    if (this.formFilter.value.range) {
     this.filter.startDate = this.convertDateService.convertRangeToString(this.formFilter.value.range)[0];
      this.filter.endDate = this.convertDateService.convertRangeToString(this.formFilter.value.range)[1];
    }

    let emitData: EmitData = {source: 'sidebar', content: {name: 'filter', body: this.filter}};
    this.sharedService.emitChange(emitData);
  }

  onCheckList(event: any) {
    let type = event.target.id.split('side')[0];
    let id = event.target.id.split('side')[1];

    if (type == 'check-account-') {
      let account = this.accounts.find(account => {return account.id == id});
      if (!account) {return;}
      if (event.target?.checked) {
        this.filter.accounts ? this.filter.accounts.push(account) : this.filter.accounts = [account];
      } else {
        if (this.filter.accounts) {
          this.filter.accounts = this.filter.accounts.filter(account => {return account.id != id});
        }
      }
      this.formFilter?.get('accounts')?.setValue(this.filter.accounts);
    }

    if (type == 'check-category-') {
      let category = this.categories.find(category => {return category.id == id});
      if (!category) {return;}
      if (event.target?.checked) {
        this.filter.categories ? this.filter.categories.push(category) : this.filter.categories = [category];
      } else {
        if (this.filter.categories) {
          this.filter.categories = this.filter.categories.filter(category => {return category.id != id});
        }
      }
      this.formFilter?.get('categories')?.setValue(this.filter.categories);
    }
  }

  saveFilter() {
    console.log('hi')
    if (!this.formFilter.get('name')?.value && this.formFilter.get('name')?.value.trim().length == 0) {return;}
    this.filter.name = this.formFilter.get('name')?.value;
    this.formFilter.get('type')?.value ? this.filter.recordType = this.formFilter.get('type')?.value : delete this.filter.recordType;
    this.formFilter.get('accounts')?.value ? this.filter.accounts = this.formFilter.get('accounts')?.value : delete this.filter.accounts;
    this.formFilter.get('categories')?.value ? this.filter.categories = this.formFilter.get('categories')?.value : delete this.filter.categories;
    if (this.formFilter.get('range')?.value) {
      let range = this.convertDateService.convertRangeToString(this.formFilter.get('range')?.value);
      this.filter.startDate = range[0];
      this.filter.endDate = range[1];
    }
    if (this.filter.id) {
      console.log('update')
      console.log(this.filter.recordType)
      this.aSub = this.filterService.update(this.filter).subscribe(
        () => {
          this.getAllFilters();
          this.toast.success("Filter updated.");
        }, error => {
          this.toast.error("Filter NOT updated! " + error.textStatus ?? '');
        });
    } else {
      console.log('add')
      console.log(this.filter.recordType)
      this.aSub = this.filterService.add(this.filter).subscribe(
        () => {
          this.getAllFilters();
          this.toast.success("Filter added.");
        }, error => {
          this.toast.error("Filter NOT added! " + error.textStatus ?? '');
        });
    }
  }

  getAllFilters() {
    this.bSub = this.filterService.getAll().subscribe(
      filters => {
      this.filters = filters;
    },
      error => {
        this.toast.error("Filters NOT downloaded! " + error);
      });
  }

  setFilter(filter: Filter) {
    this.isCollapsedFilters = true;
    this.filter = filter;
    this.initForm(this.filter);
  }

  deleteFilter(filter: Filter) {
    if (filter.id) {
      this.cSub = this.filterService.delete(filter.id).subscribe(
        ()=> {
          this.getAllFilters();
        },
        error => {
          this.toast.error('Filter NOT deleted.' + error.statusText ?? '');
        });
    }
  }

  resetDateRange() {
    if (this.dateRange) {
      this.dateRange = undefined;
      this.formFilter.get('range')?.setValue(null);
      delete this.filter.startDate;
      delete this.filter.endDate;
    }
  }
}
