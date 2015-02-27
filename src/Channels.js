'use strict';

import _ from 'lodash';
import { Map } from 'immutable';
import Channel from './Channel';

class Channels {
  constructor(bot, channels = []) {
    this.channels = Map({});

    _.each(channels, (channel) => {
      if (! (channel instanceof Channel)) {
        channel = new Channel(bot, channel);
      }

      this.channels = this.channels.set(channel.id, channel);
    });
  }

  getChannel(search) {
    return this.getChannelById(search) || this.getChannelByName(search);
  }

  getChannelById(id) {
    return this.channels.find((channel) => {
      return channel.id === id;
    });
  }

  getChannelByName(name) {
    return this.channels.find((channel) => {
      return channel.name === name;
    });
  }
}

export default Channels;
