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
    const {owner, repo, payload } = context;
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
                text: `CICD Alerts for ${context.ref}`
              }
            },
            {
              title: 'Repo',
              value: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`,
              short: true,
            },
            {
              title: 'Pull Request',
              value: `<${payload.pull_request.html_url} | ${payload.pull_request.title}>`,
              short: true,
            }
          ],
          footer_icon: 'https://github.githubassets.com/favicon.ico',
          footer: `<https://github.com/${owner}/${repo} | ${owner}/${repo}>`
        },
      ]
    }
}

export const formatChannelName = (channel) => {
  return channel.replace(/[#@]/g, '');
}