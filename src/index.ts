/**
 * SPDX-FileCopyrightText: 2024 Denis Glazkov <glazzk.off@mail.ru>
 * SPDX-License-Identifier: MIT
 */

import { Context, MiddlewareFn } from 'telegraf'
import { Message, Update } from '@telegraf/types'

type ChatID = number
type MediaGroupID = string
type PhotoOrVideoMessage = Message.PhotoMessage | Message.VideoMessage

enum CompleteKind {
   Debounced,
   TimedOut,
}

interface MediaGroupOptions {
   timeout: number
}

interface DelayedMediaGroupMessages {
   media_messages: PhotoOrVideoMessage[]
   complete: (kind: CompleteKind) => void
}

export class MediaGroup {
   options: MediaGroupOptions
   chats: Map<ChatID, Map<MediaGroupID, DelayedMediaGroupMessages>>

   constructor(options?: MediaGroupOptions) {
      this.options = options || { timeout: 500 }
      this.chats = new Map<ChatID, Map<MediaGroupID, DelayedMediaGroupMessages>>()
   }

   middleware(): MiddlewareFn<Context> {
      return (ctx: Context, next: () => Promise<void>) => {
         const message = ctx.message || ctx.channelPost
         const chat = ctx.chat

         if (!chat || !message) {
            return next()
         }

         if (!('photo' in message) && !('video' in message)) {
            return next()
         }

         if (!('media_group_id' in message) || !message.media_group_id) {
            return next()
         }

         const media_group_id: MediaGroupID = message.media_group_id
         const chat_id: ChatID = chat.id

         if (!this.chats.has(chat_id)) {
            this.chats.set(chat_id, new Map<MediaGroupID, DelayedMediaGroupMessages>())
         }

         const chat_media_groups = this.chats.get(chat_id)

         if (!chat_media_groups) {
            return next()
         }

         if (!chat_media_groups.has(media_group_id)) {
            chat_media_groups.set(media_group_id, {
               media_messages: [],
               complete: () => {},
            })
         }

         const delayed_media_messages = chat_media_groups.get(media_group_id)

         if (!delayed_media_messages) {
            return next()
         }

         delayed_media_messages.complete(CompleteKind.Debounced)
         delayed_media_messages.media_messages.push(message)

         return new Promise((resolve) => {
            delayed_media_messages.complete = resolve
            setTimeout(() => resolve(CompleteKind.TimedOut), this.options.timeout)
         }).then((kind) => {
            if (kind != CompleteKind.TimedOut) {
               return
            }

            Object.assign(ctx.update, {
               media_group: delayed_media_messages.media_messages
                  .slice()
                  .sort((a, b) => (a && b ? a.message_id - b.message_id : 0)),
            })

            chat_media_groups.delete(media_group_id)
            return next()
         })
      }
   }
}

type MediaGroupContextBase<T, U> = T & {
   update: Update & { media_group: U[] }
}

export type PhotoMediaGroupContext<T> = MediaGroupContextBase<T, Message.PhotoMessage>
export type VideoMediaGroupContext<T> = MediaGroupContextBase<T, Message.VideoMessage>
export type MediaGroupContext<T> = MediaGroupContextBase<T, PhotoOrVideoMessage>

function custom_media_group<T>(key: string) {
   return () => {
      return (update: Update): update is Update & { media_group: T[] } => {
         if (!('media_group' in update)) {
            return false
         }

         for (const media of update.media_group as PhotoOrVideoMessage[]) {
            if (!(key in media)) {
               return false
            }
         }

         return true
      }
   }
}

export const photo_media_group = custom_media_group<Message.PhotoMessage>('photo')
export const video_media_group = custom_media_group<Message.VideoMessage>('video')
export const media_group = () => {
   return (update: Update): update is Update & { media_group: PhotoOrVideoMessage[] } => {
      return 'media_group' in update
   }
}
