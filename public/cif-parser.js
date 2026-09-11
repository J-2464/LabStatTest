// Read mmCIF tokens, including quoted values and semicolon-delimited text.
function* tokens(text) {
  text = text.replace(/\r\n?/g, '\n');
  let i = 0;
  while (i < text.length) {
    if (/\s/.test(text[i])) { i++; continue; }
    if (text[i] === '#') { while (i < text.length && text[i] !== '\n') i++; continue; }
    if (text[i] === ';' && (i === 0 || text[i - 1] === '\n')) {
      const end = text.indexOf('\n;', i + 1);
      if (end < 0) throw new Error('Unterminated CIF text field.');
      yield { value: text.slice(i + 1, end), quoted: true };
      i = end + 2;
    } else if (text[i] === "'" || text[i] === '"') {
      const quote = text[i++], start = i;
      while (i < text.length && !(text[i] === quote && (i + 1 === text.length || /\s/.test(text[i + 1])))) i++;
      if (i === text.length) throw new Error('Unterminated CIF quoted value.');
      yield { value: text.slice(start, i++), quoted: true };
    } else {
      const start = i;
      while (i < text.length && !/\s/.test(text[i])) i++;
      yield { value: text.slice(start, i), quoted: false };
    }
  }
}

export function parseCif(text) {
  const iterator = tokens(text);
  let token = iterator.next();
  const next = () => { token = iterator.next(); };
  const control = t => !t.quoted && /^(?:_|loop_$|stop_$|data_|save_|global_$)/i.test(t.value);
  const residues = new Map();
  let firstModel;
  while (!token.done) {
    if (token.value.quoted || token.value.value.toLowerCase() !== 'loop_') { next(); continue; }
    next();
    const headers = [];
    while (!token.done && !token.value.quoted && token.value.value.startsWith('_')) {
      headers.push(token.value.value.toLowerCase()); next();
    }
    if (!headers.length) throw new Error('CIF loop is missing column names.');
    const atomLoop = headers.some(h => h.startsWith('_atom_site.'));
    const columns = new Map(headers.map((h, i) => [h.replace('_atom_site.', ''), i]));
    if (atomLoop && !['cartn_x', 'cartn_y', 'cartn_z'].every(h => columns.has(h))) {
      throw new Error('The atom table is missing 3D coordinates.');
    }
    while (!token.done && !control(token.value)) {
      const row = [];
      for (let i = 0; i < headers.length; i++) {
        if (token.done || control(token.value)) throw new Error('Incomplete row in CIF table.');
        row.push(token.value.value); next();
      }
      if (!atomLoop) continue;
      const get = (...names) => {
        for (const name of names) {
          const value = row[columns.get(name)];
          if (value !== undefined && value !== '.' && value !== '?') return value;
        }
      };
      if (get('label_atom_id', 'auth_atom_id') !== 'CA') continue;
      // Calcium ions also use CA as their atom name; only carbon qualifies.
      if (get('type_symbol') && get('type_symbol').toUpperCase() !== 'C') continue;
      const sequence = get('label_seq_id', 'auth_seq_id');
      if (!sequence) continue;
      const model = get('pdbx_pdb_model_num') || '1';
      firstModel ??= model;
      if (model !== firstModel) continue;
      const chain = get('label_asym_id', 'auth_asym_id');
      if (!chain) throw new Error('A protein residue is missing its chain identifier.');
      const position = ['cartn_x', 'cartn_y', 'cartn_z'].map(h => Number(get(h)));
      if (!position.every(Number.isFinite)) throw new Error('A protein residue has invalid coordinates.');
      const insertion = get('pdbx_pdb_ins_code') || '';
      const key = JSON.stringify([chain, sequence, insertion]);
      const occupancy = Number(get('occupancy') ?? 1);
      const residue = { chain, sequence, insertion, name: get('label_comp_id', 'auth_comp_id') || 'UNK', position, occupancy };
      if (!residues.has(key) || occupancy > residues.get(key).occupancy) residues.set(key, residue);
    }
  }
  if (!residues.size) throw new Error('No amino-acid alpha carbons found. Choose an AlphaFold mmCIF structure file.');
  return { residues: [...residues.values()], model: firstModel };
}
