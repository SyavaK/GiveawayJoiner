'use strict';
class ChronoGG extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.chrono.gg';
this.authContent = 'Coin Shop';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/Chrono';
this.auth = Lang.get('service.wiki') + 'ChronoGG';
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 700), default: this.getConfig('timer_from', 500) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 500), max: 2880, default: this.getConfig('timer_to', 700) };
this.withValue = false;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
authCheck(callback) {
$.ajax({
url: 'https://www.chrono.gg',
success: function () {
callback(1);
},
error: function () {
callback(-1);
}
});
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/ChronoGG.png',
username: 'ChronoGG'
};
callback(userData);
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let chtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = chtimer;
}
_this.ua = mainWindow.webContents.session.getUserAgent();
_this.url = 'https://api.chrono.gg';
let chcurr = 1;
_this.check = true;
function giveawayEnter() {
let chnext = _this.interval();
if (!_this.check || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'ChronoGG', 'srch');
}
return;
}
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'chronogg' + chcurr + '.txt')) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + 'chronogg' + chcurr + '.txt', 'info');
}
let chdata = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'chronogg' + chcurr + '.txt');
if (chdata.includes('JWT')) {
let chauth = chdata.toString();
rq({
method: 'GET',
uri: _this.url + '/account',
headers: {
'accept': 'application/json',
'origin': 'https://www.chrono.gg',
'Authorization': chauth,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.chrono.gg/shop',
},
json: true
})
.then((acc) => {
if (acc.status === 200) {
let chacc = acc.coins;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.acc') + acc.email + ' - ' + chacc.balance + Lang.get('service.coins'));
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Spin Coin', 'chk');
}
}
rq({
method: 'GET',
uri: _this.url + '/quest/spin',
headers: {
'accept': 'application/json',
'origin': 'https://www.chrono.gg',
'Authorization': chauth,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.chrono.gg/?a=default',
},
json: true
})
.then((spin) => {
let chquest = spin.quest,
chchest = spin.chest,
chcoins = chquest.value + chquest.bonus;
if (chchest.base) {
chcoins = chcoins + chchest.base + chchest.bonus;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + chcoins + Lang.get('service.coins'), 'enter');
}
else {
_this.log(Lang.get('service.acc') + acc.email + ' - ' + Lang.get('service.done') + chcoins + Lang.get('service.coins'), 'enter');
}
})
.catch((err) => {
if (_this.getConfig('log', true)) {
if (err.statusCode === 420) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
})
.catch((err) => {
if (err.statusCode === 401) {
_this.log(Lang.get('service.ses_not_found'), 'err');
}
});
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.dt_err'), 'err');
}
}
}
else {
_this.check = false;
if (chcurr === 1) {
fs.writeFile(storage.getDataPath().slice(0, -7) + 'chronogg1.txt', '', (err) => { });
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/chronogg1.txt', 'err');
_this.stopJoiner(true);
}
}
chcurr++;
setTimeout(giveawayEnter, chnext);
}
giveawayEnter();
}
}
