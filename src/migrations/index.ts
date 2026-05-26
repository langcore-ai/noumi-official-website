import * as migration_20260422_085454_initial from './20260422_085454_initial'
import * as migration_20260422_180500_add_html_render_mode from './20260422_180500_add_html_render_mode'
import * as migration_20260422_182200_add_blog_html_card_fields from './20260422_182200_add_blog_html_card_fields'
import * as migration_20260423_020800_add_autosave_to_version_tables from './20260423_020800_add_autosave_to_version_tables'
import * as migration_20260423_091500_add_invite_requests_collection from './20260423_091500_add_invite_requests_collection'
import * as migration_20260424_142500_add_faq_legal_html_mode from './20260424_142500_add_faq_legal_html_mode'
import * as migration_20260430_095800_add_use_cases_page from './20260430_095800_add_use_cases_page'
import * as migration_20260511_142500_add_features_page from './20260511_142500_add_features_page'
import * as migration_20260511_151800_add_feature_pages_collection from './20260511_151800_add_feature_pages_collection'
import * as migration_20260525_132000_add_friendly_links from './20260525_132000_add_friendly_links'
import * as migration_20260525_160000_add_about_page from './20260525_160000_add_about_page'
import * as migration_20260526_104000_add_friendly_link_html_mode from './20260526_104000_add_friendly_link_html_mode'

export const migrations = [
  {
    up: migration_20260422_085454_initial.up,
    down: migration_20260422_085454_initial.down,
    name: '20260422_085454_initial',
  },
  {
    up: migration_20260422_180500_add_html_render_mode.up,
    down: migration_20260422_180500_add_html_render_mode.down,
    name: '20260422_180500_add_html_render_mode',
  },
  {
    up: migration_20260422_182200_add_blog_html_card_fields.up,
    down: migration_20260422_182200_add_blog_html_card_fields.down,
    name: '20260422_182200_add_blog_html_card_fields',
  },
  {
    up: migration_20260423_020800_add_autosave_to_version_tables.up,
    down: migration_20260423_020800_add_autosave_to_version_tables.down,
    name: '20260423_020800_add_autosave_to_version_tables',
  },
  {
    up: migration_20260423_091500_add_invite_requests_collection.up,
    down: migration_20260423_091500_add_invite_requests_collection.down,
    name: '20260423_091500_add_invite_requests_collection',
  },
  {
    up: migration_20260424_142500_add_faq_legal_html_mode.up,
    down: migration_20260424_142500_add_faq_legal_html_mode.down,
    name: '20260424_142500_add_faq_legal_html_mode',
  },
  {
    up: migration_20260430_095800_add_use_cases_page.up,
    down: migration_20260430_095800_add_use_cases_page.down,
    name: '20260430_095800_add_use_cases_page',
  },
  {
    up: migration_20260511_142500_add_features_page.up,
    down: migration_20260511_142500_add_features_page.down,
    name: '20260511_142500_add_features_page',
  },
  {
    up: migration_20260511_151800_add_feature_pages_collection.up,
    down: migration_20260511_151800_add_feature_pages_collection.down,
    name: '20260511_151800_add_feature_pages_collection',
  },
  {
    up: migration_20260525_132000_add_friendly_links.up,
    down: migration_20260525_132000_add_friendly_links.down,
    name: '20260525_132000_add_friendly_links',
  },
  {
    up: migration_20260525_160000_add_about_page.up,
    down: migration_20260525_160000_add_about_page.down,
    name: '20260525_160000_add_about_page',
  },
  {
    up: migration_20260526_104000_add_friendly_link_html_mode.up,
    down: migration_20260526_104000_add_friendly_link_html_mode.down,
    name: '20260526_104000_add_friendly_link_html_mode',
  },
]
