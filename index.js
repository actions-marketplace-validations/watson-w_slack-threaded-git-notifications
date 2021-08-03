const { getInput, debug,
  setOutput, setFailed } = require('@actions/core');
const { context } = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const { generateRootMessage,
  generateReplyMessage, lookUpChannelId } = require('./src/utils');

(async () => {
  const channel = getInput('channel'); // channel to post to
  const token = process.env.SLACK_BOT_TOKEN; // slack bock token
  const message = getInput('message'); // Text to send in message
  const ts = getInput('msg_id'); // ID of the message to update
  const color = getInput('color'); // Current status of the check

  // validate input
  if (!channel && !getInput('channel_id')) {
    setFailed(`You must provider either a 'channel' or a 'channel_id'.`);
    return;
  }

  if (!message) {
    setFailed(`You must specify a message`)
  }

  // initialize slack utility
  const slack = new WebClient(token);

  // obtain slack channel ID
  const channelId = getInput('channel_id') || (await lookUpChannelId({ slack, channel }));

  if (!channelId) {
    setFailed(`Slack channel ${channel} could not be found.`);
    return;
  }

  // define search parameters for root messages.
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

  // search for root message.
  const result = await slack.search.messages(searchArgs)
    .catch((err) => {
      debug('Slack search API threw an error:')
      debug(err);
      setFailed(`Slack search API failure.`);
    });

  // update or generate root message on slack.
  const { matches = [] } = result && result.messages || {};

  let rootMessage = matches[0];

  if(rootMessage) {
    rootMessage = await slack.chat.update(generateRootMessage(channel, color, ts)).catch((err) => {
      debug('Slack chat API threw an error on root message:')
      debug(err);
      setFailed(`Slack chat API failure.`);
    });
  } else {
    rootMessage = await slack.chat.postMessage(generateRootMessage(channel, color, ts)).catch((err) => {
      debug('Slack chat API threw an error on root message:')
      debug(err);
      setFailed(`Slack chat API failure.`);
    });
  }

  // update or generate reply message on slack
  let replyMessage;
  if(Boolean(ts)) {
    replyMessage = await slack.chat.update(generateReplyMessage(channel, message, color, rootMessage.ts)).catch((err) => {
      debug('Slack chat API threw an error on reply message:')
      debug(err);
      setFailed(`Slack chat API failure.`);
    });
  } else {
    replyMessage = await slack.chat.postMessage(generateReplyMessage(channel, message, color, rootMessage.ts)).catch((err) => {
      debug('Slack chat API threw an error on reply message:')
      debug(err);
      setFailed(`Slack chat API failure.`);
    });
  }

  setOutput('message_id', replyMessage.ts);
})();

