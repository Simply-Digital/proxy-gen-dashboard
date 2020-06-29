import { Injectable } from '@angular/core';

/**
 * Settings in this service are pull directly from divs in the dom. 
 * They are put there by the pnp wordpress plugin when the page loads.
 */

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _proxyDomain: string; // proxy tld. Could possibly be different than site tld.
  private _firebaseUsername: string; // only has user level permissions of course
  private _firebasePassword: string;

  constructor() { }

  get proxyDomain() {
    if (this._proxyDomain) {
      return this._proxyDomain;
    }
    return this._proxyDomain = this.getElementValById('pnp-proxyDomain');
  }
  set proxyDomain(val: string) {
    this._proxyDomain = val;
  }

  get firebaseUsername() {
    if (this._firebaseUsername) {
      return this._firebaseUsername;
    }
    return this._firebaseUsername = this.getElementValById('pnp-fbUsername');
  }
  set firebaseUsername(val: string) {
    this._firebaseUsername = val;
  }

  get firebasePassword() {
    if (this._firebasePassword) {
      return this._firebasePassword;
    }
    return this._firebasePassword = this.getElementValById('pnp-fbPassword');
  }
  set firebasePassword(val: string) {
    this._firebasePassword = val;
  }


  // use this to pull our settings from divs on page
  private getElementValById(id: string) {
    let val;
    try {
      val = (window.document.getElementById(id) as any).innerText;
    } catch (e) {
      //console.error(e);
    }

    return val;
  }
}
