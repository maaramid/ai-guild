"""AI Guild rebrand: turn a DevLabs source tree into AI Guild.

Re-run this on every new DevLabs release to get the matching AI Guild version:

    python -I tools/rebrand/rebrand.py <devlabs-source-folder-or-zip> <output-folder>

What it does, in order:
  1. copies the DevLabs tree, replacing brand, links and agent names (BRAND/NAMES below)
  2. applies exact code patches (credits, deep-link scheme, release config, ...)
  3. adds the AI Guild extras (Meta Ads roles) and copies overlay/ on top
     (new icons, bundled Meta Ads skills, REBRAND.md, this kit)
  4. prints every patch that no longer matches, so you know what to check by hand
     when DevLabs changed that part of the code.
Kept untouched: LICENSE, LICENSE-ASSETS, the LimeZu ATTRIBUTION.md (MIT/asset rules).
"""
import os, re, shutil, sys, tempfile, zipfile

# ─── settings ────────────────────────────────────────────────────────────────
BRAND = 'AI Guild'                     # app name shown to people
SLUG = 'aiguild'                       # package name, storage keys, deep-link scheme
FILE_PREFIX = 'AIGuild'                # installer file names, code identifiers
OWNER = 'Maaramid'
REPO = 'maaramid/ai-guild'             # your GitHub repo: app updates + downloads
SITE = 'maaramid.github.io/ai-guild'   # your website
EMAIL_DOMAIN = 'maaramid.com'
APP_ID = 'com.maaramid.aiguild'

BOSS_OLD, BOSS_NEW = 'Ramon', 'Roy'
NAMES = {   # DevLabs display name -> AI Guild name (OG + isekai anime mix)
    'Paolo': 'Kazuma', 'Maricel': 'Emilia', 'Rodel': 'Edward', 'Bong': 'Subaru',
    'Rowena': 'Misato', 'Carlo': 'Rudeus', 'Ernesto': 'Spike', 'Lorna': 'Kaoru',
    'Miguel': 'Vash', 'Kristine': 'Aqua', 'Jomar': 'Shinji', 'Rogelio': 'Naofumi',
    'Lito': 'Satoru', 'Divina': 'Faye',
    # role-template names
    'Nestor': 'Kenshin', 'Celso': 'Alphonse', 'Marites': 'Asuna', 'Benjie': 'Ainz', 'Rosalie': 'Roxy',
}
HIRES_NAMES = {  # community hires gallery (docs/hires) uses the original cast names
    'Michael': BOSS_NEW, 'Jim': 'Kazuma', 'Pam': 'Emilia', 'Dwight': 'Edward', 'Kevin': 'Subaru',
    'Angela': 'Misato', 'Oscar': 'Rudeus', 'Stanley': 'Spike', 'Phyllis': 'Kaoru', 'Andy': 'Vash',
    'Kelly': 'Aqua', 'Ryan': 'Shinji', 'Toby': 'Naofumi', 'Creed': 'Satoru', 'Meredith': 'Faye',
    'Erin': 'Rem',
}
BOSS_AR = 'روي'   # Arabic locale spelling of the boss name

PROTECT = {'LICENSE', 'LICENSE-ASSETS', 'CONTRIBUTORS.md', 'src/renderer/src/assets/ATTRIBUTION.md',
           'src/main/legacyUserData.ts', 'test/legacy-userdata.test.cjs', 'site/assets/fonts/LICENSE.txt'}
TEXT_EXT = {'.ts', '.tsx', '.js', '.cjs', '.mjs', '.json', '.md', '.html', '.css', '.yml', '.yaml',
            '.txt', '.py', '.sh', '.svg', '.plist', '.xml', '.toml', '.jsonl', ''}
SKIP_DIRS = {'node_modules', '.git', 'out', 'dist'}
KIT = os.path.dirname(os.path.abspath(__file__))


def LP(p):
    p = os.path.abspath(p)
    return p if p.startswith('\\\\?\\') or os.name != 'nt' else '\\\\?\\' + p


