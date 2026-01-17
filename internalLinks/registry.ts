
import { GUIDE_CONTENT } from '../data/guideContent';

export type LinkItem = {
  id: string;
  title: string;
  type: "tool" | "article";
  url: string;
  aliases: string[];
};

// Manually define tools
const TOOLS: LinkItem[] = [
  {
    id: 'evt-pathway',
    title: 'Thrombectomy Pathway',
    type: 'tool',
    url: '/calculators/evt-pathway',
    aliases: ['Thrombectomy Pathway', 'EVT Calculator', 'Thrombectomy Tool']
  },
  {
    id: 'elan-pathway',
    title: 'ELAN Protocol',
    type: 'tool',
    url: '/calculators/elan-pathway',
    aliases: ['ELAN Protocol', 'ELAN Pathway', 'ELAN Calculator']
  },
  {
    id: 'se-pathway',
    title: 'Status Epilepticus Pathway',
    type: 'tool',
    url: '/calculators/se-pathway',
    aliases: ['Status Epilepticus Pathway', 'SE Pathway', 'SE Protocol']
  },
  {
    id: 'migraine-pathway',
    title: 'Migraine Pathway',
    type: 'tool',
    url: '/calculators/migraine-pathway',
    aliases: ['Migraine Pathway', 'Headache Pathway']
  },
  {
    id: 'gca-pathway',
    title: 'GCA Pathway',
    type: 'tool',
    url: '/calculators/gca-pathway',
    aliases: ['GCA Pathway', 'Giant Cell Arteritis Pathway']
  },
  {
    id: 'nihss-calc',
    title: 'NIHSS Calculator',
    type: 'tool',
    url: '/calculators?id=nihss',
    aliases: ['NIHSS', 'NIH Stroke Scale']
  }
];

// Helper to generate aliases from Article IDs/Titles
const getArticleAliases = (id: string, title: string): string[] => {
  const aliases = [title];
  
  // Specific overrides for common trial names
  if (id === 'defuse-3-trial') aliases.push('DEFUSE 3', 'DEFUSE-3', 'DEFUSE 3 trial');
  if (id === 'dawn-trial') aliases.push('DAWN', 'DAWN trial');
  if (id === 'select2-trial') aliases.push('SELECT2', 'SELECT 2', 'SELECT2 trial');
  if (id === 'angel-aspect-trial') aliases.push('ANGEL-ASPECT', 'ANGEL ASPECT');
  if (id === 'shine-trial') aliases.push('SHINE', 'SHINE trial');
  if (id === 'nascet-trial') aliases.push('NASCET', 'NASCET trial');
  if (id === 'crest-trial') aliases.push('CREST', 'CREST trial');
  if (id === 'chance-trial') aliases.push('CHANCE', 'CHANCE trial');
  if (id === 'point-trial') aliases.push('POINT', 'POINT trial');
  if (id === 'sammpris-trial') aliases.push('SAMMPRIS', 'SAMMPRIS trial');
  if (id === 'socrates-trial') aliases.push('SOCRATES', 'SOCRATES trial');
  if (id === 'sps3-trial') aliases.push('SPS3', 'SPS3 trial');
  if (id === 'sparcl-trial') aliases.push('SPARCL', 'SPARCL trial');
  if (id === 'elan-study') aliases.push('ELAN trial', 'ELAN study'); // Distinction from ELAN Protocol tool
  if (id === 'status-epilepticus') aliases.push('ESETT', 'ESETT trial'); // The article covers ESETT
  if (id === 'distal-trial') aliases.push('DISTAL', 'DISTAL trial');
  if (id === 'escape-mevo-trial') aliases.push('ESCAPE-MeVO', 'ESCAPE MeVO', 'ESCAPE-MeVO trial');
  
  // New Trials
  if (id === 'attention-trial') aliases.push('ATTENTION', 'ATTENTION trial');
  if (id === 'baoche-trial') aliases.push('BAOCHE', 'BAOCHE trial');
  if (id === 'extend-trial') aliases.push('EXTEND', 'EXTEND trial');
  if (id === 'ninds-trial') aliases.push('NINDS', 'NINDS trial');
  if (id === 'ecass3-trial') aliases.push('ECASS III', 'ECASS 3', 'ECASS-3', 'ECASS III trial');
  if (id === 'weave-trial') aliases.push('WEAVE', 'WEAVE trial');
  if (id === 'eagle-trial') aliases.push('EAGLE', 'EAGLE trial');

  return aliases;
};

const ARTICLES: LinkItem[] = Object.values(GUIDE_CONTENT).map(topic => ({
  id: topic.id,
  title: topic.title,
  type: 'article',
  url: topic.category === 'Neuro Trials' ? `/trials/${topic.id}` : `/guide/${topic.id}`,
  aliases: getArticleAliases(topic.id, topic.title)
}));

export const LINK_REGISTRY: LinkItem[] = [...TOOLS, ...ARTICLES];
