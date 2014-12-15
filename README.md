Media-proxy
===========

A simple HTTP proxy which automatically saves to disk all audio/mpeg requests.

## Requirements

Node >= `0.10.x`

## How to start

- Clone this repo
- `npm install`
- `node index.js`
- Set your OS to use a web HTTP proxy on port `8001`

Then, every `audio/mpeg` requests will be saved on `./downloads` folder with the following filename pattern:

```{ID3 - Artist} - {ID3 - Title}.mp3```
