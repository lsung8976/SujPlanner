// Notion 논문 정리 → Core Research 마이그레이션 (v3: 저자/연도/저널 포함)
var NOTION_PAPERS = [
    {
        paper: "Efficient Memory Management for LLM Serving with PagedAttention (vLLM)",
        authors: "Kwon, W. et al.",
        year: "2023",
        venue: "SOSP 2023",
        status: "cited",
        tags: "#KV_Cache #LLM_Serving #OS #vLLM #PagedAttention #Memory",
        application: "OS의 Virtual Memory Paging 기법을 KV 캐시 관리에 적용. 내 연구의 OS-기반 LLM 메모리 관리 접근법의 기초가 되는 핵심 논문.",
        critique: "Paging 기법 자체는 검증된 방식이나, 단일 GPU 내 메모리 관리에 한정. 분산 환경에서의 페이지 관리 확장은 다루지 않음.",
        notes: "[2025-12-15]\nWhat: 기존 LLM 시스템의 메모리에 모델+KV캐시가 비효율적으로 올라감. KV캐시 용량이 클수록 성능 상승. OS의 Paging 기법에서 착안한 PagedAttention 개발.\nResult: Throughput 증가, beam search/parallel sampling 성능 향상, 메모리 절약, Latency 감소.\nIdea: 전통적 OS 기법을 KV 캐싱에 적용하여 성능 향상을 가져다준 좋은 논문.",
        created: "2025-12-15T00:00:00.000Z"
    },
    {
        paper: "MemGPT: Towards LLMs as Operating System",
        authors: "Packer, C. et al.",
        year: "2023",
        venue: "Arxiv (NeurIPS 2023 Workshop)",
        status: "reading",
        tags: "#LLM_OS #Memory_Management #Context_Window #HierarchicalMemory",
        application: "LLM이 자체 메모리를 자율적으로 관리하는 구조. 내 연구의 'LLM as OS' 비전과 직접 연결. 계층적 메모리 구조(Main/Disk)를 LLM에 적용한 아이디어 차용 가능.",
        critique: "Function call 기반 메모리 관리는 오버헤드 발생 가능. 실시간 서빙 환경에서의 latency 영향 미검증. 일반화 가능성에 대한 실험 부족.",
        notes: "[2025-12-16]\nWhat: LLM 컨텍스트 윈도우 한계를 OS 계층적 메모리 구조로 해결. 자주 쓰는 Context→Main Memory, External Context→Disk. Function call로 LLM이 자율적으로 메모리 관리.\nResult: 채팅 에이전트에서 장기 기억 유지, 검색과 함께 지속 대화 가능.\nIdea: 저장소 관리를 함수콜로 수행. 메모리 계층 구조로 LLM 장기기억 상승. 이런 게 일반화된 시대가 오지 않을까? 마치 사람처럼.",
        created: "2025-12-16T00:00:00.000Z"
    },
    {
        paper: "DistServe: Disaggregated Prefill-Decode LLM Serving",
        authors: "Zhong, Y. et al.",
        year: "2024",
        venue: "OSDI 2024",
        status: "cited",
        tags: "#LLM_Serving #PD_Disaggregation #Distributed #GPU_Scheduling #RL",
        application: "Prefill/Decode 분리 서빙의 기본 프레임워크. 이기종 GPU 그룹(메모리 적합→Decode, 연산 적합→Prefill, 유연한 고성능→플렉시블)으로 나누고 RL로 동적 할당하는 아이디어의 출발점.",
        critique: "이기종 GPU 활용 가능성을 제시하나 실제 다양한 GPU mix에서의 실험 부족. RL 기반 동적 할당은 미탐구 영역.",
        notes: "[2025-12-17]\nWhat: LLM의 Prefill과 Decode 단계를 GPU를 나눠 사용. 분산화된 LLM 서빙 시스템 제안.\nResult: 더 좋은 Throughput, Latency 기대.\nIdea: 다중 이기종 GPU 활용. 메모리 적합 GPU→Decode, 연산 적합→Prefill, 플렉시블 고성능 GPU를 RL로 전환하며 성능 기대.",
        created: "2025-12-17T00:00:00.000Z"
    },
    {
        paper: "Splitwise: Efficient Generative LLM Serving with Phase Splitting",
        authors: "Patel, P. et al.",
        year: "2024",
        venue: "ISCA 2024",
        status: "reading",
        tags: "#LLM_Serving #PD_Split #Scheduler #KV_Cache_Transfer #Cluster",
        application: "Prompt/Token Pool + Mixed Pool 관리 스케줄러 설계가 내 연구의 스케줄링 레이어에 참고 가능. KV-Cache 전송 방법론 상세 서술이 유용.",
        critique: "LLM 서빙의 디테일(KV Cache 전송, GPU별 행렬 연산 배치 등) 논문은 이미 많음. 차별화 포인트를 찾아야 하는 과제가 남아있음.",
        notes: "[2025-12-19]\nWhat: Prompt Computation / Token Generation Phase 분리. Prompt Pool, Token Pool, Mixed Pool 관리 Cluster-Level Scheduler. KV-Cache 이동 방법론 상세 서술.\nResult: 다양한 HW 클러스터 프로비저닝. 전력/비용 효율 증가. KV-Cache 전송 오버헤드 우수.\nIdea: LLM은 디테일이 중요. GPU 분할, 연산 과정, KV Cache 전송 스케줄링은 이미 많은 논문 존재. 내가 비집고 들어갈 곳은 어디인가?",
        created: "2025-12-19T00:00:00.000Z"
    },
    {
        paper: "Mooncake: A KVCache-centric Disaggregated Architecture for LLM Serving",
        authors: "Qin, R. et al. (Moonshot AI)",
        year: "2024",
        venue: "Arxiv",
        status: "cited",
        tags: "#KV_Cache #Distributed_Storage #RDMA #PD_Disaggregation #Scheduler #Mooncake",
        application: "분산 자원(CPU, DRAM, SSD, RDMA)을 통합한 KVCache 저장소(Mooncake Store) 구축이 핵심. 내 연구는 이를 확장하여 '분산된 자원을 하나로 합치는' 방향으로 기여 가능.",
        critique: "단일 시스템 내 자원 활용에 한정. 여러 노드에 걸친 분산 자원 통합은 미탐구. Conductor 스케줄러의 스케일링 한계 미검증.",
        notes: "[2025-12-22]\nWhat: Prefill/Decode 분리 아키텍처. 분산 자원을 묶어 KVCache 공유 저장소(Mooncake Store) 구축. PagedBlock 관리, zero-copy, RDMA NIC 활용. Conductor 전역 스케줄러로 prefix 매칭 및 부하 분산.\nResult: 실제 챗봇에 운용. 유효요청용량 59~498% 증가. Prefill 성능 대폭 향상.\nIdea: 분산 자원을 KVCache로 활용하는 아키텍처가 등장. 앞으로 내 논문은 분산된 자원을 하나로 합치는 방향으로 기여사항을 적으면 좋겠다.",
        created: "2025-12-22T00:00:00.000Z"
    },
    {
        paper: "semi-PD: Towards Efficient LLM Serving via Phase-wise Disaggregated Computation and Unified Storage",
        authors: "Liu, H. et al.",
        year: "2024",
        venue: "Arxiv",
        status: "reading",
        tags: "#PD_Disaggregation #SM_Partitioning #Unified_Memory #LLM_Serving",
        application: "Unified Memory Manager + Computational Resource Controller로 전체 GPU SM을 Prefill/Decode에 동적 분배. Elastic Buffer 개념이 내 연구의 자원 관리 레이어에 적용 가능.",
        critique: "DistServe 코드베이스 의존. SM 비율 분배의 최적화 기준이 불명확. 이기종 GPU 환경에서의 확장성 미검증.",
        notes: "[2025-12-23]\nWhat: Prefill/Decode를 서로 다른 GPU에 나눠 서빙. Unified Memory Manager + Computational Resource Controller로 전체 GPU 제어. (x,y) SM 비율 분배.\nResult: TTFT, TPOT 성능 향상. DistServe 코드베이스. FFN, GEMM 퓨전. Elastic Buffer로 워크로드 감소.",
        created: "2025-12-23T00:00:00.000Z"
    },
    {
        paper: "FlexGen: High-Throughput Generative Inference of Large Language Models with a Single GPU",
        authors: "Sheng, Y. et al.",
        year: "2023",
        venue: "ICML 2023",
        status: "reading",
        tags: "#Offloading #Single_GPU #KV_Cache #Quantization #Throughput #Memory",
        application: "제한된 GPU 환경에서의 메모리 관리 전략. 지그재그 스케줄링으로 가중치/KV Cache 업로드/오프로딩 병목 최소화. 내 연구의 메모리 계층 활용 전략에 참고.",
        critique: "단일 GPU 최적화에 한정. 분산 환경 확장 미고려. Throughput 중심이라 Latency 관점 약함.",
        notes: "[2025-12-27]\nWhat: 제한된 GPU에서 대규모 LLM inference 높은 Throughput 달성. 지그재그 스케줄링 + GPU/CPU/Disk 통합 캐시 관리 + Quantization으로 가중치/KV캐시 압축.\nResult: 단일 GPU에서 기존 대비 100배 높은 Throughput.\nIdea: 제한된 GPU, 메모리 이슈가 LLM에서 가장 큰 이슈임을 재확인.",
        created: "2025-12-27T00:00:00.000Z"
    },
    {
        paper: "Helix: Serving LLMs over Heterogeneous GPUs and Network via Max-Flow",
        authors: "Mei, X. et al.",
        year: "2025",
        venue: "EuroSys 2025",
        status: "reading",
        tags: "#Heterogeneous_GPU #Max_Flow #MILP #Pipeline_Parallelism #LLM_Serving #Low_Cost",
        application: "이기종 분산 GPU 환경에서 Max-Flow 공식화로 최적 모델 배치. L4 같은 저비용 GPU 조합이 H100급 성능 달성. 내 연구의 이기종 자원 활용 + 비용 최적화에 직접 적용 가능.",
        critique: "MILP 풀이 시간이 대규모 클러스터에서 확장 가능한지 미검증. 동적 워크로드 변화에 대한 대응 부족.",
        notes: "[2025-12-29]\nWhat: 이기종 분산 GPU+네트워크 환경에서 Max-Flow 문제로 공식화. MILP 알고리즘으로 최적 모델 placement, per-request pipelining, request scheduling.\nResult: 네트워크 오버헤드 감소, 높은 디코드 처리량, 프롬프트 레이턴시 감소.\nIdea: 저비용 L4 GPU 조합이 H100급 성능. 저전력 강점. 이질적 자원 활용에 많은 인사이트. 파이프라인 병렬화, 모델 배치 방법론.",
        created: "2025-12-29T00:00:00.000Z"
    },
    {
        paper: "SpotServe: Serving Generative LLMs on Preemptible Instances",
        authors: "Miao, X. et al.",
        year: "2024",
        venue: "ASPLOS 2024",
        status: "reading",
        tags: "#Preemptible_GPU #Dynamic_Reparallelization #Migration #Cost_Optimization #LLM_Serving",
        application: "Preemptible GPU의 동적 재병렬화 + 마이그레이션 비용 수식화. 내 연구의 동적 자원 할당 및 장애 복구 전략에 참고 가능.",
        critique: "Preemptible 인스턴스 가용성이 클라우드 제공자에 종속. 실제 프로덕션 환경에서의 안정성 검증 부족.",
        notes: "[2025-12-30]\nWhat: Preemptible GPU 인스턴스 활용한 저비용 서빙. 동적 재병렬화 + 그래프 기반 GPU 파라미터/KV캐시 마이그레이션 시각화 및 비용 최소화.\nResult: 기존 대비 Tail latency 감소, 비용 절감.\nIdea: 동적으로 변하는 GPU 인스턴스를 잘 활용. 지속적 모니터링 + 이기종 GPU간 마이그레이션 수식화.",
        created: "2025-12-30T00:00:00.000Z"
    },
    {
        paper: "ReKV: Real-time Streaming Video Understanding with KV Cache Retrieval",
        authors: "Shi, Y. et al.",
        year: "2025",
        venue: "ICLR 2025",
        status: "reading",
        tags: "#Video_LLM #KV_Cache #Streaming #Real_Time #VQA",
        application: "비디오 스트리밍 LLM에서의 KV Cache 실시간 관리. 코사인 유사도 기반 어텐션 계산이 내 연구의 실시간 캐시 관리 전략에 참고 가능.",
        critique: "자원 제약으로 실험 규모 한정. 대규모 환경 재현 어려움. 거대 자본 필요한 연구 영역.",
        notes: "[2026-01-20]\nWhat: Video-LLMs + Streaming VQA를 가능하게 하는 Training-Free 방식. 기존 VQA는 전체 비디오 처리 후 응답 필요. ReKV는 실시간 상호작용 해결. 코사인 유사도 + 어텐션 실시간 계산.\nResult: External/Internal Retrieval 모두 uniform sampling 대비 크게 우수. 낮은 latency, GPU 메모리 사용량.\nIdea: 비디오 스트리밍 LLM 첫 논문. 메모리가 중요해지는 시대. 거대한 비디오 실시간 처리를 위한 KV캐시 논문이 쏟아질 것. 자원 제약이 단점.",
        created: "2026-01-20T00:00:00.000Z"
    },
    {
        paper: "Cutting is All You Need: Execution of Large-Scale QNN on Limited-Qubit Device",
        authors: "Lee, S. et al.",
        year: "2025",
        venue: "IEEE QAI 2025",
        status: "reading",
        tags: "#Quantum #Circuit_Cutting #HQNN #Backpropagation #Limited_Qubit",
        application: "N큐빗 회로를 M큐빗 디바이스에서 실행하는 cutting 방법. 양자 컴퓨팅의 자원 제약 해결 관점에서 LLM 서빙의 GPU 자원 제약 문제와 유사한 접근.",
        critique: "Cut Circuit이 Original 대비 성능 열화 뚜렷. 큐빗 부족 디바이스 문제 해결을 위해 다중 디바이스 필요성 발생 가능.",
        notes: "[2026-01-29]\nWhat: HQNN에서 N큐빗 회로를 M큐빗 디바이스에서 실행하기 위한 cutting 기법. 기존 backpropagation 문제 해결. 최적 cutting point 탐색.\nResult: Cut Circuit이 Original Circuit과 Accuracy 유사.\nIdea: 분할 서킷은 오리지널 대비 성능 저하 보임. 큐빗 부족 디바이스가 아직 많아 여러 디바이스 사용 상황 발생 예상.",
        created: "2026-01-29T00:00:00.000Z"
    }
];

