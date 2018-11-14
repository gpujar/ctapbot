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
const express = require('express');
const bodyParser = require('body-parser');

const SkypeBot = require('./skypebot');
const SkypeBotConfig = require('./skypebotconfig');

const REST_PORT = (process.env.PORT || 5000);

// const botConfig = new SkypeBotConfig(
//     process.env.APIAI_ACCESS_TOKEN,
//     process.env.APIAI_LANG,
//     process.env.APP_ID,
//     process.env.APP_SECRET
// );

const botConfig = new SkypeBotConfig(
    "459a5c8bd9fa4a2db2866e723bcf5235",
    "en",
    "cdb15e9b-e87d-4ad3-b7d7-3f5cc9f0409e",
    "aeTLVZF802:cnrtqXQ49^#)"
);

const skypeBot = new SkypeBot(botConfig);

// console timestamps
require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l');

const app = express();
app.use(bodyParser.json());

// app.post('/chat', skypeBot.botService.listen());
app.post('/chat', skypeBot.botService.listen());
app.get('/chat', function(){
     console.log('Get is called now...........');
});
app.listen(REST_PORT, function () {
    console.log('Rest service ready on port ' + REST_PORT);
    return;
});