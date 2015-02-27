'use strict';

class DM {
  constructor(bot, dm) {
    this.bot = bot;

    this.id = dm.id;
    this.name = dm.name;
    this.userId = dm.user;
    this.archived = dm.is_archived;
    this.open = dm.is_open;
  }
}

export default DM;
