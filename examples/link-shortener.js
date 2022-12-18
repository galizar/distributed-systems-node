import fs from 'fs';

fs.writeFileSync('/tmp/count.txt', '0'); // only run once

function setUrl(url) {
	const id = Number(fs.readFileSync('/tmp/count.txt').toString()) + 1;
	fs.writeFileSync('/tmp/count.txt', String(id));
	fs.writeFileSync(`/tmp/${id}.txt`, url);
	return `sho.rt/${id}`;
}

function getUrl(code) {
	return fs.readFileSync(`/tmp/${code}.txt`).toString();
}
