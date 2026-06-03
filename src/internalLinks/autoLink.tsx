
import React from 'react';
import {
  Link } from 'react-router-dom';
import { LINK_REGISTRY,
  TRIAL_MODAL_PATTERNS,
} from './registry';

// Sort by alias length descending to match longest phrases first (e.g. "DAWN trial" before "DAWN")
const SORTED_ITEMS = LINK_REGISTRY.flatMap(item => 
  item.aliases.map(alias => ({ ...item, alias }))
).sort((a, b) => b.alias.length - a.alias.length);

const MAX_LINKS_PER_PAGE = 8;

export const autoLinkReactNodes = (
  text: string, 
  openTrial?: (slug: string) => void
): React.ReactNode[] => {
  if (!text) return [];
  
  let nodes: React.ReactNode[] = [text];
  let linkCount = 0;
  const usedIds = new Set<string>();

  // Iterate through all registry items
  for (const item of SORTED_ITEMS) {
    if (linkCount >= MAX_LINKS_PER_PAGE) break;
    
    // Check if we've already linked this ID in this block (prevent double linking same target)
    if (usedIds.has(item.id)) continue;

    const newNodes: React.ReactNode[] = [];
    let matchedInThisItem = false;

    // Process existing nodes
    for (const node of nodes) {
      if (typeof node !== 'string') {
        newNodes.push(node);
        continue;
      }

      // Regex escape function
      const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for whole words/phrases, case insensitive
      // We use word boundaries \b to avoid linking "DAWN" inside "Dawned"
      const regex = new RegExp(`\\b(${escapeRegExp(item.alias)})\\b`, 'i');
      
      const parts = node.split(regex);
      
      if (parts.length > 1 && !matchedInThisItem) {
        // We found a match in this text node
        // parts[0] = before, parts[1] = match, parts[2] = after...
        // We only link the FIRST occurrence per alias per invocation to avoid spam
        for (let i = 0; i < parts.length; i++) {
          if (i === 1) {
             // This is the match
             const matchedText = parts[i];
             
             // Check if this is a trial that should open in a modal
             const trialSlug = TRIAL_MODAL_PATTERNS[matchedText];
             const isTrialModalLink = trialSlug !== undefined;
             
             if (isTrialModalLink && openTrial) {
               // Render as button that opens modal
               newNodes.push(
                 <button
                   key={`trial-btn-${item.id}-${i}`}
                   onClick={(e) => {
                     e.preventDefault();
                     openTrial(trialSlug);
                   }}
                   className="text-neuro-600 hover:text-neuro-700 underline decoration-neuro-300 hover:decoration-neuro-500 transition-colors cursor-pointer font-semibold underline-offset-2"
                 >
                   {matchedText}
                 </button>
               );
             } else {
               // Regular navigation link
               newNodes.push(
                 <Link key={`${item.id}-${i}`} to={item.url} className="text-neuro-600 hover:underline font-semibold decoration-neuro-200 underline-offset-2">
                   {matchedText}
                 </Link>
               );
             }
             
             matchedInThisItem = true;
             usedIds.add(item.id);
             linkCount++;
          } else {
             newNodes.push(parts[i]);
          }
        }
      } else {
        newNodes.push(node);
      }
    }
    nodes = newNodes;
  }

  // Clean up empty strings
  return nodes.filter(n => n !== "");
};

// Recursive processor for React Element trees (e.g. from ReactMarkdown)
export const processNodesForLinking = (
  children: React.ReactNode,
  openTrial?: (slug: string) => void
): React.ReactNode => {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return autoLinkReactNodes(child, openTrial);
    }
    
    if (React.isValidElement(child)) {
      const element = child as React.ReactElement<any>;
      const type = element.type;
      // Don't link inside existing links or code blocks
      if (type === 'a' || type === 'code' || type === 'pre') {
        return child;
      }
      
      // Recurse
      if (element.props.children) {
        return React.cloneElement(element, {
          ...element.props,
          children: processNodesForLinking(element.props.children, openTrial)
        });
      }
    }
    return child;
  });
};
