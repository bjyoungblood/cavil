'use strict';

class User {
  constructor(bot, user) {
    this.bot = bot;

    this.id = user.id;
    this.username = user.name;
    this.realName = user.real_name;
    this.timezone = user.tz;
    this.profile = user.profile;
    this.status = user.status;
    this.deleted = user.deleted;
  }
}

export default User;
