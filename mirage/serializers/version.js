/* eslint-disable ember/avoid-leaking-state-in-ember-objects */

import BaseSerializer from './application';

export default BaseSerializer.extend({
  attrs: [
    'crate_id',
    'created_at',
    'downloads',
    'features',
    'id',
    'links',
    'num',
    'updated_at',
    'yanked',
    'license',
    'crate_size',
  ],

  include: ['publishedBy'],

  links(version) {
    return {
      dependencies: `/api/v1/crates/${version.crateId}/${version.num}/dependencies`,
      version_downloads: `/api/v1/crates/${version.crateId}/${version.num}/downloads`,
    };
  },

  getHashForResource() {
    let [hash, addToIncludes] = BaseSerializer.prototype.getHashForResource.apply(this, arguments);

    if (Array.isArray(hash)) {
      for (let resource of hash) {
        this._adjust(resource, addToIncludes);
      }
    } else {
      this._adjust(hash, addToIncludes);
    }

    addToIncludes = addToIncludes.filter(it => it.modelName !== 'user');

    return [hash, addToIncludes];
  },

  _adjust(hash, includes) {
    hash.dl_path = `/api/v1/crates/${hash.crate_id}/${hash.num}/download`;
    hash.crate = hash.crate_id;

    if (hash.published_by_id) {
      let user = includes.find(it => it.modelName === 'user' && it.id === hash.published_by_id);
      hash.published_by = this.getHashForIncludedResource(user)[0].users[0];
    } else {
      hash.published_by = null;
    }

    delete hash.crate_id;
    delete hash.published_by_id;
  },
});
