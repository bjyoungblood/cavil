'use strict';

import _ from 'lodash';
import { Map } from 'immutable';
import Group from './Group';

class Groups {
  constructor(bot, groups = []) {
    this.groups = Map({});

    _.each(groups, (group) => {
      if (! (group instanceof Group)) {
        group = new Group(bot, group);
      }

      console.log(group);
      this.groups = this.groups.set(group.id, group);
    });
  }

  getGroup(search) {
    return this.getGroupById(search) || this.getGroupByName(search);
  }

  getGroupById(id) {
    return this.groups.find((group) => {
      return group.id === id;
    });
  }

  getGroupByName(name) {
    return this.groups.find((group) => {
      return group.name === name;
    });
  }
}

export default Groups;
