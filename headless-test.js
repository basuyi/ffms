#!/usr/bin/env node

const { chromium } = require('playwright');

console.log('🎭 运行无头浏览器测试（排除显示环境问题）...\n');

async function runHeadlessTest() {
    let browser = null;
    let page = null;
    
    try {
        console.log('🚀 启动无头Chromium浏览器...');
        browser = await chromium.launch({ 
            headless: true // 无头模式
        });
        
        page = await browser.newPage();
        
        // 设置用户代理
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        
        console.log('📡 访问工作流编辑器...');
        
        const response = await page.goto('http://localhost:3001', { 
            waitUntil: 'networkidle',
            timeout: 15000 
        });
        
        console.log(`📨 HTTP状态: ${response.status()}`);
        
        if (response.ok()) {
            console.log('✅ 页面HTTP响应正常');
            
            // 等待页面完全加载
            await page.waitForLoadState('networkidle');
            
            // 获取页面标题
            const title = await page.title();
            console.log(`📋 页面标题: "${title}"`);
            
            // 获取页面HTML长度
            const html = await page.content();
            console.log(`📄 页面HTML长度: ${html.length} 字符`);
            
            // 检查React根元素
            const rootElement = await page.$('#root');
            if (rootElement) {
                console.log('✅ React根元素存在');
                
                const rootContent = await rootElement.innerHTML();
                console.log(`📝 根元素内容长度: ${rootContent.length} 字符`);
                
                if (rootContent.length > 100) {
                    console.log('✅ React应用已渲染内容');
                } else {
                    console.log('⚠️ React应用可能未完全渲染');
                    console.log(`根元素内容: ${rootContent.substring(0, 200)}...`);
                }
            } else {
                console.log('❌ React根元素不存在');
            }
            
            // 检查是否有JavaScript错误
            let jsErrors = [];
            page.on('pageerror', error => {
                jsErrors.push(error.message);
            });
            
            // 等待潜在的JS执行
            await page.waitForTimeout(3000);
            
            if (jsErrors.length > 0) {
                console.log('❌ 发现JavaScript错误:');
                jsErrors.forEach(error => console.log(`   - ${error}`));
            } else {
                console.log('✅ 没有发现JavaScript错误');
            }
            
            // 检查特定元素
            console.log('\n🔍 检查应用元素...');
            
            // 检查按钮
            const buttons = await page.$$('button');
            console.log(`📱 找到 ${buttons.length} 个按钮`);
            
            // 检查React Flow
            const reactFlow = await page.$('.react-flow');
            if (reactFlow) {
                console.log('✅ React Flow画布存在');
            } else {
                console.log('⚠️ React Flow画布未找到');
            }
            
            // 尝试获取所有文本内容
            const bodyText = await page.textContent('body');
            console.log(`📝 页面文本内容长度: ${bodyText.length} 字符`);
            
            if (bodyText.includes('工作流') || bodyText.includes('workflow') || bodyText.includes('节点')) {
                console.log('✅ 页面包含工作流相关内容');
            } else {
                console.log('⚠️ 页面可能不包含预期的工作流内容');
                console.log(`前100个字符: "${bodyText.substring(0, 100)}"`);
            }
            
            // 测试API调用
            console.log('\n📡 测试页面内API调用...');
            const apiResponse = await page.evaluate(async () => {
                try {
                    const response = await fetch('/api/node-types');
                    const data = await response.json();
                    return { success: true, nodeCount: Object.keys(data).length };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            });
            
            if (apiResponse.success) {
                console.log(`✅ 页面内API调用成功，节点类型: ${apiResponse.nodeCount}种`);
            } else {
                console.log(`❌ 页面内API调用失败: ${apiResponse.error}`);
            }
            
            // 截图
            await page.screenshot({ 
                path: '/workspace/headless-screenshot.png',
                fullPage: true 
            });
            console.log('📸 无头浏览器截图已保存');
            
        } else {
            console.log(`❌ 页面HTTP响应异常: ${response.status()}`);
        }
        
    } catch (error) {
        console.log(`❌ 无头浏览器测试失败: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function testNetworkAccessibility() {
    console.log('🌐 测试网络可访问性...');
    
    const fetch = require('node-fetch');
    
    const testUrls = [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3001/api/node-types',
        'http://localhost:3001/static/js/main.69f6477e.js',
        'http://localhost:3001/static/css/main.9a5a5199.css'
    ];
    
    for (const url of testUrls) {
        try {
            const response = await fetch(url);
            console.log(`✅ ${url} - ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`❌ ${url} - ${error.message}`);
        }
    }
}

async function main() {
    await testNetworkAccessibility();
    console.log('\n' + '='.repeat(50));
    await runHeadlessTest();
    
    console.log('\n📋 测试总结:');
    console.log('📸 生成的截图文件:');
    console.log('   - /workspace/headless-screenshot.png (无头模式)');
    console.log('   - /workspace/app-screenshot.png (有头模式)');
    console.log('   - /workspace/final-screenshot.png (最终状态)');
    
    console.log('\n💡 如果无头测试成功但您仍无法访问，可能的原因:');
    console.log('   1. 浏览器缓存问题 - 尝试Ctrl+F5强制刷新');
    console.log('   2. 浏览器扩展干扰 - 尝试无痕模式');
    console.log('   3. 网络代理/VPN - 暂时禁用');
    console.log('   4. 防火墙/安全软件 - 检查端口3001是否被阻止');
    console.log('   5. DNS问题 - 尝试使用127.0.0.1:3001');
}

main().catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
});