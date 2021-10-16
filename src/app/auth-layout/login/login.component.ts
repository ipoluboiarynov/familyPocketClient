import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Params, Router} from "@angular/router";
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

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private toast: ToastrService) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      remember: new FormControl(false)
    })

    this.route.queryParams.subscribe((params: Params) => {
      if (params['registered']) {
        this.toast.success('You have been successfully registered.');
      } else if (params['accessDenied']) {
        this.toast.error('Access denied. Login first!');
      } else if (params['sessionFailed']) {
        this.toast.warning('Session is over. Login again.');
      }
    })
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }

  login() {
    if (this.form.valid) {
      let user: User = {
        email: this.form.get('email')?.value,
        password: this.form.get('password')?.value
      };
      this.form.disable();
      this.aSub = this.auth.login(user).subscribe(
        () => {
          this.router.navigate(['/dashboard']).then();
       },
        error => {
          this.toast.error(error.error.exception);
          this.form.enable();
        });
    }
  }
}
