'use strict';

var nodemailer = require('nodemailer');
var sys = require('sys'),
spawn = require('child_process').spawnSync;

const execSync = require('child_process').execSync;

const phantomjsLambdaPack = require('phantomjs-lambda-pack');

const shellSync = (command, cwd) => {
    console.log('shellSync:', command);

    const options = {};
    const env = process.env;
    env.npm_config_cache ='/tmp/.npm';
    options.cwd = cwd;
    options.env = env;

    return execSync(command, options).toString();
};

module.exports.sz2kindle = (event, context, callback) => {

  console.log("sz_username = " + event.sz_username);
  console.log("sz_password = " + event.sz_password);
  console.log("SMTP URL = " + event.smtp_url);
  console.log("email_from = " + event.email_from);
  console.log("email_to = " + event.email_to);

  phantomjsLambdaPack.exec('parseSZissue.phantom.js', (error, stdout, stderr) => {
          if (error) {
              console.error(`exec error: ${error}`);
              return;
          }

          console.log(`SZ Issue: ${stdout}`);
          console.log(`Should have no error: ${stderr}`);

          var lsStart = spawn('ls', ['/tmp'], { encoding : 'utf8', shell:'/bin/bash'});
          console.log('lsStart stdout here: \n' + lsStart.stdout);
          console.log('lsStart stderr here: \n' + lsStart.stderr);

          var rm = spawn('rm', ['-rf', '/tmp'], {shell:'/bin/bash'});
          console.log('rm stdout here: \n' + rm.stdout);
          console.log('rm stderr here: \n' + rm.stderr);

          var lsBefore = spawn('ls', ['/tmp'], { encoding : 'utf8', shell:'/bin/bash'});
          console.log('lsBefore stdout here: \n' + lsBefore.stdout);
          console.log('lsBefore stderr here: \n' + lsBefore.stderr);

          var issue = encodeURI(stdout.trim());

          const curl = shellSync("curl -o /tmp/issues/issue.mobi --create-dirs -A 'Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.3 Kindle/1.0 (screen 600x800)' -d 'fileFormat=MOBI&username="+encodeURI(event.sz_username)+"&password="+encodeURI(event.sz_password)+"&issue="+issue+"' -L http://reader.sueddeutsche.de/epub/authenticateAndRedirect");
          console.log(`curl: ${curl}`);

          var lsAfter = spawn('ls', ['/tmp'], { encoding : 'utf8', shell:'/bin/bash'});
          console.log('lsAfter stdout here: \n' + lsAfter.stdout);
          console.log('lsAfter stderr here: \n' + lsAfter.stderr);

          // create reusable transporter object using the default SMTP transport
          var transporter = nodemailer.createTransport(event.smtp_url);

          // setup e-mail data with unicode symbols
          var mailOptions = {
              from: event.email_from,
              to: event.email_to,
              subject: issue,
              html: '',
              attachments: [
                 {
                     path: '/tmp/issues/issue.mobi'
                 }
               ]
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, function(error, info){
              if(error){
                  return console.log(error);
              }
              console.log('Message sent: ' + info.response);
          });


          callback(error, 'fin!!');
      });

};
