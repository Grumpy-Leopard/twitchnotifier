# Serverless Twitch Notifier

## Requirements

- [Serverless](https://serverless.com/framework/docs/providers/aws/guide/quick-start/) installed and configured (including the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/installing.html))
- Environment variables set for:
  - `TWITCH_CLIENT_ID` = Client ID for the [Twitch API](https://dev.twitch.tv/docs/authentication/#registration)
  - `TWITCH_CLIENT_HUB_SECRET` = Any string that will be used for [Twitch API HMAC signatures](https://dev.twitch.tv/docs/api/webhooks-guide/#getting-notifications)

## Limitations

- Currently has no UI at all, entries are manually added to database tables.
- Limited verification of event streams
- Support only for Go-Live events via Discord Webhooks

## Support

This is provided with no support whatsoever, as it is a personal project. If you use it for something, I'd love to hear from you. Pull requests welcome for anything from typos to refactors!

## Credits

Currently all code written by myself with no contributions.