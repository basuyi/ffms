#!/usr/bin/env node

const { chromium } = require('playwright');

console.log('🎭 启动Playwright真实浏览器测试...\n');

async function runBrowserTest() {
    let browser = null;
    let page = null;
    
    try {
        console.log('🚀 启动Chromium浏览器...');
        browser = await chromium.launch({ 
            headless: false, // 显示浏览器窗口
            devtools: true,  // 打开开发者工具
            slowMo: 1000     // 慢动作，便于观察
        });
        
        console.log('📄 创建新页面...');
        page = await browser.newPage();
        
        // 监听控制台消息
        page.on('console', msg => {
            console.log(`🖥️ 浏览器控制台[${msg.type()}]: ${msg.text()}`);
        });
        
        // 监听页面错误
        page.on('pageerror', error => {
            console.log(`❌ 页面错误: ${error.message}`);
        });
        
        // 监听网络请求
        page.on('request', request => {
            console.log(`📡 请求: ${request.method()} ${request.url()}`);
        });
        
        // 监听网络响应
        page.on('response', response => {
            const status = response.status();
            const url = response.url();
            if (url.includes('localhost:3001')) {
                console.log(`📨 响应: ${status} ${url}`);
            }
        });
        
        console.log('\n🌐 测试1: 尝试访问工作流编辑器主页...');
        
        try {
            // 设置较长的超时时间
            await page.goto('http://localhost:3001', { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            console.log('✅ 页面加载成功!');
            
            // 等待React应用加载
            console.log('⏳ 等待React应用初始化...');
            await page.waitForSelector('#root', { timeout: 10000 });
            console.log('✅ React根节点已找到');
            
            // 检查页面标题
            const title = await page.title();
            console.log(`📋 页面标题: "${title}"`);
            
            // 截图
            await page.screenshot({ path: '/workspace/app-screenshot.png' });
            console.log('📸 截图已保存到: /workspace/app-screenshot.png');
            
            // 检查是否有错误信息
            const errorElements = await page.$$('*:has-text("无法访问")');
            if (errorElements.length > 0) {
                console.log('❌ 发现"无法访问"错误信息');
            } else {
                console.log('✅ 没有发现明显的错误信息');
            }
            
            // 等待工作流编辑器特定元素
            console.log('🔍 检查工作流编辑器元素...');
            
            // 检查是否有React Flow画布
            try {
                await page.waitForSelector('.react-flow', { timeout: 5000 });
                console.log('✅ React Flow画布已加载');
            } catch (e) {
                console.log('⚠️ React Flow画布未找到 (可能还在加载)');
            }
            
            // 检查是否有添加节点按钮
            try {
                await page.waitForSelector('button', { timeout: 5000 });
                const buttons = await page.$$('button');
                console.log(`✅ 找到 ${buttons.length} 个按钮元素`);
            } catch (e) {
                console.log('⚠️ 未找到按钮元素');
            }
            
        } catch (error) {
            console.log(`❌ 主页面访问失败: ${error.message}`);
            
            // 尝试访问测试页面
            console.log('\n🌐 测试2: 尝试访问测试页面...');
            try {
                await page.goto('http://localhost:9999/browser-test.html', { 
                    waitUntil: 'networkidle',
                    timeout: 15000 
                });
                console.log('✅ 测试页面加载成功!');
                
                // 等待测试结果
                await page.waitForTimeout(3000);
                
                const testResults = await page.textContent('body');
                if (testResults.includes('服务器连接成功')) {
                    console.log('✅ 测试页面显示服务器连接成功');
                } else {
                    console.log('⚠️ 测试页面可能显示连接问题');
                }
                
            } catch (testError) {
                console.log(`❌ 测试页面也无法访问: ${testError.message}`);
            }
        }
        
        console.log('\n🌐 测试3: 直接测试API端点...');
        
        try {
            const response = await page.goto('http://localhost:3001/api/node-types', {
                waitUntil: 'networkidle',
                timeout: 10000
            });
            
            if (response.ok()) {
                console.log('✅ API端点可以正常访问');
                const content = await page.textContent('pre');
                if (content && content.includes('start')) {
                    console.log('✅ API返回正确的JSON数据');
                } else {
                    console.log('⚠️ API数据格式可能有问题');
                }
            } else {
                console.log(`❌ API端点响应异常: ${response.status()}`);
            }
        } catch (apiError) {
            console.log(`❌ API端点测试失败: ${apiError.message}`);
        }
        
        console.log('\n⏳ 保持浏览器打开30秒供手动检查...');
        await page.waitForTimeout(30000);
        
    } catch (error) {
        console.log(`❌ 浏览器测试失败: ${error.message}`);
        console.log('错误堆栈:', error.stack);
    } finally {
        if (page) {
            console.log('📸 保存最终截图...');
            await page.screenshot({ path: '/workspace/final-screenshot.png' }).catch(() => {});
        }
        if (browser) {
            console.log('🔚 关闭浏览器...');
            await browser.close();
        }
    }
}

async function checkServices() {
    console.log('🔍 检查服务状态...');
    
    const fetch = require('node-fetch');
    
    try {
        console.log('📡 测试后端API...');
        const response = await fetch('http://localhost:3001/api/node-types');
        if (response.ok) {
            console.log('✅ 后端API响应正常');
        } else {
            console.log(`❌ 后端API响应异常: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ 后端API无法连接: ${error.message}`);
        return false;
    }
    
    try {
        console.log('🎨 测试前端页面...');
        const response = await fetch('http://localhost:3001');
        if (response.ok) {
            const html = await response.text();
            if (html.includes('root')) {
                console.log('✅ 前端页面响应正常');
                return true;
            } else {
                console.log('⚠️ 前端页面内容异常');
                return false;
            }
        } else {
            console.log(`❌ 前端页面响应异常: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ 前端页面无法连接: ${error.message}`);
        return false;
    }
}

async function main() {
    const servicesOk = await checkServices();
    
    if (!servicesOk) {
        console.log('\n❌ 服务检查失败，请先确保服务器正常运行');
        process.exit(1);
    }
    
    console.log('✅ 服务检查通过，开始浏览器测试\n');
    await runBrowserTest();
    
    console.log('\n📋 测试完成!');
    console.log('📸 检查截图文件:');
    console.log('   - /workspace/app-screenshot.png');
    console.log('   - /workspace/final-screenshot.png');
}

main().catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
});