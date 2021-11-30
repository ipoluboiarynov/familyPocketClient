import {Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Record} from "../../shared/models/Record";
import {RecordService} from "../../shared/services/record.service";
import {DatePipe} from '@angular/common';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Account} from "../../shared/models/Account";
import Swal from "sweetalert2";
import {Subscription} from "rxjs";
import {ToastrService} from "ngx-toastr";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Category} from "../../shared/models/Category";
import {CategoryService} from "../../shared/services/category.service";
import {AccountService} from "../../shared/services/account.service";
import {Filter} from "../../shared/models/Filter";
import {PageParams} from "../../shared/search/PageParams";
import {RecordSearchValues} from "../../shared/search/RecordSearchValues";
import {SharedService} from "../../shared/services/shared.service";
import {EmitData} from "../../shared/models/EmitData";
import {ConvertDateService} from "../../shared/services/convertDate.service";
import {TemplateService} from "../../shared/services/template.service";

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html'
})
export class RecordsComponent implements OnInit, OnDestroy {

  records: Record[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  pageLoaded: boolean = false;
  formRecord!: FormGroup;
  updateObject?: any;
  closeResult!: string;
  filter!: Filter;
  dateRange: (Date | undefined)[] | undefined;
  pageParams: PageParams = {pageNumber: 0, pageSize: 100};
  emitRecords: EmitData = {source: 'records', content: null};

  aSub!: Subscription;
  bSub!: Subscription;
  cSub!: Subscription;
  dSub!: Subscription;
  eSub!: Subscription;
  fSub!: Subscription;

  @ViewChildren("accountChecks") accountChecks!: QueryList<ElementRef>;
  @ViewChildren("categoryChecks") categoryChecks!: QueryList<ElementRef>;

  constructor(private recordService: RecordService,
              private categoryService: CategoryService,
              private accountService: AccountService,
              private templateService: TemplateService,
              private datePipe: DatePipe,
              private toast: ToastrService,
              private modalService: NgbModal,
              private sharedService: SharedService,
              private convertDateService: ConvertDateService
              ) {
    sharedService.changeEmitted$.subscribe(result => {
      if (!result.source) {
        return
      }
      if (result.content && result.content === 'onInit') {
        this.ngOnInit();
      }
      // From Sidebar Page
      if (result.source === 'sidebar') {
        if (result.content?.name == 'filter') {
          this.filter = result.content.body;
          if (this.filter.startDate) {
            this.dateRange = this.convertDateService.convertStringToRange(this.filter.startDate, this.filter.endDate ?? null);
          } else {
            delete this.dateRange;
            this.filterRecords(this.filter);
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.filterRecords();
    this.getAllCategories();
    this.getAllAccounts();
    this.sharedService.emitChange(this.emitRecords);
  }

  ngOnDestroy() {
    this.aSub ? this.aSub.unsubscribe() : '';
    this.bSub ? this.bSub.unsubscribe() : '';
    this.cSub ? this.cSub.unsubscribe() : '';
    this.dSub ? this.dSub.unsubscribe() : '';
    this.eSub ? this.eSub.unsubscribe() : '';
    this.fSub ? this.fSub.unsubscribe() : '';
  }

  open(content: any, record: object) {
    this.startFormRecord(record);
    this.modalService.open(content, {windowClass: 'modal-mini', size: 'sm', centered: true}).result.then(() => {
      this.closeResult = 'Closed with: $result';
    }, () => {
      this.closeResult = 'Dismissed $this.getDismissReason(reason)';
    });
  }

  compareById(v1: any, v2: any) {
    return v1?.id === v2?.id;
  }

  emitChanges(name: string, body: any) {
    this.emitRecords.content = {name, body};
    this.sharedService.emitChange(this.emitRecords);
  }

  getAllCategories() {
    this.aSub = this.categoryService.getAll().subscribe(
      categories => {
        this.categories = categories;
        this.emitChanges('categories', categories);
      },
      error => {
        this.toast.error(error.error.message ?? 'Categories are not downloaded.');
      }
    );
  }

  getAllAccounts() {
    this.bSub = this.accountService.getAll().subscribe(
      accounts => {
        this.accounts = accounts;
        this.emitChanges('accounts', accounts);
      },
      error => {
        this.toast.error(error.error.message ?? 'Accounts are not downloaded.');
      }
    );
  }

  /////////////////////////////////////////////////////////////////////////////
  //                             Record Operations                          //
  /////////////////////////////////////////////////////////////////////////////

  filterRecords(filter?: Filter, pageParams?: PageParams) {
    let filterToSend;
    if (!filter) {
      filterToSend = this.filter ?? {name: 'unknown'};
    } else {
      filterToSend = filter;
    }
    this.emitChanges('filter', filterToSend);
    let searchValues: RecordSearchValues = {filter: filterToSend, pageParams: pageParams ?? this.pageParams};
    this.cSub = this.recordService.search(searchValues).subscribe(
      pageOfRecords => {
        this.records = pageOfRecords.content;
        this.pageLoaded = false;
      },
      error => {
        this.toast.error('Records are not downloaded. ' + error.statusText ?? '');
      }
    );
  }

  startFormRecord(record?: any) {
    this.updateObject = record;
    this.formRecord = new FormGroup({
      recordType: new FormControl(record.recordType, [Validators.required]),
      recordAmount: new FormControl(record.amount, [Validators.required]),
      recordAccount: new FormControl(record.account, [Validators.required]),
      recordDate: new FormControl(record.recordDate ? new Date(record.recordDate) : new Date(), [Validators.required]),
      recordCategory: new FormControl(record.category, [Validators.required]),
      recordComment: new FormControl(record.comment)
    });
  }

  updateRecord() {
    if (!this.formRecord.get('recordCategory')?.value) { return; }
    this.updateObject.recordType = this.formRecord.get('recordType')?.value;
    this.updateObject.amount = this.formRecord.get('recordAmount')?.value;
    this.updateObject.account = this.formRecord.get('recordAccount')?.value;
    this.updateObject.recordDate = this.formRecord.get('recordDate')?.value ? this.convertDateService.convertDateToString(this.formRecord.get('recordDate')?.value) :
      this.convertDateService.convertDateToString(new Date());
    this.updateObject.category = this.formRecord.get('recordCategory')?.value;
    this.updateObject.comment = this.formRecord.get('recordComment')?.value;
    this.formRecord.disable();
    this.dSub = this.recordService.update(this.updateObject).subscribe(
      () => {
        this.toast.success('Record was updated.');
        this.formRecord.reset();
        this.formRecord.enable();
        this.modalService.dismissAll();
        this.updateObject = null;
        this.pageLoaded = false;
        // window.location.reload();
      },
      error => {
        this.formRecord.enable();
        this.toast.error(error.errors?.message ?? 'Record is NOT updated! Try again.')
      }
    );
  }

  deleteRecord(record: Record) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: 'btn btn-success',
        confirmButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "Delete record with amount of " + record.amount + "?",
      icon: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value && record.id) {
        this.eSub = this.recordService.delete(record.id).subscribe(
          () => {
            swalWithBootstrapButtons.fire({
              title: 'Deleted!',
              text: 'Record has been deleted.',
              icon: 'success'
            }).then();
            this.filterRecords();
          },
          error => {
            swalWithBootstrapButtons.fire({
              title: 'Error!',
              text: error.error?.message ?? 'Record is NOT deleted! Try again.',
              icon: 'error'
            }).then();
          }
        );
      }
    })
  }

  /////////////////////////////////////////////////////////////////////////////
  //                               Date Filter                               //
  /////////////////////////////////////////////////////////////////////////////

  setDateForFilter(date: any) {
    let dateRange_str = [];
    if (typeof date == 'number') {
      this.dateRange = this.convertDateService.convertDaysToRange(date);
      dateRange_str = this.convertDateService.convertDaysToRange(date);
    } else if (typeof date == 'object') {
      this.dateRange = date;
      dateRange_str = this.convertDateService.convertRangeToString(date);
    } else {
      return;
    }
    if (this.filter) {
      this.filter.startDate = dateRange_str[0] ?? null;
      this.filter.endDate = dateRange_str[1] ?? null;
    } else {
      this.filter = {
        name: 'unknown',
        startDate: dateRange_str[0] ?? null,
        endDate: dateRange_str[1] ?? null
      }
    }
    this.filterRecords(this.filter);
  }

  resetDateRange() {
    this.dateRange = undefined;
    if (this.filter?.startDate) {
      this.filter.startDate = undefined;
    }
    if (this.filter?.endDate) {
      this.filter.endDate = undefined;
    }
    this.filterRecords(this.filter);
  }

  /////////////////////////////////////////////////////////////////////////////
  //                       Category / Account  Filter                        //
  /////////////////////////////////////////////////////////////////////////////

  dontCloseOnClick(event: any) {
    event.stopPropagation();
    if (event.target.id) {
      let id = event.target.id;
      let checked = event.target.checked;

      if (id === 'accounts-check') {
        if (this.filter) {
          this.filter.accounts = this.accounts;
        } else {
          this.filter = {
            name: 'unknown',
            accounts: this.accounts
          }
        }
      }
      if (id === 'accounts-uncheck') {
        if (this.filter) {
          this.filter.accounts = [];
        }
      }
      if (id.includes('check-account-')) {
        let accountId = id.split('-')[2];
        let account = this.accounts.find(account => {
          return account.id == accountId;
        });
        if (account) {
          if (this.filter) {
            if (this.filter.accounts) {
              checked ? this.filter.accounts.push(account) : this.filter.accounts = this.filter.accounts.filter(account => {
                return account.id != accountId;
              });
            } else {
              this.filter.accounts = [account];
            }
          } else {
            this.filter = {
              name: 'unknown', accounts: [account]
            }
          }

        }
      }


      if (id === 'categories-check') {
        if (this.filter) {
          this.filter.categories = this.categories;
        } else {
          this.filter = {
            name: 'unknown',
            categories: this.categories
          }
        }
      }
      if (id === 'categories-uncheck') {
        if (this.filter) {
          this.filter.categories = [];
        }
      }
      if (id.includes('check-category-')) {
        let categoryId = id.split('-')[2];
        let category = this.categories.find(category => {
          return category.id == categoryId;
        });
        if (category) {
          if (this.filter) {
            if (this.filter.categories) {
              checked ? this.filter.categories.push(category) : this.filter.categories = this.filter.categories.filter(category => {
                return category.id != categoryId;
              });
            } else {
              this.filter.categories = [category];
            }
          } else {
            this.filter = {
              name: 'unknown', categories: [category]
            }
          }

        }
      }
      this.filter ? this.filterRecords(this.filter) : '';
    }
  }

  checkboxToggle(checked: boolean, listName: string) {
    let list: QueryList<ElementRef> = new QueryList<ElementRef>();
    switch (listName) {
      case 'account':
        list = this.accountChecks;
        break;
      case 'category':
        list = this.categoryChecks;
        break;
    }
    list.forEach(value => {
      value.nativeElement.checked = checked;
    })
  }
}
