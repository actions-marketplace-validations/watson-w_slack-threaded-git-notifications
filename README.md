# slack-threaded-git-notifications

# Reply to PR specific messaging for a given channel.

This action queries the provided channel for a PR specific thread based on the branch name(`CICD Alerts for ${github.context.ref}`), then replies to the thread with the provided input.

If no thread exists, this action will create one, then reply to it.

## Inputs

### `channel`

**Required** The channel name for Git status reporting

### `channel_id`

**Required** The channel ID for Git status reporting. This parameter takes president over `channel`

### `message`

**Required** The message to reply to the main thread.

### `message_id`

**Optional** Message time stamp of a reply to update.

### `color`

**Optional** RAG status of the current message. This color is applied to the root message as well.

## Outputs

### `message_id`

The unique identifier associated with the newly posted message.

## Example usage

uses: watson-w/slack-threaded-git-notifications@v0.3
with:
  channel: git
  message: Executing E2E tests
  color: warning
env:
  SLACK_BOT_TOKEN: ${{ secrets.SLACK_NOTIFICATIONS_BOT_TOKEN }}