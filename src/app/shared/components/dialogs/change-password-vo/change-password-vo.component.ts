import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password-vo',
  standalone: false,
  templateUrl: './change-password-vo.component.html',
  styleUrl: './change-password-vo.component.scss',
})
export class ChangePasswordVoComponent {
  form: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    remember: new FormControl(''),
  });
}
