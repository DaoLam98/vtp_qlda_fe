import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '@c10t/nice-component-library';
import {environment} from 'src/environments/environment';

interface OtpConfig {
  phone: string;
  dialogTitle?: string;
  totalSeconds?: number;
  otpLength?: number;
  closeOnSuccess?: boolean;
  onResend?: () => void | Promise<void>;
  onVerify?: (otp: string) => boolean | Promise<boolean>;
}

@Component({
  selector: 'app-otp-dialog',
  standalone: false,
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.scss'],
})
export class OtpDialogComponent implements OnInit, OnDestroy {
  dialogTitle = 'common.dialog.title';
  canResend = false;
  otp = '';
  isExpired = false;
  mm = '03';
  ss = '00';

  otpForm: FormGroup;

  countdownInterval: any;
  totalSeconds = 180;
  otpLength = 6;
  minuteLeft: number = 0

  config!: Required<Pick<OtpConfig,
    'dialogTitle' | 'totalSeconds' | 'otpLength' | 'closeOnSuccess'
  >> & OtpConfig;

  constructor(
    @Optional() public matDialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<OtpConfig> | null,
    private fb: FormBuilder,
    protected apiService: ApiService,
  ) {
    const defaults: Required<Pick<OtpConfig,
      'dialogTitle' | 'totalSeconds' | 'otpLength' | 'closeOnSuccess'
    >> = {
      dialogTitle: 'common.dialog.title',
      totalSeconds: 180,
      otpLength: 6,
      closeOnSuccess: true,
    };

    this.config = {
      ...defaults, ...(data ?? {}),
      phone: data?.phone ?? ''
    };

    this.dialogTitle = this.config.dialogTitle;
    this.totalSeconds = this.config.totalSeconds;
    this.otpLength = this.config.otpLength;

    this.otpForm = this.fb.group({
      otp: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.otpLength),
          Validators.pattern(/^\d+$/), // chỉ số
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.apiService.post(
      `${environment.PATH_API_V1}/notification/notification/otp/te_plan_process_otp_booking`, {}).subscribe();
    this.setClockFromTotal();
    this.startCountdown();
    this.minuteLeft = this.totalSeconds / 60;
    this.otpForm.get('otp')?.valueChanges.subscribe(v => (this.otp = v || ''));
  }

  ngOnDestroy(): void {
    if(this.countdownInterval) clearInterval(this.countdownInterval);
  }

  onClose(): void {
    this.matDialogRef.close();
  }

  async onResend(): Promise<void> {
    if(!this.canResend) return;
    try {
      if(this.config.onResend) await this.config.onResend();

      this.totalSeconds = this.config.totalSeconds;
      this.isExpired = false;
      this.canResend = false;
      this.otpForm.reset();
      this.setClockFromTotal();
      this.startCountdown();
    } catch(e) {
      console.error('Resend OTP failed:', e);
    }
  }

  async onSubmit(): Promise<void> {
    if(this.otpForm.invalid || this.isExpired) return;
    if(this.config.onVerify) {
      await this.config.onVerify(this.otp);
    }
    this.matDialogRef.close({
      success: true,
      otp: this.otp
    });
  }

  private setClockFromTotal(): void {
    const minutes = Math.floor(this.totalSeconds / 60);
    const seconds = this.totalSeconds % 60;
    this.mm = minutes.toString().padStart(2, '0');
    this.ss = seconds.toString().padStart(2, '0');
  }

  private startCountdown(): void {
    if(this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      this.totalSeconds--;
      this.setClockFromTotal();

      if(this.totalSeconds <= 0) {
        this.isExpired = true;
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
}
