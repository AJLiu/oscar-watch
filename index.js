#!/usr/bin/env node
let config = require('./config');

let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let twilio = require('twilio');
let client = new twilio.RestClient(config.SID, config.Token);

let OscarWatch = require('./watcher');
let Printer = require('./printer');

let args = process.argv.slice(2);

if (args[0]) {
  /*
   * Set phone number
   * oscar --set-number xxx-xxx-xxxx
   */
  if ((args[0] === Printer.commands.setNumber.command ||
       args[0] === Printer.commands.setNumber.shortCmd)) {
    if (!args[1] || args[1].replace('-', '').replace(' ', '').length != 10)
      console.log('please enter a valid number');
    else {
      config.PhoneNumber = args[1].replace('-', '').replace(' ', '');
      fs.writeFile(__dirname + '/config.json', JSON.stringify(config), (err) => {
        if (err)
          throw err;
        console.log(`number set to ${args[1]}`);
      });
    }
    return;
  }
  
  /*
   * Set twilio phone number
   * oscar --set-number xxx-xxx-xxxx
   */
  if ((args[0] === Printer.commands.setTwilioNumber.command ||
       args[0] === Printer.commands.setTwilioNumber.shortCmd)) {
    if (!args[1] || args[1].replace('-', '').replace(' ', '').length != 10)
      console.log('please enter a valid number');
    else {
      config.TwilioNumber = args[1].replace('-', '').replace(' ', '');
      fs.writeFile(__dirname + '/config.json', JSON.stringify(config), (err) => {
        if (err)
          throw err;
        console.log(`twilio number set to ${args[1]}`);
      });
    }
    return;
  }
  
  /*
   * Show config
   */
  if ((args[0] === Printer.commands.config.command ||
       args[0] === Printer.commands.config.shortCmd)) {
    
    console.log(`Twilio SID: ${config.SID}\nTwilio Token: ${config.Token}\nTwilio Phone: ${config.TwilioNumber}\nYour Phone: ${config.PhoneNumber}`);
    
    return;
  }
  
  /*
   * Show config
   */
  if ((args[0] === Printer.commands.list.command ||
       args[0] === Printer.commands.list.shortCmd)) {
    
    console.log(config.WatchList);
    
    return;
  }
  
  /*
   * Set Twilio Token
   * oscar --set-token 12345555555
   */
  if ((args[0] === Printer.commands.setToken.command ||
       args[0] === Printer.commands.setToken.shortCmd)) {
    if (!args[1])
      args[1] = 'Not Set';
    
    config.Token = args[1];
    fs.writeFile(__dirname + '/config.json', JSON.stringify(config), (err) => {
      if (err)
        throw err;
      console.log(`token set to ${args[1]}`);
    });
    
    return;
  }
  
  /*
   * Set Twilio SID
   * oscar --set-sid lolololol
   */
  if (args[0] === Printer.commands.setSID.command ||
      args[0] === Printer.commands.setSID.shortCmd) {
    if (!args[1])
      args[1] = 'Not Set';
    
    config.SID = args[1];
    fs.writeFile(__dirname + '/config.json', JSON.stringify(config), (err) => {
      if (err)
        throw err;
      console.log(`sid set to ${args[1]}`);
    });
    
    return;
  }
  
  /*
   * Add URL to watch list
   * oscar --add https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_course_detail?cat_term_in=201608&subj_code_in=ENGL&crse_numb_in=1101
   */
  if (args[0] === Printer.commands.addSection.command ||
      args[0] === Printer.commands.addSection.shortCmd) {
    let urlTest = /^https?:\/\/oscar.gatech.edu\/pls\/bprod\/bwckschd.p_disp_detail_sched\?term_in=201608&crn_in=(\d{5})$/;
    let crnTest = /^(\d{5})$/;
    if (!args[1])
      console.log('enter a url or crn to watch');
    else {
      let url;
      if (urlTest.test(args[1]))
        url = args[1];
      else if (crnTest.test(args[1]))
        url = 'https://oscar.gatech.edu/pls/bprod/bwckschd.p_disp_detail_sched?term_in=201608&crn_in='
              + args[1];
      else {
        console.log('enter a valid oscar url or crn');
        return;
      }
      for (let obj of config.WatchList) {
        if (obj.url === url) {
          console.log('section already in watch list');
          return;
        }
      }
      
      config.WatchList.push({url: url, open: false});
      fs.writeFile(__dirname + '/config.json', JSON.stringify(config), (err) => {
        if (err)
          throw err;
        console.log(`${url} was added to watch list`);
      });
    }
    return;
  }
  
  /*
   * Add all sections of a class to watch list
   */
  if (args[0] === Printer.commands.addAllSections.command ||
      args[0] === Printer.commands.addAllSections.shortCmd) {
    if (!args[1])
      console.log('enter a valid url or course code');
    else {
      let urlTest = /^https?:\/\/oscar.gatech.edu\/pls\/bprod\/bwckctlg\.p_disp_listcrse\?term_in=201608&subj_in=(ACCT|AE|AS|APPH|ASE|ARBC|ARCH|BIOL|BMEJ|BMED|BMEM|BCP|BC|CETL|CHBE|CHEM|CHIN|CP|CEE|COA|COE|COS|CX|CSE|CS|COOP|UCGA|EAS|ECON|ECEP|ECE|ENGL|FS|FREN|GT|GTL|GRMN|HP|HS|HIN|HIST|HTS|ISYE|ID|IPCO|IPIN|IPFS|IPSA|INTA|IL|INTN|IMBA|IAC|JAPN|KOR|LATN|LS|LING|LCC|LMC|MGT|MOT|MLDR|MSE|MATH|ME|MP|MSL|ML|MUSI|NS|NRE|PERS|PHIL|PHYS|POL|PTFE|DOPP|PSY|PSYC|PUBP|PUBJ|RUSS|SCI|SOC|SPANPOL)&crse_in=(\d{4})&schd_in=%$/;
      let courseCodeTest = /^(ACCT|AE|AS|APPH|ASE|ARBC|ARCH|BIOL|BMEJ|BMED|BMEM|BCP|BC|CETL|CHBE|CHEM|CHIN|CP|CEE|COA|COE|COS|CX|CSE|CS|COOP|UCGA|EAS|ECON|ECEP|ECE|ENGL|FS|FREN|GT|GTL|GRMN|HP|HS|HIN|HIST|HTS|ISYE|ID|IPCO|IPIN|IPFS|IPSA|INTA|IL|INTN|IMBA|IAC|JAPN|KOR|LATN|LS|LING|LCC|LMC|MGT|MOT|MLDR|MSE|MATH|ME|MP|MSL|ML|MUSI|NS|NRE|PERS|PHIL|PHYS|POL|PTFE|DOPP|PSY|PSYC|PUBP|PUBJ|RUSS|SCI|SOC|SPANPOL)\s?(\d{4})$/i;
      let url;
      
      if (urlTest.test(args[1]))
        url = args[1];
      else if (courseCodeTest.test((args[1]))) {
        let data = courseCodeTest.exec(args[1]).slice(1, 3);
        url = `https://oscar.gatech.edu/pls/bprod/bwckctlg.p_disp_listcrse?term_in=201608&subj_in=${data[0].toUpperCase()}&crse_in=${data[1]}&schd_in=%`
      } else {
        console.log('enter a vlid url or course code');
        return;
      }
      
      request.get(url, (err, body, html) => {
        if (err)
          throw err;
        
        let $ = cheerio.load(html);
        
        $('th.ddtitle a').each((i, el) => {
          let url = 'https://oscar.gatech.edu' + $(el).attr('href');
          
          for (let obj of config.WatchList) {
            if (obj.url === url) {
              console.log('section already in watch list');
              return;
            }
          }
          
          config.WatchList.push({url: url, open: false});
          fs.writeFile(__dirname + '/config.json', JSON.stringify(config), (err) => {
            if (err)
              throw err;
            console.log(`${url} was added to watch list`);
          });
        });
      });
    }
    return;
  }
  
  /*
   * Watch the classes
   */
  if (args[0] === Printer.commands.watch.command ||
      args[0] === Printer.commands.watch.shortCmd) {
    for (let obj of config.WatchList) {
      OscarWatch.watch(obj, config, (err, message)=> {
        if (err)
          throw err;
        client.messages.create({
          to: config.PhoneNumber,
          from: config.TwilioNumber,
          body: message
        }, (err, message) => {
          if (err)
            console.error(err);
        });
      }, 300000);
    }
    return;
  }
  
  /*
   * Print the help menu if no matches
   */
  Printer.printHelp();
}
else {
  Printer.printHelp();
}
