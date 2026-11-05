const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const channels=[];
class Channel{
 constructor(){channels.push(this);}
 postMessage(data){for(const channel of channels)if(channel!==this)queueMicrotask(()=>channel.onmessage?.({data}));}
}
function player(){
 const events={},docEvents={},document={hidden:false,hasFocus:()=>true,addEventListener:(name,fn)=>docEvents[name]=fn};
 const media={src:'audio/relentless-minor.mp3',paused:true,currentTime:12,playCalls:0,pause(){this.paused=true;},play(){this.paused=false;this.playCalls++;return Promise.resolve();}};
 const context={document,window:{addEventListener:(name,fn)=>events[name]=fn},BroadcastChannel:Channel,Float32Array,Uint8Array,Promise};
 vm.createContext(context);vm.runInContext(fs.readFileSync('dist/music.js','utf8')+';globalThis.Music=GameMusic;',context);
 const music=new context.Music(media);return {music,media,events,docEvents,document};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 const first=player();first.music.setState({enabled:true,active:true,shopping:true});await flush();assert(!first.media.paused);
 first.events.blur();assert(first.media.paused,'shop must stop on blur');assert.equal(first.media.currentTime,12);
 first.music.setState({enabled:true,active:true,shopping:true});assert(first.media.paused,'frame sync must not undo blur');
 first.events.focus();await flush();assert(!first.media.paused);
 first.document.hidden=true;first.docEvents.visibilitychange();assert(first.media.paused);
 first.document.hidden=false;first.events.focus();await flush();assert(!first.media.paused);
 const second=player();second.music.setState({enabled:true,active:true});await flush();assert(first.media.paused);assert(!second.media.paused);
 first.music.sync();assert(first.media.paused,'inactive owner must not steal playback back');
 first.events.focus();await flush();assert(!first.media.paused);assert(second.media.paused);
 first.music.setState({enabled:false,active:true});assert(first.media.paused);
 first.music.setState({enabled:true,active:true});first.events.blur();await flush();assert(first.media.paused,'pending play cannot restart after blur');
 first.events.focus();await flush();first.events.pagehide();assert(first.media.paused);
 first.events.pageshow();await flush();assert(!first.media.paused);
 first.music.setState({enabled:true,active:true,track:'boss'});await flush();assert.equal(first.media.src,'audio/relentless-minor.mp3');
 first.media.currentTime=8;first.music.setState({enabled:true,active:true,track:'normal'});await flush();assert.equal(first.media.currentTime,8);assert.equal(first.music.track,'boss');assert.equal(first.media.src,'audio/relentless-minor.mp3');
 first.music.setState({enabled:true,active:true,shopping:true});await flush();assert.equal(first.media.currentTime,8);assert.equal(first.media.src,'audio/relentless-minor.mp3');
 assert.match(fs.readFileSync('dist/index.html','utf8'),/id="bgm" src="audio\/relentless-minor\.mp3"/);
 console.log('Music ownership: shop/selection blur, frame sync, hidden, multiple pages, focus transfer, mute, pending play, page lifecycle and continuous boss BGM passed');
})().catch(error=>{console.error(error);process.exitCode=1;});
