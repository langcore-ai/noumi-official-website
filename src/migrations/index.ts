import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260410_102102_site_localization from './20260410_102102_site_localization';
import * as migration_20260410_105153_localized_og_and_media_i18n from './20260410_105153_localized_og_and_media_i18n';
import * as migration_20260413_020911_cms_publish_flow from './20260413_020911_cms_publish_flow';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260410_102102_site_localization.up,
    down: migration_20260410_102102_site_localization.down,
    name: '20260410_102102_site_localization',
  },
  {
    up: migration_20260410_105153_localized_og_and_media_i18n.up,
    down: migration_20260410_105153_localized_og_and_media_i18n.down,
    name: '20260410_105153_localized_og_and_media_i18n',
  },
  {
    up: migration_20260413_020911_cms_publish_flow.up,
    down: migration_20260413_020911_cms_publish_flow.down,
    name: '20260413_020911_cms_publish_flow'
  },
];
