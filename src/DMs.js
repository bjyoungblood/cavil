'use strict';

import _ from 'lodash';
import { Map } from 'immutable';
import DM from './DM';

class DMs {
  constructor(bot, dms = []) {
    this.dms = Map({});

    _.each(dms, (dm) => {
      if (! (dm instanceof DM)) {
        dm = new DM(bot, dm);
      }

      this.dms = this.dms.set(dm.id, dm);
    });
  }

  getDM(search) {
    return this.getDMById(search) || this.getDMByName(search);
  }

  getDMById(id) {
    return this.dms.find((dm) => {
      return dm.id === id;
    });
  }

  getDMByUserId(userId) {
    return this.dms.find((dm) => {
      return dm.userId === userId;
    });
  }
}

export default DMs;
