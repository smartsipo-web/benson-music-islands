# Benson’s Music Islands

Independent portfolio for 施維駿 Benson. Five real-time 3D islands with a cute rock-concert theme, rotatable camera, zoom controls, four lighting presets, an automatic day/night cycle, nine walking family/teacher characters and Benson playing drums. The original copied competition results, judge comments, CPA levels, photographs, videos and family stories remain available in accessible dialogs.

## Development

Requires Node.js 20+. Three.js is bundled locally; there is no runtime CDN dependency. Install dependencies once with `npm ci`.

```
npm test
npm run build
npm start
```

Drag to orbit, scroll/pinch to zoom, select an island to read its content. Day/night presets stop the automatic clock; enable 日夜流轉 to resume it. 暫停行走 freezes characters, boats and the clock. Reduced-motion preference starts paused. Browsers without WebGL show the prior illustration and retain content navigation. A hidden tab or offscreen world stops drawing frames. The original reference's interaction was observed at https://puma.taipei/heart-island; all scene geometry and models here are original, with no reference-site assets copied.

## Content provenance

Copied one way from `smartsipo-web/benson-shih` at commit `c42649b46e9a3cc221e0c0ac6af801a1bb83bfaf` on 2026-10-28. Original repository and deployment are unchanged. `content.json` holds the copied records; all photographs are local independent copies. Original unknown scores/comments remain marked pending. Artwork is an AI-created illustration, not a depiction of an actual location.

Target Vercel project: `prj_kf3ZWUhy1bJYU7xDOLd3bqNrwKC0`, team `bensondrum`. Build: `npm run build`, output: `dist`.

## Trophy walk and scenery

The 3D bay is surrounded by low-poly mountains and pine forests. The trophy boardwalk shows the existing 20 drum and 5 dance competition records. `trophies.js` derives its display from the same `content.json` sections as the original islands, so editing a result updates both presentations. It does not alter those sections. The October 3 Golden Drum event has two explicitly identified stage photos; other events show a pending-photo message until photographs are matched. Scene trophies are stylized representations of the recorded results, not verified replicas of physical trophies. A trophy detail can link back to the original island record, video and judge scores.

## Touring, guests and the courage tree

The five content islands are spaced roughly 25% farther from the hub. Their stages have rounded props, wooden deck details, instruments, speakers, flowers, café supplies, books, certificates, film reels and a clapperboard. Static geometry is batched by material per island to reduce rendering work.

Benson follows a continuous route along the island perimeter paths and bridges. Each of the five stops has a distinct performance: drums, dance, microphone/bow, trophy salute, and camera pose. `出發巡演` starts the next walk; `跟隨 Benson` tracks the touring character. `全景` cancels following.

Guests choose a nickname, hair, skin, shirt and home island. Server-created records in the project-specific private Blob store last exactly 1,800,000 ms. The API always filters expired guests, and browser monotonic countdowns remove rendered guest models even if polling is unavailable. Reloading or re-submitting while active returns the same expiry; clients cannot set or extend it. At most 24 guests can normally join at a time. Guest lists refresh every 20 seconds; expiration is also checked locally every second/frame. Old records are removed during visitor API reads.

The separate 勇氣之樹 island provides public encouragement messages. Both HTML forms and server validation require a real name or nickname plus text. Messages persist independently of guest expiration. Text is rendered using `textContent`; storage credentials and ownership cookies never enter public responses. Requests use same-origin JSON and a Secure HttpOnly cookie. New messages are limited by a per-session time bucket. Only the most recent 60 messages are displayed; older message files remain retained in the private store.

The private store `benson-music-islands-visitors` is connected only to this Vercel project. The provisioned `BLOB_READ_WRITE_TOKEN` is server-only. No existing Supabase database or original Benson website is used. `npm test` includes exact expiration-boundary, input, ownership-redaction and continuous-tour-route checks.

## Landscape and character refinements

`atmosphere.js` builds a continuous height-field ridge with pine forests and gently drifting sculpted clouds. The atmosphere animation respects pause/reduced-motion settings. `character-hair.js` supplies layered hair caps, fringe, swept short hair, bob/long hair, a moving ponytail, rock tufts and short curls for the permanent cast and visitor hair options.

The BENSON / MUSIC ISLANDS wordmark is upright. The independent tree/trophy link buttons and floating link labels were removed; click the 3D courage tree to leave a named message, or click the trophy boardwalk/trophies to explore awards. Existing messages remain in the same store. The cinema screen uses the user's Golden Drummer photograph (`assets/benson-golden-drummer-stage.jpg`) at its full 3:2 aspect ratio.

## Music performance themes
The homepage is a single full-height 3D scene. The original official website link is in the header immediately before the collaboration link. Resident introduction, journal and footer sections are removed; all source records remain accessible through island dialogs.
The drum/dance buttons replace day/night controls. They switch Benson's pose and position, costume color, environment lighting and accent colors. Tour remains optional. Rhythm lighting and synthesized percussion are separate opt-in controls; sound starts disabled. Bridge keys and notes share batched geometry/materials for mobile performance. The drum set opens competition works, the dance floor opens the first recorded dance video, Benson opens his profile, and the stage trophy opens the award collection. Growth tabs derive milestones from existing competition, CPA, dance and performance records.
