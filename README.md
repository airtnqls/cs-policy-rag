# CS Policy RAG

한국 소비자 상담 정책과 공개형 상담 사례를 기반으로 고객지원 답변을 생성하는 B2B SaaS 스타일 RAG MVP입니다.

## 왜 만들었나

기존 웹서비스 포트폴리오가 실사용 서비스 운영 경험을 보여주는 포트폴리오라면, CS Policy RAG는 기업형 AI/RAG SaaS 개발 역량을 보여주기 위해 제작한 보완 포트폴리오입니다.

고객지원 담당자는 환불, 교환, AS, 계약해지, 위약금, 배송 분쟁 질문에 빠르게 답해야 하지만, 답변 근거와 안전한 표현을 함께 유지하기 어렵습니다. 이 MVP는 한국어 상담 질문을 분류하고 관련 상담 사례를 검색한 뒤, 근거와 신뢰도를 포함한 답변을 제공합니다.

## 주요 기능

- 한국어 소비자 상담 사례 기반 로컬 RAG
- 환불, 교환, 수리, 계약해지, 위약금, 배송, 하자, 보증, 청약철회, 중고거래 분류
- 개인정보 탐지 및 마스킹
- 프롬프트 인젝션 차단
- 검색 근거 카드와 매칭 용어, 필드, 점수 표시
- 브라우저 localStorage 기반 관리자 상담 로그
- CSV 데이터셋 탐색기와 내장 샘플 데이터 fallback
- OpenRouter 무료 모델 선택 연동
- OpenSearch 검색 어댑터 확장 구조
- Neo4j GraphRAG 어댑터 확장 구조
- Vercel 배포 가능한 Next.js App Router 구조

## 아키텍처

```txt
app/
  api/chat/route.ts       # 안전 검사, 검색, 분류, 답변 생성 API
  chat/page.tsx           # RAG 데모
  dataset/page.tsx        # 데이터셋 탐색
  admin/page.tsx          # 운영 로그
  graph/page.tsx          # GraphRAG 관계 뷰
lib/
  data/                   # CSV 로더와 샘플 데이터
  rag/                    # 토크나이저, 검색, 분류, 신뢰도, 답변
  safety/                 # PII 및 프롬프트 인젝션 탐지
  search/                 # local/OpenSearch 어댑터
  graph/                  # local/Neo4j 어댑터
```

## RAG 흐름

1. 사용자가 한국어 상담 질문을 입력합니다.
2. 개인정보를 마스킹하고 프롬프트 인젝션을 검사합니다.
3. 질문을 한국어 친화 토큰과 도메인 용어로 분해합니다.
4. 질문, 답변, 분쟁유형, 카테고리, 품목, 키워드 필드에 가중치를 적용해 상위 5개 사례를 검색합니다.
5. 검색 점수, 점수 차이, 도메인 용어 매칭, 분쟁 유형 인식 여부로 신뢰도를 계산합니다.
6. `OPENROUTER_API_KEY`가 있으면 검색 근거만 전달해 OpenRouter Chat Completions API로 답변을 생성합니다.
7. OpenRouter 호출이 실패하거나 API 키가 없으면 로컬 deterministic 답변을 생성합니다.
8. 답변에는 결론, 분쟁 유형, 확인할 사실, 인용 사례, 신뢰도, 면책 문구를 포함합니다.

## 안전 흐름

- 전화번호, 이메일, 주민등록번호 유사 패턴, 카드번호, 계좌번호, 이름 패턴을 탐지하고 마스킹합니다.
- 시스템 프롬프트 공개, 이전 지시 무시, 관리자 권한 우회 등 프롬프트 인젝션 문구를 탐지하면 검색과 답변 생성을 중단합니다.
- 차단 또는 낮은 신뢰도 결과는 관리자 로그에서 상태로 확인할 수 있습니다.

## 데이터셋 처리

실제 CSV는 다음 경로에 배치합니다.

```txt
data/raw/consumer_cases.csv
```

정규화 결과는 다음 경로에 저장됩니다.

```txt
data/processed/consumer_cases.normalized.json
```

앱 로딩 우선순위는 다음과 같습니다.

1. `data/processed/consumer_cases.normalized.json`
2. `data/raw/consumer_cases.csv`
3. `lib/data/sampleCases.ts` fallback sample data

