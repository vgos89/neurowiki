
import { LINK_REGISTRY, LinkItem } from './registry';
import { EVT_CONTENT, ELAN_CONTENT, SE_CONTENT, MIGRAINE_CONTENT } from '../data/toolContent';

// Aggregate all tool text into search corpus.
// GCA pathway retired 2026-05-15 (tool was not validated).
const TOOL_CORPUS: Record<string, string[]> = {
  'evt-pathway': Object.values(EVT_CONTENT),
  'elan-pathway': Object.values(ELAN_CONTENT),
  'se-pathway': Object.values(SE_CONTENT),
  'migraine-pathway': Object.values(MIGRAINE_CONTENT),
};

export const getBacklinks = (articleId: string): LinkItem[] => {
  const article = LINK_REGISTRY.find(i => i.id === articleId && i.type === 'article');
  if (!article) return [];

  const foundTools: Set<string> = new Set();

  Object.entries(TOOL_CORPUS).forEach(([toolId, texts]) => {
    const fullText = texts.join(' ').toLowerCase();
    
    // Check if any alias of the article is present in the tool text
    const hasReference = article.aliases.some(alias => {
        // Simple case-insensitive match
        // Note: This matches "ELAN" in "ELAN Protocol" which is correct
        const regex = new RegExp(`\\b${alias.toLowerCase()}\\b`);
        return regex.test(fullText);
    });

    if (hasReference) {
        foundTools.add(toolId);
    }
  });

  return Array.from(foundTools)
    .map(tid => LINK_REGISTRY.find(i => i.id === tid))
    .filter((item): item is LinkItem => !!item);
};
