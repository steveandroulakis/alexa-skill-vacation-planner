/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

// this screen view is shown when the user's vacation is finally here
const apl_document = require('apl_document.json');

// triggered if the user has already saved a vacation date
// displays how many days to go until a user's vacation
const HasVacationLaunchRequestHandler = {
    async canHandle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        
        // pull any existing vacation info from DynamoDb
        const sessionAttributes = await
        attributesManager.getPersistentAttributes();
        
        // save as session attributes for use in the handler
        // note: we don't care if a user has specified a year or not
        // if they only give month/day then we assume it's the next
        // instance of that date (i.e. this year or next year)
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

        // getting the next vacation date for comparison
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

        // make sure the user's vacation isn't in the past
        if (currentDate.getFullYear() <= currentYear) {
          
          
          
          const diffDays = Math.round(Math.abs((currentDate.getTime() - nextVacation) / oneDay));
          speechText = `Welcome back. It looks like there are ${diffDays} days until your vacation.`;
          
          if(diffDays < 2) {
            speechText = `<prosody volume="x-loud">
              <audio src='soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_02'/>
              ${randomSpeech(YAY)}</prosody> It's vacation time!`;
              
            if (supportsAPL(handlerInput)) {
              console.log('SUPPORTS APL');
              resp.addDirective({
                type : 'Alexa.Presentation.APL.RenderDocument',
                document : apl_document.document,
                datasources : apl_document.datasources
              });
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

const HELP_MESSAGE = `Say, for example. My vacation is november third, and 
  I'll remember it for later.`;
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Say open vacation planner another time. Goodbye.';


function randomSpeech(speech_list) {
    const rand = Math.floor(Math.random() * speech_list.length);

    return speech_list[rand];
}

const YAY = ['<say-as interpret-as="interjection">aloha!</say-as>',
            '<say-as interpret-as="interjection">bon voyage!</say-as>',
            '<say-as interpret-as="interjection">huzzah!</say-as>',
            '<say-as interpret-as="interjection">woo hoo!</say-as>',
            '<say-as interpret-as="interjection">yay!</say-as>'];
            
  
// took this function from an Amazon Developer forum post :)          
function supportsAPL(handlerInput) { 
  const supportedInterfaces = 
  handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface != null && aplInterface != undefined; 
}


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
