/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
'use strict';

const apiai = require('apiai');
const uuid = require('node-uuid');
const botbuilder = require('botbuilder');
const fs = require('fs');

var welcomeAdaptiveCard1 = fs.readFileSync('./resources/welcome_adaptive_card.json');
const welcomeAdaptiveCard = JSON.parse(welcomeAdaptiveCard1);

var dctapPreSetupAdaptiveCard1 = fs.readFileSync('./resources/dctap_pre_setup_adaptive_card.json');
const dctapPreSetupAdaptiveCard = JSON.parse(dctapPreSetupAdaptiveCard1);

var dctapSetupAdaptiveCard1 = fs.readFileSync('./resources/dctap_setup_adaptive_card.json');
const dctapSetupAdaptiveCard = JSON.parse(dctapSetupAdaptiveCard1);

var dctapPostSetupAdaptiveCard1 = fs.readFileSync('./resources/dctap_post_setup_adaptive_card.json');
const dctapPostSetupAdaptiveCard = JSON.parse(dctapPostSetupAdaptiveCard1);

var ctapPreSetupAdaptiveCard1 = fs.readFileSync('./resources/ctap_pre_setup_adaptive_card.json');
const ctapPreSetupAdaptiveCard = JSON.parse(ctapPreSetupAdaptiveCard1);

var ctapSetupAdaptiveCard1 = fs.readFileSync('./resources/ctap_setup_adaptive_card.json');
const ctapSetupAdaptiveCard = JSON.parse(ctapSetupAdaptiveCard1);

var ctapPostSetupAdaptiveCard1 = fs.readFileSync('./resources/ctap_post_setup_adaptive_card.json');
const ctapPostSetupAdaptiveCard = JSON.parse(ctapPostSetupAdaptiveCard1);

var pyTestPreSetupAdaptiveCard1 = fs.readFileSync('./resources/pytest_pre_setup_adaptive_card.json');
const pyTestPreSetupAdaptiveCard = JSON.parse(pyTestPreSetupAdaptiveCard1);

var pyTestSetupAdaptiveCard1 = fs.readFileSync('./resources/pytest_setup_adaptive_card.json');
const pyTestSetupAdaptiveCard = JSON.parse(pyTestSetupAdaptiveCard1);

var pyTestPostSetupAdaptiveCard1 = fs.readFileSync('./resources/pytest_post_setup_adaptive_card.json');
const pyTestPostSetupAdaptiveCard = JSON.parse(pyTestPostSetupAdaptiveCard1);

var codeCheckinAdaptiveCard1 = fs.readFileSync('./resources/code_checkin_adaptive_card.json');
const codeCheckinAdaptiveCard = JSON.parse(codeCheckinAdaptiveCard1);

var messagesHeroCard1 = fs.readFileSync('./resources/messages_hero_card.json');
var messages = JSON.parse(messagesHeroCard1);

