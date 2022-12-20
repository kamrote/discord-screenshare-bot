# Screenshare movies/youtube to discord

- unfortunately due to how discord works on browser, both outgoing audio from your mic and screenshare are compressed. causing the screenshared audio to often sound flat/distorted. until discord adds their own way for bots to screenshare or fix the compression. audio will sound slightly worse than if you were actually watching what is being screenshared

## Info
- made for ubuntu, not tested on any other os
- if your planning on streaming a 1080p movie, or even at 720. your gonna need an actual decent server, otherwise the screenshare is just gonna lag terribly
- For anybody wondering why this uses RobotJS to click the screenshare instead of just making puppeteer auto set the screenshare tab, for whatever reason even after 5 years of people asking, puppeteer wont add a option to accept screensharing audio.
- If you select 1920x1080 as a resolution but discord still says the quality is 720, it is streaming 1080. its just that if you stream from the browser it auto shows as 720p
- Make sure to set whatever video it streams to fullscreen on the target site.
- If done correctly, this should work with netflix, youtube, pirating sites, and other streaming services.

## How to install
Download repository

Install chrome
- wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add
- wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
- sudo apt install ./google-chrome-stable_current_amd64.deb

Install XVFB
- sudo apt-get install xvfb

Install required libraries for RobotJS
- **MAKE SURE YOUR IN THE DIRECTORY YOU PLACED THE SCRIPT IN
- sudo apt-get install libxtst-dev libpng++-dev
- npm install -g node-gyp
- node-gyp rebuild
- sudo apt-get install python-pip (if this commands doesnt work: sudo apt-get install python3-pip)
- sudo apt install make
- sudo apt install build-essential
- sudo apt-get install manpages-dev

Install required libraries for puppeteer to run
- sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

There may be more commands to fix things that i simply dont remember putting in, sorry. if you get an error, google it


### Setup
- npm i
- Set the discord token of the bot to receive commands in config.json
- Find the token of the *REAL* discord account that your going to use to go live, and put it in streambot_token inside of config.json (obviously make sure this account is in the discord server being used, and has permissions to join channels)
- Set the channel ID's in config.json
- Set either 720 or 1080 in config.json
- Make sure the executablePath for puppeteer is the right location for chrome installation

### Video of it being used at 720p (slightly laggy since its on a bad server)
https://user-images.githubusercontent.com/85530913/205511368-81cf4382-b7f2-472b-810b-0f19e2fae907.mp4

## Known issues
- Puppeteer sometimes doesnt go full maximized making it so it cant click the screenshare button (typically fixed by changing "screen_pos[2].y" on line 161 to 565)
