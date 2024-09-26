/**
 * SPDX-FileCopyrightText: 2024 Denis Glazkov <glazzk.off@mail.ru>
 * SPDX-License-Identifier: MIT
 */

import { Telegraf, Context } from 'telegraf'
import {
   MediaGroup,
   media_group,
   photo_media_group,
   video_media_group,
   type MediaGroupContext,
   type PhotoMediaGroupContext,
   type VideoMediaGroupContext,
} from '@dietime/telegraf-media-group'

import 'dotenv/config'

const bot = new Telegraf<Context>(process.env.TELEGRAM_BOT_TOKEN!)

bot.use(new MediaGroup({ timeout: 1000 }).middleware())

bot.on(media_group(), (ctx: MediaGroupContext<Context>) => {
   for (const media of ctx.update.media_group) {
      if ('photo' in media) {
         console.log('Photo:', media.photo)
      }

      if ('video' in media) {
         console.log('Photo:', media.video)
      }
   }
})

bot.on(photo_media_group(), (ctx: PhotoMediaGroupContext<Context>) => {
   for (const media of ctx.update.media_group) {
      console.log('Photo:', media.photo)
   }
})

bot.on(video_media_group(), (ctx: VideoMediaGroupContext<Context>) => {
   for (const media of ctx.update.media_group) {
      console.log('Video:', media.video)
   }
})

bot.launch()
