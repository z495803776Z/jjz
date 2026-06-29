import { initStarfield } from './starfield.js';
import { initOpening } from './opening.js';
import { initRitual } from './ritual.js';

const canvas = document.querySelector('.starfield');
if (canvas) initStarfield(canvas);

const scene = document.querySelector('#opening-scene');
if (scene) initOpening(scene);

const ritual = document.querySelector('#ritual');
if (ritual) initRitual(ritual);