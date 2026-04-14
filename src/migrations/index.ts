import * as migration_20260414_022830_initial_schema from './20260414_022830_initial_schema';
import * as migration_20260414_072840_home_html_sections from './20260414_072840_home_html_sections';
import * as migration_20260414_073141_home_html_cta_footnote from './20260414_073141_home_html_cta_footnote';

export const migrations = [
  {
    up: migration_20260414_022830_initial_schema.up,
    down: migration_20260414_022830_initial_schema.down,
    name: '20260414_022830_initial_schema',
  },
  {
    up: migration_20260414_072840_home_html_sections.up,
    down: migration_20260414_072840_home_html_sections.down,
    name: '20260414_072840_home_html_sections',
  },
  {
    up: migration_20260414_073141_home_html_cta_footnote.up,
    down: migration_20260414_073141_home_html_cta_footnote.down,
    name: '20260414_073141_home_html_cta_footnote'
  },
];
