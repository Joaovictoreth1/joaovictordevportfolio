function normalize(value) {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function filterProjects(projects, category, query, language) {
    const terms = normalize(query).trim().split(/\s+/u).filter(Boolean);
    return projects.filter(project => {
        if (category !== 'all' && project.category !== category) return false;
        const searchable = normalize([
            project.title[language],
            project.desc[language],
            ...project.tags,
        ].join(' '));
        return terms.every(term => searchable.includes(term));
    });
}

export const projectLabels = {
    pt: {
        all: 'Todos',
        categories: 'Categorias de projetos',
        search: 'Buscar projetos por nome ou tecnologia',
        count: count => count === 1 ? '1 projeto encontrado.' : `${count} projetos encontrados.`,
        empty: 'Nenhum projeto corresponde a esta busca e categoria.',
        reset: 'Limpar filtros',
        open: 'Abrir projeto',
    },
    en: {
        all: 'All',
        categories: 'Project categories',
        search: 'Search projects by name or technology',
        count: count => count === 1 ? '1 project found.' : `${count} projects found.`,
        empty: 'No projects match this query and category.',
        reset: 'Clear filters',
        open: 'Open project',
    },
};
