import * as migration_20260422_085454_initial from './20260422_085454_initial';
import * as migration_20260422_180500_add_html_render_mode from './20260422_180500_add_html_render_mode';
import * as migration_20260422_182200_add_blog_html_card_fields from './20260422_182200_add_blog_html_card_fields';

export const migrations = [
  {
    up: migration_20260422_085454_initial.up,
    down: migration_20260422_085454_initial.down,
    name: '20260422_085454_initial'
  },
  {
    up: migration_20260422_180500_add_html_render_mode.up,
    down: migration_20260422_180500_add_html_render_mode.down,
    name: '20260422_180500_add_html_render_mode'
  },
  {
    up: migration_20260422_182200_add_blog_html_card_fields.up,
    down: migration_20260422_182200_add_blog_html_card_fields.down,
    name: '20260422_182200_add_blog_html_card_fields'
  },
];
