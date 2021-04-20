import { LitElement, html, customElement, css, property } from 'lit-element';

import '@material/mwc-list/mwc-list-item';
import '@material/mwc-list/mwc-list';
import { Toc } from '../../../types/search';

interface TocExtended extends Toc {
  isParent?: boolean;
}

@customElement('ft-toc')
export class FtToc extends LitElement {
  @property({ type: Array }) toc: Array<TocExtended> = [];

  static styles = css`
    :host {
      display: block;
    }
    mwc-list-item.child {
      --mdc-list-side-padding: 32px;
    }
  `;

  render() {
    const renderTocItem = (toc: TocExtended) => {
      return html` <mwc-list-item
        value="${toc.contentId}"
        class=${toc.isParent ? 'parent' : 'child'}
        @request-selected=${this.handleItemSelect.bind(this, toc.contentId)}
      >
        ${toc.title}
      </mwc-list-item>`;
    };
    return html`
      <mwc-list>
        ${this.toc.map((toc) => html`${renderTocItem(toc)}`)}
      </mwc-list>
    `;
  }

  private handleItemSelect(id: string) {
    this.dispatchEvent(new CustomEvent('selected', { detail: { value: id } }));
  }
}
