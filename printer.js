module.exports.title = 'oscar-watcher';
module.exports.description = 'watches changes in gt oscar classes';
module.exports.commands = {
  setNumber: {
    command: 'set-number',
    shortCmd: 'n',
    description: 'sets the phone number to send the course updates to',
    arg: 'phone-number'
  },
  setTwilioNumber: {
    command: 'set-twilio-number',
    shortCmd: 'm',
    description: 'sets the twilio phone number used to send the updates',
    arg: 'phone-number'
  },
  setToken: {
    command: 'set-token',
    shortCmd: 't',
    description: 'sets the twilio token for sending text messages',
    arg: 'token'
  },
  setSID: {
    command: 'set-sid',
    shortCmd: 's',
    description: 'sets the twilio SID for sending text messages',
    arg: 'sid'
  },
  config: {
    command: 'config',
    shortCmd: 'c',
    description: 'shows the current configuration settings',
    arg: ''
  },
  list: {
    command: 'list',
    shortCmd: 'l',
    description: 'shows the watchlist',
    arg: ''
  },
  addSection: {
    command: 'add',
    shortCmd: 'a',
    description: 'adds a section to the watch list',
    arg: 'oscar-url/CRN'
  },
  addAllSections: {
    command: 'add-all',
    shortCmd: 'A',
    description: 'adds all sections of a course to the watch list',
    arg: 'oscar-url'
  },
  watch: {
    command: 'watch',
    shortCmd: 'w',
    description: 'watches all sections in the watch list and sends a text when sections become available',
    arg: ''
  }
};

module.exports.printHelp = () => {
  let str = `${this.title}: ${this.description}\n\n`;
  let maxCmdLength = -1;
  for (let key in this.commands) {
    if (this.commands[key].command.length + this.commands[key].arg.length > maxCmdLength)
      maxCmdLength = this.commands[key].command.length + this.commands[key].arg.length;
  }
  
  for (let key in this.commands) {
    let spaces = '';
    for (let i = this.commands[key].command.length + this.commands[key].arg.length; i < maxCmdLength; i++)
      spaces += ' ';
    str += `${this.commands[key].shortCmd} | ${this.commands[key].command}`;
    if (this.commands[key].arg)
      str += ` <${this.commands[key].arg}> `;
    else
      str += '    ';
    str += `${spaces} ${this.commands[key].description}\n`;
  }
  
  console.log(str);
};

