'use strict';
// One routed player; each theme resumes its own position across boss transitions.
class GameMusic {
 constructor(media){this.track='normal';this.positions={};this.media=media;this.media.loop=true;this.media.volume=.35;this.gain=null;this.context=null;this.analyser=null;this.frequencyData=null;this.bandRanges=[];this.waveform=new Float32Array(96);this.timeData=new Uint8Array(2048);this.bands=new Float32Array(24);this.bass=0;this.projectionEnergy=0;this.target=null;this.pendingPlay=false;this.playbackRevision=0;this.enabled=true;this.active=false;this.shopping=false;}
 unlock(context){
  if(context&&!this.gain&&context.createMediaElementSource){
   try{const source=context.createMediaElementSource(this.media),gain=context.createGain();gain.gain.value=0;
    // Analyse the music before shop gain; sound effects go straight to destination.
    try{if(context.createAnalyser){this.analyser=context.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.45;this.analyser.minDecibels=-85;this.analyser.maxDecibels=-20;this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount);const binHz=context.sampleRate/this.analyser.fftSize,minHz=60,maxHz=Math.min(16000,context.sampleRate/2);for(let i=0;i<this.bands.length;i++){const start=Math.max(1,Math.ceil(minHz*(maxHz/minHz)**(i/this.bands.length)/binHz)),end=Math.min(this.frequencyData.length,Math.max(start+1,Math.ceil(minHz*(maxHz/minHz)**((i+1)/this.bands.length)/binHz)));this.bandRanges.push([start,end]);}}}catch{this.analyser=null;this.frequencyData=null;this.bandRanges=[];}
    if(this.analyser){source.connect(this.analyser);this.analyser.connect(gain);}else source.connect(gain);
    gain.connect(context.destination);this.context=context;this.gain=gain;this.media.volume=1;this.target=null;}
   catch{ /* Media volume remains a fallback if audio routing is unavailable. */ }
  }
  this.sync();
 }
 setState({enabled,active,shopping,track='normal'}){this.enabled=enabled;this.active=active;this.shopping=shopping;this.setTrack(track);this.sync();}
 setTrack(track){
  if(track===this.track)return;
  this.positions??={};if(this.track)this.positions[this.track]=this.media.currentTime||0;
  this.track=track;this.playbackRevision++;if(this.media.pause)this.media.pause();
  this.media.src=track==='boss'?'audio/relentless-minor.mp3':'audio/normal-theme.mp3';
  if(this.media.load)this.media.load();
  this.media.currentTime=this.positions[track]||0;
  this.bands.fill(0);this.waveform.fill(0);this.bass=0;this.projectionEnergy=0;
 }
 sampleSpectrum(dt=1/60){
  dt=Math.max(0,Math.min(.1,dt));const playing=this.enabled&&this.active&&!this.media.paused&&this.context?.state!=='suspended'&&this.context?.state!=='closed';
  if(this.analyser&&playing)this.analyser.getByteFrequencyData(this.frequencyData);else if(this.frequencyData)this.frequencyData.fill(0);
  for(let i=0;i<this.bands.length;i++){let power=0;const range=this.bandRanges[i];if(range&&this.frequencyData){const [start,end]=range;for(let bin=start;bin<end;bin++)power+=(this.frequencyData[bin]/255)**2;power=(power/Math.max(1,end-start))**.75;}const speed=power>this.bands[i]?24:10;this.bands[i]+=(power-this.bands[i])*(1-Math.exp(-dt*speed));}
  this.bass=0;for(let i=0;i<6;i++)this.bass+=this.bands[i]/6;
  const energy=playing?Math.min(1,(this.bass*.65+this.bands.reduce((a,v)=>a+v,0)/this.bands.length*.35)*1.65):0;
  this.projectionEnergy+=(energy-this.projectionEnergy)*(1-Math.exp(-dt*(energy>this.projectionEnergy?4:2)));
  // Read the actual BGM waveform for the two lift-mounted oscilloscope strips.
  if(this.analyser&&playing&&this.analyser.getByteTimeDomainData){this.analyser.getByteTimeDomainData(this.timeData);for(let i=0;i<this.waveform.length;i++){const start=Math.floor(i*this.timeData.length/this.waveform.length),end=Math.floor((i+1)*this.timeData.length/this.waveform.length);let peak=0;for(let k=start;k<end;k++){const value=(this.timeData[k]-128)/128;if(Math.abs(value)>Math.abs(peak))peak=value}this.waveform[i]=peak}}else this.waveform.fill(0);
 }
 spectrumAt(position){const index=Math.max(0,Math.min(1,position))*(this.bands.length-1),left=Math.floor(index),right=Math.min(this.bands.length-1,left+1);return this.bands[left]+(this.bands[right]-this.bands[left])*(index-left);}
 sync(){
  const playing=this.enabled&&this.active,target=playing?(this.shopping?.12:.35):0;
  if(target!==this.target){
   if(this.gain){const param=this.gain.gain,now=this.context.currentTime;if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);else{param.cancelScheduledValues(now);param.setValueAtTime(param.value,now);}param.linearRampToValueAtTime(target,now+.35);}
   else this.media.volume=target;
   this.target=target;
  }
  if(!playing){this.playbackRevision++;if(this.media.pause)this.media.pause();return;}
  if(this.media.paused&&!this.pendingPlay&&this.media.play){
   this.pendingPlay=true;const revision=this.playbackRevision;
   try{Promise.resolve(this.media.play()).then(()=>{if(revision!==this.playbackRevision&&(!this.enabled||!this.active))this.media.pause();}).catch(()=>{}).finally(()=>{this.pendingPlay=false;if(revision!==this.playbackRevision)this.sync();});}
   catch{this.pendingPlay=false;}
  }
 }
}
