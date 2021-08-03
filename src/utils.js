const { context } = require('@actions/github');

export const generateReplyMessage = (channel, message, color = 'good', ts = Math.floor(Date.now() / 1000)) => {
    const {owner, repo, payload} = context;
    return {
      ts,
      channel,
      attachments: [
        {
          color,
          fields: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: message
              }
            },
            {
              title: 'Pull Request',
              value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
              short: true,
            }
          ],
          footer_icon: 'https://github.githubassets.com/favicon.ico',
          footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
        },
      ]
    }
};
  
export const generateRootMessage = (channel, color = 'good', ts = Math.floor(Date.now() / 1000)) => {
    const {owner, repo, payload, ref } = context;
    return {
      ts,
      channel,
      attachments: [
        {
          color,
          fields: [
            {
              title: `CICD Alerts for ${ref}`,
              value: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
              short: true,
            }
          ],
          footer_icon: 'https://github.githubassets.com/favicon.ico',
          footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`
        },
      ]
    }
}

export const lookUpChannelId = async function({ slack, channel }) {
  let result;
  const formattedChannel = channel.replace(/[#@]/g, '');

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