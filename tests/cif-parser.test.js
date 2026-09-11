import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCif } from '../public/cif-parser.js';

const header = `data_test
_struct.title
;Two proteins
with a multiline description
;
loop_
_atom_site.label_atom_id
_atom_site.type_symbol
_atom_site.label_comp_id
_atom_site.label_asym_id
_atom_site.label_seq_id
_atom_site.Cartn_x
_atom_site.Cartn_y
_atom_site.Cartn_z
_atom_site.pdbx_PDB_model_num
_atom_site.occupancy
`;

test('selects one alpha carbon per residue and preserves two chain positions', () => {
  const parsed = parseCif(header + `N N ALA A 1 0 0 0 1 1
'CA' C ALA A 1 1 2 3 1 1
C C ALA A 1 2 3 4 1 1
"CA" C GLY B 1 -1 -2 -3 1 1
CA Ca CA C . 10 10 10 1 1
# end
`);
  assert.equal(parsed.residues.length, 2);
  assert.deepEqual(parsed.residues.map(r => r.chain), ['A', 'B']);
  assert.deepEqual(parsed.residues[1].position, [-1, -2, -3]);
});

test('keeps first model and highest occupancy alternate', () => {
  const parsed = parseCif(header + `CA C ALA A 1 1 2 3 1 0.4
CA C ALA A 1 4 5 6 1 0.6
CA C ALA A 1 7 8 9 2 1
`);
  assert.equal(parsed.residues.length, 1);
  assert.equal(parsed.model, '1');
  assert.deepEqual(parsed.residues[0].position, [4, 5, 6]);
});

test('accepts reordered columns, author IDs, and wrapped rows', () => {
  const parsed = parseCif(`data_test
loop_
_atom_site.Cartn_z
_atom_site.auth_asym_id
_atom_site.auth_seq_id
_atom_site.auth_atom_id
_atom_site.Cartn_x
_atom_site.Cartn_y
3 'Protein A' 10 CA
1 2
`);
  assert.equal(parsed.residues[0].chain, 'Protein A');
  assert.deepEqual(parsed.residues[0].position, [1, 2, 3]);
});

test('rejects missing coordinates, incomplete rows, and non-protein files', () => {
  assert.throws(() => parseCif(header + 'CA C ALA A 1 ? 2 3 1 1'), /invalid coordinates/);
  assert.throws(() => parseCif(header + 'CA C ALA'), /Incomplete row/);
  assert.throws(() => parseCif('data_empty'), /No amino-acid/);
});
