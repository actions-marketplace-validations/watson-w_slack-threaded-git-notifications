const { getInput, debug,
  setOutput, setFailed } = require('@actions/core');
const { context } = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const { generateRootMessage,
  generateReplyMessage, lookUpChannelId } = require('./src/utils');

(async () => {
  const channel = getInput('channel');
  const token = process.env.SLACK_BOT_TOKEN;
  const message = getInput('message');
  const ts = getInput('msg_id');
  const color = getInput('color');

  if (!channel && !getInput('channel_id')) {
    setFailed(`You must provider either a 'channel' or a 'channel_id'.`);
    return;
  }

  if (!message) {
    setFailed(`You must specify a message`)
  }

  const slack = new WebClient(token);

  const channelId = getInput('channel_id') || (await lookUpChannelId({ slack, channel }));

  if (!channelId) {
    setFailed(`Slack channel ${channel} could not be found.`);
    return;
  }

  const predicate = `CICD Alerts for ${context.ref}`;
  const queryObject = {
    channelId,
    text: predicate,
  }
  const searchArgs = {
    query: JSON.stringify(queryObject),
    sort: 'timestamp',
    sortDir: 'asc'
  }

  const result = await slack.search.messages(searchArgs)
    .catch((err) => {
      debug('Slack search API threw an error:')
      debug(err);
      setFailed(`Slack search API failure.`);
    });

  // update or generate root message on slack.
  const { matches = [] } = result && result.messages || {};

  let rootMessage = matches[0];

  const slackMethod = rootMessage ? 'update' : 'sendMessage';

  rootMessage = await slack.chat[slackMethod](generateRootMessage(channel, color, ts)).catch((err) => {
    debug('Slack chat API threw an error on root message:')
    debug(err);
    setFailed(`Slack chat API failure.`);
  });

  // update or generate reply message on slack
  const slackReplyMethod = Boolean(ts) ? 'update' : 'sendMessage';
  
  const replyMessage = await slack.chat[slackReplyMethod](generateReplyMessage(channel, message, color, rootMessage.ts)).catch((err) => {
    debug('Slack chat API threw an error on reply message:')
    debug(err);
    setFailed(`Slack chat API failure.`);
  });

  setOutput('message_id', replyMessage.ts);
})();

