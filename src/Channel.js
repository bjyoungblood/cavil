'use strict';

class Channel {
  constructor(bot, group) {
    this.bot = bot;

    this.id = group.id;
    this.name = group.name;
    this.creatorId = group.creator;
    this.archived = group.is_archived;
    this.open = group.is_open;
  }
}

export default Channel;