# ─── 1. token pass ───────────────────────────────────────────────────────────
PAIRS = [
    ('raw.githubusercontent.com/jeffreycayao/Dev-Labs', f'raw.githubusercontent.com/{REPO}'),
    ('jeffreycayao/Dev-Labs', REPO),
    ('https://atmtlabs-hires.dev', f'https://{SITE}/hires'),
    ('devlabs.atmt.dev', SITE),
    ('hello@automatika.ph', f'hello@{EMAIL_DOMAIN}'),
    ('support@automatika.ph', f'support@{EMAIL_DOMAIN}'),
    ('dev.jepoy.devlabs', APP_ID),
    ('ph.automatika.jepoyfloorai', APP_ID),
    ('https://jepoy.dev/floors/', f'https://{SITE}/floors/'),
    ('jepoy.dev/#download', f'{SITE}/#download'),
    (f'{BOSS_OLD.lower()}s-command-center', f'{BOSS_NEW.lower()}s-command-center'),
    (f'is{BOSS_OLD}', f'is{BOSS_NEW}'),
]
REGEX = [
    (r'DevLabs™', BRAND),
    (r'DevLabs(?=-(\$\{|\d|x64|win|mac|linux))', FILE_PREFIX),
    (r'(?<=[A-Za-z0-9_$])DevLabs|DevLabs(?=[A-Za-z0-9_$])', FILE_PREFIX),
    (r'DevLabs', BRAND), (r'Devlabs', SLUG.capitalize()), (r'devlabs', SLUG), (r'DEVLABS', SLUG.upper()),
    (r'Dev-Labs', BRAND.replace(' ', '-')),
    (BOSS_OLD.upper(), BOSS_NEW.upper()),
    (rf'(?<![A-Za-z]){BOSS_OLD}(?![a-z])', BOSS_NEW),
    (rf'(?<![A-Za-z]){BOSS_OLD.lower()}(?![a-z])', BOSS_NEW.lower()),
    ('رامون', BOSS_AR),
    (r'(?<!Monte )\b(' + '|'.join(NAMES) + r')\b', lambda m: NAMES[m[1]]),
]
REGEX = [(re.compile(p), r) for p, r in REGEX]
HIRES_RX = re.compile(r'\b(' + '|'.join(HIRES_NAMES) + r')\b')


def rename(name):
    for a, b in (('devlabs', SLUG), ('DevLabs', FILE_PREFIX), ('Dev-Labs', BRAND.replace(' ', '-'))):
        name = name.replace(a, b)
    return name


def token_pass(src, out):
    n = 0
    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel_root = os.path.relpath(root, src).replace('\\', '/')
        out_root = os.path.join(out, *[rename(p) for p in rel_root.split('/') if p != '.'])
        os.makedirs(out_root, exist_ok=True)
        for f in files:
            rel = f if rel_root == '.' else f'{rel_root}/{f}'
            s, d = os.path.join(root, f), os.path.join(out_root, rename(f))
            if rel in PROTECT or os.path.splitext(f)[1].lower() not in TEXT_EXT:
                shutil.copy2(s, d); continue
            try:
                text = open(s, encoding='utf-8', newline='').read()
            except UnicodeDecodeError:
                shutil.copy2(s, d); continue
            new = text
            for a, b in PAIRS:
                new = new.replace(a, b)
            for rx, b in REGEX:
                new = rx.sub(b, new)
            if rel.startswith('docs/hires/'):
                new = HIRES_RX.sub(lambda m: HIRES_NAMES[m[1]], new)
            if rel != 'CHANGELOG.md':
                new = re.sub(r'atmtlabs(?=[:\'])', SLUG, new)          # own deep-link scheme
                new = re.sub(r'\ba ' + re.escape(BRAND), 'an ' + BRAND, new)
            n += new != text
            open(d, 'w', encoding='utf-8', newline='').write(new)
    return n


# ─── 2. exact patches ────────────────────────────────────────────────────────
DL = 'DevLabs by Jeffrey Cayao (jepoy.dev)'
DL_HTML = ('<a href="https://github.com/jeffreycayao/Dev-Labs">DevLabs</a> by Jeffrey Cayao '
           '(<a href="https://jepoy.dev">jepoy.dev</a>)')