// Migration v3: 저자/연도/저널 포함
(async function() {
    var migrated = localStorage.getItem('suj_notion_migrated_v3');
    if (migrated) return;

    console.log('Migrating Notion paper data to Core Research (v3 with authors/year/venue)...');
    var count = 0;

    for (var i = 0; i < NOTION_PAPERS.length; i++) {
        var p = NOTION_PAPERS[i];
        var id = 'notion_v3_' + Date.now().toString(36) + '_' + i;
        var data = {
            paper: p.paper,
            authors: p.authors,
            year: p.year,
            venue: p.venue,
            status: p.status,
            tags: p.tags,
            application: p.application,
            critique: p.critique,
            notes: p.notes,
            created: p.created,
            updated: new Date().toISOString()
        };

        await TrackService.save('core_entries', id, data);
        count++;
    }

    // Clean up old v2 entries
    var oldItems = await TrackService.getAll('core_entries');
    for (var j = 0; j < oldItems.length; j++) {
        if (oldItems[j]._id && oldItems[j]._id.indexOf('notion_') === 0 && oldItems[j]._id.indexOf('notion_v3_') !== 0) {
            await TrackService.remove('core_entries', oldItems[j]._id);
        }
    }

    localStorage.setItem('suj_notion_migrated_v3', 'true');
    console.log('Notion migration v3 complete: ' + count + ' papers with authors/year/venue.');
})();
