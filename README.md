# ytb

A low-tech youtube.

It is mainly an experiment in an attempt to reduce the environmental impact of this type of platform and reduce cognitive dependence.

## Demo

[![demo ytb screenshot](./screenshot.jpg "Demo ytb screenshot")](https://ytb.bastiencornier.com)
[ytb.bastiencornier.com](http://ytb.bastiencornier.com/)

## Tech

- Starter is based on : [sstnbl](https://github.com/Bastou/sstnbl)
- Vanilla js and css kepts to minimal
- For the videos I use the api from [invidious instances](https://github.com/iv-org/invidious), I don't host them.

## Features

The app respect the one page one feature principle.

- Search a video
- List videos from search query
- Play video
- And nothing else

## Getting Started

### 1. Install dependencies

```
npm install
```

Install eleventy

```
npm i -g eleventy
```

### 2. Run Project

build and host locally for local development with watcher

```
npm run start
```

build project

```
npm run build
```

to debug:

```
npm run e11:debug
```
