type Role =
  | 'KHUB_ADMIN'
  | 'PERSONAL_BOOK_USER'
  | 'DEBUG_USER'
  | 'PERSONAL_BOOK_SHARE_USER'
  | 'ADMIN'
  | 'PDF_EXPORT_USER'
  | 'BETA_USER'
  | 'PORTAL_ADMIN'
  | 'SAVED_SEARCH_USER'
  | 'USERS_ADMIN'
  | 'HTML_EXPORT_USER';

export interface LoginResponse {
  profile: {
    userId: string;
    displayName: string;
    emailAddress: string;
    roles: Array<Role>;
  };
  authenticationIdentifier: {
    identifier: string;
    realm: string;
  };
}

export type AuthenticationResponse = Partial<LoginResponse> & {
  sessionAuthenticated: boolean;
};
