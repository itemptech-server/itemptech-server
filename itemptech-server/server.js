/**
 * Itemptech console server  —  app.itemptech.com
 * --------------------------------------------------------------
 * PHASE 1 (now)   : serve the console HTML files + health check
 * PHASE 2 (next)  : DingTalk OAuth login  (/auth/dingtalk/*)
 * PHASE 3 (later) : enforce session gate + role-based menus
 *
 * Put your console HTML files in  /public
 *   public/index.html        -> launcher (menu)
 *   public/login.html        -> DingTalk sign-in page
 *   public/admin_14.html     -> admin console
 *   public/sales_14.html     -> sales console
 *   public/spec_viewer.html  -> spec viewer ... etc.
 */

const express      = require('express');
const cookieParser = require('cookie-parser');
const path         = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const PUB  = path.join(__dirname, 'public');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- health check (Render pings this) ----------------------------
app.get('/healthz', (req, res) => res.json({ ok: true }));

// ==================================================================
//  AUTH — DingTalk SSO   (filled in PHASE 2)
// ==================================================================
const DINGTALK = {
  appKey:    process.env.DINGTALK_APP_KEY    || '',
  appSecret: process.env.DINGTALK_APP_SECRET || '',
  redirect:  process.env.DINGTALK_REDIRECT   || 'https://app.itemptech.com/auth/dingtalk/callback',
};

// (1) send the user to DingTalk to log in
app.get('/auth/dingtalk/login', (req, res) => {
  if (!DINGTALK.appKey) return res.status(500).send('DingTalk not configured yet (Phase 2).');
  // TODO Phase 2: build DingTalk authorize URL + redirect
  return res.status(501).send('DingTalk login — coming in Phase 2.');
});

// (2) DingTalk redirects back here with an authCode
app.get('/auth/dingtalk/callback', async (req, res) => {
  // TODO Phase 2: authCode -> userAccessToken -> userinfo
  //               -> match Airtable Users -> issue session cookie -> redirect '/'
  return res.status(501).send('DingTalk callback — coming in Phase 2.');
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ ok: true });
});

// consoles call this to learn the logged-in user's role + allowed menus
app.get('/auth/me', (req, res) => {
  // TODO Phase 3: verify session cookie -> { user, role, menus }
  res.json({ user: null, role: null, menus: [] });
});

// ==================================================================
//  SESSION GATE   (enforced in PHASE 3)
// ==================================================================
function requireAuth(req, res, next) {
  // TODO Phase 3: verify the session cookie (JWT). If invalid -> redirect('/login').
  // During Phase 1 this is OPEN so you can verify the deploy works.
  return next();
}

// ==================================================================
//  PAGES
// ==================================================================

// public: login page
app.get(['/login', '/login.html'], (req, res) =>
  res.sendFile(path.join(PUB, 'login.html'))
);

// gated: launcher (Phase 3 will actually enforce requireAuth)
app.get(['/', '/index.html'], requireAuth, (req, res) =>
  res.sendFile(path.join(PUB, 'index.html'))
);

// gated: all other console html/assets in /public
//   (Phase 3: whitelist css/img + /auth + /login as public)
app.use(requireAuth, express.static(PUB, { extensions: ['html'] }));

// fallback
app.use((req, res) => res.status(404).send('Not found'));

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () =>
  console.log(`Itemptech server listening on ${HOST}:${PORT}  (env PORT=${process.env.PORT || 'UNSET'})`)
);
