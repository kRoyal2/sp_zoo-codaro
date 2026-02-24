"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const STATUS_BUTTONS = [
  "🟢 I'm okay!",
  "🟡 Feeling tired.",
  "🟠 Feeling unwell, no injury.",
  "🟠 Minor injury, can move.",
  "🔴 Urgent medical help needed.",
  "🔴 Trapped / In danger.",
  "🔴 Emergency, critical condition!",
];

const BUTTON_TO_STATUS: Record<string, string> = {
  "🟢 I'm okay!": "in_way",
  "🟡 Feeling tired.": "in_way",
  "🟠 Feeling unwell, no injury.": "in_way",
  "🟠 Minor injury, can move.": "in_way",
  "🔴 Urgent medical help needed.": "problem",
  "🔴 Trapped / In danger.": "problem",
  "🔴 Emergency, critical condition!": "problem",
};

const KEYBOARD = {
  keyboard: [
    [{ text: "🟢 I'm okay!" }, { text: "🟡 Feeling tired." }],
    [
      { text: "🟠 Feeling unwell, no injury." },
      { text: "🟠 Minor injury, can move." },
    ],
    [
      { text: "🔴 Urgent medical help needed." },
      { text: "🔴 Trapped / In danger." },
    ],
    [{ text: "🔴 Emergency, critical condition!" }],
    [{ text: "📍 Send Location", request_location: true }],
  ],
  resize_keyboard: true,
  persistent: true,
};

export const pollTelegram = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN not set");
      return null;
    }

    const offset = await ctx.runQuery(internal.telegram_bot.getPollOffset, {});

    const resp = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${offset}&limit=100&timeout=0`
    );
    const data = await resp.json();

    if (!data.ok || !data.result?.length) return null;

    let maxUpdateId = offset - 1;

    for (const update of data.result) {
      const updateId: number = update.update_id;
      if (updateId > maxUpdateId) maxUpdateId = updateId;

      const msg = update.message;
      if (!msg) continue;

      const telegramUserId: number = msg.from.id;
      const telegramUsername: string | undefined = msg.from.username;

      // Determine status update
      let hikerStatus: string | undefined;
      if (msg.text === "/start") {
        hikerStatus = "preparing";
      } else if (msg.text && BUTTON_TO_STATUS[msg.text]) {
        hikerStatus = BUTTON_TO_STATUS[msg.text];
      }

      const hikerId = await ctx.runMutation(internal.telegram_bot.upsertHiker, {
        telegram_user_id: telegramUserId,
        telegram_username: telegramUsername,
        ...(hikerStatus !== undefined && { status: hikerStatus }),
      });

      if (msg.text === "/start") {
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: msg.chat.id,
            text: "Welcome! Use the buttons below to send your status, or share your location. Stay safe! 🏔️",
            reply_markup: KEYBOARD,
          }),
        });
        continue;
      }

      if (msg.text && STATUS_BUTTONS.includes(msg.text)) {
        await ctx.runMutation(internal.telegram_bot.saveHikerMessage, {
          hiker_id: hikerId,
          telegram_user_id: telegramUserId,
          status_button: msg.text,
        });
        continue;
      }

      if (msg.text) {
        await ctx.runMutation(internal.telegram_bot.saveHikerMessage, {
          hiker_id: hikerId,
          telegram_user_id: telegramUserId,
          message: msg.text,
        });
        continue;
      }

      if (msg.photo) {
        const photo = msg.photo[msg.photo.length - 1];
        try {
          const uploadUrl = await ctx.runMutation(
            internal.telegram_bot.generateUploadUrl,
            {}
          );

          const fileInfoResp = await fetch(
            `https://api.telegram.org/bot${TOKEN}/getFile?file_id=${photo.file_id}`
          );
          const fileInfo = await fileInfoResp.json();
          const filePath: string = fileInfo.result.file_path;

          const photoResp = await fetch(
            `https://api.telegram.org/file/bot${TOKEN}/${filePath}`
          );

          const uploadResp = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/jpeg" },
            body: await photoResp.arrayBuffer(),
          });
          const { storageId } = await uploadResp.json();

          await ctx.runMutation(internal.telegram_bot.saveHikerMessage, {
            hiker_id: hikerId,
            telegram_user_id: telegramUserId,
            photoId: storageId,
          });
        } catch (e) {
          console.error("Photo upload failed:", e);
        }
        continue;
      }

      if (msg.location) {
        await ctx.runMutation(internal.telegram_bot.saveHikerMessage, {
          hiker_id: hikerId,
          telegram_user_id: telegramUserId,
          geo_lat: msg.location.latitude,
          geo_lon: msg.location.longitude,
        });
        continue;
      }
    }

    if (maxUpdateId >= offset) {
      await ctx.runMutation(internal.telegram_bot.savePollOffset, {
        offset: maxUpdateId + 1,
      });
    }

    return null;
  },
});