module.exports = class SkypeBot {

    get apiaiService() {
        return this._apiaiService;
    }

    set apiaiService(value) {
        this._apiaiService = value;
    }

    get botConfig() {
        return this._botConfig;
    }

    set botConfig(value) {
        this._botConfig = value;
    }

    get botService() {
        return this._botService;
    }

    set botService(value) {
        this._botService = value;
    }

    get sessionIds() {
        return this._sessionIds;
    }

    set sessionIds(value) {
        this._sessionIds = value;
    }

    constructor(botConfig) {
        this._botConfig = botConfig;
        var apiaiOptions = {
            language: botConfig.apiaiLang,
            requestSource: "skype"
        };

        this._apiaiService = apiai(botConfig.apiaiAccessToken, apiaiOptions);
        this._sessionIds = new Map();

        this.botService = new botbuilder.ChatConnector({
            appId: this.botConfig.skypeAppId,
            appPassword: this.botConfig.skypeAppSecret
        });

        var inMemoryStorage = new botbuilder.MemoryBotStorage();
        this._bot = new botbuilder.UniversalBot(this.botService).set('storage', inMemoryStorage); // Register in memory storage
        //this._bot = new botbuilder.UniversalBot(this.botService);

        this._bot.dialog('/', (session) => {
            console.log('dialog dialog dialog.... ');
            if (session.message && session.message.text) {
                this.processMessage(session);
            }
        });

    }

    processMessage(session) {
        console.log('Giri :: Response from dialog flow ::', session);
        let messageText = session.message.text;
        let sender = session.message.address.conversation.id;
        if (messageText && sender) {
            console.log(sender, messageText);
            if (!this._sessionIds.has(sender)) {
                this._sessionIds.set(sender, uuid.v1());
            }
            let apiaiRequest = this._apiaiService.textRequest(messageText,
                {
                    sessionId: this._sessionIds.get(sender),
                    originalRequest: {
                        data: session.message,
                        source: "skype"
                    }
                });

            apiaiRequest.on('response', (response) => {
                console.log(sender, "Received api.ai response");
                if (this._botConfig.devConfig) {
                    console.log(sender, "Received api.ai response");
                }

                if (SkypeBot.isDefined(response.result) && SkypeBot.isDefined(response.result.fulfillment)) {
                    let responseText = response.result.fulfillment.speech;
                    let responseMessages = response.result.fulfillment.messages;
                    console.log('Giri :: responseText '+responseText);
                    console.log('Giri :: responseMessages '+JSON.stringify(responseMessages));

                    if (SkypeBot.isDefined(responseMessages) && responseMessages.length > 0) {
                       // this.doRichContentResponse(session, responseMessages);
                        this.getMessage(session, responseMessages, responseText);
                        //session.send("testing....");
                    } else if (SkypeBot.isDefined(responseText)) {
                        console.log(sender, 'Response as text message');
                        session.send(responseText);

                    } else {
                        console.log(sender, 'Received empty speech');
                    }
                } else {
                    console.log(sender, 'Received empty result');
                }
            });

            apiaiRequest.on('error', (error) => {
                console.error(sender, 'Error while call to api.ai', error);
            });

            apiaiRequest.end();
        } else {
            console.log('Empty message');
        }
    }

    getMessage(session, message, responseText) {
        let steps_message;
        let validation_message;
        console.log('Giri :: responseText  '+responseText);
        switch (responseText) {
            case "welcome":{
              //  steps_message = new botbuilder.Message(session).text(messages.setup.DCTAP_SETUP.pre_setup.steps.subtitle).textFormat('plain');
             //   session.send(steps_message);
                validation_message = this.getHeroCardResponseText(session, messages.setup.WELCOME.steps.title, messages.setup.WELCOME.steps.subtitle, messages.setup.WELCOME.steps.imageUrl, messages.setup.WELCOME.steps.buttons);
                session.send(validation_message);
               // session.send(this.sendAdaptiveCard(session,welcomeAdaptiveCard));
            }
                break;
            case "dctap_pre_setup":{
              //  steps_message = new botbuilder.Message(session).text(messages.setup.DCTAP_SETUP.pre_setup.steps.subtitle).textFormat('plain');
             //   session.send(steps_message);
                session.send(this.sendAdaptiveCard(session,dctapPreSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.DCTAP_SETUP.pre_setup.steps.title, messages.setup.DCTAP_SETUP.pre_setup.steps.subtitle, messages.setup.DCTAP_SETUP.pre_setup.steps.imageUrl, messages.setup.DCTAP_SETUP.pre_setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "dctap_setup":{
                console.log('Giri :: DCTAP SETUP....  ');
                console.log('Giri :: dctapSetupAdaptiveCard  '+dctapSetupAdaptiveCard);
                session.send(this.sendAdaptiveCard(session,dctapSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.DCTAP_SETUP.setup.steps.title, messages.setup.DCTAP_SETUP.setup.steps.subtitle, messages.setup.DCTAP_SETUP.setup.steps.imageUrl, messages.setup.DCTAP_SETUP.setup.steps.buttons);
                console.log('Giri :: validation_message  '+validation_message);
                session.send(validation_message);
            }
                break;
            case "dctap_post_setup":{
                session.send(this.sendAdaptiveCard(session,dctapPostSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.DCTAP_SETUP.post_setup.steps.title, messages.setup.DCTAP_SETUP.post_setup.steps.subtitle, messages.setup.DCTAP_SETUP.post_setup.steps.imageUrl, messages.setup.DCTAP_SETUP.post_setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "ctap_pre_setup":{
                session.send(this.sendAdaptiveCard(session,ctapPreSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.CTAP_SETUP.pre_setup.steps.title, messages.setup.CTAP_SETUP.pre_setup.steps.subtitle, messages.setup.CTAP_SETUP.pre_setup.steps.imageUrl, messages.setup.CTAP_SETUP.pre_setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "ctap_setup":{
                session.send(this.sendAdaptiveCard(session,ctapSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.CTAP_SETUP.setup.steps.title, messages.setup.CTAP_SETUP.setup.steps.subtitle, messages.setup.CTAP_SETUP.setup.steps.imageUrl, messages.setup.CTAP_SETUP.setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "ctap_post_setup":{
                session.send(this.sendAdaptiveCard(session,ctapPostSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.CTAP_SETUP.post_setup.steps.title, messages.setup.CTAP_SETUP.post_setup.steps.subtitle, messages.setup.CTAP_SETUP.post_setup.steps.imageUrl, messages.setup.CTAP_SETUP.post_setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "pytest_pre_setup":{
                session.send(this.sendAdaptiveCard(session,pyTestPreSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.PY_TEST_SETUP.pre_setup.steps.title, messages.setup.PY_TEST_SETUP.pre_setup.steps.subtitle, messages.setup.PY_TEST_SETUP.pre_setup.steps.imageUrl, messages.setup.PY_TEST_SETUP.pre_setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "pytest_setup":{
                session.send(this.sendAdaptiveCard(session,pyTestSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.PY_TEST_SETUP.setup.steps.title, messages.setup.PY_TEST_SETUP.setup.steps.subtitle, messages.setup.PY_TEST_SETUP.setup.steps.imageUrl, messages.setup.PY_TEST_SETUP.setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "pytest_post_setup":{
                session.send(this.sendAdaptiveCard(session,pyTestPostSetupAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.PY_TEST_SETUP.post_setup.steps.title, messages.setup.PY_TEST_SETUP.post_setup.steps.subtitle, messages.setup.PY_TEST_SETUP.post_setup.steps.imageUrl, messages.setup.PY_TEST_SETUP.post_setup.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "code_checkin":{
                session.send(this.sendAdaptiveCard(session,codeCheckinAdaptiveCard));
                validation_message = this.getHeroCardResponseText(session, messages.setup.CODE_CHECKIN.steps.title, messages.setup.CODE_CHECKIN.steps.subtitle, messages.setup.CODE_CHECKIN.steps.imageUrl, messages.setup.CODE_CHECKIN.steps.buttons);
                session.send(validation_message);
            }
                break;
            case "close":{
                validation_message = this.getHeroCardResponseText(session, messages.setup.CLOSE.steps.title, messages.setup.CLOSE.steps.subtitle, messages.setup.CLOSE.steps.imageUrl, messages.setup.CLOSE.steps.buttons);
                session.send(validation_message);
               // session.endConversationAction();
                //session.send(this.sendAdaptiveCard(session,pyTestPostSetupAdaptiveCard));
            }
                break;
            default:
            {
                for (let messageIndex = 0; messageIndex < message.length; messageIndex++) {
                    let msg = message[messageIndex];
                    switch (msg.type) {
                        //message.type 0 means text message
                        case 0:
                        {
                            if (SkypeBot.isDefined(msg.speech)) {
                                session.send(msg.speech);
                            }
                        }
                            break;
                    }
                }
            }
        }
        // var msg1 = "1) Request CRM to get account in github3 \n2) Get access to adam 'spvss-appserver-developers' group \n 3) Generate SSH key 4) Add key to github3 "
        // session.send(msg1);
    }

    getHeroCardResponseText(session, title, subtitle, imageUrl, buttons) {
        console.log('giri 1 :: ' + title);
        let heroCard = new botbuilder.HeroCard(session).title(title);
        console.log('giri 2 :: ' + subtitle);
        if (SkypeBot.isDefined(subtitle)) {
            heroCard = heroCard.subtitle(subtitle)
        }
        console.log('giri 3 :: ' + imageUrl);
        if (SkypeBot.isDefined(imageUrl)) {
            heroCard = heroCard.images([botbuilder.CardImage.create(session, imageUrl)]);
        }
        if (SkypeBot.isDefined(buttons)) {
            let buttons_ = [];
            for (let buttonIndex = 0; buttonIndex < buttons.length; buttonIndex++) {
                let messageButton = buttons[buttonIndex];
                if (messageButton.text) {
                    let postback = messageButton.postback;
                    if (!postback) {
                        postback = messageButton.text;
                    }
                    let button;
                    if (postback.startsWith("http")) {
                        button = botbuilder.CardAction.openUrl(session, postback, messageButton.text);
                    } else {
                        //button = botbuilder.CardAction.postBack(session, postback, messageButton.text); Skype Code
                        button = botbuilder.CardAction.messageBack(session).title(messageButton.text).displayText(messageButton.text).value("Value").text(postback);
                    }
                    buttons_.push(button);
                }
            }
            heroCard.buttons(buttons_);
        }
        //  let msg1 = new botbuilder.Message(session).text("1) Request CRM to get account in github3 \n2) Get access to adam 'spvss-appserver-developers' group \n 3) Generate SSH key 4) Add key to github3 ").textFormat('plain');
        return new botbuilder.Message(session).attachments([heroCard]);
    }

    sendAdaptiveCard(session, card){
        return new botbuilder.Message(session).addAttachment(card);
    }

    doRichContentResponse(session, messages) {

        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
            let message = messages[messageIndex];
            switch (message.type) {
                //message.type 0 means text message
                case 0:
                {
                    if (SkypeBot.isDefined(message.speech)) {
                        session.send(message.speech);
                    }
                }
                    break;
                //message.type 1 means card message
                case 1:
                {
                    let heroCard = new botbuilder.HeroCard(session).title(message.title);

                    if (SkypeBot.isDefined(message.subtitle)) {
                        heroCard = heroCard.subtitle(message.subtitle)
                    }

                    if (SkypeBot.isDefined(message.imageUrl)) {
                        heroCard = heroCard.images([botbuilder.CardImage.create(session, message.imageUrl)]);
                    }

                    if (SkypeBot.isDefined(message.buttons)) {

                        let buttons = [];

                        for (let buttonIndex = 0; buttonIndex < message.buttons.length; buttonIndex++) {
                            let messageButton = message.buttons[buttonIndex];
                            if (messageButton.text) {
                                let postback = messageButton.postback;
                                if (!postback) {
                                    postback = messageButton.text;
                                }

                                let button;

                                if (postback.startsWith("http")) {
                                    button = botbuilder.CardAction.openUrl(session, postback, messageButton.text);
                                } else {
                                    button = botbuilder.CardAction.postBack(session, postback, messageButton.text);
                                }

                                buttons.push(button);
                            }
                        }

                        heroCard.buttons(buttons);

                    }

                    let msg = new botbuilder.Message(session).attachments([heroCard]);
                    session.send(msg);

                }

                    break;

                //message.type 2 means quick replies message
                case 2:
                {

                    let replies = [];

                    let heroCard = new botbuilder.HeroCard(session).title(message.title);

                    if (SkypeBot.isDefined(message.replies)) {

                        for (let replyIndex = 0; replyIndex < message.replies.length; replyIndex++) {
                            let messageReply = message.replies[replyIndex];
                            let reply = botbuilder.CardAction.postBack(session, messageReply, messageReply);
                            replies.push(reply);
                        }

                        heroCard.buttons(replies);
                    }

                    let msg = new botbuilder.Message(session).attachments([heroCard]);
                    session.send(msg);

                }

                    break;

                //message.type 3 means image message
                case 3:
                {
                    let heroCard = new botbuilder.HeroCard(session).images([botbuilder.CardImage.create(session, message.imageUrl)]);
                    let msg = new botbuilder.Message(session).attachments([heroCard]);
                    session.send(msg);
                }

                    break;

                default:

                    break;
            }
        }

    }

    static isDefined(obj) {
        if (typeof obj == 'undefined') {
            return false;
        }

        if (!obj) {
            return false;
        }

        return obj != null;
    }
}