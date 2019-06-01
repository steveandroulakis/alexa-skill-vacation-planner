# Vacation Planner Skill

### Coded June 1st 2019

By androua@amazon.com -- used for an upcoming video course

Part of the Master Builder program

## File breakdown:

- `index.js` -- the main skill handler code that runs as the skill's Lambda endpoint
- `package.json` -- used by Lambda to make the ASK SDK available to index.js
- `apl_document.json` -- a 'hooray' type screen for when your vacation has arrived
- `en-US.json` -- This is the skill's model. Can be pasted into the voice model
  on developer.amazon.com under `Build -> Interaction Model -> JSON Editor`
- `sections/` -- each file is a stage of the code for the video lesson

_Note:_ This skill is an overly simplistic example only and not meant to be published.
