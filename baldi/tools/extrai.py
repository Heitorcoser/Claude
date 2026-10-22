# Lê a cena School.unity (YAML de texto do projeto descompilado) e gera um JSON com:
# objetos visíveis (malha, material, matriz no mundo), colisores e objetos especiais (scripts).
import yaml, re, json, sys, os, glob, math
A = sys.argv[1]  # pasta Assets
CENA = sys.argv[2]
OUT = sys.argv[3]
# guid -> caminho, a partir dos .meta
guid = {}
for m in glob.glob(A + '/**/*.meta', recursive=True):
    g = re.search(r'^guid: (\w+)', open(m, encoding='utf-8', errors='ignore').read(), re.M)
    if g: guid[g.group(1)] = m[:-5]
txt = open(CENA, encoding='utf-8').read()
docs = {}
for parte in re.split(r'^--- ', txt, flags=re.M)[1:]:
    cab, corpo = parte.split('\n', 1)
    m = re.match(r'!u!(\d+) &(-?\d+)', cab)
    if not m: continue
    try: d = yaml.load(corpo, Loader=yaml.CSafeLoader)
    except Exception: continue
    k = list(d)[0]
    docs[int(m.group(2))] = (int(m.group(1)), k, d[k])
print('docs', len(docs), file=sys.stderr)
T = {i: v for i, (t, k, v) in docs.items() if t in (4, 224)}
go = {i: v for i, (t, k, v) in docs.items() if t == 1}
def comps(gid):
    return [docs.get(c['component']['fileID']) for c in go[gid].get('m_Component', []) if c['component']['fileID'] in docs]
