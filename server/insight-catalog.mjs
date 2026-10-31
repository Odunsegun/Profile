// Owner-approved card metadata, 29 October 2026. Facts are joined by name from
// profile.json; ordering is explicit and does not depend on array position.
const PROJECTS = [
  { slug: 'azure-fitness-tracker', name: 'Azure Fitness Tracker', section: 'featured', order: 10,
    image: { src: '/assets/fitness-tracker.png', alt: 'Azure Fitness Tracker dashboard showing activity streaks and progress' } },
  { slug: 'football-tracking', name: 'Football Tracking', section: 'featured', order: 20,
    image: { src: '/assets/ML-photo.png', alt: 'Annotated Spain versus France match frame with player track IDs and movement overlays' } },
  { slug: 'enterprise-network-security-lab', name: 'Enterprise Network Security Lab', section: 'featured', order: 30 },
  { slug: 'interstellar-cannon', name: 'Interstellar Cannon', section: 'featured', order: 40,
    image: { src: '/assets/interstellar-cannon.png', alt: 'Interstellar Cannon simulation showing the Sun, planets, and a projectile path' } },
  { slug: 'hotel-management-system', name: 'Hotel Management System', section: 'archive', order: 50 },
  { slug: 'vacation-finder', name: 'Vacation Finder App', section: 'archive', order: 60 },
  { slug: 'web-ctf', name: 'CTF Web Security Challenge', section: 'archive', order: 70 },
  { slug: 'r-internet-analysis', name: 'R Internet Analysis', section: 'archive', order: 80 },
];
const INTERNAL = new Set([
  ...PROJECTS.map(item => `/projects/${item.slug}/`),
  '/experience/constellation-software/', '/profile.json',
]);
const IMAGES = new Set(PROJECTS.flatMap(item => item.image ? [item.image.src] : []));
const EXTERNAL = new Set([
  'https://github.com/Odunsegun/azure-fitness-tracker',
  'https://github.com/Odunsegun/football-tracking',
  'https://github.com/Odunsegun/enterprise-network-security-lab',
  'https://github.com/Odunsegun/Interstellar-Cannon',
  'https://github.com/Odunsegun/Hotel-Management-System',
  'https://github.com/Odunsegun/Vacation-Finder-App',
  'https://github.com/Odunsegun/Capture-The-Flag-CTF-Web-Security-Challenge',
  'https://github.com/Odunsegun/R-Internet-Analysis',
  'https://wonderful-forest-08c0abc0f.1.azurestaticapps.net/',
]);
export const RICH_LIMITS = Object.freeze({ cards: 2, sources: 3, followUps: 3, followUpCharacters: 160 });
export function approvedUrl(value, kind = 'link') {
  if (typeof value !== 'string') return null;
  if (kind === 'image') return IMAGES.has(value) ? value : null;
  if (kind === 'internal') return INTERNAL.has(value) ? value : null;
  return INTERNAL.has(value) || EXTERNAL.has(value) ? value : null;
}

export function createCatalog(profile) {
  const records = new Map();
  const projects = [...profile.projects, ...(profile.also || [])];
  for (const metadata of PROJECTS) {
    const matches = projects.filter(project => project.name === metadata.name);
    if (matches.length !== 1) continue;
    const project = matches[0];
    const record = {
      id: `project:${metadata.slug}`, type: 'project', title: project.name,
      summary: project.description, tags: [...project.technologies],
      detailUrl: `/projects/${metadata.slug}/`, image: metadata.image ? { ...metadata.image } : null,
      links: [{ label: 'GitHub', url: project.link }, ...(project.live ? [{ label: 'Live demo', url: project.live }] : [])],
      section: metadata.section, order: metadata.order,
    };
    records.set(record.id, record);
  }
  const internship = profile.experience.find(item => item.company === 'HomeBuilder (Constellation Software)');
  if (internship) records.set('experience:constellation-software', {
    id: 'experience:constellation-software', type: 'experience', title: 'HomeBuilder · Constellation Software',
    summary: `${internship.title}, ${internship.dates}. ${internship.summary}`,
    // Tags supported by the public Constellation record in js/experience-data.js.
    tags: ['REST APIs', 'OpenAPI', 'Automated testing'],
    detailUrl: '/experience/constellation-software/', image: null, links: [], section: 'experience', order: 10,
  });
  const credentialLabel = item => item.name.match(/\(([^)]+)\)$/)?.[1] || item.name;
  const earned = profile.certifications.filter(item => item.status === 'earned');
  const planned = profile.plannedCertifications || [];
  records.set('profile:certifications', {
    id: 'profile:certifications', type: 'credentials', title: 'Credentials & preparation',
    summary: `Earned: ${earned.map(credentialLabel).join(', ')}.${planned.length ? ` Preparation/plans: ${planned.map(item => `${credentialLabel(item)} (${item.status})`).join(', ')}.` : ''}`,
    tags: [`${earned.length} earned`, `${planned.length} in preparation/planned`],
    // This public record includes AZ-900; the certifications page currently does not.
    detailUrl: '/profile.json', image: null, links: [], section: 'credentials', order: 10,
  });
  return records;
}

