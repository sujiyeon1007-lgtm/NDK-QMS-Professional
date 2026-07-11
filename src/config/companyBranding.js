/**
 * RC1 Company Branding - static asset paths (SSOT fallbacks)
 *
 * Official NDK stamp: public/assets/stamp/company_stamp.png (P0-OP-007).
 * Uploaded Company Workspace branding (profile.branding.stamp) takes precedence.
 */

export const COMPANY_BRANDING_ASSETS = Object.freeze({
  /** Shared stamp PNG - transaction statement, certificate, TDE */
  stamp: "/assets/stamp/company_stamp.png",
});

/** Default stamp URL when Company Workspace has no uploaded stamp */
export const DEFAULT_COMPANY_STAMP_URL = COMPANY_BRANDING_ASSETS.stamp;
