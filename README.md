# Vacation Planner Skill

### Coded June 1st 2019

By androua@amazon.com -- used for an upcoming video course

Part of the Master Builder program

## File breakdown

- `index.js` -- the main skill handler code that runs as the skill's Lambda endpoint
- `package.json` -- used by Lambda to make the ASK SDK available to index.js
- `apl_document.json` -- a 'hooray' type screen for when your vacation has arrived
- `en-US.json` -- This is the skill's model. Can be pasted into the voice model
  on developer.amazon.com under `Build -> Interaction Model -> JSON Editor`
- `sections/` -- each file is a stage of the code for the video lesson

_Note:_ This skill is an overly simplistic example only and not meant to be published.


## Deployment

The video lesson that demonstrates the building of this skill will be linked here soon.
To summarize here:

Create the skill on amazon.developer.com
- Select `Custom` and `Provision Your Own` and then `Create Skill`
- Select `Fact Skill`
- Go to the `Build` screen of the skill, find `JSON Editor` under `Interaction Model`
- Replace the JSON with the en-US.json code in this repository
- Save the model, build the model

Log into AWS
- `Create Function` and select from the serverless repository
- Choose `alexa-skills-kit-nodejs-factskill`
- Use the code editor in Lambda to replace `index.js`, and add `apl_document.json`
- Save the function
- Copy the ARN from the top right of the function screen

Link the skill with the new lambda function
- Select `Endpoint` under `Interaction Model` and paste the ARN collected above
- Select `Interfaces` and then toggle the `Alexa Presentation Language` on
- Save the model, build the model
- You can now click `Test` and use the skill in the simulator

## Usage

Set your vacation date with the utterance:

`tell vacation planner my vacation is december fifteen`

Once a date is saved, you can find out how close you are to your vacation by opening
the skill:

`open vacation planner`

Once you're within a day of your vacation, you'll get a hype screen
and some sound effects :)
