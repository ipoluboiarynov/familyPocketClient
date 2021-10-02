import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../shared/services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {bindCallback, Subscription} from "rxjs";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
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
      repeat_password: new FormControl(null, [Validators.required, Validators.minLength(6)])
    })
  }

  register() {
    if (this.form.valid &&
      this.form.get("password")?.value === this.form.get("repeat_password")?.value) {
      let user = {
        email: this.form.get("email")?.value,
        password: this.form.get("password")?.value
      }
      this.auth.register(user).subscribe(
        callback => {
        this.toast.success('You have been successfully registered.');
      },
        error => {
          this.toast.error(error.error.exception);
        },
        () => {
          this.form.reset();
        });
    } else {
      this.toast.warning("Check typed values and try again.");
      this.form.enable();
    }
  }
}
