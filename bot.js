var HTTPS = require('https');

var botID = process.env.BOT_ID,
botCommand =  /^\/roll/;
// /roll
// d4, d6, d8, d10, d20
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
  //Default vals   
  var    rollCount = 1; 
  var    rollMin = 1;
  var    rollMax = 20;
  var    rollMod = 0; //added
  
  command.text = String(command.text).toLowerCase();
  command.text = command.text.replace("\/roll", "");
 
  if ( command.text.includes('+') ) { //Is there a mod?
   //parse out modifier
   rollMod = parseInt( command.text.substr(command.text.indexOf("+") ) );
   if (Number.isNaN(rollMod)) { rollMod = 0; } 
   if (rollMod < 0) { rollMod = 0; }
   if (rollMod > 1000) { rollMod = 1000; }  
  }
  /*
  if (command.text.split(' ')[1].split('d')[1] ) { //Check for input xdy
   //dice setup
   rollCount = parseInt( command.text.split(' ')[1].split('d')[0] );
   if (rollCount < 1) { rollCount = 1; }
   if (rollCount > 1000) { rollCount = 1000; }
   rollMax = parseInt( command.text.split(' ')[1].split('d')[1] );
   if (rollMax < 1) { rollMax = 1; }
   if (rollMax > 1000) { rollMax = 1000; } 
  }*/
  
  console.log('Count: ' + rollCount + ", Min: " + rollMin + ", Max: " + rollMax);
  relThis.res.writeHead(400);
  postMessage((command.name + " rolls ["+ command.text +"] " + roll(rollCount, rollMin, rollMax, rollMod) + " on " + rollCount + "d" + rollMax + "+" +rollMod), command.name, command.user_id);  
  relThis.res.end();
}

function roll(count, min, max, mod) {
  var result = 0;
  var textResult = "";
  var which = 1;
  var critSuccess = ["Nat 20!","One dead dragon!","You rocked that!","Ya, mon!","Wowsers!","The ghost of Gary Gygax cheers you on!","Brilliant!","You are a juggernaut!"];
  var critFailure = ["Oh no!","A ONE! Really.","You did not want to do that anyway.","Ouch!","Did you roll that?","Darn.","A hungry Illithid licks your brain!","Critical failure!"];

  //relThis.res.writeHead(200);
  if(count === 1){
    result = min + Math.floor(Math.random()*(max-min+1));
  } else {
    for(i = 0; i < count; i++){
      result = result + (min + Math.floor(Math.random()*(max-min+1)));
    } 
  }
  textResult = result; //basic total
  
  if(count == 1 && result == max && max == 20  ) {
      //Celebrate natural 20 on d20!
      which = Math.floor(Math.random()*critSuccess.length); //choose a message
      textResult = result + mod + "(" + critSuccess[which] + ")";    
  } else if (count == 1 && result == 1 && max == 20) {
      //Curse natural 1 on d20!
      which = Math.floor(Math.random()*critFailure.length); //choose a message
      textResult = result + mod + " (" + critFailure[which] + ")";    
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