COPY = f'© 2026 Chaitanya Giri, Jeffrey Cayao (jepoy.dev) and {OWNER}.'
B = BRAND
SITE_FOOT = [
    ('<a href="https://jepoy.dev">Developer: Jeffrey Cayao</a><a href="https://www.facebook.com/jeffcayao.social">Facebook</a>',
     f'<a href="https://github.com/{REPO}">{OWNER}</a><a href="https://jepoy.dev">Based on DevLabs by Jeffrey Cayao</a>'),
    (f'© 2026 jepoy.dev. {B} is open source under the MIT License, built on',
     f'© 2026 {OWNER}. {B} is open source under the MIT License, a rebrand of {DL_HTML}, built on'),
    (f'{B} by jepoy.dev</div>', f'{B} by {OWNER}</div>'),
    ('<strong>jepoy.dev</strong> (Jeffrey Cayao, "we", "us")', f'<strong>{OWNER}</strong> ("we", "us")'),
    (f'<strong>jepoy.dev</strong> (Jeffrey Cayao, developer of {B})', f'<strong>{OWNER}</strong> ({B})'),
]
PATCHES = {
    'electron-builder.yml': [
        ('owner: jeffreycayao', f'owner: {REPO.split("/")[0]}'),
        (f'repo: {B.replace(" ", "-")}', f'repo: {REPO.split("/")[1]}'),
        ('copyright: Copyright © 2026 Chaitanya Giri and jepoy.dev',
         f'copyright: Copyright © 2026 Chaitanya Giri, Jeffrey Cayao (jepoy.dev) and {OWNER}')],
    'test/public-release-config.test.cjs': [
        (f'jeffreycayao\\/{B.replace(" ", "-")}', REPO.replace('/', '\\/')),
        (f'owner: jeffreycayao\\n  repo: {B.replace(" ", "-")}', f'owner: {REPO.split("/")[0]}\\n  repo: {REPO.split("/")[1]}')],
    'src/shared/brand.ts': [
        (" * Kept as `atmtlabs` on purpose: links already shared by older builds use it. */",
         f" * Own scheme so {B} does not take over DevLabs' atmtlabs:// links. */")],
    'src/main/skillsCatalog.ts': [
        (f"new Set(['{B}', 'Jepoy Floor AI', 'ATMT Labs'])", f"new Set(['{B}', 'DevLabs', 'Jepoy Floor AI', 'ATMT Labs'])")],
    'site/api/download.js': [(f'/^{B}-', f'/^{FILE_PREFIX}-')] * 5,
    'tools/check-release-links.cjs': [(f'{B}-(', f'{FILE_PREFIX}-('), (f'download/{B}-<version>', f'download/{FILE_PREFIX}-<version>')],
    'src/main/index.ts': [
        (f'`{B}-floor-', f'`{FILE_PREFIX}-floor-'),
        ('built on Munder Difflin by Chaitanya Giri and extended, localized and maintained by jepoy.dev.',
         f'rebranded by {OWNER} from {DL}, which is built on Munder Difflin by Chaitanya Giri.'),
        ("'© 2026 Chaitanya Giri and jepoy.dev. Open source under the MIT License.'", f"'{COPY} Open source under the MIT License.'"),
        ("'Developer: Jeffrey Cayao · jepoy.dev · facebook.com/jeffcayao.social'", f"'{B} by {OWNER} · based on {DL}'")],
    '.github/FUNDING.yml': [('custom: ["https://jepoy.dev/sponsor#support-form"]', '# custom: ["https://your-sponsor-link"]')],
    'AGENTS.md': [(f'{B} is an open-source (MIT) Electron desktop app, forked from',
                   f'{B} is an open-source (MIT) Electron desktop app by {OWNER}, a rebrand of [DevLabs](https://github.com/jeffreycayao/Dev-Labs) by Jeffrey Cayao, which is forked from')],
    'CONTRIBUTORS.md': [('DevLabs is a fork of [Munder Difflin]',
                         f'{B} (by {OWNER}) is a rebrand of [DevLabs](https://github.com/jeffreycayao/Dev-Labs) by Jeffrey Cayao,\nwhich is a fork of [Munder Difflin]')],
    'DESIGN.md': [(f'({B} by jepoy.dev)', f'({B} by {OWNER}, palette inherited from DevLabs by jepoy.dev)')],
    'docs/DESIGN.md': [(f'Owner: {B} / jepoy.dev.', f'Owner: {B} / {OWNER} (design inherited from DevLabs / jepoy.dev).')],
    'package.json': [('"author": "jepoy.dev (https://jepoy.dev)",', f'"author": "{OWNER}",'),
                     ('"Chaitanya Giri (original author, https://github.com/chaitanyagiri/munder-difflin)"',
                      '"Chaitanya Giri (original author, https://github.com/chaitanyagiri/munder-difflin)",\n    "Jeffrey Cayao (DevLabs, https://jepoy.dev)"')],
    'PRIVACY.md': [('jepoy.dev (Jeffrey Cayao) explains', f'{OWNER} explains')],
    'README.md': [
        ('<sub>A fork of <a href="https://github.com/HarnessMD/munder-difflin"><b>Munder Difflin</b></a> by',
         '<sub>A rebrand of <a href="https://github.com/jeffreycayao/Dev-Labs"><b>DevLabs</b></a> by <a href="https://jepoy.dev">Jeffrey Cayao</a>, itself a fork of <a href="https://github.com/HarnessMD/munder-difflin"><b>Munder Difflin</b></a> by'),
        (f'- **Developer:** Jeffrey Cayao ([jepoy.dev](https://jepoy.dev/) · [facebook.com/jeffcayao.social](https://www.facebook.com/jeffcayao.social)), who extends, localizes and maintains {B}.',
         f'- **{B} rebrand:** {OWNER}.\n- [**DevLabs**](https://github.com/jeffreycayao/Dev-Labs) by Jeffrey Cayao ([jepoy.dev](https://jepoy.dev/) · [facebook.com/jeffcayao.social](https://www.facebook.com/jeffcayao.social)), who extended and localized the app this build is based on.'),
        ('## Use it in 5 minutes (no coding needed)',
         '## New in AI Guild: Meta Ads team\n\nTwo extra roles in **Add agent → templates**: **Kazuma - Meta Ads Specialist** (audits, results\nreading, campaign plans) and **Emilia - Creative Strategist** (customer research, angles, hooks,\nscripts, briefs, test plans). Every agent also gets the bundled Meta Ads skills:\n`meta-ads-market-research`, `meta-ads-creative-strategy`, `meta-ads-audit` and\n`meta-ads-metrics-reader`. Turn on the **Meta Ads** connector to let them read your ad account.\n\n## New in AI Guild: the 2D guild hall\n\nThe office is now a light **2D guild hall** (canvas, no 3D engine): working agents sit at\ntheir desks in the work hall, idle ones hang out in the tavern, courtyard and great hall, and\nRoy runs things from the office of the guild master. The cast are anime-style people; their looks\nlive in `src/renderer/src/scene/office/animeArt.ts` (`ANIME_LOOKS`). The old 3D office is still\nthere: **Settings → General → Features → 3D office**.\n\n## Use it in 5 minutes (no coding needed)')],
    'resources/help/features.html': [('© 2026 Chaitanya Giri and jepoy.dev.', COPY)],
    'resources/help/index.html': [
        ('<dt>Built on</dt><dd><a href="https://github.com/chaitanyagiri/munder-difflin">Munder Difflin</a> by Chaitanya Giri (MIT License), extended, localized and maintained by jepoy.dev.</dd>',
         f'<dt>Built on</dt><dd>{DL_HTML}, itself built on <a href="https://github.com/chaitanyagiri/munder-difflin">Munder Difflin</a> by Chaitanya Giri (MIT License). Rebranded as {B} by {OWNER}.</dd>'),
        ('<dt>Developer</dt><dd>Jeffrey Cayao · <a href="https://jepoy.dev">jepoy.dev</a>', '<dt>Based on</dt><dd>DevLabs by Jeffrey Cayao · <a href="https://jepoy.dev">jepoy.dev</a>'),
        ('<dt>Developer</dt><dd>Jeffrey Cayao · <a href="https://jepoy.dev">jepoy.dev</a>', '<dt>Based on</dt><dd>DevLabs by Jeffrey Cayao · <a href="https://jepoy.dev">jepoy.dev</a>'),
        ('© 2026 Chaitanya Giri and jepoy.dev.', COPY)],
    'site/assets/site.css': [('in the jepoy.dev palette', 'in the palette inherited from DevLabs (jepoy.dev)')],
    'src/renderer/src/design/tokens.css': [(f'{B} palette (jepoy.dev brand)', f'{B} palette (inherited from DevLabs by jepoy.dev)')],
    'THIRD_PARTY_NOTICES.md': [('## Original application — Munder Difflin by Chaitanya Giri (MIT License)',
        f'## Based on — DevLabs by Jeffrey Cayao (MIT License)\n\n{B} is a rebrand of **DevLabs** (https://github.com/jeffreycayao/Dev-Labs),\nCopyright (c) 2026 Jeffrey Cayao (jepoy.dev, https://jepoy.dev), released under the MIT License.\nThe full notice is in [`LICENSE`](./LICENSE).\n\n## Original application — Munder Difflin by Chaitanya Giri (MIT License)')],
}
for f in ('site/index.html', 'site/features.html', 'site/guide.html', 'site/privacy.html'):
    PATCHES[f] = [(a, b, 'optional') for a, b in SITE_FOOT]

