import { createApp } from '../src/app.js';
import { createModels } from '../src/models/index.js';
import { db } from '../src/config/db.js';

const app = createApp(createModels(db));

export default app;
