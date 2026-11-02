// Original daily accompaniment. Its notes share the challenge's beat scheduler.
export function createChallengeMusic(ctx,plan={transpose:0,period:600,seed:71,melody:[0,4,2,7,4,2,0,-5]}){
 const master=ctx.createGain();master.gain.value=.32;master.connect(ctx.destination);
 function note(freq,at,length,volume,type='sine'){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq*Math.pow(2,plan.transpose/12);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.012);g.gain.exponentialRampToValueAtTime(.001,at+length);o.connect(g);g.connect(master);o.start(at);o.stop(at+length+.02);}
 const noise=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.09),ctx.sampleRate);const data=noise.getChannelData(0);let seed=plan.seed;for(let i=0;i<data.length;i++){seed=(seed*16807)%2147483647;data[i]=seed/1073741824-1;}
 function hat(at,backbeat=false){const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=noise;filter.type='highpass';filter.frequency.value=backbeat?1400:6500;gain.gain.setValueAtTime(backbeat?.14:.07,at);gain.gain.exponentialRampToValueAtTime(.001,at+(backbeat?.085:.04));source.connect(filter);filter.connect(gain);gain.connect(master);source.start(at);}
 const chords=[[130.81,164.81,196],[110,130.81,164.81],[87.31,110,130.81],[98,123.47,146.83]];
 return {beat(index,at){const chord=chords[Math.floor(index/4)%4];note(chord[0]/2,at,.28,.4,'triangle');if(index%2===0)chord.forEach(f=>note(f*2,at,.4,.1,'triangle'));note(523.25*Math.pow(2,plan.melody[index%plan.melody.length]/12),at+plan.period/2000,.19,.12,index%3===0?'triangle':'sine');hat(at,index%4===1||index%4===3);hat(at+plan.period/2000);},dispose(){master.disconnect();}};
}