# ─── 3. AI Guild extras ──────────────────────────────────────────────────────
META_TEMPLATES = """  t('meta-ads-specialist', 'non-technical', 'Meta Ads Specialist', {
    description: 'Meta Ads Specialist — plans, audits and reads Facebook and Instagram ads like a careful media buyer; gives each ad a clear decision. Never spends without approval.',
    name: 'Kazuma - Meta Ads Specialist', character: 'jim', accent: 'sky',
    capabilities: ['meta-ads', 'media-buying', 'audit', 'reporting'],
    goal: 'Run the Meta (Facebook / Instagram) ads side of the business like a careful media buyer. Plan campaigns from the business goal backwards: what a result is (purchase, message, lead, booking), what it is worth (target CPA or ROAS), then objective, structure, audiences and budget. Before any launch, do the pre-launch check with the meta-ads-audit skill. Audit accounts on request and deliver the score, the biggest leak and a fix list ranked P1/P2/P3. Read results with the meta-ads-metrics-reader skill: find which funnel step (butas) is leaking and give every ad one decision: Continue, Scale carefully, Revise, Test, Pause or Gather more data, with the number that backs it. Work from Ads Manager exports, screenshots or, when the owner turned it on, the Meta Ads connector (read only). Never publish, pause, change budgets or spend money without the owner\\'s explicit OK in chat. Report in plain Taglish or English: what happened, why, what to do next.'
  }),
  t('creative-strategist', 'non-technical', 'Creative Strategist', {
    description: 'Creative Strategist — turns customer research into Facebook and Instagram ad angles, hooks, scripts, copy and briefs with a test plan; drafts only.',
    name: 'Emilia - Creative Strategist', character: 'pam', accent: 'peach',
    capabilities: ['creative-strategy', 'research', 'copywriting', 'testing'],
    goal: 'Turn research into ads that sell. Start with what real customers say in public, using the meta-ads-market-research skill: reviews, comments, forum posts and competitor ads in the Meta Ad Library, collected into a customer language bank with sources. Then build the creative strategy with the meta-ads-creative-strategy skill: read the market temperature, choose message pillars and pair each with proof, write angles and opening hooks in the customer\\'s own words, then deliver video and UGC scripts (hook, problem, mechanism, proof, CTA), three-variant static ad copy, creator and designer briefs, a variation matrix and a test plan with kill and scale rules. Flag any claim without backing as "proof needed". Hand scripts to the Meta Ads Specialist for launch. Drafts only: a human approves before anything goes live.'
  }),
"""
EXTRAS = {
    'test/prompt-library.test.cjs': [
        ("'launch-marketer': 'marketing',", "'launch-marketer': 'marketing', 'meta-ads-specialist': 'marketing', 'creative-strategist': 'marketing',")],
    'src/shared/agentTemplates.ts': [
        ('  // ─── extra role templates', META_TEMPLATES + '  // ─── extra role templates')],
}

