# Pair programming exercise: Double Message Part 2

## Contents

## Goal

## Getting started

Work with the scaffolding in the `skeleton` folder. Here are the other things
you'll need to get started:

- Sendgrid: a Sendgrid account (for sending and receiving email). You'll need a
  [Sendgrid API key](https://app.sendgrid.com/settings/api_keys).

## Phase 6. Outgoing email

Let's add support for outgoing email as well. We're going to use Sendgrid as our
email provider. Grab your [Sendgrid API
key](https://app.sendgrid.com/settings/api_keys) and install the
[sendgrid-nodejs](https://github.com/sendgrid/sendgrid-nodejs) package.

As with Twilio, we'll need a user's Sendgrid API key to send and receive
messages on their behalf.

## Phase 9. Incoming email

We'll be using the [Sendgrid Inbound parse
webhook](https://sendgrid.com/docs/API_Reference/Webhooks/parse.html) to receive
incoming messages. Set up the webhook, and set up an endpoint that Sendgrid can
call when it receives an incoming message.

## Phase 10. OAuth

The final phase of this project involves letting a user log in using their
Facebook credentials rather than using a username and password. Stop and give
this problem some thought, and you'll realize that it's more complex than it
seems at first glance, because there are a lot of different cases that we need
to account for:

- If a user registers for a new account using Facebook.
- If a user who is already registered using Facebook subsequently tries to
  register using a username and password.
- If a user registers with a username and password, then subsequently tries to
  register, or log in, using Facebook.
- If a user who is already registered with a username and password wants to link
  their Facebook account so that they can log in using Facebook in the future.
- If a user wants to unlink their Facebook account.

