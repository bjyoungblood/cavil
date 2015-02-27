'use strict';

import _ from 'lodash';
import { Map } from 'immutable';
import User from './User';

class Users {
  constructor(bot, users = []) {
    this.users = Map({});

    _.each(users, (user) => {
      if (! (user instanceof User)) {
        user = new User(bot, user);
      }

      this.users = this.users.set(user.id, user);
    });
  }

  getUser(search) {
    return this.getUserById(search) || this.getUserByUsername(search);
  }

  getUserById(id) {
    return this.users.find((user) => {
      return user.id === id;
    });
  }

  getUserByUsername(username) {
    return this.users.find((user) => {
      return user.username === username;
    });
  }
}

export default Users;