# ─── 2D guild hall + anime cast (AI Guild extra) ───────────────────────────
GUILD = {
    'src/shared/features.ts': [
        ('  geminiVoice: boolean;\n}',
         '  geminiVoice: boolean;\n  /** The 3D office (Three.js) instead of the light 2D guild hall. Heavier on the GPU. */\n  office3d: boolean;\n}'),
        ('  geminiVoice: true\n};', '  geminiVoice: true,\n  office3d: false\n};')],
    'src/renderer/src/App.tsx': [
        ("import { OfficeFloor3D } from '@/scene/office3d/OfficeFloor3D';", "import { OfficeView } from '@/scene/OfficeView';"),
        ('          <OfficeFloor3D />', '          <OfficeView />')],
    'src/renderer/src/components/EditAgentModal.tsx': [
        ("import { useEffect, useState, type CSSProperties } from 'react';", "import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';"),
        ("import { AgentAvatarModal } from '@/features/office/avatar/AgentAvatarModal';",
         "// Loaded on demand: the avatar editor pulls in Three.js.\nconst AgentAvatarModal = lazy(() => import('@/features/office/avatar/AgentAvatarModal').then((m) => ({ default: m.AgentAvatarModal })));"),
        ('{avatarOpen && <AgentAvatarModal agent={liveAgent} onClose={() => setAvatarOpen(false)} />}',
         '{avatarOpen && <Suspense fallback={null}><AgentAvatarModal agent={liveAgent} onClose={() => setAvatarOpen(false)} /></Suspense>}')],
    'src/renderer/src/scene/office/portraitArt.ts': [
        ("import { rgbToHex, shade } from '../../lib/avatars/palette';",
         "import { rgbToHex, shade } from '../../lib/avatars/palette';\n\n// AI Guild: the cast is drawn by the anime-style renderer (animeArt.ts); the\n// pixel versions below stay available as paintPixelPortrait / pixelCharacterLook.\nexport { paintAnimePortrait as paintPortrait, animeCharacterLook as characterLook } from './animeArt';"),
        ('export function characterLook(name: OfficeCharacterName): CharacterLook {', 'export function pixelCharacterLook(name: OfficeCharacterName): CharacterLook {'),
        ('export function paintPortrait(ctx: CanvasRenderingContext2D, name: OfficeCharacterName, scale = 2, clear = true): void {',
         'export function paintPixelPortrait(ctx: CanvasRenderingContext2D, name: OfficeCharacterName, scale = 2, clear = true): void {')],
}

