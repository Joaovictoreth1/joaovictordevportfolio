import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterProjects, projectLabels } from './project-search.mjs';

const project = {
    title: { pt: 'Gestão de Projetos', en: 'Project Management' },
    desc: { pt: 'Fluxo de aprovação', en: 'Approval workflow' },
    category: 'backend',
    tags: ['Node.js', 'PostgreSQL'],
};

test('matches every token across localized text and technology tags', () => {
    assert.deepEqual(filterProjects([project], 'all', 'GESTAO postgresql', 'pt'), [project]);
    assert.deepEqual(filterProjects([project], 'backend', 'workflow node', 'en'), [project]);
    assert.deepEqual(filterProjects([project], 'all', 'approval', 'pt'), []);
});

test('retains the selected category independently of the query and language', () => {
    assert.deepEqual(filterProjects([project], 'edge', 'node', 'pt'), []);
    assert.deepEqual(filterProjects([project], 'edge', '   ', 'en'), []);
    assert.deepEqual(filterProjects([project], 'backend', '   ', 'en'), [project]);
    assert.equal(projectLabels.pt.count(1), '1 projeto encontrado.');
    assert.equal(projectLabels.en.count(0), '0 projects found.');
});
