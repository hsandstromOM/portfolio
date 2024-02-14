import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { createClient, Entry, Space, ContentfulClientApi } from 'contentful';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const DEFAULT_CONFIG = {
  credentials: {
    space: environment.contentful.space,
    accessToken: environment.contentful.accessToken,
  },
  contentTypeIds: {
    home: 'home'
  },
};


@Injectable({
  providedIn: 'root'
})
export class ContentfulService {
  titleHandlers: Function[];
  private client: any;
  date!: any;
  hostName!: string;

  apiUrl!: string;
  spaceId!: string;
  accessToken!: string;
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private doc: Document,
    private router: Router
  ) {
    this.hostName = this.doc.location.hostname;
    this.date = new Date();
    this.titleHandlers = [];
    this.getData();
    try {
      this.config = JSON.parse(localStorage['catalogConfig']);
    } catch (e) {
      this.config = DEFAULT_CONFIG.credentials;
    }

    this.titleHandlers = [];
    this._createClient();
    this.getSpace();
   }
   // get the current space
  getSpace(): Promise<Space> {
    return this.client.getSpace().then((space: any) => {
      this.titleHandlers.forEach((handler) => handler(space.name));
      return space;
    });
  }
   config: {
      space: string;
      accessToken: string;
    };

    // return a custom config if available
    getConfig(): { space: string; accessToken: string } {
      return this.config !== DEFAULT_CONFIG.credentials
        ? Object.assign({}, this.config)
        : { space: '', accessToken: '' };
    }

    // set a new config and store it in localStorage
    setConfig(config: { space: string; accessToken: string }) {
      localStorage.setItem('catalogConfig', JSON.stringify(config));
      this.config = config;

      this._createClient();
      this.getSpace();

      return Object.assign({}, this.config);
    }

    _createClient() {
      this.client = createClient({
        space: environment.contentful.space,
        accessToken: environment.contentful.accessToken,
      });
    }

    resetConfig() {
      localStorage.removeItem('catalogConfig');
      this.config = DEFAULT_CONFIG.credentials;

      this._createClient();
      this.getSpace();

      return Object.assign({}, this.config);
    }
   getData() {
    if (
      this.hostName === 'hosea-portfolio.web.app' ||
      this.hostName === 'hosea-portfolio.firebaseapp.com' ||
      this.hostName === 'localhost'
    ) {
      this.apiUrl = environment.contentful.apiHost;
      this.spaceId = environment.contentful.space;
      this.accessToken = environment.contentful.accessToken;

      this.client = createClient({
        host: environment.contentful.previewHost,
        space: environment.contentful.space,
        accessToken: environment.contentful.previewToken,
      });
    } else {
      this.apiUrl = environment.contentful.apiHost;
      this.spaceId = environment.contentful.space;
      this.accessToken = environment.contentful.accessToken;
      this.client = createClient({
        host: environment.contentful.apiHost,
        space: environment.contentful.space,
        accessToken: environment.contentful.accessToken,
      });
    }
  }
}
