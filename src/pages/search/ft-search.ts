import {
  LitElement,
  html,
  css,
  customElement,
  TemplateResult,
  internalProperty,
  query,
  property,
} from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import type { TextField } from '@material/mwc-textfield';
import '@material/mwc-textfield';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-list';
import '@material/mwc-select';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-linear-progress';

import {
  Suggestion,
  ClusteredSearchBody,
  TopicOutput,
  MapOutput,
  DocumentOutput,
} from '../../types/search';
import { suggestApi, searchApi } from '../../api/search';

@customElement('ft-search')
export class FtSearch extends LitElement {
  @property({ type: Array }) results: Array<
    TopicOutput | MapOutput | DocumentOutput
  > = [];

  @property({ type: String }) sort:
    | 'ft:lastPublication'
    | 'ft:topicTitle'
    | 'ft:relevance' = 'ft:relevance';

  @property({ type: Number }) size = 25;

  @property({ type: Boolean }) isLastPage = true;

  @property({ type: Number }) totalResults = 0;

  @property({ type: Number }) currentPage = 1;

  @property({ type: String }) value = '';

  @internalProperty() private autocompleteItems?: Array<Suggestion> = [];

  @internalProperty() private autocompleteOpened = false;

  @internalProperty() private loading = false;

  @internalProperty() private availableSort: Array<{
    key: 'ft:lastPublication' | 'ft:topicTitle' | 'ft:relevance';
    label: string;
  }> = [
    {
      key: 'ft:lastPublication',
      label: 'Publication',
    },
    {
      key: 'ft:topicTitle',
      label: 'Titre',
    },
    {
      key: 'ft:relevance',
      label: 'Pertinence',
    },
  ];

  @internalProperty() private availableSizes = [5, 10, 25, 50];

  private searchDebouncer: ReturnType<typeof setTimeout> | null = null;

  private suggestDebouncer: ReturnType<typeof setTimeout> | null = null;

  @query('mwc-textfield') inputElem?: TextField;

