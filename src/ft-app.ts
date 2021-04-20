import {
  LitElement,
  html,
  customElement,
  css,
  internalProperty,
  query,
} from 'lit-element';

import '@material/mwc-top-app-bar-fixed';
import '@material/mwc-linear-progress';
import '@material/mwc-icon-button';
import '@material/mwc-button';
import '@polymer/paper-tooltip/paper-tooltip';

import { TopicOutput, MapOutput, DocumentOutput } from './types/search';
import { getCurrentSessionApi } from './api/authent';

import api from './api/api';
import './pages/login/ft-login';
import './pages/search/ft-search';
import './pages/details/ft-details';
import type { FtDetails } from './pages/details/ft-details';

@customElement('ft-app')
export class App extends LitElement {
  @internalProperty() private isAuthentified = false;

  @internalProperty() private appPage: 'login' | 'search' | 'detail' = 'search';

  @internalProperty() private itemTitle?: string;

  @internalProperty() private item?: TopicOutput | MapOutput | DocumentOutput;

  @internalProperty() private loading = false;

  @internalProperty() private results: Array<
    TopicOutput | MapOutput | DocumentOutput
  > = [];

  @internalProperty() private sort:
    | 'ft:lastPublication'
    | 'ft:topicTitle'
    | 'ft:relevance' = 'ft:relevance';

  @internalProperty() private size = 25;

  @internalProperty() private isLastPage = true;

  @internalProperty() private totalResults = 0;

  @internalProperty() private currentPage = 1;

  @internalProperty() private value = '';

  @query('ft-details') ftDetails?: FtDetails;

  static styles = css`
    :host {
      display: block;
    }
    .header {
      margin-bottom: 8px;
    }
    .action {
      display: flex;
      align-items: center;
      flex-direction: row;
    }
    ft-search {
      height: calc(100vh - 80px);
      margin: 0 16px;
    }
    ft-details {
      height: calc(100vh - 80px);
      margin: 0;
    }
  `;

  render() {
    const displayPage = () => {
      switch (this.appPage) {
        case 'login':
          return html`<ft-login
            @authentified=${this.handleAuthentified.bind(this)}
            @cancel-login=${this.back.bind(this)}
          ></ft-login>`;
        case 'search':
          return html`<ft-search
            @item-selected=${this.handleItemSelected.bind(this)}
            @search=${this.seachChanged.bind(this)}
            .results=${this.results}
            .sort=${this.sort}
            .size=${this.size}
            .isLastPage=${this.isLastPage}
            .totalResults=${this.totalResults}
            .currentPage=${this.currentPage}
            .value=${this.value}
          ></ft-search>`;
        case 'detail':
          return html`<ft-details
            .item=${this.item}
            @title-changed=${this.handleTitleChanged.bind(this)}
          ></ft-details>`;
        default:
          return null;
      }
    };
    return html`
      <mwc-top-app-bar-fixed class="header">
        ${this.appPage !== 'search'
          ? html`<mwc-icon-button
              icon="arrow_back"
              slot="navigationIcon"
              @click=${this.back.bind(this)}
            ></mwc-icon-button>`
          : null}
        <div slot="title">${this.getHeaderTitle()}</div>
        <div slot="actionItems">
          <div class="action">
            <mwc-button
              raised
              .icon="${this.isAuthentified ? 'logout' : 'login'}"
              .label=${this.isAuthentified ? 'Deconnexion' : 'Connexion'}
              @click=${this.onLogClick.bind(this)}
            ></mwc-button>
            <paper-tooltip
              >${this.isAuthentified
                ? html`Se Deconnecter`
                : html`Se connecter`}</paper-tooltip
            >
          </div>
        </div>
      </mwc-top-app-bar-fixed>
      ${this.loading
        ? html`<mwc-linear-progress indeterminate></mwc-linear-progress>`
        : null}
      ${displayPage()}
    `;
  }

  async firstUpdated() {
    this.checkAuthentifed();
  }

  private getHeaderTitle() {
    if (this.appPage === 'login') {
      return 'Connection';
    }
    if (this.appPage === 'search') {
      return 'Recherche';
    }

    if (this.appPage === 'detail') {
      return `Details: ${this.itemTitle}`;
    }
    return 'Fluid Topics Challenge';
  }

  private async checkAuthentifed() {
    this.loading = true;
    const token = window.localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      const response = await getCurrentSessionApi();
      if (response && response.data && response.data.sessionAuthenticated) {
        this.isAuthentified = true;
      }
    } else {
      this.isAuthentified = false;
      api.setToken(null);
    }
    this.loading = false;
  }

  private seachChanged({
    detail,
  }: CustomEvent<{
    currentPage: number;
    isLastPage: boolean;
    totalResults: number;
    sort: 'ft:lastPublication' | 'ft:topicTitle' | 'ft:relevance';
    size: number;
    results: Array<TopicOutput | MapOutput | DocumentOutput>;
    value: string;
  }>) {
    this.currentPage = detail.currentPage;
    this.isLastPage = detail.isLastPage;
    this.totalResults = detail.totalResults;
    this.sort = detail.sort;
    this.size = detail.size;
    this.results = detail.results;
    this.value = detail.value;
  }

  private async handleItemSelected({
    detail,
  }: CustomEvent<{ value: TopicOutput | MapOutput | DocumentOutput }>) {
    this.item = detail.value;
    this.appPage = 'detail';
  }

  private handleTitleChanged({ detail }: CustomEvent<{ value: string }>) {
    this.itemTitle = detail.value;
  }

  private handleAuthentified() {
    const token = window.localStorage.getItem('token');
    if (token) {
      api.setToken(token);
    }
    this.isAuthentified = true;
    this.appPage = 'search';
  }

  private onLogClick() {
    if (this.isAuthentified) {
      window.localStorage.removeItem('token');
      api.setToken(null);
      this.isAuthentified = false;
    } else {
      this.appPage = 'login';
    }
  }

  private async back() {
    if (this.ftDetails) {
      this.ftDetails.cancel = true;
      await this.ftDetails.updateComplete;
    }
    this.appPage = 'search';
  }
}
