# threaded-git-status-notifications

# Reply to PR specific messaging for a given channel.

This action queries the provided channel for a PR specific thread based on the branch name(`CICD Alerts for ${github.context.ref}`), then replies to the thread with the provided input.

## Inputs

### `Channel`

**Required** The channel to limit this search to.

### `Token`

**Required** The Slack Auth Token.

## Outputs

### `messageId`

The Unique Identifier utilized as message UUID by `voxmedia/github-action-slack-notify-build@v1` 

## Example usage

uses: actions/slack-threaded-git-notifications@v1.1
with:
  Channel: ${{secrets.GIT_NOTIFICATION_CHANNEL}}
  Token: ${{secrets.SLACK_BOT_TOKEN}}