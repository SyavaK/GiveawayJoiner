'use strict';
class ScrapTF extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://scrap.tf';
this.authContent = 'Logout';
this.authLink = 'https://scrap.tf/login';
this.settings.rnd = { type: 'checkbox', trans: this.transPath('rnd'), default: this.getConfig('rnd', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
this.withValue = false;
delete this.settings.pages;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/ScrapTF.png',
username: 'ScrapTF User',
};
$.ajax({
url: 'https://scrap.tf',
success: function (html) {
html = $(html.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
userData.username = html.find('.nav-username').text();
userData.avatar = html.find('.pull-left.nav-avatar > .avatar-container > noload').attr('src');
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
_this.url = 'https://scrap.tf';
let page = 1;
_this.pagemax = 2;
let callback = function () {
page++;
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
};
this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
let spurl = '';
GJuser.sp = ',';
if (page === 1) {
spurl = '/ending';
}
$.ajax({
url: _this.url + '/raffles' + spurl,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
let sptent = data.find('.panel-raffle'),
sptented = data.find('.raffle-entered'),
spcurr = 0;
for (let spcurred = 0; spcurred < sptented.length; spcurred++) {
let linked = sptented.eq(spcurred).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
GJuser.sp = GJuser.sp + linked + ',';
}
let random = Array.from(Array(sptent.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
setTimeout(function () {
}, (Math.floor(Math.random() * 3000)) + 10000);
function giveawayEnter() {
if (sptent.length <= spcurr || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + page);
}
if (callback) {
callback();
}
return;
}
let spnext = _this.interval(),
sprnd = random[spcurr],
spcont = sptent.eq(sprnd),
link = spcont.find('.panel-heading .raffle-name a').attr('href'),
name = spcont.find('.panel-heading .raffle-name a').text(),
entered = link.replace('/raffles/', '');
if (name === undefined || name === '') {
name = entered;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + _this.logLink(_this.url + link, name));
}
if (!GJuser.sp.includes(',' + entered + ',')) {
let pmout = 0;
if (_this.check === undefined) {
pmout = (Math.floor(Math.random() * 5000)) + 8000;
_this.check = 1;
}
setTimeout(function () {
$.ajax({
url: _this.url + link,
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
let enter = data.indexOf('>Enter Raffle<') >= 0,
hash = data.substring(data.indexOf("ScrapTF.Raffles.EnterRaffle(")+39,data.indexOf("<i18n>Enter Raffle</i18n></button>")).slice(0, 64),
csrf = data.substring(data.indexOf("ScrapTF.User.Hash =")+21,data.indexOf("ScrapTF.User.QueueHash")).slice(0, 64);
if (enter) {
let tmout = (Math.floor(Math.random() * 3000)) + 4000;
spnext = spnext + tmout + pmout;
setTimeout(function () {
$.ajax({
type: 'POST',
dataType: 'json',
url: _this.url + '/ajax/viewraffle/EnterRaffle',
headers: {
'authority': 'scrap.tf',
'accept': 'application/json, text/javascript, */*; q=0.01',
'x-requested-with': 'XMLHttpRequest',
'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
},
data: {raffle: entered, captha: '', hash: hash, csrf: csrf},
success: function (response) {
let spresp = JSON.stringify(response.success);
if (spresp) {
_this.log(Lang.get('service.entered_in') + _this.logLink(_this.url + link, name));
}
else {
_this.log(Lang.get('service.cant_join'));
}
}
});
}, tmout);
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'));
}
}
}
});
}, pmout);
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'));
spnext = 1000;
}
}
spcurr++;
setTimeout(giveawayEnter, spnext);
}
giveawayEnter();
}
});
}
}