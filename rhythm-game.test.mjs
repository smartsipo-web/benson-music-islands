import test from 'node:test';import assert from 'node:assert/strict';import {BEATS,DURATION,judgeTap} from './rhythm-game.mjs';
test('challenge has 24 playable beats within fifteen seconds',()=>{assert.equal(BEATS.length,24);assert.ok(BEATS[0]>0);assert.ok(BEATS.at(-1)<DURATION);});
test('timing judges nearest unused beat and cannot award double taps',()=>{const hits=new Set();const first=judgeTap(600,hits);assert.equal(first.points,100);hits.add(first.index);assert.equal(judgeTap(601,hits).points,0);assert.equal(judgeTap(1340,hits).points,60);assert.equal(judgeTap(300,hits).index,-1);});
