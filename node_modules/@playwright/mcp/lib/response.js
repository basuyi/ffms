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
export class Response {
    _result = [];
    _code = [];
    _images = [];
    _context;
    _includeSnapshot = false;
    _includeTabs = false;
    _snapshot;
    toolName;
    toolArgs;
    constructor(context, toolName, toolArgs) {
        this._context = context;
        this.toolName = toolName;
        this.toolArgs = toolArgs;
    }
    addResult(result) {
        this._result.push(result);
    }
    result() {
        return this._result.join('\n');
    }
    addCode(code) {
        this._code.push(code);
    }
    code() {
        return this._code.join('\n');
    }
    addImage(image) {
        this._images.push(image);
    }
    images() {
        return this._images;
    }
    setIncludeSnapshot() {
        this._includeSnapshot = true;
    }
    setIncludeTabs() {
        this._includeTabs = true;
    }
    async snapshot() {
        if (this._snapshot !== undefined)
            return this._snapshot;
        if (this._includeSnapshot && this._context.currentTab())
            this._snapshot = await this._context.currentTabOrDie().captureSnapshot();
        else
            this._snapshot = '';
        return this._snapshot;
    }
    async serialize() {
        const response = [];
        // Start with command result.
        if (this._result.length) {
            response.push('### Result');
            response.push(this._result.join('\n'));
            response.push('');
        }
        // Add code if it exists.
        if (this._code.length) {
            response.push(`### Ran Playwright code
\`\`\`js
${this._code.join('\n')}
\`\`\``);
            response.push('');
        }
        // List browser tabs.
        if (this._includeSnapshot || this._includeTabs)
            response.push(...(await this._context.listTabsMarkdown(this._includeTabs)));
        // Add snapshot if provided.
        const snapshot = await this.snapshot();
        if (snapshot)
            response.push(snapshot, '');
        // Main response part
        const content = [
            { type: 'text', text: response.join('\n') },
        ];
        // Image attachments.
        if (this._context.config.imageResponses !== 'omit') {
            for (const image of this._images)
                content.push({ type: 'image', data: image.data.toString('base64'), mimeType: image.contentType });
        }
        return { content };
    }
}