LOCALE_ADDS = {
    'en': ({'office3d': '3D office (heavier)',
            'office3dDesc': 'Show the 3D office instead of the light 2D guild hall. Needs a stronger graphics card; the 2D hall is the default.'},
           {'title': 'Guild Hall', 'recruit': 'Recruit', 'working': 'working', 'idle': 'idle', 'error': 'needs a look',
            'waiting': 'waiting', 'fullscreen': 'Full screen', 'resetView': 'Reset view'}),
    'ar': ({'office3d': 'مكتب ثلاثي الأبعاد (أثقل)',
            'office3dDesc': 'اعرض المكتب ثلاثي الأبعاد بدلاً من قاعة النقابة الخفيفة ثنائية الأبعاد. يحتاج إلى بطاقة رسومات أقوى.'},
           {'title': 'قاعة النقابة', 'recruit': 'تجنيد', 'working': 'يعمل', 'idle': 'متفرغ', 'error': 'يحتاج مراجعة',
            'waiting': 'ينتظر', 'fullscreen': 'ملء الشاشة', 'resetView': 'إعادة ضبط العرض'}),
    'zh-CN': ({'office3d': '3D 办公室（较耗资源）',
               'office3dDesc': '用 3D 办公室代替轻量的 2D 公会大厅。需要较好的显卡；默认是 2D 大厅。'},
              {'title': '公会大厅', 'recruit': '招募', 'working': '工作中', 'idle': '空闲', 'error': '需要查看',
               'waiting': '等待中', 'fullscreen': '全屏', 'resetView': '重置视图'}),
}


