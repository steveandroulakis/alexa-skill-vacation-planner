/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

const HasVacationLaunchRequestHandler = {
    async canHandle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        
        const sessionAttributes = await
        attributesManager.getPersistentAttributes();
        console.log(sessionAttributes);

        const month = sessionAttributes.hasOwnProperty('month') ?
            sessionAttributes.month : 0;
        const day = sessionAttributes.hasOwnProperty('day') ?
            sessionAttributes.day : 0;
            
        attributesManager.setSessionAttributes(sessionAttributes);

        // if the user launched the skill AND already has vacation information
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest' &&
            month &&
            day;

    },
    async handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const year = sessionAttributes.hasOwnProperty('year') ? sessionAttributes.year : 0;
        const month = sessionAttributes.hasOwnProperty('month') ? sessionAttributes.month : 0;
        const day = sessionAttributes.hasOwnProperty('day') ? sessionAttributes.day : 0;

        // getting the current date with the time
        const currentDateTime = new Date(new Date().toLocaleString("en-US"));

        // removing the time from the date because it affects our difference calculation
        const currentDate = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate());
        
        // if a user didn't specify a year, then assume the next year
        let currentYear = year;
        if(!year) {
          currentYear = currentDate.getFullYear();
        }

        // getting the next vacation
        let nextVacation = Date.parse(`${month} ${day}, ${currentYear}`);
        console.log(currentDate.getFullYear());
        console.log(`${month} ${day}, ${currentYear}`);

        // adjust the nextVacation by one year if the current date is next year
        if (currentDate.getTime() > nextVacation) {
            nextVacation = Date.parse(`${month} ${day}, ${currentYear + 1}`);
        }

        const oneDay = 24 * 60 * 60 * 1000;
        
        let speechText = "";
        const resp = handlerInput.responseBuilder;

        if (currentDate.getFullYear() <= currentYear) {
          
          console.log(currentDate.getTime());
          console.log(nextVacation);
          
          const diffDays = Math.round(Math.abs((currentDate.getTime() - nextVacation) / oneDay));
          speechText = `Welcome back. It looks like there are ${diffDays} days until your vacation.`;
          
          if(diffDays < 2) {
            speechText = `Woo! It's vacation time.`;
          }
          
        }
        else
        {
          speechText = `Welcome back. It looks like your vacation was in the past. Maybe it's time for another.`;
        }
        
        resp.speak(speechText)
        .withShouldEndSession(true);
            
        return resp.getResponse();
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Hey. When are you going on vacation?';
        const repromptText = 'When was that?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .getResponse();
    }
};

const CaptureVacationIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.intent.name === 'CaptureVacationIntentHandler';
  },
  async handle(handlerInput) {
        const year = handlerInput.requestEnvelope.request.intent.slots.year.value || "";
        const month = handlerInput.requestEnvelope.request.intent.slots.month.value || "";
        const day = handlerInput.requestEnvelope.request.intent.slots.day.value || "";

        const attributesManager = handlerInput.attributesManager;
        const vacationAttributes = {
            "year": year,
            "month": month,
            "day": day
        };

        attributesManager.setPersistentAttributes(vacationAttributes);
        await attributesManager.savePersistentAttributes();

        const speechText = `You're going on vacation on ${month} ${day} ${year}.`;
          
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    HasVacationLaunchRequestHandler,
    LaunchRequestHandler,
    CaptureVacationIntentHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
    // create a DynamoDb table with a partition key of 'id' (string)
  .withTableName('VacationSkillUsers')
  .lambda();