export function responseFormat(catalog) {
  const ids = [...catalog.keys()];
  return {
    type: 'json_schema',
    json_schema: {
      name: 'insight_reply', strict: true,
      schema: {
        type: 'object', additionalProperties: false,
        required: ['reply', 'cardIds', 'sourceIds', 'followUps'],
        properties: {
          reply: { type: 'string' },
          cardIds: { type: 'array', items: { type: 'string', enum: ids }, maxItems: RICH_LIMITS.cards },
          sourceIds: { type: 'array', items: { type: 'string', enum: ids }, maxItems: RICH_LIMITS.sources },
          followUps: { type: 'array', items: { type: 'string', maxLength: RICH_LIMITS.followUpCharacters }, maxItems: RICH_LIMITS.followUps },
        },
      },
    },
  };
}

export function catalogContext(catalog) {
  // The model selects IDs; it has no reason to generate card URLs or image paths.
  return [...catalog.values()].map(({ id, type, title, summary, tags, section, order }) =>
    ({ id, type, title, summary, tags, section, order }));
}

function safeCard(record) {
  const detailUrl = approvedUrl(record?.detailUrl, 'internal');
  if (!detailUrl || !['project', 'experience', 'credentials'].includes(record.type) ||
      typeof record.title !== 'string' || typeof record.summary !== 'string') return null;
  const imageSrc = approvedUrl(record.image?.src, 'image');
  return {
    id: record.id, type: record.type, title: record.title, summary: record.summary,
    tags: Array.isArray(record.tags) ? record.tags.filter(tag => typeof tag === 'string').slice(0, 8) : [],
    detailUrl,
    image: imageSrc && typeof record.image.alt === 'string' && record.image.alt.trim()
      ? { src: imageSrc, alt: record.image.alt } : null,
    links: (Array.isArray(record.links) ? record.links : []).flatMap(link => {
      const url = approvedUrl(link?.url);
      return url && typeof link.label === 'string' ? [{ label: link.label, url }] : [];
    }).slice(0, 3),
  };
}

export function resolveReply(value, catalog) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      typeof value.reply !== 'string' || !value.reply.trim() || value.reply.length > 16000 ||
      Object.keys(value).some(key => !['reply', 'cardIds', 'sourceIds', 'followUps'].includes(key)) ||
      !['cardIds', 'sourceIds', 'followUps'].every(key => Array.isArray(value[key]) && value[key].every(item => typeof item === 'string'))) {
    throw new Error('Invalid structured reply');
  }
  const select = (ids, limit) => [...new Set(ids)].flatMap(id => {
    const record = catalog.get(id);
    const card = record && safeCard(record);
    return card ? [card] : [];
  }).slice(0, limit);
  const cards = select(value.cardIds, RICH_LIMITS.cards);
  // A displayed card always has its actual public supporting record linked.
  const sources = select([...cards.map(card => card.id), ...value.sourceIds], RICH_LIMITS.sources)
    .map(({ id, title, detailUrl }) => ({ id, title, url: detailUrl }));
  const followUps = [...new Set(value.followUps.map(question => question.trim()))]
    .filter(question => question.length > 0 && question.length <= RICH_LIMITS.followUpCharacters)
    .slice(0, RICH_LIMITS.followUps);
  return { reply: value.reply.trim(), cards, sources, followUps };
}
