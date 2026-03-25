import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json
import os
import random
import re
from datetime import datetime, timedelta

BOT_TOKEN = os.environ['TELEGRAM_BOT_TOKEN']
CHAT_ID = os.environ['TELEGRAM_CHAT_ID']
GEMINI_API_KEY = os.environ['GEMINI_API_KEY']

# ===== ARXIV =====
ARXIV_KEYWORDS = [
    'LLM Serving', 'LLM inference', 'KV cache',
    'operating system AI', 'ML systems',
    'reinforcement learning', 'RLHF',
    'vLLM', 'PagedAttention', 'speculative decoding',
    'mixture of experts', 'model compression',
    'AI agent', 'neural architecture'
]

def fetch_arxiv_papers(max_results=5):
    """Fetch recent papers from ArXiv using random keyword."""
    keyword = random.choice(ARXIV_KEYWORDS)
    query = urllib.parse.quote(f'all:"{keyword}"')
    url = (
        f'http://export.arxiv.org/api/query?search_query={query}'
        f'&sortBy=submittedDate&sortOrder=descending&max_results={max_results}'
    )
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'SujPlanner/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode('utf-8')

        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        root = ET.fromstring(data)
        papers = []
        for entry in root.findall('atom:entry', ns):
            title = entry.find('atom:title', ns).text.strip().replace('\n', ' ')
            abstract = entry.find('atom:summary', ns).text.strip().replace('\n', ' ')
            link = entry.find('atom:id', ns).text.strip()
            papers.append({
                'title': title,
                'abstract': abstract,
                'url': link,
                'source': f'ArXiv ({keyword})'
            })
        return papers
    except Exception as e:
        print(f'ArXiv fetch error: {e}')
        return []

# ===== PYTORCH KOREA COMMUNITY =====
def fetch_pytorch_kr(max_results=5):
    """Fetch recent posts from PyTorch Korea discuss forum RSS."""
    url = 'https://discuss.pytorch.kr/c/news/14.rss'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'SujPlanner/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode('utf-8')

        root = ET.fromstring(data)
        papers = []
        for item in root.findall('.//item')[:max_results]:
            title = item.find('title').text or ''
            desc = item.find('description').text or ''
            link = item.find('link').text or ''
            # Clean HTML tags from description
            clean_desc = re.sub(r'<[^>]+>', '', desc)[:1500]
            papers.append({
                'title': title.strip(),
                'abstract': clean_desc.strip(),
                'url': link.strip(),
                'source': 'PyTorch Korea'
            })
        return papers
    except Exception as e:
        print(f'PyTorch Korea fetch error: {e}')
        return []

# ===== GEMINI SUMMARY =====
def summarize_with_gemini(title, abstract):
    """Summarize paper using Gemini API."""
    prompt = f"""다음은 최신 AI/CS 논문 또는 기술 글의 내용입니다.
당신은 시스템 아키텍처와 LLM을 연구하는 대학원생의 똑똑한 조교입니다.
이 글을 바쁜 디렉터(성준님)를 위해 딱 3가지 항목으로 한국어 요약해 주세요.
각 항목은 1-2문장으로 간결하게 작성하세요.

1. What (무엇을 해결했나 / 무엇에 대한 글인가)
2. Result (어떤 결과를 냈나 / 핵심 포인트)
3. Idea (OS, LLM Serving, 강화학습 관점에서 어떻게 응용할 수 있을까?)

[제목]: {title}
[내용]: {abstract[:2000]}"""

    url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}'
    body = json.dumps({
        'contents': [{'parts': [{'text': prompt}]}]
    }).encode('utf-8')

    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    return result['candidates'][0]['content']['parts'][0]['text']

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

# ===== MAIN =====
def main():
    # Gather papers from both sources
    all_papers = []

    arxiv = fetch_arxiv_papers(5)
    pytorch_kr = fetch_pytorch_kr(5)

    all_papers.extend(arxiv)
    all_papers.extend(pytorch_kr)

    if not all_papers:
        send_telegram('<b>Paper Agent</b>\n\n오늘은 논문을 가져오지 못했습니다. 내일 다시 시도합니다.')
        return

    # Pick 1 random paper
    paper = random.choice(all_papers)
    print(f'Selected: [{paper["source"]}] {paper["title"]}')

    # Summarize with Gemini
    try:
        summary = summarize_with_gemini(paper['title'], paper['abstract'])
    except Exception as e:
        print(f'Gemini error: {e}')
        summary = '(요약 생성 실패 - 직접 읽어보세요!)'

    # Build message
    msg = f'<b>Paper Delivery</b>\n\n'
    msg += f'<b>{paper["title"]}</b>\n'
    msg += f'<i>via {paper["source"]}</i>\n'
    msg += f'{paper["url"]}\n\n'
    msg += summary

    send_telegram(msg)

if __name__ == '__main__':
    main()
