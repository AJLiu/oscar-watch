let request = require('request');
let fs = require('fs');
let cheerio = require('cheerio');

module.exports.watch = function (obj, config, callback, timer) {
  function watch() {
    setTimeout(function () {
      request.get(obj.url, (err, body, html) => {
        if(err)
          callback(err);
        
        let $ = cheerio.load(html);
        let seats = [];
        let className = $('div>table>tr>th.ddlabel').text();
        
        $('table td table td.dddefault').each((i, el)=> {
          seats.push(parseInt($(el).text(), 10));
        });
        
        if (seats.length != 6) {
          console.log("something went wrong");
          callback(err);
        } else {
          console.log(`${className}: ${seats[2]}/${seats[0]} open, ${seats[5]}/${seats[3]} waitlist`);
          if (seats[2] !== 0 && !obj.open && seats[5] === 0) {
            obj.open = true;
            fs.writeFileSync(__dirname + '/config.json', JSON.stringify(config));
            console.log('class now open');
            callback(null, `${className}: ${seats[2]}/${seats[0]} open, ${seats[5]}/${seats[3]} waitlist`);
          } else if ((seats[2] === 0 || seats[5]) !== 0 && obj.open) {
            obj.open = false;
            fs.writeFileSync(__dirname + '/config.json', JSON.stringify(config));
            console.log('class now closed');
            callback(null, `${className}: ${seats[2]}/${seats[0]} open, ${seats[5]}/${seats[3]} waitlist`);
          }
          watch();
        }
      });
    }, timer);
  }
  
  watch();
};