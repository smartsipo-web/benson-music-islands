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
