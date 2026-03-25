import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json
import os
import random
import re
import time

BOT_TOKEN = os.environ['TELEGRAM_BOT_TOKEN'].strip()
CHAT_ID = os.environ['TELEGRAM_CHAT_ID'].strip()
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '').strip()
MODE = os.environ.get('PAPER_MODE', 'arxiv').strip()  # 'community' or 'arxiv'

# ===== FETCH: ArXiv =====

def fetch_arxiv_batch():
    categories = ['cs.OS', 'cs.LG', 'cs.DC', 'cs.AI', 'cs.CL']
    cat_query = '+OR+'.join([f'cat:{c}' for c in categories])
    url = (
        f'http://export.arxiv.org/api/query?search_query={cat_query}'
        f'&sortBy=submittedDate&sortOrder=descending&max_results=10'
    )
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'SujPlanner/1.0'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read().decode('utf-8')

        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        root = ET.fromstring(data)
        papers = []
        for entry in root.findall('atom:entry', ns):
            title = entry.find('atom:title', ns).text.strip().replace('\n', ' ')
            abstract = entry.find('atom:summary', ns).text.strip().replace('\n', ' ')
            link = entry.find('atom:id', ns).text.strip()
            cats = [c.get('term') for c in entry.findall('atom:category', ns)]
            papers.append({
                'title': title,
                'abstract': abstract[:1500],
                'url': link,
                'categories': ', '.join(cats[:3]),
                'source': 'ArXiv'
            })
        print(f'ArXiv: fetched {len(papers)} papers')
        return papers
    except Exception as e:
        print(f'ArXiv fetch error: {e}')
        return []

# ===== FETCH: PyTorch Korea =====

def fetch_pytorch_kr():
    url = 'https://discuss.pytorch.kr/c/news/14.rss'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'SujPlanner/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode('utf-8')

        root = ET.fromstring(data)
        papers = []
        for item in root.findall('.//item')[:5]:
            title = item.find('title').text or ''
            desc = item.find('description').text or ''
            link = item.find('link').text or ''
            clean_desc = re.sub(r'<[^>]+>', '', desc)[:1500]
            papers.append({
                'title': title.strip(),
                'abstract': clean_desc.strip(),
                'url': link.strip(),
                'source': 'PyTorch Korea'
            })
        print(f'PyTorch Korea: fetched {len(papers)} posts')
        return papers
    except Exception as e:
        print(f'PyTorch Korea fetch error: {e}')
        return []

# ===== GEMINI =====

def gemini_call(prompt):
    url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}'
    body = json.dumps({
        'contents': [{'parts': [{'text': prompt}]}]
    }).encode('utf-8')

    for attempt in range(3):
        try:
            req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode('utf-8'))
            return result['candidates'][0]['content']['parts'][0]['text']
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 2:
                wait = (attempt + 1) * 15
                print(f'Gemini rate limited, retrying in {wait}s...')
                time.sleep(wait)
            else:
                raise

# ===== TELEGRAM =====

def send_telegram(text):
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    body = json.dumps({
        'chat_id': CHAT_ID,
        'text': text,
        'parse_mode': 'HTML',
        'disable_web_page_preview': True
    }).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read().decode('utf-8'))
    if not result.get('ok'):
        raise Exception(f'Telegram error: {result}')
    print('Telegram message sent')

# ===== MODE 1: Community (06:00 KST) =====

