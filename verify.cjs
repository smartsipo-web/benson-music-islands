const fs=require('node:fs'),assert=require('node:assert/strict');const data=JSON.parse(fs.readFileSync('content.json'));
assert.equal((data.sections.results.match(/<article/g)||[]).length,20);assert.equal(data.reviews.length,19);assert.equal((data.sections.dance.match(/<article/g)||[]).length,5);assert.equal((data.sections.performances.match(/<article/g)||[]).length,10);
for(const html of Object.values(data.sections))for(const m of html.matchAll(/src="([^"]+)"/g))if(!/^https?:/.test(m[1]))assert.ok(fs.existsSync(m[1]),'Missing asset '+m[1]);
for(const m of data.sections.results.matchAll(/data-review-id="([^"]+)"/g))assert.ok(data.reviews.some(r=>r.id===m[1]),'Missing review '+m[1]);
assert.ok(fs.existsSync('assets/islands.png'));console.log('Passed: content counts, review mapping, all local photo assets and island artwork.');
