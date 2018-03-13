# NativeScript AWS SDK

[![npm](https://img.shields.io/npm/v/nativescript-aws-sdk.svg)](https://www.npmjs.com/package/nativescript-aws-sdk)
[![npm](https://img.shields.io/npm/dt/nativescript-aws-sdk.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-aws-sdk)
[![Build Status](https://travis-ci.org/triniwiz/nativescript-aws-sdk.svg?branch=master)](https://travis-ci.org/triniwiz/nativescript-aws-sdk)

## Installation

```bash
tns plugin add nativescript-aws-sdk
```

## Usage

### TypeScript

#### S3

```ts
import { S3 } from 'nativescript-aws-sdk';
S3.init({ endPoint: '', accessKey: '', secretKey: '', type: 'static' }); // <= Try calling this after the app launches to start the service
```

```ts
import { S3 } from 'nativescript-aws-sdk';
const s3 = new S3();
const imageUploaderId = s3.createUpload({
  file: '~/assets/hulk_wolverine_x_men.jpg',
  bucketName: 'yaychat',
  key: `ns_${isIOS ? 'ios' : 'android'}_hulk_wolverine_x_men.jpg`,
  acl: 'public-read',
  completed: (error, success) => {
    if (error) {
      console.log(`Download Failed :-> ${error.message}`);
    }
    if (success) {
      console.log(`Download Complete :-> ${success.path}`);
    }
  },
  progress: progress => {
    console.log(`Progress : ${progress.value}`);
  }
});

s3.pause(imageUploaderId);
s3.resume(imageUploaderId);
s3.cancel(imageUploaderId);
```

### JavaScript

```js
const S3 = require('nativescript-aws-sdk').S3;
S3.S3.init({ endPoint: '', accessKey: '', secretKey: '', type: 'static' }); // <= Try calling this after the app launches to start the service
```

```js
const imageUploaderId = s3.createUpload({
  file: '~/assets/hulk_wolverine_x_men.jpg',
  bucketName: 'yaychat',
  key: `ns_${isIOS ? 'ios' : 'android'}_hulk_wolverine_x_men.jpg`,
  acl: 'public-read',
  completed: (error, success) => {
    if (error) {
      console.log(`Download Failed :-> ${error.message}`);
    }
    if (success) {
      console.log(`Download Complete :-> ${success.path}`);
    }
  },
  progress: progress => {
    console.log(`Progress : ${progress.value}`);
  }
});

s3.pause(imageUploaderId);
s3.resume(imageUploaderId);
s3.cancel(imageUploaderId);
```

## Api

### S3

| Method                                   | Default | Type                         | Description                                       |
| ---------------------------------------- | ------- | ---------------------------- |-----------------------------------------------------|
| createDownload(options: S3DownloadOptions) |         | `string`                     | Creates a task it returns the id of the task |
| createUpload(options: S3UploadOptions)    |         | `string`                     | Creates a task it returns the id of the task |
| resume(id: string)                       |         | `void`                       | Resumes a task.                              |
| cancel(id: string)                       |         | `void`                       | Cancels a task.                              |
| pause(id: string)                        |         | `void`                       | Pauses a task.                               |


## Example Image

| IOS                                     | Android                                     |
| --------------------------------------- | ------------------------------------------- |
| Coming Soon | Coming Soon |