def community_delivery():
    """PyTorch Korea 최신 글 1편 + Gemini 간단 요약."""
    papers = fetch_pytorch_kr()
    if not papers:
        send_telegram('<b>Community Delivery</b>\n\n오늘은 커뮤니티 글을 가져오지 못했습니다.')
        return

    paper = random.choice(papers)
    print(f'Selected: {paper["title"]}')

    try:
        prompt = f"""다음은 PyTorch 한국 사용자 모임에 올라온 최신 글이야.
바쁜 대학원생(성준)이 아침에 1분 만에 읽을 수 있도록 핵심만 3줄로 요약해줘.
한국어로 작성하고, 이모지 없이 깔끔하게.

[제목]: {paper['title']}
[내용]: {paper['abstract'][:2000]}

형식:
**핵심**: 이 글이 뭔지 한 줄
**포인트**: 가장 중요한 내용
**한줄평**: 읽어볼 가치가 있는 이유"""
        summary = gemini_call(prompt)
    except Exception as e:
        print(f'Gemini error: {e}')
        summary = paper['abstract'][:300] + '...'

    msg = f'<b>Community Pick</b>\n\n'
    msg += f'<b>{paper["title"]}</b>\n'
    msg += f'<i>via PyTorch Korea</i>\n'
    msg += f'{paper["url"]}\n\n'
    msg += summary

    send_telegram(msg)

# ===== MODE 2: ArXiv Curation (10:00 KST) =====

def arxiv_delivery():
    """ArXiv 10편 수집 -> Gemini가 1편 선정 + What/Result/Idea 요약."""
    papers = fetch_arxiv_batch()
    if not papers:
        send_telegram('<b>Paper Delivery</b>\n\n오늘은 ArXiv 논문을 가져오지 못했습니다.')
        return

    try:
        paper, summary = pick_and_summarize(papers)
    except Exception as e:
        print(f'Gemini error: {e}')
        paper = random.choice(papers)
        summary = '(AI 요약 생성 실패 - 직접 읽어보세요!)'

    msg = f'<b>Paper Delivery</b>\n\n'
    msg += f'<b>{paper["title"]}</b>\n'
    msg += f'<i>via ArXiv</i> | {paper["categories"]}\n'
    msg += f'{paper["url"]}\n\n'
    msg += summary

    print(f'Picked: {paper["title"]}')
    send_telegram(msg)

def pick_and_summarize(papers):
    paper_list = ''
    for i, p in enumerate(papers):
        paper_list += f'\n[{i+1}] {p["title"]}\n'
        paper_list += f'    Categories: {p["categories"]}\n'
        paper_list += f'    Abstract: {p["abstract"][:500]}\n'

    prompt = f"""너는 시스템 아키텍처와 LLM을 연구하는 대학원생(성준)의 수석 연구 조교야.
아래는 오늘 ArXiv에 올라온 {len(papers)}편의 논문 목록이야.

이 중에서 다음 연구 관심사와 가장 관련 깊은 **딱 1편**만 골라줘:
- 시스템 아키텍처의 병목 해결 (OS, 스케줄링, 메모리 관리)
- LLM Serving 최적화 (KV Cache, Speculative Decoding, vLLM)
- 강화학습을 이용한 자원 스케줄링 / RLHF
- ML Systems, 분산 시스템
- 흥미로운 최신 AI 트렌드 (새로운 아키텍처, 에이전트 등)

실용적이고 시스템에 적용 가능한 것을 우선해.
가끔 의외의 분야 논문도 골라줘.

**반드시 아래 형식으로만 응답해:**

PICK: [번호]

**What** (무엇을 해결했나)
1-2문장

**Result** (핵심 결과)
1-2문장

**Idea** (성준의 연구에 어떻게 응용 가능?)
1-2문장

===== 논문 목록 ====={paper_list}"""

    response = gemini_call(prompt)

    pick_match = re.search(r'PICK:\s*\[?(\d+)\]?', response)
    pick_idx = 0
    if pick_match:
        pick_idx = int(pick_match.group(1)) - 1
        if pick_idx < 0 or pick_idx >= len(papers):
            pick_idx = 0

    summary = re.sub(r'PICK:\s*\[?\d+\]?\s*\n?', '', response).strip()
    return papers[pick_idx], summary

# ===== MAIN =====

def main():
    print(f'Mode: {MODE}')
    if MODE == 'community':
        community_delivery()
    else:
        arxiv_delivery()

if __name__ == '__main__':
    main()