def mat_trs(t):
    p, q, s = t['m_LocalPosition'], t['m_LocalRotation'], t['m_LocalScale']
    x, y, z, w = q['x'], q['y'], q['z'], q['w']
    R = [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
         [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
         [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]]
    M = [[R[r][c] * [s['x'], s['y'], s['z']][c] for c in range(3)] + [[p['x'], p['y'], p['z']][r]] for r in range(3)]
    return M + [[0, 0, 0, 1]]
def mul(a, b): return [[sum(a[r][k] * b[k][c] for k in range(4)) for c in range(4)] for r in range(4)]
mundo = {}
def W(tid):
    if tid in mundo: return mundo[tid]
    t = T[tid]; M = mat_trs(t); f = t['m_Father']['fileID']
    if f and f in T: M = mul(W(f), M)
    mundo[tid] = M; return M
def ativo(gid):  # ativo na hierarquia
    while True:
        if not go[gid].get('m_IsActive', 1): return False
        tr = next((c for c in comps(gid) if c and c[0] in (4, 224)), None)
        f = tr[2]['m_Father']['fileID'] if tr else 0
        if not f or f not in T: return True
        gid = T[f]['m_GameObject']['fileID']
# Unity (mão esquerda) -> Three.js (mão direita): inverte z. M' = S M S
def conv(M):
    S = [1, 1, -1, 1]
    return [M[r][c] * S[r] * S[c] for c in range(4) for r in range(4)]  # coluna-maior, como o Three.js
MALHA = {10210: 'quad', 10202: 'cube', 10206: 'cylinder', 10207: 'sphere', 10209: 'plane', 10208: 'capsule'}
mats, malhas, objs, cols, especiais = {}, {}, [], [], []
def material(ref):
    g = ref.get('guid')
    if not g: return None
    if g in mats: return g
    p = guid.get(g)
    if not p or not p.endswith('.mat'): mats[g] = None; return g
    d = yaml.load(open(p).read().split('\n', 3)[3], Loader=yaml.CSafeLoader)['Material']
    tex = None; esc = [1, 1]; off = [0, 0]
    for e in d['m_SavedProperties'].get('m_TexEnvs', []):
        if '_MainTex' in e:
            v = e['_MainTex']; tg = v['m_Texture'].get('guid')
            if tg and tg in guid: tex = os.path.relpath(guid[tg], A)
            esc = [v['m_Scale']['x'], v['m_Scale']['y']]; off = [v['m_Offset']['x'], v['m_Offset']['y']]
    cor = [1, 1, 1, 1]
    for e in d['m_SavedProperties'].get('m_Colors', []):
        if '_Color' in e: c = e['_Color']; cor = [c['r'], c['g'], c['b'], c['a']]
    sh = d.get('m_Shader', {}).get('guid', '')
    mats[g] = {'nome': d['m_Name'], 'tex': tex, 'esc': esc, 'off': off, 'cor': cor, 'shader': os.path.basename(guid.get(sh, sh))}
    return g
scripts = {}
sprites = []
def caminho(gid):  # nomes dos pais, para saber de quem é cada sprite
    nomes = []
    while True:
        tr = next((c for c in comps(gid) if c and c[0] in (4, 224)), None)
        f = tr[2]['m_Father']['fileID'] if tr else 0
        if not f or f not in T: return '/'.join(reversed(nomes))
        gid = T[f]['m_GameObject']['fileID']; nomes.append(go[gid]['m_Name'])
def sprite_info(ref):
    g = ref.get('guid'); p = guid.get(g)
    if not p: return None
    meta = open(p + '.meta', encoding='utf-8', errors='ignore').read()
    ppu = re.search(r'spritePixelsToUnits: ([\d.]+)', meta); piv = re.search(r'spritePivot: {x: ([\d.]+), y: ([\d.]+)}', meta)
    return {'tex': os.path.relpath(p, A), 'ppu': float(ppu.group(1)) if ppu else 100, 'piv': [float(piv.group(1)), float(piv.group(2))] if piv else [0.5, 0.5]}
for gid, g in go.items():
    at = ativo(gid)
    cs = [c for c in comps(gid) if c]
    for c in cs:
        if c[0] == 212:
            tr = next((x for x in g['m_Component'] if docs.get(x['component']['fileID'], (0,))[0] in (4, 224)), None)
            if not tr: continue
            M3 = conv(W(tr['component']['fileID'])); si = sprite_info(c[2].get('m_Sprite', {}))
            if si: sprites.append(dict(si, n=g['m_Name'], pai=caminho(gid), a=int(at and c[2].get('m_Enabled', 1)), fx=c[2].get('m_FlipX', 0), cor=c[2].get('m_Color'), M=[round(v, 4) for v in M3]))
    if not at:
        for c in cs:
            if c[0] == 114:
                sg = c[2].get('m_Script', {}).get('guid'); nome = os.path.basename(guid.get(sg, sg or '?')).replace('.cs', '')
                tr = next((x for x in g['m_Component'] if docs.get(x['component']['fileID'], (0,))[0] in (4, 224)), None)
                if tr:
                    M3 = conv(W(tr['component']['fileID']))
                    campos = {k: v for k, v in c[2].items() if not k.startswith('m_') and not isinstance(v, (dict, list))}
                    especiais.append({'s': nome, 'n': g['m_Name'], 'a': 0, 'pai': caminho(gid), 'pos': [M3[12], M3[13], M3[14]], 'campos': campos})
        continue
    cs = [c for c in comps(gid) if c]
    tr = next((c for c in cs if c[0] in (4, 224)), None)
    if not tr: continue
    tid = next(c['component']['fileID'] for c in g['m_Component'] if docs.get(c['component']['fileID'], (0,))[0] in (4, 224))
    M = W(tid); M3 = conv(M)
    mf = next((c for c in cs if c[0] == 33), None); mr = next((c for c in cs if c[0] == 23), None)
    if mf and mr and mr[2].get('m_Enabled', 1):
        mm = mf[2]['m_Mesh']; fid = mm.get('fileID')
        if fid in MALHA and mm.get('guid', '').startswith('0000'): malha = MALHA[fid]
        elif mm.get('guid') in guid: malha = os.path.relpath(guid[mm['guid']], A); malhas[malha] = 1
        else: malha = None
        if malha:
            objs.append({'n': g['m_Name'], 'm': malha, 'mat': [material(x) for x in mr[2].get('m_Materials', [])], 'M': [round(v, 4) for v in M3]})
    for c in cs:
        if c[0] == 65 and c[2].get('m_Enabled', 1):  # BoxCollider
            cols.append({'n': g['m_Name'], 't': 'box', 'trig': c[2].get('m_IsTrigger', 0), 'c': c[2]['m_Center'], 's': c[2]['m_Size'], 'M': [round(v, 4) for v in M3], 'tag': g.get('m_TagString')})
        if c[0] == 64 and c[2].get('m_Enabled', 1):  # MeshCollider
            mm = c[2]['m_Mesh']; fid = mm.get('fileID')
            malha = MALHA.get(fid) if mm.get('guid', '').startswith('0000') else (os.path.relpath(guid[mm['guid']], A) if mm.get('guid') in guid else None)
            if malha: cols.append({'n': g['m_Name'], 't': 'mesh', 'm': malha, 'trig': c[2].get('m_IsTrigger', 0), 'M': [round(v, 4) for v in M3], 'tag': g.get('m_TagString')})
        if c[0] == 114:
            sg = c[2].get('m_Script', {}).get('guid')
            nome = os.path.basename(guid.get(sg, sg or '?')).replace('.cs', '')
            scripts[nome] = scripts.get(nome, 0) + 1
            if True or nome in ('NotebookScript', 'PickupScript', 'DoorScript', 'SwingingDoorScript', 'BaldiScript', 'PrincipalScript', 'PlaytimeScript', 'SweepScript', 'CraftersScript', 'FirstPrizeScript', 'BullyScript', 'PlayerScript', 'ExitTriggerScript', 'AILocationSelectorScript', 'EntranceScript', 'FacultyTriggerScript', 'TapePlayerScript', 'GameControllerScript', 'AlarmClockScript', 'EndlessNotebookScript', 'HuggingScript', 'MathGameScript', 'CraftersTriggerScript', 'DetentionTextScript', 'MouseoverScript', 'ClickableTest', 'AmbienceScript'):
                campos = {k: v for k, v in c[2].items() if not k.startswith('m_') and not isinstance(v, (dict, list))}
                especiais.append({'s': nome, 'a': 1, 'pai': caminho(gid), 'n': g['m_Name'], 'tag': g.get('m_TagString'), 'pos': [M3[12], M3[13], M3[14]], 'M': [round(v, 4) for v in M3], 'campos': campos})
def resolve(v):
    if isinstance(v, dict) and 'fileID' in v and len(v) <= 3:
        i = v['fileID']
        if i in T: return {'ref': go.get(T[i]['m_GameObject']['fileID'], {}).get('m_Name'), 'pos': conv(W(i))[12:15]}
        if i in go: return {'ref': go[i]['m_Name'], 'go': i}
        if i in docs: d = docs[i]; g = d[2].get('m_GameObject', {}).get('fileID'); return {'ref': go.get(g, {}).get('m_Name'), 'tipo': d[0]}
        return None
    if isinstance(v, list): return [resolve(x) for x in v]
    return v
for t, k, v in docs.values():
    if t != 114: continue
    g = v.get('m_GameObject', {}).get('fileID')
    for e in especiais:
        if e.get('_gid') == g: pass
refs = []
for i, (t, k, v) in docs.items():
    if t != 114: continue
    sg = v.get('m_Script', {}).get('guid'); nome = os.path.basename(guid.get(sg, sg or '?')).replace('.cs', '')
    g = v.get('m_GameObject', {}).get('fileID')
    r = {kk: resolve(vv) for kk, vv in v.items() if not kk.startswith('m_') and isinstance(vv, (dict, list))}
    r = {kk: vv for kk, vv in r.items() if vv not in (None, [], {})}
    refs.append({'s': nome, 'n': go.get(g, {}).get('m_Name'), 'refs': r})
json.dump({'refs': refs, 'sprites': sprites, 'objs': objs, 'mats': mats, 'malhas': list(malhas), 'cols': cols, 'esp': especiais}, open(OUT, 'w'))
print('objs', len(objs), 'mats', len(mats), 'malhas', len(malhas), 'cols', len(cols), 'esp', len(especiais), file=sys.stderr)
print(json.dumps(scripts), file=sys.stderr)
