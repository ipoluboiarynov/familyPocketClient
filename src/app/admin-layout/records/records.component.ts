import {AfterContentChecked, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
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

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html'
})
export class RecordsComponent implements OnInit, AfterContentChecked, OnDestroy {

  records: Record[] = [];
  accounts: Account[] = [];
  categories: Category[] = [];
  pageLoaded: boolean = false;
  formRecord!: FormGroup;
  aSub!: Subscription;
  updateObject?: any;
  closeResult!: string;
  filter!: Filter;
  dateRange: (Date | undefined)[] | undefined;
  pageParams: PageParams = {pageNumber: 0, pageSize: 100};

  @ViewChildren("accountChecks") accountChecks!: QueryList<ElementRef>;
  @ViewChildren("categoryChecks") categoryChecks!: QueryList<ElementRef>;

  constructor(private recordService: RecordService,
              private categoryService: CategoryService,
              private accountService: AccountService,
              private datePipe: DatePipe,
              private toast: ToastrService,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.filterRecords();
    this.getAllCategories();
    this.getAllAccounts();
  }

  ngAfterContentChecked() {
    // this.addDateLabels();
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }

  // addDateLabels() {
  //   let rows = document.querySelectorAll(('[id^="row-"]'));
  //   let date_rows = document.querySelectorAll(('[id^="date-index-"]'));
  //   if (rows && rows.length > 0) {
  //     if (!this.pageLoaded) {
  //       if (date_rows && date_rows.length > 0) {
  //         date_rows.forEach(element => {
  //           element.parentNode?.removeChild(element);
  //         });
  //       }
  //
  //       this.records.forEach((record, index) => {
  //         if (index === 0 || (index > 0 && record.recordDate !== this.records[index - 1].recordDate)) {
  //           let tr = document.createElement('tr');
  //           tr.setAttribute('id', 'date-index-' + index)
  //           let td = document.createElement('td');
  //           td.setAttribute('colspan', '6');
  //
  //           let h5 = document.createElement('h5');
  //           let date = this.datePipe.transform(record.recordDate, 'MMMM dd');
  //           h5.innerText = date ?? '';
  //           h5.classList.add('record-date');
  //
  //           td.append(h5);
  //           tr.append(td);
  //           rows.item(index).parentNode?.insertBefore(tr, rows.item(index));
  //         }
  //       });
  //     }
  //     this.pageLoaded = true;
  //   }
  // }

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
  //                             Record Operations                          //
  /////////////////////////////////////////////////////////////////////////////

  filterRecords(filter?: Filter, pageParams?: PageParams) {
    let filterToSend;
    if (!filter) {
      filterToSend = this.filter ?? {name: 'unknown'};
    } else {
      filterToSend = filter;
    }
    let searchValues: RecordSearchValues = {filter: filterToSend, pageParams: pageParams ?? this.pageParams};
    this.recordService.search(searchValues).subscribe(
      pageOfRecords => {
        this.records = pageOfRecords.content;
        this.pageLoaded = false;
      },
      error => {
        this.toast.error(error.error.message ?? 'Records are not downloaded.');
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
    this.updateObject.recordType = this.formRecord.get('recordType')?.value;
    this.updateObject.amount = this.formRecord.get('recordAmount')?.value;
    this.updateObject.account = this.formRecord.get('recordAccount')?.value;
    this.updateObject.recordDate = this.formRecord.get('recordDate')?.value ? this.convertDateToString(this.formRecord.get('recordDate')?.value) :
      this.convertDateToString(new Date());
    this.updateObject.category = this.formRecord.get('recordCategory')?.value;
    this.updateObject.comment = this.formRecord.get('recordComment')?.value;
    this.formRecord.disable();
    this.recordService.update(this.updateObject).subscribe(
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
        this.recordService.delete(record.id).subscribe(
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
  //                               Date Filter                              //
  /////////////////////////////////////////////////////////////////////////////

  generateDateFromDays(days: number) {
    let endDate = new Date();
    let date = new Date();
    let startDate = new Date(date.setDate(date.getDate() - days + 1));
    this.dateRange = [startDate, endDate];
    let startDate_str = this.convertDateToString(startDate);
    let endDate_str = this.convertDateToString(endDate);
    this.setDateForFilter([startDate_str, endDate_str]);
  }

  generateDateFromRange(dateRange: any[] | undefined) {
    if (dateRange) {
      this.dateRange = dateRange;
      let startDate_str = this.convertDateToString(dateRange[0]);
      let endDate_str = this.convertDateToString(dateRange[1]);
      this.setDateForFilter([startDate_str, endDate_str]);
    }
  }

  setDateForFilter(dateRange: any[]) {
    let startDate_str = dateRange[0] ?? null;
    let endDate_str = dateRange[1] ?? null;
    if (this.filter) {
      this.filter.startDate = startDate_str;
      this.filter.endDate = endDate_str;
    } else {
      this.filter = {
        name: 'unknown',
        startDate: startDate_str,
        endDate: endDate_str
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
