#!/usr/bin/env node
/**
 * 批量合并PR脚本
 * 功能：自动批量合并PR并关闭关联Issue
 */

const { execSync } = require('child_process');

// 获取环境变量
const MODE = process.env.MODE || 'recent';
const COUNT = parseInt(process.env.COUNT || '5', 10);
const EXCLUDE = process.env.EXCLUDE || '';
const PR_NUMBERS = process.env.PR_NUMBERS || '';
const AUTO_CLOSE = process.env.AUTO_CLOSE === 'true';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Meowouuo/lyrics';
const API = `https://api.github.com/repos/${REPO}`;

// 执行curl命令
function curl(url, method = 'GET', data = null) {
  const headers = `-H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github+json"`;
  // 对于非 GET 请求，需要添加 -X 参数
  const methodFlag = method !== 'GET' ? `-X ${method}` : '';
  const dataFlag = data ? `-d '${JSON.stringify(data)}'` : '';
  const cmd = `curl -s ${methodFlag} ${headers} ${dataFlag} "${url}"`.trim().replace(/\s+/g, ' ');
  try {
    const output = execSync(cmd, { encoding: 'utf8' });
    if (!output.trim()) return null;  // DELETE 请求返回空
    return JSON.parse(output);
  } catch (e) {
    console.error(`请求失败: ${url}, 方法: ${method}, 错误: ${e.message}`);
    return null;
  }
}

// 获取PR列表
function getPRsToMerge() {
  const prs = [];

  if (MODE === 'manual') {
    // 手动模式：解析输入的PR编号
    const numbers = PR_NUMBERS.split(',').map(n => n.trim()).filter(n => n);
    for (const num of numbers) {
      prs.push(parseInt(num, 10));
    }
  } else {
    // 最近N个模式
    const excludeSet = new Set(EXCLUDE.split(',').map(n => n.trim()).filter(n => n));
    const allPRs = curl(`${API}/pulls?state=open&sort=created&direction=desc&per_page=100`);

    if (!allPRs || !Array.isArray(allPRs)) {
      console.error('获取PR列表失败');
      return [];
    }

    for (const pr of allPRs) {
      const num = String(pr.number);
      if (!excludeSet.has(num) && prs.length < COUNT) {
        prs.push(pr.number);
      }
    }
  }

  return prs;
}

// 合并单个PR
function mergePR(prNumber) {
  console.log(`\n正在处理 PR #${prNumber}...`);

  // 获取PR信息
  const prInfo = curl(`${API}/pulls/${prNumber}`);
  if (!prInfo) {
    console.log(`  ❌ 无法获取 PR #${prNumber} 信息，跳过`);
    return false;
  }

  if (prInfo.state === 'closed') {
    console.log(`  ⏭️ PR #${prNumber} 已关闭，跳过`);
    return false;
  }

  if (prInfo.merged) {
    console.log(`  ⏭️ PR #${prNumber} 已合并，跳过`);
    return false;
  }

  console.log(`  PR标题: ${prInfo.title}`);
  console.log(`  可合并: ${prInfo.mergeable}`);

  // 提取关联的Issue编号
  let issueNumber = null;
  const bodyMatch = prInfo.body?.match(/#(\d+)/);
  if (bodyMatch) {
    issueNumber = bodyMatch[1];
  } else {
    const headMatch = prInfo.head?.ref?.match(/\/(\d+)-/);
    if (headMatch) {
      issueNumber = headMatch[1];
    }
  }

  // 合并PR
  console.log(`  正在合并 PR #${prNumber}...`);
  const mergeResult = curl(`${API}/pulls/${prNumber}/merge`, 'PUT', { merge_method: 'squash' });

  if (mergeResult && mergeResult.merged) {
    console.log(`  ✅ PR #${prNumber} 合并成功`);

    // 删除已合并的PR分支
    const headRef = prInfo.head?.ref;
    if (headRef && headRef !== 'dev' && headRef !== 'main') {
      console.log(`  正在删除分支 ${headRef}...`);
      const deleteResult = curl(`${API}/git/refs/heads/${encodeURIComponent(headRef)}`, 'DELETE');
      if (deleteResult === null) {
        // DELETE 请求成功返回空
        console.log(`  ✅ 分支 ${headRef} 已删除`);
      } else {
        console.log(`  ⚠️ 分支 ${headRef} 删除失败`);
      }
    }

    // 关闭关联的Issue
    if (AUTO_CLOSE && issueNumber) {
      console.log(`  正在关闭 Issue #${issueNumber}...`);
      curl(`${API}/issues/${issueNumber}`, 'PATCH', { state: 'closed' });
      curl(`${API}/issues/${issueNumber}/labels`, 'POST', ['已完成']);
      console.log(`  📌 Issue #${issueNumber} 已关闭`);
    }

    return true;
  } else {
    console.log(`  ❌ PR #${prNumber} 合并失败: ${mergeResult?.message || '未知错误'}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log('=== 批量合并PR ===');
  console.log(`模式: ${MODE}`);
  console.log(`自动关闭Issue: ${AUTO_CLOSE}`);
  console.log('');

  const prs = getPRsToMerge();

  if (prs.length === 0) {
    console.log('没有需要合并的PR');
    return;
  }

  console.log(`将要合并的PR: ${prs.join(', ')}`);
  console.log('');

  let successCount = 0;
  for (const pr of prs) {
    if (mergePR(pr)) {
      successCount++;
    }
  }

  console.log(`\n✅ 批量处理完成: ${successCount}/${prs.length} 个PR合并成功`);
}

main().catch(err => {
  console.error('错误:', err);
  process.exit(1);
});