CSV가 없으면 30개 샘플 상담 사례를 사용합니다. 샘플 데이터는 포트폴리오 데모용으로 현실적인 형식으로 작성된 가상 데이터입니다.

지원하는 컬럼명 예시는 다음과 같습니다.

- `category`, `카테고리`, `분류`
- `item`, `품목`, `상품`
- `question`, `질문`, `문의`
- `answer`, `답변`, `처리결과`
- `source`, `출처`
- `dispute_type`, `분쟁유형`

## 실제 데이터셋 사용 방법

1. 공공데이터포털에서 “한국소비자원_소비자상담 표준답변” CSV를 다운로드합니다.
2. 파일을 `data/raw/consumer_cases.csv`에 저장합니다.
3. 아래 명령을 실행합니다.

```bash
npm run data:normalize
npm run dev
```

4. `/dataset` 페이지에서 전체 record count가 표시되는지 확인합니다.

자동 다운로드도 시도할 수 있습니다.

```bash
npm run data:download
```

주의:

- 자동 다운로드는 data.go.kr 인증/세션/버튼 구조 때문에 실패할 수 있습니다.
- 실패 시 수동 다운로드 후 `npm run data:normalize`를 실행하면 됩니다.
- CSV가 없으면 앱은 30개 fallback sample data로 동작합니다.
- 약 1,332개 행의 실제 CSV가 있으면 `/dataset`과 `/chat` 모두 전체 데이터셋을 대상으로 동작합니다.

## Optional OpenRouter API

이 프로젝트는 API 키 없이도 로컬 deterministic 답변으로 동작합니다. OpenRouter 무료 모델을 사용하려면 Vercel 또는 로컬 `.env.local`에 다음 값을 추가합니다.

```bash
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=openrouter/free
OPENROUTER_SITE_URL=https://your-vercel-domain.vercel.app
OPENROUTER_APP_TITLE=CS Policy RAG
```

동작 우선순위는 다음과 같습니다.

1. `OPENROUTER_API_KEY`가 있으면 검색된 상담 사례만 근거로 OpenRouter Chat Completions API를 호출합니다.
2. OpenRouter 호출이 실패하거나 무료 모델 rate limit이 발생하면 로컬 deterministic 답변으로 자동 fallback합니다.
3. API 키가 없으면 외부 네트워크 호출 없이 로컬 답변만 사용합니다.

무료 모델은 사용량 제한과 일시적 429 응답이 있을 수 있으므로 포트폴리오 데모에서는 fallback을 유지하는 것을 권장합니다.

## OpenSearch 확장 계획

현재 MVP는 `lib/search/localSearchAdapter.ts`를 사용합니다. 운영 환경에서는 `lib/search/openSearchAdapter.ts`에 OpenSearch 클라이언트를 연결하고, `question`, `answer`, `disputeType`, `category`, `item`, `keywords` 필드에 BM25 가중치를 적용하면 됩니다. UI와 API는 `RetrievedCase` 인터페이스를 유지하므로 검색 엔진 교체 영향이 작습니다.

## Neo4j GraphRAG 확장 계획

현재 MVP는 `lib/graph/localGraphAdapter.ts`로 질문, 분쟁 유형, 품목, 정책 용어, 상담 사례 관계를 구성합니다. 운영 환경에서는 `lib/graph/neo4jAdapter.ts`에 드라이버를 연결하고 상담 사례와 정책 용어를 노드로 적재해 Cypher 쿼리로 근거 경로를 반환할 수 있습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

프로덕션 빌드 확인:

```bash
npm run build
```

## Vercel 배포

별도 서버, Docker, DB, 인증이 필요 없습니다.

1. GitHub 저장소를 Vercel에 연결합니다.
2. Framework Preset은 Next.js를 선택합니다.
3. OpenRouter를 사용할 경우 Vercel 환경 변수에 `OPENROUTER_API_KEY`와 선택 모델 값을 추가합니다.
4. CSV 파일을 포함하려면 `data/raw/consumer_cases.csv` 또는 정규화된 `data/processed/consumer_cases.normalized.json`을 저장소에 추가합니다.

## 향후 개선

- 실제 공공 상담 데이터 정제 파이프라인 추가
- OpenSearch BM25와 벡터 검색 하이브리드 검색
- Neo4j 기반 정책 용어 관계 탐색
- 답변 평가셋과 회귀 테스트
- 관리자 로그 서버 저장소 연결
- 상담원 피드백을 활용한 검색 품질 개선
