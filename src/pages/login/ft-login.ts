import {
  LitElement,
  html,
  css,
  customElement,
  TemplateResult,
  internalProperty,
  query,
} from 'lit-element';
import type { TextField } from '@material/mwc-textfield';
import '@material/mwc-textfield';
import '@material/mwc-button';
import type { Snackbar } from '@material/mwc-snackbar';
import '@material/mwc-snackbar';
import { loginApi } from '../../api/authent';

@customElement('ft-login')
export class FtLogin extends LitElement {
  @internalProperty() private login = '';

  @internalProperty() private password = '';

  @internalProperty() private error = false;

  @internalProperty() private errorMsg?: string;

  @query('mwc-snackbar') snackBar?: Snackbar;

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
    }
    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .wrapper > * {
      margin-top: 15px;
    }
    .actions {
      display: flex;
      flex-direction: row;
    }
    .invalid {
      --mdc-theme-primary: red;
      --mdc-text-field-label-ink-color: red;
    }
    mwc-button {
      margin: 8px;
    }
  `;

  render(): TemplateResult {
    return html`
      <div class="wrapper">
        <mwc-textfield
          required
          outlined
          label="Login"
          class="${this.error ? 'invalid' : ''}"
          @input=${this.onInput.bind(this, 'login')}
        >
        </mwc-textfield>
        <mwc-textfield
          required
          outlined
          label="Password"
          type="password"
          class="${this.error ? 'invalid' : ''}"
          @input=${this.onInput.bind(this, 'password')}
        >
        </mwc-textfield>
        <div class="actions">
          <mwc-button outlined @click=${this.onCancel.bind(this)}>
            Retour
          </mwc-button>
          <mwc-button
            raised
            @click=${this.onClick.bind(this)}
            .disabled=${!this.login || !this.password}
          >
            Se connecter
          </mwc-button>
        </div>
      </div>
      <mwc-snackbar
        id="errorSnackBar"
        leading
        .labelText="${this.errorMsg || ''}"
      >
      </mwc-snackbar>
    `;
  }

  onInput(type: 'login' | 'password', e: InputEvent) {
    this.error = false;
    const target = e.currentTarget as TextField;
    if (type === 'login') {
      this.login = target.value;
    }
    if (type === 'password') {
      this.password = target.value;
    }
  }

  private async onClick() {
    const { login, password } = this;
    if (login && password) {
      this.errorMsg = undefined;
      const response = await loginApi(login, password);
      if (!response.error) {
        const token = btoa(`${login}:${password}`);
        window.localStorage.setItem('token', token);
        this.dispatchEvent(new CustomEvent('authentified'));
      } else {
        this.error = true;
        const err = await response.response.json();
        this.errorMsg = err.message;
        this.snackBar?.show();
      }
    }
  }

  private onCancel() {
    this.dispatchEvent(new CustomEvent('cancel-login'));
  }
}
