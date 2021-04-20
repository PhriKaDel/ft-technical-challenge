import {
  LitElement,
  html,
  customElement,
  css,
  internalProperty,
  property,
  PropertyValues,
  query,
} from 'lit-element';

import { unsafeHTML } from 'lit-html/directives/unsafe-html';

import '@material/mwc-drawer';
import '@material/mwc-top-app-bar';
import '@material/mwc-linear-progress';
import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-list';

import './components/ft-toc';
import {
  TopicOutput,
  MapOutput,
  DocumentOutput,
  Toc,
} from '../../types/search';
import { getMap, getToc } from '../../api/map';
import { getTopic, getTopics } from '../../api/topics';

import api from '../../api/api';

interface TocExtended extends Toc {
  isParent?: boolean;
}

@customElement('ft-details')
export class FtDetails extends LitElement {
  @internalProperty() private itemTitle?: string;

  @internalProperty() private loading = false;

  @internalProperty() private content = '';

  @internalProperty() private anchors: Array<TocExtended> = [];

  @property({ type: Object }) item?:
    | TopicOutput
    | MapOutput
    | DocumentOutput
    | null;

  @property({ type: Boolean }) cancel = false;

  @query('.main-content') mainContentElem?: HTMLDivElement;

  private itemChangedDebouncer: ReturnType<typeof setTimeout> | null = null;

  static styles = css`
    :host {
      display: block;
    }
    .drawer-content {
      padding: 0px 16px 0 16px;
    }
    .main-content {
      min-height: 300px;
      padding: 48px 18px 0 18px;
    }
    mwc-list-item.child {
      --mdc-list-side-padding: 32px;
    }
  `;

  render() {
    return html`
      ${this.anchors.length > 0
        ? html`<mwc-drawer ?open=${!!this.anchors.length}>
            <div class="drawer-content">
              <p>Accès rapides</p>
              <ft-toc
                .toc=${this.anchors}
                @selected=${this.handleItemSelect.bind(this)}
              ></ft-toc>
            </div>
            <div slot="appContent">
              ${this.loading
                ? html`<mwc-linear-progress
                    indeterminate
                  ></mwc-linear-progress>`
                : null}
              <div class="main-content">${unsafeHTML(this.content)}</div>
            </div>
          </mwc-drawer>`
        : html`<div class="main-content">${unsafeHTML(this.content)}</div>`}
    `;
  }

  updated(
    properties: PropertyValues<{
      item: TopicOutput | MapOutput | DocumentOutput;
      itemTitle: string;
    }>
  ) {
    if (properties.has('item')) {
      if (this.item) {
        this.cancel = false;
        this.itemChangedWithDebouncer();
      }
    }
    if (properties.has('itemTitle') && this.itemTitle) {
      this.dispatchEvent(
        new CustomEvent('title-changed', { detail: { value: this.itemTitle } })
      );
    }
  }

  goTo(id: string) {
    if (this.mainContentElem && id) {
      const target = this.mainContentElem.querySelector(id);
      if (target) {
        target.scrollIntoView({
          block: 'start',
          behavior: 'smooth',
        });
      }
    }
  }

  private async itemChangedWithDebouncer() {
    if (this.itemChangedDebouncer) {
      clearTimeout(this.itemChangedDebouncer);
    }
    this.itemChangedDebouncer = setTimeout(async () => {
      await this.itemChanged();
    }, 50);
  }

  private async itemChanged() {
    this.anchors = [];
    this.content = '';
    this.loading = true;
    let contentUrl: string | null = null;
    if (this.item) {
      if (this.item.type === 'DOCUMENT') {
        contentUrl = this.item.document.contentUrl;
        this.itemTitle = this.item.document.title;
        if (contentUrl) {
          const response = await api.fetch(
            contentUrl,
            'GET',
            null,
            'text/html'
          );
          const data = await response.text();
          const link = this.item.document.documentId;
          this.content = `<h1 id=${link}>${this.itemTitle}</h1>${data}`;
          this.anchors = [];
        }
      }
      let mapId: string | null = null;
      if (this.item.type === 'TOPIC') {
        this.itemTitle = this.item.topic.title;
        contentUrl = this.item.topic.contentUrl;
        this.itemTitle = this.item.topic.title;
        if (contentUrl) {
          const response = await api.fetch(
            contentUrl,
            'GET',
            null,
            'text/html'
          );
          const data = await response.text();
          const link = this.item.topic.tocId;
          this.content = `<h1 id=${link}>${this.itemTitle}</h1>${data}`;
          this.anchors = [];
        }
      }

      if (this.item.type === 'MAP') {
        mapId = this.item.map.mapId;
        this.itemTitle = this.item.map.title;
      }

      if (mapId) {
        await this.getToc(mapId);
        const response = await getMap(mapId);
        if (!response.error && response.data) {
          const topicsResponse = await getTopics(mapId);
          if (!topicsResponse.error && topicsResponse.data) {
            for (const topic of topicsResponse.data) {
              if (!this.cancel) {
                await this.getTopicContent(mapId, topic.id);
              } else {
                await Promise.resolve();
              }
            }
          }
        }
      }
    }
    this.loading = false;
  }

  async getToc(mapId: string) {
    const tocResponse = await getToc(mapId);
    if (tocResponse && tocResponse.data) {
      this.anchors = tocResponse.data.reduce(
        (acc: Array<TocExtended>, curr) => {
          if (curr.children.length > 0) {
            acc.push({ ...curr, children: [], isParent: true });
          }
          return acc.concat(curr.children);
        },
        []
      );
    }
  }

  async getTopicContent(mapId: string, topicId: string) {
    const topicResponse = await getTopic(mapId, topicId);
    const contentUrl = `https://doc.fluidtopics.com//api/khub/maps/${mapId}/topics/${topicId}/content`;
    const r = await api.fetch(contentUrl, 'GET', null, 'text/html');
    const data = await r.text();
    if (topicResponse.data && data) {
      const link = topicResponse.data.id;
      const title = topicResponse.data.title;
      this.content += `<h1 id="${link.replace(
        /[~+>:]/g,
        '__'
      )}">${title}</h1>${data}<br/>`;
    }
  }

  private handleItemSelect({ detail }: CustomEvent<{ value: string }>) {
    const id = detail.value;
    this.goTo(`#${id.replace(/[~+>:]/g, '__')}`);
  }
}
