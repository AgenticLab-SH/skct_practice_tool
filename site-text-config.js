(function initSiteTextConfig() {
    const DEFAULT_SITE_TEXT_CONFIG = {
        meta: {
            title: 'SKCT 온라인 연습 도구 | OMR & 타이머 & 메모장 & 계산기 무료',
            description: 'SKCT(SK 인적성 검사) 완벽 대비를 위한 무료 온라인 OMR 및 타이머. 다중 페이즈 타이머, 메모장, 그림판, 화면 계산기를 실전처럼 연습하세요. SK그룹 취준생 필수 도구!',
            ogTitle: 'SKCT 온라인 연습 도구 | OMR & 타이머',
            ogDescription: '실전 SKCT 환경 완벽 구현! OMR, 타이머, 메모장, 계산기를 무료로 사용해보세요.',
            twitterTitle: 'SKCT 온라인 연습 도구 | OMR & 타이머',
            twitterDescription: '실전 SKCT 환경 완벽 구현! OMR, 타이머, 메모장, 계산기를 무료로 사용해보세요.',
            srTitle: 'SKCT 연습 툴 - SKCT 실제화면과 동일한 온라인 SKCT 환경 가이드',
            srDescription: "본 웹사이트는 SK그룹 인적성 검사를 대비하기 위한 완벽한 무료 SKCT 연습 애플리케이션입니다. SKCT 실제 환경, SKCT 실제화면 인터페이스, 그리고 SKCT 크기 체감까지 고려하여 최대한 정밀하게 구현하였습니다. SKCT 모의고사 인적성 테스트를 진행할 때 필수적인 'SKCT 타이머', 'SKCT 화면 계산기', 'SKCT 메모장', 'SKCT 그림판', 'SKCT 실제 OMR'의 모든 기능을 하나의 SKCT 툴 화면 안에서 제공합니다. 실제 시험과 동일한 감각으로 SKCT 모의 연습을 철저히 준비하세요!"
        },
        toolbar: {
            popupButton: '화면 더 줄이기',
            totalTimeLabel: '전체 남은 시간',
            defaultPhaseName: '1과목 언어이해',
            guidePrefix: '가이드:',
            playButtonTitle: '타이머 시작',
            nextSubjectButton: '다음',
            resetSubjectButton: '과↺',
            resetAllButton: '전↺'
        },
        tools: {
            omrCollapseButton: '◀ 탭 접기',
            omrModeLabel: '응시 모드',
            skipButton: '문항 건너뛰기',
            modeToggleButton: '📝 정답 입력 모드로 전환',
            scoreButton: '📊 채점 및 통계 확인',
            detailStatsButton: '📋 과목별 상세 통계',
            bulkImportButton: '📥 정오표 일괄입력',
            resetButton: '🔄 RESET',
            statSummaryLabel: '맞은 / 푼 / 전체',
            statRateAttemptedLabel: '정답률(푼 문제 대비)',
            statRateOverallLabel: '정답률(전체 문제 대비)',
            statSkippedLabel: '건너뛴 문제',
            statUnansweredLabel: '못 푼 문제',
            notepadTab: '메모장',
            canvasTab: '그림판',
            clearToolButton: '삭제',
            notepadPlaceholder: '이곳에 텍스트를 입력하거나 붙여넣기(Ctrl+V) 하세요...',
            calculatorPanelLabel: '계산기'
        },
        breakOverlay: {
            title: '쉬는 시간입니다',
            description: '다음 과목이 시작될 때까지 통제됩니다.',
            skipButton: '쉬는 시간 건너뛰기',
            supportHint: '개발에 큰 힘이 됩니다. 좌측 ☕ 아이콘을 통해 후원 부탁드립니다.'
        },
        helpModal: {
            title: '📖 사용 가이드',
            exampleSectionTitle: '📷 실제 툴 사용 권장 예시',
            pdfTitle: '▶ PDF 활용 예시',
            pdfCaption: '좌측에 PDF나 e-book을 띄워두고 이 예시 사진과 동일한 비율로 맞춰서 화면을 구성하시고 연습하시면 됩니다.',
            omrTitle: '▶ 연습용 모드 (OMR 사용)',
            omrCaption: '정답 마킹 및 채점을 위해 OMR을 펼쳐두고 연습할 수 있습니다.',
            referenceBlockHtml: '<strong style="color:#1e293b;">[참고사항]</strong><br>\n1. <strong>실제 시험장 사용 불가</strong>: 실제 온라인 SKCT 시험은 전용 보안 프로그램에서 진행되므로 본 연습 툴을 병행하여 띄워둘 수 없습니다.<br>\n2. <strong>유사 환경 구현</strong>: 본 도구는 실제 시험의 타이머 작동 방식, 리셋되는 메모장, 제한적 계산기 등 UI/UX를 최대한 비슷하게 체험하도록 제작한 모의 연습 도구입니다.<br>\n3. <strong>OMR은 연습 전용</strong>: 실제 시험에는 OMR이 없으며 문제 에 직접 정답을 체크하는 방식입니다. 본 서비스의 OMR 기능은 여러분의 채점 편의를 위해 가상으로 추가된 기능입니다.',
            featureSectionTitle: '🗺️ 기능 안내',
            sidebarFeatureHtml: '<div style="position:absolute; top:-10px; left:10px; background:#1e293b; padding:0 5px; color:#3b82f6; font-weight:bold;">좌측 사이드바</div>\n<p>📖 <strong>GUIDE</strong> — 업데이트 공지, 사용 예시, 기능 설명 확인</p>\n<p>📝 <strong>연습용 OMR</strong> — 답안 마킹, 채점, 통계 확인</p>\n<p>⚙ <strong>설정</strong> — 실전/연습 모드, 타이머, 가이드 시간, 화면 비율 조정</p>\n<p>↗ <strong>화면 더 줄이기</strong> — 팝업으로 더 좁은 실전 화면 구성</p>\n<p>🛡️ <strong>무적모드(테스트)</strong> — 링커리어 화면 가림막 대응 확장 설치</p>\n<p>🔥 <strong>접속자 수</strong> — 실시간 현황과 최근 7일 그래프</p>\n<p>💬 <strong>게시판</strong> — 공지, Q&A, Tip, 후기, 개선요청, FAQ</p>\n<p>☕ <strong>커피후원</strong> — 운영 후원과 문의 링크</p>\n<hr style="border-color:#334155; margin: 8px 0;">\n<p style="color:#93c5fd;">OMR에서 답 마킹 → <strong>자동 다음 문제 이동</strong></p>\n<p style="color:#93c5fd;">[문항 건너뛰기] = 현재 문항을 미응답 상태로 넘김</p>\n<p style="color:#93c5fd;">[정답 입력 모드] = 채점용 정답 입력 모드 전환, 타이머 자동 정지</p>\n<p style="color:#93c5fd;">[채점 및 통계 확인] = 과목별 오답, 미응답, 소요 시간 확인</p>',
            timerFeatureHtml: '<strong>🕒 다중 페이즈 타이머</strong><br>\n전체 시간, 과목 시간, 가이드 시간을 <strong>한 화면에서 동시 확인</strong><br>\n<span style="color:#c4b5fd;">과목 → 쉬는시간 자동 전환, 설정에서 시간 조절 가능</span>',
            practiceFeatureHtml: '<strong>✏️ 연습장 (메모장 & 그림판)</strong><br>\n다음 문제 넘어가면 <strong>자동 초기화</strong><br>\n<span style="color:#fde68a;">문제 풀이 흔적이 남지 않도록 실제 흐름에 맞춰 동작</span>',
            calculatorFeatureHtml: '<strong>🧮 키보드 사용 가능한 계산기</strong><br>\n숫자/연산 입력과 버튼 조작 지원<br>\n<span style="color:#86efac;">복잡한 공학 기능 없이 실전형 제한 계산기</span>'
        },
        settingsModal: {
            title: '⚙ 통합 설정',
            practiceModeTitle: '🎯 모드 설정',
            practiceModeHint: 'OFF = 실전 모드: 과목 시간 종료 시 자동 잠금 및 다음 과목 강제 전환\nON = 연습 모드: 시간 제한·강제 전환 없이 자유롭게 마킹',
            scoringTitle: '📊 채점 기준',
            scoringHint: 'OFF = 건너뜀으로 별도 집계\nON = 상세 통계와 오답 복기에서 건너뜀도 오답으로 함께 봄',
            timerTitle: '🕒 타이머 설정',
            guideTitle: '⏱️ 문항별 시간 가이드',
            layoutTitle: '📐 높이 비율 설정 (우측 영역)',
            toolTitle: '🧰 도구 설정'
        },
        advancedGuide: {
            title: '🔒 고급 이용 안내',
            loginTitle: '1. 이미 이용권이 있다면 바로 로그인',
            loginBody: '발급받은 <strong>ID</strong>와 <strong>비밀번호</strong>를 입력하면 바로 고급 모드로 들어갈 수 있습니다.',
            featureTitle: '2. 고급 모드에서 달라지는 점',
            featureCard1Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">실전형 도구</strong>\n계산기 동작, 우측 버튼 열, 도구 설정을 더 실제 환경에 가깝게 쓸 수 있습니다.',
            featureCard2Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">빠른 복기</strong>\n정오표 일괄입력과 문항별 상세 통계 저장으로 복기 시간이 줄어듭니다.',
            featureCard3Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">반복 연습</strong>\n과목/전체 타이머 재시작으로 같은 세트를 여러 번 실전처럼 연습할 수 있습니다.',
            featureCard4Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">시간 감각 훈련</strong>\n문항별 시간 가이드를 보며 실제 시험 페이스를 더 세밀하게 익힐 수 있습니다.',
            planTitle: '3. 이용권 선택',
            planIntro: '현재는 <strong>7일권</strong>과 <strong>14일권</strong>을 이용할 수 있습니다. 필요한 기간을 선택해 신청하면 됩니다.',
            donateButton: '후원 페이지 열기',
            flowHtml: '<strong>신청 흐름</strong><br>\n1. 후원 페이지에서 금액을 확인하고 후원을 진행합니다.<br>\n2. 아래 신청서에 정보와 이용 시작 희망일을 입력합니다.<br>\n3. 저장 후 표시되는 <strong>신청번호 + 조회 비밀번호</strong>를 보관합니다.<br>\n4. 신청 조회에서 승인 상태와 발급된 계정 정보를 확인합니다.',
            formTitle: '4. 이용권 신청서',
            formDescription: '후원 후 아래 정보를 작성해 주세요. 승인되면 이 창에서 바로 로그인용 계정 정보를 확인할 수 있습니다.',
            passwordHint: '여기서 입력하는 비밀번호는 <strong>신청 조회용</strong>입니다. 고급 로그인 비밀번호와는 다르니, 신청번호와 함께 꼭 보관해 주세요.',
            submitButton: '신청서 저장',
            lookupTitle: '5. 신청 조회',
            lookupDescription: '저장 후 받은 <strong>신청번호</strong>와 직접 정한 <strong>조회 비밀번호</strong>를 입력하면 현재 상태와 발급 결과를 확인할 수 있습니다.',
            lookupButton: '조회',
            contactHtml: '문의가 있으면 <strong>zhdlsqpdj@gmail.com</strong>로 보내주세요.'
        },
        advancedFeature: {
            title: '🔒 고급 기능',
            introHtml: '<div style="font-weight:800; margin-bottom:6px;">고급 모드 활용 가이드</div>\n대부분의 고급 기능은 <strong>OMR 탭</strong> 안에서 이어서 사용합니다. 이 창은 어디에서 무엇을 누르면 되는지만 빠르게 확인하는 용도로 보시면 됩니다.',
            summaryHtml: '<strong>기본 흐름</strong><br>답안을 체크한 뒤 <strong>정답 입력 모드</strong>로 전환하고 정답을 넣은 다음, <strong>채점 및 통계 확인</strong>을 누르면 복기용 기능이 한 번에 열립니다.',
            planHtml: '<strong>복기 기능 위치</strong><br><strong>과목별 상세 통계</strong>, <strong>문항별 상세 통계 TXT 다운로드</strong>, <strong>정오표 일괄입력</strong>은 모두 OMR 탭 아래 버튼 구역에 모여 있습니다.',
            flowButton: '신청 안내 다시 보기',
            statsButton: '문항별 상세 통계 TXT 다운로드',
            feature1Html: '<strong>1. 채점 결과 먼저 보기</strong><br>OMR 탭에서 <strong>채점 및 통계 확인</strong>을 누르면 맞은 수, 정답률, 건너뜀, 못 푼 문제를 바로 확인할 수 있습니다.',
            feature2Html: '<strong>2. 과목별 상세 통계 열기</strong><br><strong>과목별 상세 통계</strong> 버튼으로 과목별 정오답 분포와 문항 상태를 더 자세히 확인합니다.',
            feature3Html: '<strong>3. TXT로 복기 기록 남기기</strong><br><strong>문항별 상세 통계 TXT 다운로드</strong> 버튼으로 정오답, 미응답, 문항별 시간 기록을 파일로 저장합니다.',
            feature4Html: '<strong>4. 반복 연습 이어가기</strong><br><strong>정오표 일괄입력</strong>, <strong>과목 초기화</strong>, <strong>전체 초기화</strong>, <strong>문항별 시간 가이드</strong>를 조합하면 같은 세트를 빠르게 다시 돌릴 수 있습니다.'
        },
        messages: {
            advancedLoading: '고급 구독 정보를 불러오는 중입니다.',
            advancedCooldown: 'ID 또는 비밀번호를 여러 번 틀려 {seconds}초 동안 다시 시도할 수 없습니다.',
            advancedUnlocked: '이 브라우저는 이미 인증되어 있습니다. 약 {minutes}분 동안 바로 고급 모드를 열 수 있습니다.',
            advancedAvailable: '현재 사용 가능한 고급 이용권 {count}건을 확인했습니다. 관리자에게 받은 ID와 비밀번호를 입력하면 바로 고급 팝업이 열립니다.',
            advancedNone: '현재 사용 가능한 고급 이용권이 없습니다. 관리자 페이지의 고급 구독 관리 표를 먼저 확인하세요.',
            advancedNeedConfig: '고급 구독 정보를 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
            advancedRetryAfter: '{seconds}초 후에 다시 시도할 수 있습니다.',
            advancedChecking: 'ID와 비밀번호를 확인하고 있습니다...',
            advancedOpening: '고급 버전 팝업을 여는 중입니다.',
            advancedNeedRelogin: '이 브라우저의 인증 상태가 없거나 만료되었습니다. ID와 비밀번호를 다시 입력해주세요.',
            advancedReuse: '저장된 인증 상태로 고급 버전을 다시 엽니다.',
            manualClosed: '현재 수동 이용권 신청이 닫혀 있습니다.',
            manualConfigNotReady: '운영 설정이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.',
            manualNoPlan: '신청 가능한 이용권이 아직 열리지 않았습니다.',
            manualRequiredFields: '투네이션 이름, 이용 시작일, 닉네임, 이메일, ID, 조회 비밀번호를 모두 입력해주세요.',
            manualInvalidEmail: '이메일 형식이 올바르지 않습니다.',
            manualPasswordShort: '조회 비밀번호는 6자 이상으로 설정해주세요.',
            manualPasswordMismatch: '조회 비밀번호 확인이 일치하지 않습니다.',
            manualSubmitSuccess: '신청서가 저장되었습니다. <strong>신청번호 {requestId}</strong> 와 조회 비밀번호를 꼭 보관해주세요. 아래 신청 조회에서 같은 값으로 상태를 다시 확인할 수 있습니다.',
            manualSubmitError: '신청 저장 중 오류가 발생했습니다.',
            manualLookupRequired: '신청번호와 조회 비밀번호를 모두 입력해주세요.',
            manualLookupError: '신청 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            manualLookupNotFound: '해당 신청번호를 찾지 못했습니다. 오타가 없는지 다시 확인해주세요.',
            manualLookupDecryptError: '조회 비밀번호가 일치하지 않거나 요청을 복호화하지 못했습니다.'
        }
    };

    const SITE_TEXT_CATALOG = [
        { key: 'meta.title', label: '브라우저 제목', category: '메타', selector: 'title', prop: 'text', visual: false },
        { key: 'meta.description', label: '검색 설명', category: '메타', selector: 'meta[name="description"]', prop: 'content', visual: false },
        { key: 'meta.ogTitle', label: 'OG 제목', category: '메타', selector: 'meta[property="og:title"]', prop: 'content', visual: false },
        { key: 'meta.ogDescription', label: 'OG 설명', category: '메타', selector: 'meta[property="og:description"]', prop: 'content', visual: false },
        { key: 'meta.twitterTitle', label: '트위터 제목', category: '메타', selector: 'meta[name="twitter:title"]', prop: 'content', visual: false },
        { key: 'meta.twitterDescription', label: '트위터 설명', category: '메타', selector: 'meta[name="twitter:description"]', prop: 'content', visual: false },
        { key: 'meta.srTitle', label: '숨김 H1 제목', category: '메타', selector: '#srMainTitle', prop: 'text' },
        { key: 'meta.srDescription', label: '숨김 설명문', category: '메타', selector: '#srMainDescription', prop: 'text' },
        { key: 'toolbar.popupButton', label: '상단 팝업 버튼', category: '상단 도구', selector: '#popupBtn', prop: 'text' },
        { key: 'toolbar.totalTimeLabel', label: '전체 시간 라벨', category: '상단 도구', selector: '#displayTotalTimeLabel', prop: 'text' },
        { key: 'toolbar.defaultPhaseName', label: '기본 과목명', category: '상단 도구', selector: '#displayPhaseName', prop: 'text' },
        { key: 'toolbar.guidePrefix', label: '가이드 접두어', category: '상단 도구', selector: '#displayGuidePrefix', prop: 'text' },
        { key: 'toolbar.playButtonTitle', label: '재생 버튼 툴팁', category: '상단 도구', selector: '#timerPlayBtn', prop: 'title', visual: false },
        { key: 'toolbar.nextSubjectButton', label: '다음 과목 버튼', category: '상단 도구', selector: '#subjectSkipBtn', prop: 'text' },
        { key: 'toolbar.resetSubjectButton', label: '과목 초기화 버튼', category: '상단 도구', selector: '#subjectResetBtn', prop: 'text' },
        { key: 'toolbar.resetAllButton', label: '전체 초기화 버튼', category: '상단 도구', selector: '#fullResetBtn', prop: 'text' },
        { key: 'tools.omrCollapseButton', label: 'OMR 접기 버튼', category: 'OMR/도구', selector: '#omrCollapseBtn', prop: 'text' },
        { key: 'tools.omrModeLabel', label: 'OMR 기본 상태', category: 'OMR/도구', selector: '#omrModeLabel', prop: 'text' },
        { key: 'tools.skipButton', label: '문항 건너뛰기 버튼', category: 'OMR/도구', selector: '#globalClearBtn', prop: 'text' },
        { key: 'tools.modeToggleButton', label: '정답 입력 버튼', category: 'OMR/도구', selector: '#modeToggleBtn', prop: 'text' },
        { key: 'tools.scoreButton', label: '채점 버튼', category: 'OMR/도구', selector: '#scoreBtn', prop: 'text' },
        { key: 'tools.detailStatsButton', label: '상세 통계 버튼', category: 'OMR/도구', selector: '#detailScoreBtn', prop: 'text' },
        { key: 'tools.bulkImportButton', label: '정오표 일괄입력 버튼', category: 'OMR/도구', selector: '#bulkCorrectImportBtn', prop: 'text' },
        { key: 'tools.resetButton', label: 'RESET 버튼', category: 'OMR/도구', selector: '#omrResetBtn', prop: 'text' },
        { key: 'tools.statSummaryLabel', label: '채점 결과: 맞은/푼/전체', category: 'OMR/도구', selector: '#statSummaryLabel', prop: 'text' },
        { key: 'tools.statRateAttemptedLabel', label: '채점 결과: 시도 대비', category: 'OMR/도구', selector: '#statRateAttemptedLabel', prop: 'text' },
        { key: 'tools.statRateOverallLabel', label: '채점 결과: 전체 대비', category: 'OMR/도구', selector: '#statRateOverallLabel', prop: 'text' },
        { key: 'tools.statSkippedLabel', label: '채점 결과: 건너뜀', category: 'OMR/도구', selector: '#statSkippedLabel', prop: 'text' },
        { key: 'tools.statUnansweredLabel', label: '채점 결과: 못 푼 문제', category: 'OMR/도구', selector: '#statUnansweredLabel', prop: 'text' },
        { key: 'tools.notepadTab', label: '메모장 탭', category: 'OMR/도구', selector: '#tabNotepad', prop: 'text' },
        { key: 'tools.canvasTab', label: '그림판 탭', category: 'OMR/도구', selector: '#tabCanvas', prop: 'text' },
        { key: 'tools.clearToolButton', label: '도구 삭제 버튼', category: 'OMR/도구', selector: '#clearCurrentToolBtn', prop: 'text' },
        { key: 'tools.notepadPlaceholder', label: '메모장 placeholder', category: 'OMR/도구', selector: '#notepad', prop: 'placeholder', visual: false },
        { key: 'tools.calculatorPanelLabel', label: '계산기 제목', category: 'OMR/도구', selector: '.section-panel-label', prop: 'text' },
        { key: 'breakOverlay.title', label: '쉬는 시간 제목', category: '쉬는 시간', selector: '#breakOverlayTitle', prop: 'text' },
        { key: 'breakOverlay.description', label: '쉬는 시간 설명', category: '쉬는 시간', selector: '#breakOverlayDescription', prop: 'text' },
        { key: 'breakOverlay.skipButton', label: '쉬는 시간 건너뛰기', category: '쉬는 시간', selector: '#breakSkipBtn', prop: 'text' },
        { key: 'breakOverlay.supportHint', label: '쉬는 시간 후원 안내', category: '쉬는 시간', selector: '#breakSupportHint', prop: 'html', multiline: true },
        { key: 'helpModal.title', label: '사용 가이드 제목', category: '가이드 모달', selector: '#helpModalTitle', prop: 'text' },
        { key: 'helpModal.exampleSectionTitle', label: '예시 섹션 제목', category: '가이드 모달', selector: '#helpExampleSectionTitle', prop: 'text' },
        { key: 'helpModal.pdfTitle', label: 'PDF 예시 제목', category: '가이드 모달', selector: '#helpPdfExampleTitle', prop: 'text' },
        { key: 'helpModal.pdfCaption', label: 'PDF 예시 설명', category: '가이드 모달', selector: '#helpPdfExampleCaption', prop: 'text' },
        { key: 'helpModal.omrTitle', label: 'OMR 예시 제목', category: '가이드 모달', selector: '#helpOmrExampleTitle', prop: 'text' },
        { key: 'helpModal.omrCaption', label: 'OMR 예시 설명', category: '가이드 모달', selector: '#helpOmrExampleCaption', prop: 'text' },
        { key: 'helpModal.referenceBlockHtml', label: '참고사항 본문', category: '가이드 모달', selector: '#helpReferenceBlock', prop: 'html', multiline: true },
        { key: 'helpModal.featureSectionTitle', label: '기능 안내 제목', category: '가이드 모달', selector: '#helpFeatureSectionTitle', prop: 'text' },
        { key: 'helpModal.sidebarFeatureHtml', label: '좌측 사이드바 설명', category: '가이드 모달', selector: '#helpSidebarFeatureBlock', prop: 'html', multiline: true },
        { key: 'helpModal.timerFeatureHtml', label: '타이머 설명 카드', category: '가이드 모달', selector: '#helpTimerFeatureBlock', prop: 'html', multiline: true },
        { key: 'helpModal.practiceFeatureHtml', label: '연습장 설명 카드', category: '가이드 모달', selector: '#helpPracticeFeatureBlock', prop: 'html', multiline: true },
        { key: 'helpModal.calculatorFeatureHtml', label: '계산기 설명 카드', category: '가이드 모달', selector: '#helpCalculatorFeatureBlock', prop: 'html', multiline: true },
        { key: 'settingsModal.title', label: '설정 모달 제목', category: '설정 모달', selector: '#settingsTitleTrigger', prop: 'text' },
        { key: 'settingsModal.practiceModeTitle', label: '모드 설정 제목', category: '설정 모달', selector: '#settingsPracticeModeTitle', prop: 'text' },
        { key: 'settingsModal.practiceModeHint', label: '모드 설정 설명', category: '설정 모달', selector: '#settingsPracticeModeHint', prop: 'html', multiline: true },
        { key: 'settingsModal.scoringTitle', label: '채점 기준 제목', category: '설정 모달', selector: '#settingsScoringTitle', prop: 'text' },
        { key: 'settingsModal.scoringHint', label: '채점 기준 설명', category: '설정 모달', selector: '#settingsScoringHint', prop: 'html', multiline: true },
        { key: 'settingsModal.timerTitle', label: '타이머 설정 제목', category: '설정 모달', selector: '#settingsTimerTitle', prop: 'text' },
        { key: 'settingsModal.guideTitle', label: '문항 가이드 제목', category: '설정 모달', selector: '#settingsGuideTitle', prop: 'text' },
        { key: 'settingsModal.layoutTitle', label: '높이 비율 제목', category: '설정 모달', selector: '#settingsLayoutTitle', prop: 'text' },
        { key: 'settingsModal.toolTitle', label: '도구 설정 제목', category: '설정 모달', selector: '#settingsToolTitle', prop: 'text' },
        { key: 'advancedGuide.title', label: '고급 안내 제목', category: '고급 안내', selector: '#advancedGuideModalTitle', prop: 'text' },
        { key: 'advancedGuide.loginTitle', label: '고급 안내: 로그인 제목', category: '고급 안내', selector: '#advancedGuideLoginTitle', prop: 'text' },
        { key: 'advancedGuide.loginBody', label: '고급 안내: 로그인 설명', category: '고급 안내', selector: '#advancedGuideLoginBody', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureTitle', label: '고급 안내: 차이점 제목', category: '고급 안내', selector: '#advancedGuideFeatureTitle', prop: 'text' },
        { key: 'advancedGuide.featureCard1Html', label: '고급 안내 카드 1', category: '고급 안내', selector: '#advancedGuideFeatureCard1', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureCard2Html', label: '고급 안내 카드 2', category: '고급 안내', selector: '#advancedGuideFeatureCard2', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureCard3Html', label: '고급 안내 카드 3', category: '고급 안내', selector: '#advancedGuideFeatureCard3', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureCard4Html', label: '고급 안내 카드 4', category: '고급 안내', selector: '#advancedGuideFeatureCard4', prop: 'html', multiline: true },
        { key: 'advancedGuide.planTitle', label: '고급 안내: 이용권 제목', category: '고급 안내', selector: '#advancedGuidePlanTitle', prop: 'text' },
        { key: 'advancedGuide.planIntro', label: '고급 안내: 이용권 소개', category: '고급 안내', selector: '#advancedGuidePlanIntro', prop: 'html', multiline: true },
        { key: 'advancedGuide.donateButton', label: '고급 안내: 후원 버튼', category: '고급 안내', selector: '#manualSubscriptionDonateLink', prop: 'text' },
        { key: 'advancedGuide.flowHtml', label: '고급 안내: 신청 흐름', category: '고급 안내', selector: '#advancedGuideFlow', prop: 'html', multiline: true },
        { key: 'advancedGuide.formTitle', label: '고급 안내: 신청서 제목', category: '고급 안내', selector: '#advancedGuideFormTitle', prop: 'text' },
        { key: 'advancedGuide.formDescription', label: '고급 안내: 신청서 설명', category: '고급 안내', selector: '#advancedGuideFormDescription', prop: 'html', multiline: true },
        { key: 'advancedGuide.passwordHint', label: '고급 안내: 비밀번호 안내', category: '고급 안내', selector: '#advancedGuidePasswordHint', prop: 'html', multiline: true },
        { key: 'advancedGuide.submitButton', label: '고급 안내: 신청 저장 버튼', category: '고급 안내', selector: '#manualSubscriptionSubmitBtn', prop: 'text' },
        { key: 'advancedGuide.lookupTitle', label: '고급 안내: 신청 조회 제목', category: '고급 안내', selector: '#advancedGuideLookupTitle', prop: 'text' },
        { key: 'advancedGuide.lookupDescription', label: '고급 안내: 신청 조회 설명', category: '고급 안내', selector: '#advancedGuideLookupDescription', prop: 'html', multiline: true },
        { key: 'advancedGuide.lookupButton', label: '고급 안내: 조회 버튼', category: '고급 안내', selector: '#manualSubscriptionLookupBtn', prop: 'text' },
        { key: 'advancedGuide.contactHtml', label: '고급 안내: 문의 문구', category: '고급 안내', selector: '#advancedGuideContact', prop: 'html', multiline: true },
        { key: 'advancedFeature.title', label: '고급 기능 모달 제목', category: '고급 기능', selector: '#advancedFeatureModalTitle', prop: 'text' },
        { key: 'advancedFeature.introHtml', label: '고급 기능: 안내 상단', category: '고급 기능', selector: '#advancedFeatureIntro', prop: 'html', multiline: true },
        { key: 'advancedFeature.summaryHtml', label: '고급 기능: 요약', category: '고급 기능', selector: '#advancedFeatureSummary', prop: 'html', multiline: true },
        { key: 'advancedFeature.planHtml', label: '고급 기능: 이용권 안내', category: '고급 기능', selector: '#advancedFeaturePlanInfo', prop: 'html', multiline: true },
        { key: 'advancedFeature.flowButton', label: '고급 기능: 신청 안내 버튼', category: '고급 기능', selector: '#advancedFeatureManualFlowBtn', prop: 'text' },
        { key: 'advancedFeature.statsButton', label: '고급 기능: 통계 다운로드 버튼', category: '고급 기능', selector: '#advancedStatsDownloadBtn', prop: 'text' },
        { key: 'advancedFeature.feature1Html', label: '고급 기능 설명 1', category: '고급 기능', selector: '#advancedFeatureItem1', prop: 'html', multiline: true },
        { key: 'advancedFeature.feature2Html', label: '고급 기능 설명 2', category: '고급 기능', selector: '#advancedFeatureItem2', prop: 'html', multiline: true },
        { key: 'advancedFeature.feature3Html', label: '고급 기능 설명 3', category: '고급 기능', selector: '#advancedFeatureItem3', prop: 'html', multiline: true },
        { key: 'advancedFeature.feature4Html', label: '고급 기능 설명 4', category: '고급 기능', selector: '#advancedFeatureItem4', prop: 'html', multiline: true },
        { key: 'messages.advancedLoading', label: '상태 메시지: 고급 로딩', category: '상태 메시지', visual: false },
        { key: 'messages.advancedCooldown', label: '상태 메시지: 고급 재시도 대기', category: '상태 메시지', visual: false },
        { key: 'messages.advancedUnlocked', label: '상태 메시지: 고급 인증 유지', category: '상태 메시지', visual: false },
        { key: 'messages.advancedAvailable', label: '상태 메시지: 고급 이용권 있음', category: '상태 메시지', visual: false },
        { key: 'messages.advancedNone', label: '상태 메시지: 고급 이용권 없음', category: '상태 메시지', visual: false },
        { key: 'messages.advancedNeedConfig', label: '상태 메시지: 고급 준비 중', category: '상태 메시지', visual: false },
        { key: 'messages.advancedRetryAfter', label: '상태 메시지: 고급 재시도 초', category: '상태 메시지', visual: false },
        { key: 'messages.advancedChecking', label: '상태 메시지: 고급 확인 중', category: '상태 메시지', visual: false },
        { key: 'messages.advancedOpening', label: '상태 메시지: 고급 열기 중', category: '상태 메시지', visual: false },
        { key: 'messages.advancedNeedRelogin', label: '상태 메시지: 재로그인 필요', category: '상태 메시지', visual: false },
        { key: 'messages.advancedReuse', label: '상태 메시지: 저장된 인증 재사용', category: '상태 메시지', visual: false },
        { key: 'messages.manualClosed', label: '상태 메시지: 신청 닫힘', category: '상태 메시지', visual: false },
        { key: 'messages.manualConfigNotReady', label: '상태 메시지: 신청 설정 미완료', category: '상태 메시지', visual: false },
        { key: 'messages.manualNoPlan', label: '상태 메시지: 신청 플랜 없음', category: '상태 메시지', visual: false },
        { key: 'messages.manualRequiredFields', label: '상태 메시지: 신청 필수값', category: '상태 메시지', visual: false },
        { key: 'messages.manualInvalidEmail', label: '상태 메시지: 이메일 오류', category: '상태 메시지', visual: false },
        { key: 'messages.manualPasswordShort', label: '상태 메시지: 비밀번호 길이', category: '상태 메시지', visual: false },
        { key: 'messages.manualPasswordMismatch', label: '상태 메시지: 비밀번호 불일치', category: '상태 메시지', visual: false },
        { key: 'messages.manualSubmitSuccess', label: '상태 메시지: 신청 저장 성공', category: '상태 메시지', visual: false },
        { key: 'messages.manualSubmitError', label: '상태 메시지: 신청 저장 실패', category: '상태 메시지', visual: false },
        { key: 'messages.manualLookupRequired', label: '상태 메시지: 조회 필수값', category: '상태 메시지', visual: false },
        { key: 'messages.manualLookupError', label: '상태 메시지: 조회 오류', category: '상태 메시지', visual: false },
        { key: 'messages.manualLookupNotFound', label: '상태 메시지: 신청번호 없음', category: '상태 메시지', visual: false },
        { key: 'messages.manualLookupDecryptError', label: '상태 메시지: 조회 복호화 실패', category: '상태 메시지', visual: false }
    ];
    const PREVIEW_APPLY_EVENT = 'skct-site-text-preview-apply';
    const PREVIEW_HIGHLIGHT_EVENT = 'skct-site-text-preview-highlight';
    const PREVIEW_SELECTION_MODE_EVENT = 'skct-site-text-preview-selection-mode';
    const PREVIEW_SELECTED_EVENT = 'skct-site-text-selected';
    let currentConfig = deepMerge(deepClone(DEFAULT_SITE_TEXT_CONFIG), {});
    let selectionModeEnabled = false;

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function deepClone(value) {
        if (Array.isArray(value)) return value.map((item) => deepClone(item));
        if (!isPlainObject(value)) return value;
        const next = {};
        Object.keys(value).forEach((key) => {
            next[key] = deepClone(value[key]);
        });
        return next;
    }

    function deepMerge(base, incoming) {
        const target = deepClone(base);
        if (!isPlainObject(incoming)) return target;
        Object.keys(incoming).forEach((key) => {
            const value = incoming[key];
            if (isPlainObject(value) && isPlainObject(target[key])) {
                target[key] = deepMerge(target[key], value);
            } else {
                target[key] = deepClone(value);
            }
        });
        return target;
    }

    function getValueByPath(source, path) {
        return String(path || '').split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), source);
    }

    function setValueByPath(target, path, value) {
        const segments = String(path || '').split('.');
        let pointer = target;
        segments.forEach((segment, index) => {
            if (index === segments.length - 1) {
                pointer[segment] = value;
                return;
            }
            if (!isPlainObject(pointer[segment])) {
                pointer[segment] = {};
            }
            pointer = pointer[segment];
        });
        return target;
    }

    function normalizeSiteTextConfig(rawConfig) {
        return deepMerge(DEFAULT_SITE_TEXT_CONFIG, rawConfig || {});
    }

    function formatHtmlValue(value, multiline) {
        const safe = String(value ?? '');
        return multiline ? safe.replace(/\n/g, '<br>') : safe;
    }

    function applyProperty(element, entry, value) {
        if (entry.prop === 'text') element.textContent = String(value ?? '');
        if (entry.prop === 'html') element.innerHTML = formatHtmlValue(value, entry.multiline);
        if (entry.prop === 'placeholder') element.setAttribute('placeholder', String(value ?? ''));
        if (entry.prop === 'title') element.setAttribute('title', String(value ?? ''));
        if (entry.prop === 'content') element.setAttribute('content', String(value ?? ''));
    }

    function injectPreviewStyles(doc = document) {
        if (doc.getElementById('skctSiteTextPreviewStyles')) return;
        const style = doc.createElement('style');
        style.id = 'skctSiteTextPreviewStyles';
        style.textContent = `
            [data-site-text-key] { position: relative; }
            .site-text-selection-mode [data-site-text-key] { cursor: crosshair !important; }
            .site-text-selection-mode [data-site-text-key]:hover { outline: 2px dashed rgba(37, 99, 235, 0.7); outline-offset: 3px; }
            [data-site-text-key].site-text-highlight { outline: 3px solid rgba(245, 158, 11, 0.95); outline-offset: 4px; box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.18); }
        `;
        doc.head.appendChild(style);
    }

    function clearVisualMarkers(doc = document) {
        doc.querySelectorAll('[data-site-text-key]').forEach((element) => {
            element.removeAttribute('data-site-text-key');
            element.classList.remove('site-text-highlight');
        });
    }

    function annotateVisualTargets(doc = document) {
        SITE_TEXT_CATALOG.forEach((entry) => {
            if (!entry.selector || entry.visual === false) return;
            doc.querySelectorAll(entry.selector).forEach((element) => {
                element.setAttribute('data-site-text-key', entry.key);
            });
        });
    }

    function applySiteTextConfig(rawConfig, options = {}) {
        currentConfig = normalizeSiteTextConfig(rawConfig);
        const doc = options.document || document;
        SITE_TEXT_CATALOG.forEach((entry) => {
            if (!entry.selector) return;
            const value = getValueByPath(currentConfig, entry.key);
            doc.querySelectorAll(entry.selector).forEach((element) => applyProperty(element, entry, value));
        });
        if (window.SKCT_FLAGS?.textEditor === true || options.annotate === true) {
            injectPreviewStyles(doc);
            clearVisualMarkers(doc);
            annotateVisualTargets(doc);
        }
        return currentConfig;
    }

    function applyRemoteSiteTextConfig(config) {
        return applySiteTextConfig(config || {});
    }

    function getTextValue(path, fallback = '', tokens = {}) {
        let value = getValueByPath(currentConfig, path);
        if (value == null || value === '') value = getValueByPath(DEFAULT_SITE_TEXT_CONFIG, path);
        const baseText = value == null ? fallback : String(value);
        return baseText.replace(/\{(\w+)\}/g, (_, token) => (Object.prototype.hasOwnProperty.call(tokens, token) ? String(tokens[token]) : `{${token}}`));
    }

    function highlightKey(key, options = {}) {
        const doc = options.document || document;
        doc.querySelectorAll('.site-text-highlight').forEach((element) => element.classList.remove('site-text-highlight'));
        doc.querySelectorAll(`[data-site-text-key="${CSS.escape(key)}"]`).forEach((element, index) => {
            element.classList.add('site-text-highlight');
            if (index === 0 && options.scroll !== false) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        });
    }

    function setSelectionMode(enabled) {
        selectionModeEnabled = Boolean(enabled);
        document.documentElement.classList.toggle('site-text-selection-mode', selectionModeEnabled);
    }

    function handlePreviewClick(event) {
        if (!selectionModeEnabled) return;
        const target = event.target.closest('[data-site-text-key]');
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        highlightKey(target.dataset.siteTextKey, { scroll: false });
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: PREVIEW_SELECTED_EVENT, key: target.dataset.siteTextKey }, '*');
        }
    }

    function bindPreviewMessaging() {
        window.addEventListener('message', (event) => {
            const data = event.data || {};
            if (data.type === PREVIEW_APPLY_EVENT) applySiteTextConfig(data.config || {});
            if (data.type === PREVIEW_HIGHLIGHT_EVENT && data.key) highlightKey(data.key);
            if (data.type === PREVIEW_SELECTION_MODE_EVENT) setSelectionMode(Boolean(data.enabled));
        });
        document.addEventListener('click', handlePreviewClick, true);
    }

    window.SKCTSiteTextConfig = {
        DEFAULT_SITE_TEXT_CONFIG,
        SITE_TEXT_CATALOG,
        PREVIEW_APPLY_EVENT,
        PREVIEW_HIGHLIGHT_EVENT,
        PREVIEW_SELECTION_MODE_EVENT,
        PREVIEW_SELECTED_EVENT,
        normalizeSiteTextConfig,
        applySiteTextConfig,
        applyRemoteSiteTextConfig,
        deepClone,
        getValueByPath,
        setValueByPath,
        getTextValue,
        highlightKey,
        setSelectionMode
    };
    window.applyRemoteSiteTextConfig = applyRemoteSiteTextConfig;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.SKCT_FLAGS?.textEditor === true) applySiteTextConfig(currentConfig);
            bindPreviewMessaging();
        }, { once: true });
    } else {
        if (window.SKCT_FLAGS?.textEditor === true) applySiteTextConfig(currentConfig);
        bindPreviewMessaging();
    }
})();
