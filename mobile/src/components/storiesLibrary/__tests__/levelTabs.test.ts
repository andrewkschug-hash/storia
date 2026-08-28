import { describe, expect, it } from 'vitest';
import { LIBRARY_TABS } from '@/src/components/storiesLibrary/buildStoryRows';
import { TAB_DESCRIPTIONS, LevelTabs } from '@/src/components/storiesLibrary/LevelTabs';

describe('LevelTabs conveyor belt component', () => {
  it('defines valid tab descriptions for all library tabs', () => {
    expect(LIBRARY_TABS).toEqual(['A1', 'A1+', 'A2', 'A2+', 'B1', 'B1+']);

    for (const tab of LIBRARY_TABS) {
      const info = TAB_DESCRIPTIONS[tab];
      expect(info).toBeDefined();
      expect(info.label).toBe(tab);
      expect(info.sub.length).toBeGreaterThan(0);
    }
  });

  it('exports LevelTabs functional component', () => {
    expect(typeof LevelTabs).toBe('function');
  });

  it('provides descriptive subtitles for all reading levels without empty strings', () => {
    expect(TAB_DESCRIPTIONS['A1'].sub).toBe('Arrivo');
    expect(TAB_DESCRIPTIONS['A1+'].sub).toBe('Appartenenza');
    expect(TAB_DESCRIPTIONS['A2'].sub).toBe('Responsabilità');
    expect(TAB_DESCRIPTIONS['A2+'].sub).toBe('Percorsi');
    expect(TAB_DESCRIPTIONS['B1'].sub).toBe('Due vite');
    expect(TAB_DESCRIPTIONS['B1+'].sub).toBe('La scelta');
  });
});
