/**
* @project_name Queen Amdi [WA Multi-device]
* @author BlackAmda <https://github.com/BlackAmda>
* @description A WhatsApp based 3สณแต party application that provide many services with a real-time automated conversational experience
* @link <https://github.com/BlackAmda/QueenAmdi>
* @version 4.0.6
* @file  downloadSocialMedia.js - QueenAmdi Social Media downloaders

ยฉ 2022 Black Amda, ANTECH. All rights reserved.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.*/

const { AMDI, blackamda_API, _default, igDownloader, Language, tiktok, web_scrapers } = require('queen_amdi_core/dist/scripts')
const { fblogo } = _default
const { fbDownloader } = web_scrapers
const axios = require("axios")
const Lang = Language.getString('downloadSocialMedia');

AMDI({ cmd: ["fb", "facebook"], desc: Lang.fbDesc, example: Lang.fbEXA, type: "download", react: "๐ฅ" }, (async (amdiWA) => {
    let { input, isFBurl, reply, sendButtonsMsg } = amdiWA.msgLayout;

    if (!isFBurl(input)) return reply(Lang.needlink, 'โ');

    const fbdl_data = await fbDownloader(amdiWA);

    if (!fbdl_data.hd && !fbdl_data.sd) return await reply(Lang.notfound, "โ");
    const thumb = fbdl_data.thumbnail ? fbdl_data.thumbnail : fblogo
    return await sendButtonsMsg([fbdl_data.hd, fbdl_data.sd], { text: `๐ฅ *Facebook video downloader*\n\n\`\`\`${fbdl_data.title}\`\`\``, image: { url: thumb }, tagMsg: true, noTemplate: 1 });
}));


AMDI({ cmd: ["ig", "insta", "instagram"], desc: Lang.igDesc, example: Lang.igEXA, type: "download", react: "๐" }, (async (amdiWA) => {
    let { footerTXT, input, isLINK, isIGurl, react, reply, sendImage, sendVideo } = amdiWA.msgLayout;

    if (!isLINK(input)) return reply(Lang.needlink, 'โ');
    if (!isIGurl(input)) return reply(Lang.needvalidIG);

    await react("โฌ๏ธ");
    try {
        var igPost = await igDownloader(input);
        if (!igPost.length) return await reply(Lang.notfound, "โ");
        if (!igPost[0].url) return await reply("Error".fetchError(igPost.type), "โ", 1);

        await react("โฌ๏ธ");
        igPost.forEach(async (data) => {
            if (data.type === 'image') { await sendImage({ url: data.url }, { caption: footerTXT, quoted: true }); }
            else if (data.type === 'video') { await sendVideo({ url: data.url }, { caption: footerTXT, quoted: true }); }
        });
        return await react("โ๏ธ");
    } catch (e) {
        console.log(e);
        return await reply("Error".fetchError(e), "โ", 1);
    }
}));


AMDI({ cmd: ["tk", "tiktok"], desc: Lang.TKDESC, example: Lang.tkEXA, type: "download", react: "๐ณ๏ธโ๐" }, (async (amdiWA) => {
    let { input, prefix, reply, sendListMsg } = amdiWA.msgLayout;

    if (!input) return await reply(Lang.needlink, 'โ');
    if (!input.includes('tiktok.com/')) return await reply(Lang.needlink, 'โ');

    const tkData = await tiktok({ url: input });

    const TKText = `\`\`\`${tkData.video.signature}\`\`\`\n\n๐ต Music: ${tkData.audio.name}\n\n๐จ๐ปโ๐ค Author: ${tkData.owner.name}\n\n๐ค Username: ${tkData.owner.username}`

    const sections = [
        {
            title: "Tiktok Information",
            rows: [
                { title: "โน๏ธ Tiktok Information", rowId: `${prefix}tkinfo ${input}` }
            ]
        },
        {
            title: "Tiktok Video",
            rows: [
                { title: "๐ With Watermark", rowId: `${prefix}tkdl mark ${input}` },
                { title: "๐ผ No-Watermark", rowId: `${prefix}tkdl nomark ${input}` }
            ]
        },
        {
            title: "Tiktok Audio",
            rows: [
                { title: "๐ถ Audio File", rowId: `${prefix}tkdl audio ${input}` },
                { title: "๐ Document File", rowId: `${prefix}tkdl doc ${input}` }
            ]
        }
    ]

    var listInfo = {}
    listInfo.title = "๐๏ธ Tiktok Downloader"
    listInfo.text = TKText
    listInfo.buttonTXT = "Download now"

    return await sendListMsg(listInfo, sections);
}));


AMDI({ cmd: ["mediafire", "mf", "mfire"], desc: Lang.MEDIAFIRE_DESC, type: "download", react: "๐ฅ" }, (async (amdiWA) => {
    let { footerTXT, input, react, reply, sendDocument } = amdiWA.msgLayout;

    if (!input || !input.startsWith('https://www.mediafire.com/')) return await reply(Lang.NEED_MEDIAFIRE, "โ");

    try {
        await react("โฌ๏ธ");
        const mfAPI = await blackamda_API("mediafire", `url=${input}`, amdiWA.botNumberJid);
        const response = await axios.get(mfAPI);
        const json = response.data

        if (json.status.error) return await reply("Error".fetchError([{ message: json.status.message }]), "โ", 1);
        if (json.size.isLarge) return await reply(Lang.OVER_WA_FILE);

        const caption = `${Lang.MF_TITLE}

    ๐ File name: ${json.name}
    ๐๏ธ Size: ${json.size}
    ๐ Uploaded At: ${json.uploadedAt}
    
${footerTXT}`

        await react("โฌ๏ธ");
        await sendDocument({ url: json.dl_link }, { mimetype: json.mime, fileName: json.name, caption: caption, quoted: true })
            .then(async () => {
                return await react("โ๏ธ");
            });
    } catch (e) {
        console.log(e);
        return await reply("Error".fetchError(e), "โ", 1);
    }
}));