'use strict';

import Promise from 'bluebird';
import { EventEmitter2 } from 'eventemitter2';
import WebSocket from 'ws';
import request from 'request';
import { Map } from 'immutable';

import Users from './Users';
import Channels from './Channels';
import Groups from './Groups';
import DMs from './DMs';

const API_BASE_URL = 'https://slack.com/api/';

const SLACK_EVENTS = {
  hello : 'hello',
  message : 'message',

  channel_marked : 'channel.marked',
  channel_created : 'channel.created',
  channel_joined : 'channel.joined',
  channel_left : 'channel.left',
  channel_deleted : 'channel.deleted',
  channel_rename : 'channel.rename',
  channel_archive : 'channel.archive',
  channel_unarchive : 'channel.unarchive',
  channel_history_changed : 'channel.history_changed',

  im_created : 'im.created',
  im_open : 'im.open',
  im_close : 'im.close',
  im_marked : 'im.marked',
  im_history_changed : 'im.history_changed',

  group_joined : 'group.joined',
  group_left : 'group.left',
  group_open : 'group.open',
  group_close : 'group.close',
  group_archive : 'group.archive',
  group_unarchive : 'group.unarchive',
  group_rename : 'group.rename',
  group_marked : 'group.marked',
  group_history_changed : 'group.history_changed',

  file_created : 'file.created',
  file_shared : 'file.shared',
  file_unshared : 'file.unshared',
  file_public : 'file.public',
  file_private : 'file.private',
  file_change : 'file.change',
  file_deleted : 'file.deleted',

  file_comment_added : 'file.comment.added',
  file_comment_edited : 'file.comment.edited',
  file_comment_deleted : 'file.comment.deleted',

  presence_change : 'presence.change',

  manual_presence_change : 'presence.change.manual',
  pref_change : 'pref.change',

  user_change : 'user.change',
  user_typing : 'user.typing',

  team_join : 'team.join',

  star_added : 'star.added',
  star_removed : 'star.removed',

  emoji_changed : 'emoji.changed',

  commands_changed : 'commands.changed',

  team_pref_change : 'team.pref_change',
  team_rename : 'team.rename',
  team_domain_change : 'team.domain_change',

  email_domain_changed : 'email.domain_changed',

  bot_added : 'bot.added',
  bot_changed : 'bot.changed',

  accounts_changed : 'accounts.changed',
};

class Bot extends EventEmitter2 {
  constructor(token, botName) {

    super({
      wildcard : true,
      delimiter : '.',
      newListener : false,
      maxListeners : 20,
    });

    this.botName = botName;

    this.token = token;
    this.seq = 0;

    this.replyHandlers = Map({});
  }

  connect() {
    return this.apiRequest('rtm.start', {})
      .then((slackData) => {
        this.userData = slackData.self;
        this.team = slackData.team;

        this.channels = new Channels(this, slackData.channels);
        this.groups = new Groups(this, slackData.groups);
        this.dms = new DMs(this, slackData.ims);
        this.users = new Users(this, slackData.users);

        return this._wsConnect(slackData.url);
      });
  }

  message(channel, message) {
    this.apiRequest('chat.postMessage', {
      channel : channel,
      text : message,
      link_names : 1,
      username : this.botName,
    });
  }

  replyToMessage(message, reply) {
    this.apiRequest('chat.postMessage', {
      channel : message.channel,
      text : reply,
      link_names : 1,
      username : this.botName,
    });
  }

  messageGroup(group, message) {
    let groupObj = this.groups.getGroup(group);

    this.apiRequest('chat.postMessage', {
      channel : groupObj.id,
      text : message,
      link_names : 1,
      username : this.botName,
    });
  }

  messageUser(user, message) {
    let userObj = this.users.getUser(user);
    let dm = this.dms.getDMByUserId(userObj.id);

    this.apiRequest('chat.postMessage', {
      channel : dm.id,
      text : message,
      link_names : 1,
      username : this.botName,
    });
  }

  apiRequest(method, data = {}) {
    return new Promise((resolve, reject) => {
      data.token = this.token;
      request.post(API_BASE_URL + method, (error, response, body) => {
        if (error) {
          return reject(error);
        }

        resolve(JSON.parse(body));

      }).form(data);
    });
  }

  addMentionHandler(regexp, handler) {
    this.on('mention', (message) => {
      if (message.text.match(regexp)) {
        handler(message);
      }
    });
  }

  _handleMessage(message) {
    let selfId = this.userData.id;

    let regex = new RegExp('<@' + selfId + '>', 'i');

    if (regex.test(message.text)) {
      this.emit('mention', message);
    } else {
      this.emit('message', message);
    }
  }

  _wsConnect(dataUrl) {
    this.ws = new WebSocket(dataUrl);

    this.ws.on('open', () => {
      this.emit('connect');
    });

    this.ws.on('close', () => {
      this.emit('close');
    });

    this.ws.on('message', (event) => {
      event = JSON.parse(event);

      if (event.type && SLACK_EVENTS[event.type]) {
        let type = SLACK_EVENTS[event.type];

        if (type === 'message') {
          this._handleMessage(event);
        } else {
          this.emit(type, event);
        }
      } else if (event.type && ! SLACK_EVENTS[event.type]) {
        console.log('Unhandled event type: ' + event.type);
      }
    });
  }
}

export default Bot;
