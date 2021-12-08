import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../shared/services/auth.service";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit, OnDestroy {
  form!: FormGroup
  aSub!: Subscription;

  constructor(private auth: AuthService,
              private router: Router,
              private toast: ToastrService) {
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      repeat_password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }

  register() {
    if (this.form.valid &&
      this.form.get("password")?.value === this.form.get("repeat_password")?.value) {
      let user = {
        email: this.form.get("email")?.value,
        password: this.form.get("password")?.value
      }
      this.form.disable();
      this.aSub = this.auth.register(user).subscribe(
        () => {
          this.router.navigate(['/login'], {
            queryParams: {
              registered: true
            }
          }).then();
        },
        error => {
          this.toast.error(error ?? 'Something went wrong. Try again.');
          this.form.enable();
        });
    } else {
      this.toast.warning("Check typed values and try again.");
    }
  }
}