  @query('.results') resultsWrapper?: HTMLDivElement;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }
    .inputWrapper {
      display: flex;
      flex-direction: row;
    }
    .input {
      flex: 2;
      margin-right: 16px;
      margin-bottom: 16px;
    }
    .input > mwc-textfield {
      width: 100%;
    }
    #autocomplete {
      background: white;
      z-index: 99;
      transform-origin: 50% 0;
      transition: transform 0.1s;
      transform: scaleY(1);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
      width: inherit;
      z-index: 99;
      max-height: 300px;
      overflow: auto;
      margin: 0;
      border-radius: 0;
    }

    #autocomplete.hide {
      transform: scaleY(0);
    }

    .autocompleteItem {
      color: black;
      font-size: 16px;
      padding: 8px;
      cursor: pointer;
    }
    .autocompleteItem:hover {
      background-color: #e0e0e0;
    }

    .filters {
      flex: 1;
    }

    .filters > * {
      margin-right: 8px;
      margin-bottom: 16px;
    }

    .results {
      overflow: auto;
      margin-top: 16px;
      height: 90%;
    }
    .total {
      font-weight: 500;
    }

    .kwicmatch {
      background-color: yellow;
    }

    .footer {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
  `;

  render(): TemplateResult {
    const renderResultItem = (
      item: TopicOutput | MapOutput | DocumentOutput
    ) => {
      const obj = {
        icon: '',
        title: '',
        preview: '',
      };
      if (item.type === 'TOPIC') {
        obj.icon = 'subject';
        obj.title = item.topic.htmlTitle;
        obj.preview = item.topic.htmlExcerpt;
      }
      if (item.type === 'MAP') {
        obj.icon = 'inventory';
        obj.title = item.map.htmlTitle;
        obj.preview = item.map.htmlExcerpt;
      }
      if (item.type === 'DOCUMENT') {
        obj.title = item.document.htmlTitle;
        obj.preview = item.document.htmlExcerpt;
      }
      return html`<mwc-list-item twoline graphic="icon">
          <span>${unsafeHTML(obj.title)}</span>
          <span slot="secondary">${unsafeHTML(obj.preview)}</span>
          <mwc-icon slot="graphic">${obj.icon}</mwc-icon>
        </mwc-list-item>
        <li divider padded role="separator"></li>`;
    };

    return html`
      <div class="inputWrapper">
        <div class="input">
          <mwc-textfield
            outlined
            label="Rechercher"
            icon="search"
            @input=${this.onInput}
            @keyup=${this.onKeyUp}
            .value=${this.value}
          >
          </mwc-textfield>
          ${this.autocompleteItems &&
          this.autocompleteItems.length > 0 &&
          this.autocompleteOpened
            ? html`<div id="autocomplete">
                ${this.autocompleteItems &&
                this.autocompleteItems.map(
                  (autoCompleteItem) => html`
                    <div
                      class="autocompleteItem"
                      @click="${this._handleAutocompleteSelectedChanged.bind(
                        this,
                        autoCompleteItem.value
                      )}"
                    >
                      ${autoCompleteItem.value}
                    </div>
                  `
                )}
              </div>`
            : null}
        </div>
        <div class="filters">
          <mwc-select
            outlined
            id="sizeSelect"
            label="Résultats par page"
            @selected=${this.handleSizeChanged.bind(this)}
          >
            ${this.availableSizes.map(
              (availableSize) =>
                html`<mwc-list-item
                  value="${availableSize}"
                  .selected=${availableSize === this.size}
                  >${availableSize}</mwc-list-item
                >`
            )}
          </mwc-select>
          <mwc-select
            outlined
            id="sortSelect"
            label="Trier par"
            @selected=${this.handleSortChanged.bind(this)}
          >
            ${this.availableSort.map(
              (availableSort) =>
                html`<mwc-list-item
                  value="${availableSort.label}"
                  .selected=${availableSort.key === this.sort}
                  >${availableSort.label}</mwc-list-item
                >`
            )}
          </mwc-select>
        </div>
      </div>

      ${this.loading
        ? html`<mwc-linear-progress indeterminate></mwc-linear-progress>`
        : null}
      <div class="results">
        ${this.totalResults
          ? html`<span class="total">${this.getTotalResultString()}</span>`
          : null}
        ${this.results && this.results.length
          ? html`
              <mwc-list @selected=${this.handleItemSelect.bind(this)}>
                ${this.results.map(
                  (result) => html`${renderResultItem(result)}`
                )}
              </mwc-list>
            `
          : null}
      </div>
      <div class="footer">
        <mwc-button
          @click=${this.previousResultPage.bind(this)}
          .disabled=${this.currentPage === 1}
          >Page Précedente</mwc-button
        >
        /
        <mwc-button
          @click=${this.nextResultPage.bind(this)}
          .disabled=${this.isLastPage}
          >Page Suivante</mwc-button
        >
      </div>
    `;
  }

  async suggest() {
    if (this.value) {
      const data = {
        input: this.value,
        contentLocale: 'en-US',
        maxCount: 5,
      };
      this.loading = true;
      const suggestResponse = await suggestApi(data);
      this.loading = false;
      if (suggestResponse && suggestResponse.data) {
        this.autocompleteItems = suggestResponse.data.suggestions;
        this.autocompleteOpened = true;
      }
    }
  }

  private searchWithDebouncer() {
    if (this.searchDebouncer) {
      clearTimeout(this.searchDebouncer);
    }
    this.searchDebouncer = setTimeout(() => {
      this.search();
    }, 100);
  }

  private suggestWithDebouncer() {
    if (this.suggestDebouncer) {
      clearTimeout(this.suggestDebouncer);
    }
    this.suggestDebouncer = setTimeout(() => {
      this.suggest();
    }, 500);
  }

  private _handleAutocompleteSelectedChanged(value: string) {
    this.autocompleteOpened = false;
    this.value = value;
    if (this.inputElem) {
      this.inputElem.focus();
      this.searchWithDebouncer();
    }
  }

  private async search() {
    if (this.value) {
      this.autocompleteItems = [];
      if (this.suggestDebouncer) {
        clearTimeout(this.suggestDebouncer);
      }
      const data: ClusteredSearchBody = {
        query: this.value,
        contentLocale: 'en-US',
        sort: [
          {
            key: this.sort,
            order: this.sort === 'ft:topicTitle' ? 'ASC' : 'DESC',
          },
        ],
        paging: {
          perPage: this.size,
          page: this.currentPage,
        },
      };
      this.loading = true;
      const response = await searchApi(data);
      this.loading = false;
      if (response && response.data) {
        this.currentPage = response.data.paging.currentPage;
        this.isLastPage = response.data.paging.isLastPage;
        this.totalResults = response.data.paging.totalClustersCount;
        const results = response.data.results
          .map((result) => result.entries[0])
          .flat();
        this.results = results;

        this.scrollToTop();
        this.dispatchEvent(
          new CustomEvent('search', {
            detail: {
              currentPage: this.currentPage,
              isLastPage: this.isLastPage,
              totalResults: this.totalResults,
              sort: this.sort,
              size: this.size,
              results,
              value: this.value,
            },
          })
        );
      }
    }
  }
  private onInput(e: InputEvent) {
    const target = e.currentTarget as TextField;
    if (target && target.value) {
      this.value = target.value;
      this.suggestWithDebouncer();
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const target = e.currentTarget as TextField;
      if (target && target.value) {
        this.autocompleteOpened = false;
        this.value = target.value;
        this.currentPage = 1;
        this.searchWithDebouncer();
      }
    }
  }

  private handleSizeChanged({
    detail,
  }: CustomEvent<{ index: number; diff?: string }>) {
    this.size = this.availableSizes[detail.index];
    this.searchWithDebouncer();
  }

  private handleSortChanged({
    detail,
  }: CustomEvent<{ index: number; diff?: string }>) {
    this.sort = this.availableSort[detail.index].key;
    this.searchWithDebouncer();
  }

  private handleItemSelect({
    detail,
  }: CustomEvent<{ index: number; diff?: string }>) {
    const item = this.results[detail.index];
    this.dispatchEvent(
      new CustomEvent('item-selected', { detail: { value: item } })
    );
  }

  previousResultPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.searchWithDebouncer();
      this.scrollToTop();
    }
  }

  nextResultPage() {
    if (!this.isLastPage) {
      this.currentPage += 1;
      this.searchWithDebouncer();
      this.scrollToTop();
    }
  }

  private scrollToTop() {
    if (this.resultsWrapper) {
      this.resultsWrapper.scrollTop = 0;
    }
  }

  private getTotalResultString() {
    return `${this.totalResults} résultat${this.totalResults > 1 ? 's' : ''}`;
  }
}
