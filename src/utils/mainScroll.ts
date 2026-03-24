export function getMainScrollElement(): HTMLElement | null {
  if (typeof document === 'undefined') return null;

  const main = document.querySelector('main');
  return main instanceof HTMLElement ? main : null;
}

export function scrollMainToTop(behavior: ScrollBehavior = 'auto') {
  const main = getMainScrollElement();
  if (main) {
    main.scrollTo({ top: 0, behavior });
    return;
  }

  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior });
  }
}

export function scrollWithinMainOrWindow(target: HTMLElement, offset: number, behavior: ScrollBehavior = 'smooth') {
  const main = getMainScrollElement();

  if (main) {
    const elementTop = target.offsetTop - main.offsetTop;
    main.scrollTo({ top: elementTop - offset, behavior });
    return;
  }

  if (typeof window !== 'undefined') {
    const elementTop = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementTop - offset, behavior });
  }
}
