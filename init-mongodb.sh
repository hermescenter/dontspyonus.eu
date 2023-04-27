#!/bin/sh
mongosh faces --eval 'db.analysis.createIndex({id: 1}, {unique: true})'
mongosh faces --eval 'db.meps.createIndex({id: 1}, {unique: true})'
mongosh faces --eval 'db.meps.createIndex({party: 1})'
