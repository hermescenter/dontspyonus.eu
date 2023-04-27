
# DontspyEU -- internal notes to setup

_this is the backend and the website_

Command sequence:

```
npm i
```
This is for the basic node environment setup

```
./init-mongodb.sh
```
This initialized a couple of index in mongodb. You need mongodb in your server.

```
./importer.mjs
```
This import the JSON in the mongodb `meps` collection.

```
npm run setup
```
This is to run the face recognition tool on our own. Maybe can be optimized and removed, and we can just use the inclusion of `@vladmandic/face-api` but it is not yet so.

```
npm run copy
```
It do this `cp duckface-analyzer.js node_modules/@vladmandic/face-api/demo/`. From that directory we can execute `duckface-analyzer` which saves into DB the face informations. It saves into the `analysis` collection.

```
cd node_modules/@vladmandic/face-api
node demo/duckface-analyzer.js -source=../../../site/static/MEPs/pics
```
This fill up the `analyisis` collection after running the face recognition tool

```
node ./backend.js
```
In the backend happens a links between the ID of the two existing MongoDB collections, and it exposed two basic APIs at the port 2023

