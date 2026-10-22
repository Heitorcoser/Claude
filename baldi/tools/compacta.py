# Organiza o escola.json bruto no formato que o jogo usa (app/escola.json).
import json, math, sys
d = json.load(open(sys.argv[1]))
ap = lambda M, x, y, z: [M[0]*x + M[4]*y + M[8]*z + M[12], M[1]*x + M[5]*y + M[9]*z + M[13], M[2]*x + M[6]*y + M[10]*z + M[14]]
r2 = lambda v: round(v, 2)
# materiais
mats, mi = [], {}
for g, m in d['mats'].items():
    if m: mi[g] = len(mats); mats.append({'n': m['nome'], 'tex': m['tex'], 'rep': m['esc'], 'off': m['off'], 'cor': m['cor']})
# entradas (paredes que descem quando o Baldi fica bravo) por proximidade
ent = [e for e in d['esp'] if e['s'] == 'EntranceScript']
def entrada(p):
    b = min(ent, key=lambda e: (e['pos'][0] - p[0]) ** 2 + (e['pos'][2] - p[2]) ** 2)
    return b['n'] if math.hypot(b['pos'][0] - p[0], b['pos'][2] - p[2]) < 25 else None
# portas: o script fica no _DoorOut; junta os quads e a barreira mais próximos
portas = []
for e in d['esp']:
    if e['s'] in ('DoorScript', 'SwingingDoorScript'):
        portas.append({'tipo': 'vaivem' if e['s'] == 'SwingingDoorScript' else 'porta', 'pos': [r2(v) for v in e['pos']], 'quads': [], 'bar': None, 'pai': e['pai']})
def porta_de(p, raio=2.5):
    b = min(portas, key=lambda q: (q['pos'][0] - p[0]) ** 2 + (q['pos'][2] - p[2]) ** 2)
    return b if math.hypot(b['pos'][0] - p[0], b['pos'][2] - p[2]) < raio else None
objs = []
for o in d['objs']:
    M = o['M']; mt = [mi.get(g) for g in o['mat']]
    if o['n'] in ('_DoorIn', '_DoorOut'):
        q = porta_de(M[12:15])
        if q: q['quads'].append({'M': M, 'mat': mt[0], 'lado': o['n']}); continue
    item = {'m': o['m'], 'mat': mt, 'M': M}
    if o['n'] == 'WallEntrance': item['ent'] = entrada(M[12:15])
    objs.append(item)
# colisão: paredes viram segmentos no chão (x,z); caixas viram retângulos girados
segs, caixas, gat = [], [], []
for c in d['cols']:
    M = c['M']
    if c['t'] == 'mesh' and c['m'] == 'quad' and not c['trig']:
        a = ap(M, -.5, -.5, 0); b = ap(M, .5, -.5, 0); t = ap(M, -.5, .5, 0)
        if abs(t[1] - a[1]) < 0.5: continue  # chão e teto
        s = {'a': [r2(a[0]), r2(a[2])], 'b': [r2(b[0]), r2(b[2])], 'y': [r2(min(a[1], t[1])), r2(max(a[1], t[1]))]}
        if c['n'] == '_Barrier' or c['n'] == '_DoorIn':
            q = porta_de(M[12:15], 3)
            if q:
                if c['n'] == '_Barrier' or q['bar'] is None: q['bar'] = s
                continue
        if c['n'] == 'WallEntrance': s['ent'] = entrada(M[12:15])
        if c['n'] == 'EntranceDoor': s['saida'] = 1
        segs.append(s)
    elif c['t'] == 'box':
        cen = ap(M, c['c']['x'], c['c']['y'], c['c']['z'])
        ex = [math.hypot(M[0], M[2]) * c['s']['x'] / 2, abs(M[5]) * c['s']['y'] / 2, math.hypot(M[8], M[10]) * c['s']['z'] / 2]
        ang = math.atan2(M[2], M[0])
        b = {'n': c['n'], 'c': [r2(cen[0]), r2(cen[1]), r2(cen[2])], 'h': [r2(ex[0]), r2(ex[1]), r2(ex[2])], 'ang': round(ang, 4)}
        if c['trig']: gat.append(b)
        else: caixas.append(b)
# objetos especiais
esp = [{'s': e['s'], 'n': e['n'], 'a': e['a'], 'pos': [r2(v) for v in e['pos']], 'campos': e.get('campos', {})} for e in d['esp']
       if e['s'] not in ('Billboard', 'PickupAnimationScript', 'f70555f144d8491a825f0804e09c671c', 'f4688fdb7df04437aeb418b961361dc5', 'DoorScript', 'SwingingDoorScript')]
spr = [{'n': s['n'], 'pai': s['pai'], 'tex': s['tex'], 'ppu': s['ppu'], 'piv': s['piv'], 'a': s['a'], 'M': s['M']} for s in d['sprites']]
ronda = next(r for r in d['refs'] if r['s'] == 'AILocationSelectorScript')['refs']['newLocation']
pontos = {k: v['pos'] for r in d['refs'] if r['s'] in ('PrincipalScript', 'CraftersScript') for k, v in r['refs'].items() if isinstance(v, dict) and 'pos' in v and 'Point' in k}
out = {'mats': mats, 'objs': objs, 'portas': portas, 'segs': segs, 'caixas': caixas, 'gat': gat, 'esp': esp, 'spr': spr,
       'ronda': [[r2(p['pos'][0]), r2(p['pos'][2])] for p in ronda], 'pontos': pontos}
json.dump(out, open(sys.argv[2], 'w'), separators=(',', ':'))
print('objs', len(objs), 'portas', len(portas), [len(p['quads']) for p in portas], 'sem barreira', sum(1 for p in portas if not p['bar']), 'segs', len(segs), 'caixas', len(caixas), 'gat', len(gat), 'ronda', len(ronda))
print(pontos)
