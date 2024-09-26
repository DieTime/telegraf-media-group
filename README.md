<p align="center">
    <img src="assets/icon.svg" width="140px" />
</p>

<p align="center">
All that you want to easily process media groups in <a href="https://github.com/DieTime/telegraf-media-group" style="color:#9676F2;font-weight:bold">telegraf.js</a>
</p>

<p align="center">
   <img
      src="https://img.shields.io/badge/telegraf.js-4.0-9676F2"
      alt="Compatible with telegraf.js v4.0"
   />
	<img
      src="https://img.shields.io/github/languages/top/DieTime/telegraf-media-group?logo=typescript&color=9676F2&logoColor=ffffff"
      alt="Language: typescript"
   />
	<img
      src="https://img.shields.io/npm/unpacked-size/%40dietime%2Ftelegraf-media-group?label=install%20size&color=9676F2"
      alt="Package size"
   />
   <img
      src="https://img.shields.io/github/license/DieTime/telegraf-media-group?color=9676F2"
      alt="License: MIT"
   />
</p>

## Introduction

When writing a telegram bot using <a href="https://github.com/DieTime/telegraf-media-group" style="color:#9676F2;font-weight:bold">telegraf.js</a>, you may want to process a group of media sent by a user.

This package provides all that you want to solve this problem:

- ⚡ Middleware
- 🔥 Filters
- 🚀 Wrapper types for context

## Installation

```bash
$ npm i @dietime/telegraf-media-group
```

## Usage

### Attaching `MediaGroup` middleware

You need to attach `MediaGroup` middleware to your bot so that when you receive media group messages, these messages will be accumulated. 

```ts
import { MediaGroup } from '@dietime/telegraf-media-group'

bot.use(new MediaGroup({ timeout: 1000 }).middleware())
```

The `timeout` option controls the time the middleware will wait for the next media group message. If no message is received within this timeout, middleware sends a message with accumulated media group messages for processing.

### Processing a photo and video media group

To process a media group that contains both photos and videos, use the `media_group()` filter and wrap the context in the `MediaGroupContext<T>` type for better typing.

```ts
import { media_group, type MediaGroupContext } from '@dietime/telegraf-media-group'

bot.on(media_group(), (ctx: MediaGroupContext<Context>) => {
   for (const media of ctx.update.media_group) {
      if ('photo' in media) {
         console.log('Photo:', media.photo)
      }

      if ('video' in media) {
         console.log('Video:', media.video)
      }
   }
})
```

### Processing a photo-only media group

To process a media group that contains only photos, use `photo_media_group()` filter and wrap the context in `PhotoMediaGroupContext<T>` type for better typing.

```ts
import { photo_media_group, type PhotoMediaGroupContext } from '@dietime/telegraf-media-group'

bot.on(photo_media_group(), (ctx: PhotoMediaGroupContext<Context>) => {
   for (const media of ctx.update.media_group) {
      console.log('Photo:', media.photo)
   }
})
```

### Processing a video-only media group

To process a media group that contains only videos, use `video_media_group()` filter and wrap the context in `VideoMediaGroupContext<T>` type for better typing.

```ts
import { video_media_group, type VideoMediaGroupContext } from '@dietime/telegraf-media-group'

bot.on(video_media_group(), (ctx: VideoMediaGroupContext<Context>) => {
   for (const media of ctx.update.media_group) {
      console.log('Video:', media.video)
   }
})
```
