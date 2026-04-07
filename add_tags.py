#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动给 HTML 报告添加点评标签
用法：python add_tags.py 报告.html
"""
import sys
import re

def add_tags(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已有 meta
    if 'name="report-id"' in content:
        print('已有 report-id meta 标签，跳过')
    else:
        # 生成唯一 ID
        import hashlib
        import os
        file_path = os.path.abspath(html_file)
        report_id = hashlib.md5(file_path.encode()).hexdigest()[:8]
        # 在 <head> 后添加 meta
        content = re.sub(r'(<head[^>]*>)', r'\1\n    <meta name="report-id" content="' + report_id + '">', content, count=1)
        print(f'已添加 report-id: {report_id}')

    # 检查是否已有 inject.js
    if 'inject.js' in content:
        print('已有 inject.js 引用，跳过')
    else:
        script_tag = '<script src="/inject.js"></script>'
        content = content.replace('</body>', script_tag + '\n</body>')
        print('已添加 inject.js 引用')

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'完成: {html_file}')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python add_tags.py 报告.html')
        sys.exit(1)
    add_tags(sys.argv[1])
