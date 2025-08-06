/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import fs from 'fs';
import path from 'path';
import { outputFile } from './config.js';
let sessionOrdinal = 0;
export class SessionLog {
    _folder;
    _file;
    _ordinal = 0;
    constructor(sessionFolder) {
        this._folder = sessionFolder;
        this._file = path.join(this._folder, 'session.md');
    }
    static async create(config) {
        const sessionFolder = await outputFile(config, `session-${(++sessionOrdinal).toString().padStart(3, '0')}`);
        await fs.promises.mkdir(sessionFolder, { recursive: true });
        // eslint-disable-next-line no-console
        console.error(`Session: ${sessionFolder}`);
        return new SessionLog(sessionFolder);
    }
    async log(response) {
        const prefix = `${(++this._ordinal).toString().padStart(3, '0')}`;
        const lines = [
            `### Tool: ${response.toolName}`,
            ``,
            `- Args`,
            '```json',
            JSON.stringify(response.toolArgs, null, 2),
            '```',
        ];
        if (response.result()) {
            lines.push(`- Result`, '```', response.result(), '```');
        }
        if (response.code()) {
            lines.push(`- Code`, '```js', response.code(), '```');
        }
        const snapshot = await response.snapshot();
        if (snapshot) {
            const fileName = `${prefix}.snapshot.yml`;
            await fs.promises.writeFile(path.join(this._folder, fileName), snapshot);
            lines.push(`- Snapshot: ${fileName}`);
        }
        for (const image of response.images()) {
            const fileName = `${prefix}.screenshot.${extension(image.contentType)}`;
            await fs.promises.writeFile(path.join(this._folder, fileName), image.data);
            lines.push(`- Screenshot: ${fileName}`);
        }
        lines.push('', '');
        await fs.promises.appendFile(this._file, lines.join('\n'));
    }
}
function extension(contentType) {
    if (contentType === 'image/jpeg')
        return 'jpg';
    return 'png';
}
