import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "@c10t/nice-component-library";
import * as CryptoJS from 'crypto-js';
import { ReplaySubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { environment } from "src/environments/environment";

@Injectable({ providedIn: 'root' })
export class CryptoService {
    private secretKey$ = new ReplaySubject<string>(1);
    constructor(private apiService: ApiService) {
    }
    private loadSecretKey(): void {        
        this.apiService.get<{secretKey: string}>(environment.PATH_API_V1 + "/voffice-gateway/secret-key", new HttpParams(),environment.VOFFICE_URL).subscribe({
            next: (data: {secretKey: string}) => this.secretKey$.next(data.secretKey),
            error: (err) => this.secretKey$.error('Failed to load secret key') // Xử lý lỗi
        });
    }
    async encrypt(data: string): Promise<string> {
        this.loadSecretKey();
        const secretKey = await this.secretKey$.pipe(first()).toPromise(); 
        
        return this.encryptWithKey(data, secretKey);
    }

    async decrypt(encryptedData: string): Promise<string> {
        this.loadSecretKey();
        const secretKey = await this.secretKey$.pipe(first()).toPromise();
        return this.decryptWithKey(encryptedData, secretKey);
    }

    private encryptWithKey(data: string, secretKey: string | undefined): string {
        const key = CryptoJS.enc.Hex.parse(
            CryptoJS.SHA512(secretKey).toString().substring(0, 64));
        
        return CryptoJS.AES.encrypt(data, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
    }

    private decryptWithKey(encryptedData: string, secretKey: string | undefined): string {
        const key = CryptoJS.enc.Hex.parse(
            CryptoJS.SHA512(secretKey).toString().substring(0, 64));
        
        return CryptoJS.AES.decrypt(encryptedData, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
    }
}