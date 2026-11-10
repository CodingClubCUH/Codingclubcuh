import * as migration_20260909_182033_init from './20260909_182033_init';
import * as migration_20261110_123000_add_locked_documents_rels_contact_and_notices from './20261110_123000_add_locked_documents_rels_contact_and_notices';

export const migrations = [
  {
    up: migration_20260909_182033_init.up,
    down: migration_20260909_182033_init.down,
    name: '20260909_182033_init'
  },
  {
    up: migration_20261110_123000_add_locked_documents_rels_contact_and_notices.up,
    down: migration_20261110_123000_add_locked_documents_rels_contact_and_notices.down,
    name: '20261110_123000_add_locked_documents_rels_contact_and_notices'
  },
];
