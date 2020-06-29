import { Injectable } from '@angular/core';
import { TableProxy } from '../../types/table-proxy';
import { SettingsService } from '../settings/settings.service';
import { StoreService } from 'src/app/core/services/store/store.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { take } from 'rxjs/operators';
import { ProxyPackage } from '../../types/proxy-package';
import { RegionsByProvider, longname, Region } from '../../types/region';
import { Server } from 'src/app/core/types/server';
import { SupportedCountriesService } from '../supported-countries/supported-countries.service';
import { randomIntInclusive } from 'src/app/core/utilities';
import { ModalService } from 'src/app/features/modal/modal.service';


@Injectable({
  providedIn: 'root'
})
export class ProxyGenerationService {
  proxyGen: any;

  constructor(private settingsService: SettingsService,
              private authService: AuthService,
              private store: StoreService,
              private supportedCountries: SupportedCountriesService,
              private modalService: ModalService) {

                // must import the wasm module async
                import('proxygen').then((m) => this.proxyGen = m);

              }

  async genProxiesFromFormValue(formValue: { package: ProxyPackage, regionLongname: longname, quantity: number, type: string }) {

    if (!this.proxyGen) {
      // wasm module not loaded yet.
      return;
    }

    const pkg = formValue.package;
    const quantity = formValue.quantity;
    let regionLongname = formValue.regionLongname;
    let isStatic: boolean = true;
    if (formValue.type == 'rotating') {
      isStatic = false;
    }

    let regions: Region[] = this.getRegions(regionLongname, pkg);

    const proxies: TableProxy[] = await this.genProxies(pkg, quantity, isStatic, regions);

    this.store.setTableProxies(proxies);
  }

  private getRegions(regionLongname: longname, pkg: ProxyPackage): Region[] {
    let regions: Region[] = [];

    if (regionLongname.toLowerCase() == 'random') {
      // need to make the Region objects ourselves
      for (let providerCode of pkg.providers) {
        regions.push({
          providerId: providerCode,
          longname: 'Random',
          shortname: 'RR'
        });
      }

      return regions;
    }

    return pkg.regions.filter((r: Region) => r.longname == regionLongname);
  }

  private getServers(): Server[] {
    let servers: Server[];
    this.store.servers$.pipe(take(1)).subscribe((s: Server[]) => servers = s);
    if (servers.length == 0) {
      return [];
    }
    return servers;
  }

  private async genProxies(pkg: ProxyPackage, 
             quantity: number, 
             isStatic: boolean, 
             regions: Region[]): Promise<TableProxy[]> {

    // providers this package supports
    let providers = pkg.providers;

    // get list of all the servers
    const servers: Server[] = this.getServers();
    if (servers.length == 0) {

      this.modalService.simpleMessage("Error", ["No Servers. Couldn't generate proxies."]);

      return [];
    }

    // *** 
    // FROM this point on is where we'll use wasm. 
    // We still want to be able to use the getServers and narrowProvidersByCountry function above.
    // ***
    const genArgs: GenProxiesArgs = {
      provider_codes: providers,
      quantity,
      servers,
      package_id: pkg.id,
      is_static: isStatic,
      regions,
      proxy_domain: this.settingsService.proxyDomain,
      username: this.authService.user.username,
      password: this.authService.user.password,
    }

    const proxies: TableProxy[] = await this.proxyGen.gen_proxies(genArgs);
    //console.log('new proxies: ', proxies);
  
    return proxies;
  }

}

interface GenProxiesArgs {
  provider_codes: number[];
  quantity: number;
  servers: Server[];
  package_id: number;
  is_static: boolean;
  regions: Region[];
  proxy_domain: string;
  username: string;
  password: string;
}