"""
报表点评服务
用法：python review_server.py [端口]
"""
from flask import Flask, request, jsonify, make_response, send_file
import sqlite3, uuid, re
from pathlib import Path
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5001
BASE_DIR = Path(__file__).parent
DB = BASE_DIR / 'comments.db'

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            create table if not exists comments (
                id text primary key,
                report_id text not null,
                section_id text default '',
                section_title text default '',
                content text not null,
                author text default '匿名',
                created_at text,
                updated_at text,
                parent_id text
            )
        """)
        conn.execute("create index if not exists idx_report on comments(report_id)")
        conn.commit()

def get_now():
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d %H:%M')

def get_stats():
    with get_db() as conn:
        reports = conn.execute("select report_id, count(*) as n from comments where parent_id is null group by report_id").fetchall()
        if not reports:
            return '<div style="color:#888;">暂无数据</div>'
        return ''.join(f'<div>📄 <strong>{r["report_id"]}</strong> — {r["n"]} 条点评</div>' for r in reports)

def get_reports_html():
    reports_dir = BASE_DIR
    html_files = list(reports_dir.glob('*.html'))
    if not html_files:
        return '<div style="color:#888;">当前目录暂无 HTML 文件</div>'
    return ''.join(f'<div class="card"><a href="/report/{f.name}">{f.name}</a></div>' for f in html_files)

app = Flask(__name__)

@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

@app.route('/')
def index():
    ip = sys.argv[2] if len(sys.argv) > 2 else 'localhost'
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>报表点评服务</title>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:-apple-system,"Microsoft YaHei",Arial,sans-serif;background:#f5f6fa;padding:30px;color:#333}}
  h1{{font-size:24px;color:#1a1a2e;margin-bottom:20px}}
  .card{{background:#fff;padding:16px 20px;border-radius:8px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,.1);max-width:600px}}
  a{{color:#4f46e5;text-decoration:none;font-size:14px}}
  a:hover{{text-decoration:underline}}
  .sub{{font-size:12px;color:#888;margin-top:8px}}
  .stats{{margin-top:30px}}
  .stats h2{{font-size:16px;color:#555;margin-bottom:10px}}
  .info{{background:#eef2ff;border-left:4px solid #667eea;padding:12px 16px;border-radius:0 6px 6px 0;margin-bottom:20px;font-size:13px;max-width:600px}}
  .info code{{background:#dde;padding:2px 6px;border-radius:3px;font-size:12px}}
</style>
</head>
<body>
<h1>📊 报表点评服务</h1>
<p style="color:#888;margin-bottom:20px;">端口 {PORT} · 局域网: http://{ip}:{PORT}</p>

<div class="info">
  局域网访问：确保防火墙允许 <code>{PORT}</code> 端口
</div>

<h2 style="font-size:16px;color:#555;margin-bottom:10px;">📁 HTML 报告</h2>
{get_reports_html()}

<div class="stats">
  <h2>📈 点评统计</h2>
  {get_stats()}
</div>
</body>
</html>"""
    return html

@app.route('/report/<path:filename>')
def serve_report(filename):
    filepath = BASE_DIR / filename
    if filepath.exists():
        return send_file(filepath)
    return 'File not found', 404

@app.route('/api/comments/<report_id>', methods=['GET'])
def get_comments(report_id):
    with get_db() as conn:
        rows = conn.execute(
            "select * from comments where report_id=? order by created_at asc",
            (report_id,)
        ).fetchall()
    top_level = []
    replies_map = {}
    for r in rows:
        item = dict(r)
        if item['parent_id']:
            replies_map.setdefault(item['parent_id'], []).append(item)
        else:
            item['replies'] = []
            top_level.append(item)
    for it in top_level:
        it['replies'] = replies_map.get(it['id'], [])
    return jsonify(top_level)

@app.route('/api/comments/<report_id>', methods=['POST'])
def add_comment(report_id):
    data = request.get_json()
    if not data or not data.get('content', '').strip():
        return jsonify({'error': '内容不能为空'}), 400
    parent_id = data.get('parent_id') or None
    now = get_now()
    cid = str(uuid.uuid4())[:8]
    with get_db() as conn:
        if parent_id:
            row = conn.execute("select report_id from comments where id=?", (parent_id,)).fetchone()
            if not row or row[0] != report_id:
                return jsonify({'error': '回复目标不存在'}), 404
        conn.execute(
            "insert into comments (id,report_id,section_id,section_title,content,author,created_at,updated_at,parent_id) "
            "values (?,?,?,?,?,?,?,?,?)",
            (cid, report_id, data.get('section_id',''),
             data.get('section_title',''),
             data.get('content','').strip(),
             data.get('author','匿名').strip() or '匿名',
             now, now, parent_id)
        )
        conn.commit()
    return jsonify({'id': cid, 'created_at': now})

@app.route('/api/comments/item/<cid>', methods=['PUT'])
def update_comment(cid):
    data = request.get_json()
    if not data or not data.get('content', '').strip():
        return jsonify({'error': '内容不能为空'}), 400
    now = get_now()
    with get_db() as conn:
        conn.execute("update comments set content=?,author=?,updated_at=? where id=?",
                    (data.get('content','').strip(),
                     data.get('author','匿名').strip() or '匿名',
                     now, cid))
        conn.commit()
    return jsonify({'id': cid, 'updated_at': now})

@app.route('/api/comments/item/<cid>', methods=['DELETE'])
def delete_comment(cid):
    with get_db() as conn:
        conn.execute("delete from comments where parent_id=?", (cid,))
        conn.execute("delete from comments where id=?", (cid,))
        conn.commit()
    return jsonify({'ok': True})

@app.route('/inject.js')
def inject_js():
    js_path = BASE_DIR / 'inject.js'
    if not js_path.exists():
        return '// inject.js not found', 404
    resp = make_response(js_path.read_text(encoding='utf-8'))
    resp.content_type = 'application/javascript'
    return resp

if __name__ == '__main__':
    init_db()
    print('=' * 50)
    print('  报表点评服务')
    print('=' * 50)
    print(f'  本机访问：http://localhost:{PORT}')
    print(f'  局域网访问：http://0.0.0.0:{PORT}')
    print()
    print('  按 Ctrl+C 停止服务')
    print('=' * 50)
    app.run(host='0.0.0.0', port=PORT, debug=False, use_reloader=False)
