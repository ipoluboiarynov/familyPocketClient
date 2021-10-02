import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AuthService} from "../../shared/services/auth.service";
import {User} from "../../shared/models/User";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  form!: FormGroup
  aSub!: Subscription;

  constructor(
              private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      remember: new FormControl(false)
    })

    // this.route.queryParams.subscribe((params: Params) => {
    //   if (params['registered']) {
    //     this.toast.success('Now you can login to your account');
    //   } else if (params['accessDenied']) {
    //     this.toast.error('Access denied. Login first!');
    //   } else if (params['sessionFailed']) {
    //     this.toast.warning('Session is over. Login again.');
    //   }
    // })
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }

  onSubmit() {
    // this.form.disable()
    // this.aSub = this.auth.login(this.form.value).subscribe(
    //   () => this.router.navigate(['/dashboard']),
    //   error => {
    //     this.toast.error(error.error?.message ?? 'Something went wrong! Please try again.');
    //     this.form.enable();
    //   }
    // )
  }

  login() {
    console.log(this.form.get('email')?.value);
    console.log(this.form.get('password')?.value);
    console.log(this.form.get('remember')?.value);
    if (this.form.valid) {
      let user: User = {
        email: this.form.get('email')?.value,
        password: this.form.get('password')?.value
      };
      this.auth.login(user).subscribe(callback => {
        console.log(callback);
      });
    }
  }
}
