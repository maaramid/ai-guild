# AI Guild rebrand notes

AI Guild is DevLabs by Jeffrey Cayao (jepoy.dev), rebranded by Maaramid. Same features, plus a
Meta Ads team. Everything here is produced by `tools/rebrand/rebrand.py`.

## Getting DevLabs updates

The app cannot install updates straight from the DevLabs releases: the updater would download
and install DevLabs itself (DevLabs name, logo and Ramon back, AI Guild replaced or installed
next to it). Instead, AI Guild is rebuilt from each new DevLabs version.

**Automatic:** the `Sync from DevLabs` workflow (`.github/workflows/sync-devlabs.yml`) checks
DevLabs every Monday (or when you press *Run workflow* in the Actions tab). When there are new
commits it runs the rebrand and opens a pull request; review it, merge it, then push a `v*` tag
to build the release. The last synced DevLabs commit is kept in `tools/rebrand/UPSTREAM`.

**By hand**, the same steps:

1. Download the new DevLabs source zip from https://github.com/jeffreycayao/Dev-Labs.
2. Run the rebrand (needs Python 3):

   ```
   python -I tools/rebrand/rebrand.py "Dev-Labs-main.zip" ../AI-Guild-new
   ```

3. Read the list it prints under "Check these by hand": those are spots DevLabs changed, where
   the rebrand could not patch automatically.
4. In the new folder: `npm ci`, `npm run typecheck`, `npm run test:focused`, then
   `npm run dist:win` (or `dist:mac` / `dist:linux`) to build the installer.
5. Upload the installers as a release in your own repo (`maaramid/ai-guild`). Installed AI Guild
   apps update from there.

Settings (brand, owner, repo, website, email, names) are at the top of `rebrand.py`.

## Rules from the original kept

- `LICENSE` is untouched: the MIT copyright notices of Chaitanya Giri and Jeffrey Cayao stay.
- Credit to DevLabs / Jeffrey Cayao and Munder Difflin / Chaitanya Giri is in the README, About
  dialog, Help page, website footer, `THIRD_PARTY_NOTICES.md` and `CONTRIBUTORS.md`.
- The LimeZu art credit (`LICENSE-ASSETS`, `src/renderer/src/assets/ATTRIBUTION.md`) is untouched.
- The "DevLabs™" name is not used as this app's brand.

## Placeholders to replace with your real ones

| What | Now set to | Where |
|---|---|---|
| GitHub repo (updates + downloads) | `maaramid/ai-guild` | `REPO` in `rebrand.py` |
| Website | `https://maaramid.github.io/ai-guild` | `SITE` in `rebrand.py` |
| Support email | `hello@maaramid.com`, `support@maaramid.com` | `EMAIL_DOMAIN` in `rebrand.py` |
| Sponsor link | commented out | `.github/FUNDING.yml` |

Change them in `rebrand.py` and run it again; no need to edit files one by one.

## Meta Ads team (AI Guild extra)

- Role templates: **Kazuma - Meta Ads Specialist** and **Emilia - Creative Strategist**
  (Add agent → templates, non-technical).
- Bundled skills, copied to every agent: `meta-ads-market-research`,
  `meta-ads-creative-strategy`, `meta-ads-audit`, `meta-ads-metrics-reader`
  (`resources/skills/`, from `tools/rebrand/overlay/`).
- The Meta Ads connector (already in DevLabs) gives them read access to an ad account once
  switched on.

## 2D guild hall and anime cast

- The office is a 2D top-down guild hall drawn on a canvas (`src/renderer/src/scene/guild2d/`):
  no WebGL, at most 30 frames per second, and it stops drawing while hidden or covered. The
  3D office (Three.js) loads only if switched on in **Settings → General → Features → 3D office**.
- Rooms: guild master's office (Roy's desk), library, alchemy workshop, work hall (16 desks for
  working agents), barracks, great hall (quest board, map table), tavern (where idle agents
  hang out), courtyard and gate. Click an agent to open it, double-click to edit, scroll to zoom,
  drag to pan.
- The cast are anime-style people. To redesign one, edit its entry in `ANIME_LOOKS`
  (`src/renderer/src/scene/office/animeArt.ts`): skin, hair style and colour, eye colour, outfit
  and colours, accessories. The portrait cards and the walking sprites both follow it.
- These files live in `tools/rebrand/overlay/`, so a re-run of the rebrand keeps them. Edit them
  there (or copy your changes back there) so the next DevLabs update does not undo your designs.

## Identity changes

- App name **AI Guild**, package `aiguild`, appId `com.maaramid.aiguild` (installs next to
  DevLabs without touching its data).
- Installer files `AIGuild-<version>-...`; deep links `aiguild://floor?...`, `aiguild://hire?...`.
- New "G" logo and icons (`tools/rebrand/overlay/`).

## Kept on purpose

- Internal ids `atmt-hive`, `atmt-labs/hire@1`, `atmt-labs/floor@1`, `.atmt-skill.json`,
  `atmt-*` MCP ids: renaming them breaks hooks, manifests and installed skills.
- Character sprite ids (`michael`, `jim`, `pam`, ...) used by saved teams.
- The skills catalog still reads from DevLabs' live repo `jeffreycayao/atmt_labs_floor_agentskills`.
- Screenshots in `docs/images` and the office GIF still show the old UI.

## Agent names (OG + isekai anime mix)

| Sprite | DevLabs | AI Guild | Role |
|---|---|---|---|
| michael | Ramon | **Roy** | Boss / orchestrator |
| dwight | Rodel | Edward | Assistant to the manager |
| jim | Paolo | Kazuma | Sales lead |
| pam | Maricel | Emilia | Front desk, artist |
| angela | Rowena | Misato | Head of accounting |
| kevin | Bong | Subaru | Accounting |
| oscar | Carlo | Rudeus | Accountant |
| stanley | Ernesto | Spike | Sales |
| kelly | Kristine | Aqua | Customer service |
| andy | Miguel | Vash | Sales, singer |
| phyllis | Lorna | Kaoru | Sales |
| ryan | Jomar | Shinji | Intern |
| toby | Rogelio | Naofumi | HR |
| creed | Lito | Satoru | QA |
| meredith | Divina | Faye | Supplier relations |

Template names: Nestor → Kenshin, Celso → Alphonse, Marites → Asuna, Benjie → Ainz,
Rosalie → Roxy. Hires gallery: Erin → Rem, the rest follow the sprite column.
