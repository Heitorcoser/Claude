# Converte as malhas .asset do Unity (YAML com dados em hexadecimal) para JSON simples,
# já no sistema do Three.js (z invertido e ordem dos triângulos trocada).
import yaml, struct, json, sys, re
A, lista, OUT = sys.argv[1], json.load(open(sys.argv[2]))['malhas'], sys.argv[3]
res = {}
for rel in lista:
    t = open(A + '/' + rel, encoding='utf-8').read()
    d = yaml.load(t.split('\n', 3)[3], Loader=yaml.CSafeLoader)['Mesh']
    vd = d['m_VertexData']; n = vd['m_VertexCount']; ch = vd['m_Channels']
    stride = sum(c['dimension'] * 4 for c in ch if c['stream'] == 0)
    hx = lambda campo: re.sub(r'[\s\\]', '', re.search(campo + r': ?"?([0-9a-f\s\\]+)', t).group(1))  # pode vir entre aspas e em várias linhas
    raw = bytes.fromhex(hx('_typelessdata'))
    def canal(i):
        c = ch[i]; return [struct.unpack_from('<%df' % c['dimension'], raw, v * stride + c['offset']) for v in range(n)]
    pos = canal(0); uv = canal(4) if ch[4]['dimension'] else [(0, 0)] * n
    ib = bytes.fromhex(hx('m_IndexBuffer')); idx = struct.unpack('<%dH' % (len(ib) // 2), ib)
    subs = []
    for s in d['m_SubMeshes']:
        a = s['firstByte'] // 2; tri = list(idx[a:a + s['indexCount']])
        for k in range(0, len(tri), 3): tri[k + 1], tri[k + 2] = tri[k + 2], tri[k + 1]
        subs.append(tri)
    res[rel] = {'p': [round(v, 4) for p in pos for v in (p[0], p[1], -p[2])], 'uv': [round(v, 4) for u in uv for v in u], 'subs': subs}
json.dump(res, open(OUT, 'w'))
print({k: (len(v['p']) // 3, [len(s) // 3 for s in v['subs']]) for k, v in res.items()})
