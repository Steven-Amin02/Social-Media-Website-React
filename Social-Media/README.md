# Route Social

A responsive social app built with React, TypeScript, Vite, and Tailwind CSS. English, light-only, with a Facebook-inspired feed and an original Route Social identity.

## Run locally

Use Node **20.19+ or 22.12+** and npm. Node 24 was used for verification.

```sh
cd Social-Media
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Create your own account through **Create an account**, or sign in using your existing API account’s email or username. No credentials are bundled.

The default API is `https://route-posts.routemisr.com`. To override it, copy `.env.example` to `.env.local`, change `VITE_API_BASE_URL`, and restart Vite. Vite environment values are public browser configuration; do not put secrets in them.

```sh
npm run build       # TypeScript checks and production output in dist/
npm run preview     # Serve the production build locally
npm run lint        # ESLint and React hook checks
npm run format      # Prettier
```

## Deploy to Vercel

Set the Vercel project's **Root Directory** to `Social-Media`, **Framework Preset** to `Vite`, **Build Command** to `npm run build`, and **Output Directory** to `dist`.

The included `vercel.json` rewrites application URLs to `index.html` so React Router can handle direct visits and refreshes on routes such as `/login` and `/posts/:postId`. Commit and push this file to the deployment branch to deploy the fix. After deployment, open `/login` directly and refresh it to verify routing.

## Features

- Sign-up, login by email/username, session restoration, logout, and password changes.
- All/Following/My Posts timelines, photos-only filtering, and explicit Load more pagination.
- Text and photo posts, editing, image replacement/removal, confirmed deletion, likes, likes lists, bookmarks, and shared posts with commentary.
- Comments and replies with photos, owner editing, comment likes, and deletion by the comment owner or post owner.
- Profiles, profile-photo uploads, follow/unfollow, suggestions, and saved posts.
- Notifications with all/unread views, read actions, linked targets, and a badge refreshed every minute while visible and on window focus.
- Mobile navigation, responsive desktop sidebars, keyboard-accessible forms, native modal dialogs, skeletons, empty states, and recoverable errors.

Routes: `/login`, `/register`, `/`, `/explore`, `/posts/:postId`, `/profile`, `/users/:userId`, `/saved`, `/notifications`, and `/settings`. Application routes require a validated session. Unknown URLs show a public 404 page. `/error` displays the unexpected-error page, which is also used by the application error boundary with reload and home actions.

## Learning-first architecture

```text
src/
  Components/
    layout/               Application shell and navigation
    auth/                 Session provider and account forms
    feed/                 Timelines, Explore, saved posts
    posts/                Post cards, composers, comments and replies
    profiles/             Profiles and follow suggestions
    notifications/        Polling provider and notification list
    errors/               Public error page and application error boundary
    ui.tsx                Reusable controls, dialogs, upload previews
  features/
    auth/                 Session state, hooks, and validation
    notifications/        Notification state and target routing
  shared/
    api/                  Typed fetch client and endpoint adapters
    hooks.ts              useResource, usePaged, useAction
    types.ts              Verified API model and permission helpers
```

`AuthContext` owns the current user and a token stored in `sessionStorage`. Startup validates the token with `/users/profile-data`. An authenticated 401 clears the session, while a network failure offers retry. Password changes install the returned replacement token without unmounting Settings. Following and bookmark counts update shared user state only after API success.

API calls live outside components. `useResource` handles cancellable detail loads; `usePaged` appends and deduplicates lists using server pagination metadata; `useAction` prevents duplicate writes and exposes errors. Feature parents patch changed items locally. No global server cache, Redux, or query library is required. Lists with different filters or owners are keyed so their request lifecycles remain independent.

Tailwind provides the base theme, reset, and shared component utilities in `index.css`. `App.css` holds the application-specific layouts, decorative artwork, and responsive rules. Existing HeroUI packages remain installed; native controls and dialogs keep the implementation explicit.

## API contracts

Reference: [Postman collection](https://documenter.getpostman.com/view/5709532/2sBXcBnNAq) and [provider endpoint reference](https://route-posts.routemisr.com/).

Verified against the live backend during implementation:

- Login returns `data.token` and `data.user`; protected requests use `Authorization: Bearer <token>`.
- Envelopes use `success`, `message`, `data`, and optional `meta.pagination` with `currentPage`, `numberOfPages`, `total`, `limit`, and optional `nextPage`.
- Multipart keys are `photo` for avatars, `body`/`image` for posts, and `content`/`image` for comments and replies. `removeImage=true` removes a **post** image. Existing comment/reply images can be replaced; their endpoint rejects image removal, so that control is not offered. Omitted image fields preserve attachments. The browser supplies multipart boundaries.
- Some post mutation responses contain a user ID instead of a populated user. Cards preserve already-loaded author details; edited posts are reloaded through the single-post endpoint.
- Likes, bookmarks, and follows are toggle endpoints. Responses provide the resulting boolean and updated count.
- Replies can notify using `comment_post` with `entityType: comment`; mentions use `mention_user`. Comment notification targets resolve through `entity.post`.
- Requests ask for 10 items (20 for likes); the server’s actual metadata is authoritative. User-post endpoints may choose a different page size.
- The frontend accepts JPG, PNG, WebP, and GIF files up to **5 MB**. This is the app’s conservative upload limit; the server also validates uploads and its error is displayed.

## Boundaries

Vercel SPA routing is configured in `vercel.json`; deploying still requires a Vercel project. The provider describes this backend as a free learning/testing service, not a production service. Messaging, stories, videos, global search, general profile editing, password recovery, Arabic, and dark mode are outside this version. Typed `@username` mentions are preserved; links appear only when a response supplies a matching user identifier, with no invented autocomplete endpoint.
