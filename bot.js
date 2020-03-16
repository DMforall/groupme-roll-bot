var HTTPS = require('https');

var botID = process.env.BOT_ID,
botCommand =  /^\/roll/;
//rr
//d4, d6, d8, d10, d20
// User rolls val


function respond() {
  var request = JSON.parse(this.req.chunks[0]);
  if(request.text && botCommand.test(request.text)){
      commandHandler(this, request);
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function commandHandler(relThis, command){
  /*
Default vals   
*/
  var rollCount = 1, //command.text.split(' ')[1] ? command.text.split(' ')[1] : 1,
      rollMin = 1,
      rollMax = 1,
      rollMod = 0, //added
      thisRoll = 0;

if(!command.text.split(' ')[1]){
//Pure Roll
  rollCount = 1;
  rollMin = 1;
  rollMax = 20; // default to d20
  rollMod = 0;
} else if(command.text.split(' ')[1] && command.text.split(' ')[1].split('d')[1]){
//dice setup 
  rollCount = parseInt(command.text.split(' ')[1].split('d')[0].trim());
  if (rollCount < 1) { rollCount = 1; }
  if (rollCount > 1000) { rollCount = 1000; }
  rollMin = 1;
  rollMax = parseInt(command.text.split(' ')[1].split('d')[1].trim());
  if (rollMax < 1) { rollMax = 1; }
  if (rollMax > 1000) { rollMax = 1000; }
  rollMod = parseInt(command.text.split(' ')[1].split('+')[1].trim());
  if (rollMod < 0) { rollMod = 0; }
  if (rollMod > 1000) { rollMod = 1000; }  
  thisRoll = roll(rollCount, rollMin, rollMax, rollMod);

} else { //backup default 
  rollCount = 1;
  rollMin = 1;
  rollMax = 20; // default to d20
  rollMod = 0;
}
  console.log('Count: ' + rollCount + ", Min: " + rollMin + ", Max: " + rollMax);
  relThis.res.writeHead(200);
  postMessage((command.name + " rolls " + roll(rollCount, rollMin, rollMax, rollMod) + " on " + rollCount + "d" + rollMax + " + " +rollMod), command.name, command.user_id);
  
  relThis.res.end();
}

function roll(count, min, max, mod){
  var result = 0;
  var textResult = "";
  var which = 1;
  var message= "";
  //relThis.res.writeHead(200);
  if(count === 1){
    result = min + Math.floor(Math.random()*(max-min+1));
  } else {
    for(i = 0; i < count; i++){
      result = result + (min + Math.floor(Math.random()*(max-min+1)));
    }
  }
  
  if(count == 1 && result == max && max == 20  ) {
      //Celebrate natural 20
       which = 1 + Math.floor(Math.random()*(3)); //choose a message
      switch (which) {
        case 1:
         message = "(Nat 20!)";
         break; 
        case 2:
         message = "(Yah, mon!)";
         break; 
        case 3:
         message = "(Wowsers!)";
         break;  
        default: 
         message = "(Nat 20!)";
       }
      textResult = result + mod + " " + message;
  } else if (count == 1 && result == 1 && max == 20) {
      //Curse natural 1 on d20
       which = 1 + Math.floor(Math.random()*(4)); //choose a message
      switch (which) {
        case 1:
         message = "(ONE! Ouch!)";
         break; 
        case 2:
         message = "(I didn't just roll that. Did I?)";
         break; 
        case 3:
         message = "(Darn!)";
         break;  
        case 4: 
         message = "(Critical failure!)" 
         break;
        default: 
         message = "(ONE! Ouch!)";
       }
      textResult = result + mod + " " + message;    
  
  } else {
      textResult = result + mod; 
  }
  return textResult;
}

function postMessage(message, name, id) {
  var botResponse, options, body, botReq;
  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : message,
    "attachments": [
    {
      "type": "mentions",
      "user_ids": [id],
      "loci": [
        [0,name.length + 1]
      ]

    }
    ]
  };

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;