def patch_locales(out):
    import json
    misses = []
    for lng, (feat, guild) in LOCALE_ADDS.items():
        p = os.path.join(out, 'src', 'renderer', 'src', 'i18n', 'locales', f'{lng}.json')
        if not os.path.exists(p):
            misses.append(f'locale: missing {lng}.json'); continue
        data = json.load(open(p, encoding='utf-8'))
        def find(o):
            if isinstance(o, dict):
                if 'geminiVoiceDesc' in o:
                    return o
                for v in o.values():
                    r = find(v)
                    if r is not None:
                        return r
            return None
        fdict = find(data)
        if fdict is None:
            misses.append(f'locale: {lng}: feature labels not found')
        else:
            fdict.update(feat)
        if isinstance(data.get('office'), dict):
            data['office']['guild'] = guild
        else:
            misses.append(f'locale: {lng}: no "office" section')
        open(p, 'w', encoding='utf-8', newline='\n').write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return misses


def apply_patches(out, table, label):
    misses = []
    for rel, pairs in table.items():
        p = os.path.join(out, *rel.split('/'))
        if not os.path.exists(p):
            misses.append(f'{label}: missing file {rel}'); continue
        t = open(p, encoding='utf-8', newline='').read()
        for pair in pairs:
            a, b = pair[0], pair[1]
            if a in t:
                t = t.replace(a, b, 1)
            elif b not in t and len(pair) < 3:  # 3rd item = optional patch
                misses.append(f'{label}: {rel}: {a[:70]!r}')
        open(p, 'w', encoding='utf-8', newline='').write(t)
    return misses


def copy_overlay(out):
    src = LP(os.path.join(KIT, 'overlay'))
    for root, _, files in os.walk(src):
        rel = os.path.relpath(root, src)
        dst = os.path.join(out, rel) if rel != '.' else out
        os.makedirs(dst, exist_ok=True)
        for f in files:
            shutil.copy2(os.path.join(root, f), os.path.join(dst, f))
    kit_dst = os.path.join(out, 'tools', 'rebrand')   # ship the kit with the app source
    if os.path.abspath(kit_dst) != os.path.abspath(LP(KIT)):
        shutil.rmtree(kit_dst, ignore_errors=True)
        shutil.copytree(LP(KIT), kit_dst, ignore=shutil.ignore_patterns('__pycache__'))


def main():
    src, out = sys.argv[1], LP(sys.argv[2])
    tmp = None
    if src.lower().endswith('.zip'):
        tmp = tempfile.mkdtemp(prefix='devlabs-')
        with zipfile.ZipFile(src) as z:
            z.extractall(LP(tmp))
        tops = [d for d in os.listdir(LP(tmp)) if os.path.isdir(os.path.join(LP(tmp), d))]
        src = os.path.join(tmp, tops[0]) if len(tops) == 1 else tmp
    src = LP(src)
    if os.path.exists(out):
        sys.exit(f'output folder already exists: {sys.argv[2]} (pick a new one)')
    changed = token_pass(src, out)
    misses = apply_patches(out, PATCHES, 'patch') + apply_patches(out, EXTRAS, 'extra') + apply_patches(out, GUILD, 'guild') + patch_locales(out)
    copy_overlay(out)
    if tmp:
        shutil.rmtree(LP(tmp), ignore_errors=True)
    print(f'{BRAND}: {changed} files rebranded -> {sys.argv[2]}')
    if misses:
        print('\nCheck these by hand (DevLabs changed that code):')
        for m in misses:
            print('  -', m)
    else:
        print('All patches applied.')


if __name__ == '__main__':
    main()
