const { getInput, debug,
  setOutput, setFailed } = require('@actions/core');
const { context } = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const { generateRootMessage,
  generateReplyMessage } = require('./src/utils');

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
  const { messages = { matches: []} } = result;

  let rootMessage = messages.matches[0];

  const slackRootMethod = Boolean(rootMessage) ? 'update' : 'sendMessage';

  rootMessage = await slack.chat[slackRootMethod](generateRootMessage(channel, color, ts)).catch((err) => {
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


async function lookUpChannelId({ slack, channel }) {
  let result;
  const formattedChannel = formatChannelName(channel);

  // Async iteration is similar to a simple for loop.
  // Use only the first two parameters to get an async iterator.
  for await (const page of slack.paginate('conversations.list', { types: 'public_channel, private_channel' })) {
    // You can inspect each page, find your result, and stop the loop with a `break` statement
    const match = page.channels.find(c => c.name === formattedChannel);
    if (match) {
      result = match.id;
      break;
    }
  }

  return result;
}
