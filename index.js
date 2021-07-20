const { getInput, debug,
  setOutput, setFailed } = require('@actions/core');
const { context } = require('@actions/github');
const { WebClient } = require('@slack/web-api');
const { generateRootMessage,
  generateReplyMessage } = require('./src/utils');

(async () => {
  const channel = getInput('channel');
  const token = getInput('token');
  const message = getInput('message');
  const ts = getInput('msg_id');
  const color = getInput('color');

  const slack = new WebClient(token);

  const predicate = `CICD Alerts for ${context.ref}`;
  const queryObject = {
    channel,
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
  let rootMessage = result?.messages?.matches[0];

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
