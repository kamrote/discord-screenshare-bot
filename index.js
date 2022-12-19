//Libraries
const Discord       = require('discord.js'); 
const Xvfb          = require('xvfb');
const client        = new Discord.Client();
const robot         = require("robotjs");
const puppeteer     = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config        = require('./config.json')
puppeteer.use(StealthPlugin());

//var
let is_streaming = false;
let screen_pos = [];
let stream_width = 0
let stream_height = 0;

//
switch (config.stream_quality) {
    case '1080':
        screen_pos.push({"x":1150,"y":159})
        screen_pos.push({"x":710,"y":260})
        screen_pos.push({"x":1220,"y":590})
        stream_width = 1920
        stream_height = 1080
        console.log('Set quality to 1080p')
    break;
    case '720':
        screen_pos.push({"x":840,"y":175})
        screen_pos.push({"x":420,"y":260})
        screen_pos.push({"x":900,"y":590})
        stream_width = 1280
        stream_height = 720
        console.log('Set quality to 720p')
    break;
}

var xvfb = new Xvfb({
    silent: true,
    xvfb_args: ["-screen", "0", stream_width + 'x' + stream_height + 'x' + config.stream_framerate, "-ac"],
});
xvfb.start((err)=>{if (err) console.error(err)})
  

client.on('ready', () => {
    console.log("Bot started")
})
async function do_puppeteer(vc_id, website_link, msg) {
    console.log('Starting puppeteer')
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        ignoreHTTPSErrors: true,
        //devtools: true,
        args: [
            '--enable-usermedia-screen-capturing',
            '--allow-http-screen-capture',
            '--start-maximized',
            '--auto-accept-this-tab-capture',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--enable-features=NetworkService,NetworkServiceInProcess',
            '--force-color-profile=srgb',
            '--hide-scrollbars',
            '--metrics-recording-only',
            '--no-sandbox',
            '--disable-gpu',
            '--window-size=' + stream_width + ',' + stream_height,
            '--display='+xvfb._display
        ],
        ignoreDefaultArgs: ['--mute-audio'],
        executablePath: '/usr/bin/google-chrome', 
    });
    console.log('Started browser')

    const ctx = browser.defaultBrowserContext();
    ctx.overridePermissions('https://discord.com/', ['microphone']);

    const target_page = (await browser.pages())[0];
    await target_page.setDefaultTimeout(0);
    await target_page.goto(website_link, { waitUntil: 'networkidle0' });
    console.log('Opened target page')

    const page = await browser.newPage();
    await page.setDefaultTimeout(0);
    await page.goto('https://discord.com/app', { waitUntil: 'networkidle0' });
    console.log('Opened discord page')

    if (page.url().includes('login')) { //set token
        await page.evaluate((token) => {
            setInterval(() => {
                document.body.appendChild(document.createElement `iframe`).contentWindow.localStorage.token = `"${token}"`
            }, 50);
            setTimeout(() => {
                location.reload();
            }, 1500);
        }, config.streambot_token);
        console.log('set token')
    }
    console.log('Waiting for guild button')
    await page.waitForSelector('[data-list-item-id="guildsnav___' + config.guild_id + '"]', { timeout: 0 });
    await page.waitForNetworkIdle({ idleTime: 2000 });
    await page.evaluate((guildid) => {
        document.querySelector('[data-list-item-id="guildsnav___' + guildid + '"]').click() //click server
    }, config.guild_id);
    console.log('Clicked guild, waiting for VC button to exist')
    await page.waitForSelector("[data-list-item-id='channels___" + vc_id + "']", { timeout: 0 });
    await page.waitForNetworkIdle({ idleTime: 2000 });
    await page.evaluate((vcid) => {
        document.querySelector("[data-list-item-id='channels___" + vcid + "']").click() //click vc channel
    }, vc_id);
    console.log('Clicked VC channel')

    await page.waitForNetworkIdle({ idleTime: 1000 });
    await page.evaluate((width, height, frames) => { //bypass 720 check
        navigator.mediaDevices.chromiumGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        const getDisplayMedia = async () => {
          var id;
          const gdm = await navigator.mediaDevices.chromiumGetDisplayMedia({
            video: {
                mandatory: {
                    frameRate: { ideal: frames, max: frames },
                    width: width,
                    height: height,
                },
            },
            audio: {
                autoGainControl: false,
                echoCancellation: false,
                googAutoGainControl: false,
                noiseSuppresion: false,
                sampleRate: 260000,
                sampleSize: 48,
                latency: 0,
                channelCount: 2,
            }
          })
          gdm
          return gdm;
        };
        navigator.mediaDevices.getDisplayMedia = getDisplayMedia;
    }, stream_width, stream_height, config.stream_framerate);
    await page.waitForSelector("[aria-label='Share Your Screen']");
    page.click("[aria-label='Share Your Screen']") // click screenshare
    setTimeout(async () => {
        robot.setMouseDelay(0);
        robot.moveMouse(screen_pos[0].x, screen_pos[0].y);
        setTimeout(async () => {
            robot.mouseClick();
            setTimeout(async () => {
                robot.moveMouse(screen_pos[1].x, screen_pos[1].y);
                setTimeout(async () => {
                    robot.mouseClick();
                    setTimeout(async () => {
                        robot.moveMouse(screen_pos[2].x, screen_pos[2].y);
                        setTimeout(async () => {
                            robot.mouseClick();
                            setTimeout(async () => {
                                console.log('Started screenshare')
                                msg.edit('Started screenshare')
                                is_streaming = true;
                                await target_page.bringToFront();
                                //start doing things on target_page. login to the website of the link provided, play videos, etc
                            }, 500);
                        }, 200);
                    }, 500);
                }, 200);
            }, 500);
        }, 200);
    }, 1500);
    
}

client.on('message', async msg => {
    if (msg.channel.id.toString() === config.command_channel) {
        let voice_channel = msg.member.voice.channel
        if (voice_channel) {
            if (msg.content.includes('+play ') && is_streaming === false) { //get the link of page sent
                msg.reply('Starting screenshare on ' + msg.content.split('+play ')[1]).then(async msgs => {
                    do_puppeteer(voice_channel.id, msg.content.split('+play ')[1], msgs)
                })
            }
        }
    }
})
      
client.login(config.commandbot_token);

async function error_logs(err) {
    console.log(err);
}
process.on('uncaughtException', function (err) {error_logs(err)});
