// Compatibility shim: the analysis scripts ported from the Tidbit pipeline
// call makeAuth(scopes). NeuroWiki's OAuth stack lives in lib/google-auth.mjs
// (desktop OAuth client + refresh token at the repo root, both gitignored,
// created once by `npm run seo:auth-login`). This shim adapts one to the
// other so ported scripts keep near-verbatim diffs against their upstream —
// which is what keeps porting bugs out.
//
// The scopes argument is accepted for signature compatibility but unused:
// scopes were fixed at consent time (analytics.readonly + webmasters.readonly
// + webmasters, see lib/google-auth.mjs SCOPES). Every scope the ported
// scripts ask for is a subset of that grant.

import { getGoogleAuthClient } from './lib/google-auth.mjs';

export async function makeAuth(_scopes) {
  const { oauth2Client } = await getGoogleAuthClient();
  // Some ported scripts were written against GoogleAuth and call
  // auth.getClient() before using the result. OAuth2Client has no such
  // method; it is already a usable client, so it returns itself.
  if (typeof oauth2Client.getClient !== 'function') {
    oauth2Client.getClient = async () => oauth2Client;
  }
  return oauth2Client;
}
