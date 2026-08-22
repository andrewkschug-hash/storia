/** Merged romance content for Phase 13 builder. */
'use strict';

const early = require('./lettera-content-01-02.cjs');
const midA = require('./lettera-ch03-08.cjs');
const midB = require('./lettera-ch09-15.cjs');
const late = require('./lettera-ch16-22.cjs');

module.exports = [...early, ...midA, ...midB, ...late];
