(function initSiteTextConfig() {
    const DEFAULT_SITE_TEXT_CONFIG = {
        meta: {
            title: 'SKCT 온라인 연습 도구 | OMR & 타이머 & 메모장 & 계산기 무료',
            description: 'SKCT(SK 인적성 검사) 완벽 대비를 위한 무료 온라인 OMR 및 타이머. 다중 페이즈 타이머, 메모장, 그림판, 화면 계산기를 실전처럼 연습하세요. SK그룹 취준생 필수 도구!',
            ogTitle: 'SKCT 온라인 연습 도구 | OMR & 타이머',
            ogDescription: '실전 SKCT 환경 완벽 구현! OMR, 타이머, 메모장, 계산기를 무료로 사용해보세요.',
            twitterTitle: 'SKCT 온라인 연습 도구 | OMR & 타이머',
            twitterDescription: '실전 SKCT 환경 완벽 구현! OMR, 타이머, 메모장, 계산기를 무료로 사용해보세요.',
            srTitle: 'SKCT 온라인 연습 도구',
            srDescription: 'SKCT 연습을 위해 OMR, 타이머, 메모장, 그림판, 계산기를 한 화면에서 사용할 수 있는 온라인 연습 도구입니다.'
        },
        sidebar: {
            helpLabel: '가이드',
            noticeLabel: '공지',
            omrLabelHtml: '연습<br>OMR',
            settingsLabel: '설정',
            advancedGuideLabelHtml: '고급<br>기능',
            advancedModeLabelHtml: '고급<br>활용',
            popupLabel: '팝업',
            utilityLabel: '더보기'
        },
        toolbar: {
            popupButton: '팝업 연습',
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
        utilityModal: {
            title: '⋯ 보조 기능 모음',
            descriptionHtml: '핵심 연습 흐름 밖의 기능을 한곳에 모았습니다. 일반 모드에서는 활성 세션 확인, 커뮤니티, 별도 테스트 자료 안내, 운영 후원을 여기서 엽니다.',
            descriptionAdvancedHtml: '핵심 연습 흐름 밖의 기능을 한곳에 모았습니다. 고급 모드에서는 활성 세션 확인, 커뮤니티, 자료 보관함, 별도 테스트 자료 안내, 운영 후원을 여기서 엽니다.',
            statsTitle: '활성 세션 보기',
            statsDescription: '현재 열려 있는 세션과 최근 방문 기록을 확인합니다.',
            communityTitle: '커뮤니티',
            communityDescription: '공지, 질문, 후기, 개선요청을 한곳에서 확인합니다.',
            archiveTitle: '자료 보관함',
            archiveDescription: '고급 모드 전용 기능입니다. 로그인한 계정별로 문제 원문, AI 응답, 복기 메모를 저장하고 다시 꺼내 봅니다.',
            extensionTitle: '별도 테스트 자료',
            extensionDescription: '핵심 연습 도구와 분리된 외부성 테스트 자료 안내 페이지로 이동합니다.',
            donateTitle: '운영 후원',
            donateDescription: '광고 없이 유지되는 연습 공간 운영을 응원할 수 있습니다.'
        },
        statsModal: {
            title: '🔥 활성 세션 현황',
            activeTitle: '현재 활성 세션',
            activeHint: '브라우저 탭 기준으로 실시간 반영됩니다.',
            trendTitle: '📈 최근 7일 방문 기록',
            totalTitle: '🗓️ 누적 방문 기록',
            totalHint: '브라우저 기준 방문 기록으로 집계됩니다.'
        },
        noticeModal: {
            title: '공지사항',
            emptyBody: '현재 표시 중인 공지가 없습니다.',
            updatedPrefix: '마지막 업데이트'
        },
        helpModal: {
            title: '📘 기본 사용 가이드',
            exampleSectionTitle: '📷 실제 툴 사용 권장 예시',
            pdfTitle: '▶ PDF 활용 예시',
            pdfCaption: '좌측에 PDF나 e-book을 띄워두고 이 예시 사진과 동일한 비율로 맞춰서 화면을 구성하시고 연습하시면 됩니다.',
            omrTitle: '▶ 연습용 모드 (OMR 사용)',
            omrCaption: '정답 마킹 및 채점을 위해 OMR을 펼쳐두고 연습할 수 있습니다.',
            advancedSectionTitle: '🔒 고급 기능은 별도 버튼에서 확인',
            advancedSectionLeadHtml: '이 가이드는 <strong>일반 모드 기준</strong>으로 정리되어 있습니다. 복기용 추가 버튼, 자료 보관함, 우측 실제환경 여백처럼 고급 모드에서만 열리는 기능은 좌측 <strong>고급 기능</strong> 버튼에서 따로 확인해 주세요.',
            advancedLinkButton: '고급 기능 보기',
            referenceBlockHtml: '<strong style="color:#1e293b;">[참고사항]</strong><br>\n1. <strong>실제 시험장 사용 불가</strong>: 실제 온라인 SKCT 시험은 전용 보안 프로그램에서 진행되므로 본 연습 툴을 병행하여 띄워둘 수 없습니다.<br>\n2. <strong>유사 환경 구현</strong>: 본 도구는 실제 시험의 타이머 작동 방식, 리셋되는 메모장, 제한적 계산기 등 UI/UX를 최대한 비슷하게 체험하도록 제작한 모의 연습 도구입니다.<br>\n3. <strong>OMR은 연습 전용</strong>: 실제 시험에는 OMR이 없으며 문제 에 직접 정답을 체크하는 방식입니다. 본 서비스의 OMR 기능은 여러분의 채점 편의를 위해 가상으로 추가된 기능입니다.',
            featureSectionTitle: '🗺️ 일반 모드 핵심 기능',
            sidebarFeatureHtml: '<div style="position:absolute; top:-10px; left:10px; background:#1e293b; padding:0 5px; color:#3b82f6; font-weight:bold;">좌측 사이드바</div>\n<p>📘 <strong>가이드</strong> — 일반 모드 사용 순서와 핵심 기능 확인</p>\n<p>📝 <strong>연습 OMR</strong> — 답안 마킹, 채점, 통계 확인</p>\n<p>⚙ <strong>설정</strong> — 실전/연습 모드, 타이머, 화면 비율 조정</p>\n<p>🔒 <strong>고급 기능</strong> — 신청, 승인 확인, 고급 모드에서 추가되는 기능 확인</p>\n<p>↗ <strong>팝업</strong> — 더 좁은 실전 화면으로 연습</p>\n<p>⋯ <strong>더보기</strong> — 활성 세션, 커뮤니티, 별도 테스트 자료, 운영 후원, 문서 링크 열기</p>\n<hr style="border-color:#334155; margin: 8px 0;">\n<p style="color:#93c5fd;">처음에는 <strong>답안 마킹 → 채점 및 통계</strong> 흐름만 익혀도 충분합니다.</p>\n<p style="color:#93c5fd;">OMR에서 답 마킹 → <strong>자동 다음 문제 이동</strong></p>\n<p style="color:#93c5fd;">[문항 건너뛰기] = 현재 문항을 미응답 상태로 넘김</p>\n<p style="color:#93c5fd;">[정답 입력 모드] = 채점용 정답 입력 모드 전환, 타이머 자동 정지</p>\n<p style="color:#93c5fd;">[채점 및 통계 확인] = 과목별 오답, 미응답, 소요 시간 확인</p>',
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
            title: '🔒 고급 기능',
            loginTitle: '1. 이미 승인된 경우 바로 열기',
            loginBody: '승인 후에는 신청 이메일 또는 로그인 ID와 비밀번호로 라이선스를 확인하고, 바로 고급 모드로 들어갈 수 있습니다. 같은 브라우저에서 자료 보관함 접근도 함께 열립니다. 신청번호는 로그인에 쓰지 않습니다.',
            accessButton: '고급 모드 열기',
            accessIdPlaceholder: '신청 이메일 또는 로그인 ID',
            accessPasswordPlaceholder: '비밀번호',
            featureTitle: '2. 일반 모드에 추가로 열리는 기능',
            featureCard1Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">실전 제어 확장</strong>\n과목 건너뛰기, 과목 초기화, 전체 초기화로 반복 연습과 실전 전환 속도를 높입니다.',
            featureCard2Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">상세 복기 정리</strong>\n과목별 상세 통계, 문항별 상세 통계 TXT 다운로드, 정오표 일괄입력으로 복기 흐름을 짧게 만듭니다.',
            featureCard3Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">시간 감각 훈련</strong>\n문항별 시간 가이드와 기록으로 어느 구간에서 시간이 밀리는지 더 세밀하게 확인합니다.',
            featureCard4Html: '<strong style="display:block; color:#0f172a; margin-bottom:4px;">개인 자료 보관함</strong>\n자료 보관함은 고급 모드에서만 보이며, 페이지 안에서 다시 로그인한 계정만 자기 자료를 읽고 수정할 수 있습니다.',
            featureAccessHtml: '<strong>일반 모드와의 차이</strong><br>과목 건너뛰기, 과목 초기화, 전체 초기화, 문항별 시간 가이드, 상세 통계 다운로드, 자료 보관함, 우측 실제환경 여백은 모두 고급 모드에서만 추가됩니다.',
            planTitle: '3. 처음 신청하는 경우',
            planIntro: '필요한 기간을 고르고 후원을 마친 뒤, 아래 신청서를 한 번만 저장하면 됩니다.',
            donateButton: '1. 후원 페이지 열기',
            flowHtml: '<strong>진행 순서</strong><br>\n1. 기간과 금액을 확인합니다.<br>\n2. 후원을 진행합니다.<br>\n3. 아래 신청서에 이메일, 로그인 ID, 시작일, 조회 비밀번호를 입력합니다.<br>\n4. 신청 상태를 이메일로 확인하고, 승인되면 이메일 또는 로그인 ID로 고급 모드를 엽니다.',
            formTitle: '4. 신청 정보 저장',
            formDescription: '후원 뒤에는 사용 시작일, 표시 닉네임, 이메일, 로그인 ID, 조회 비밀번호만 입력하면 됩니다. 로그인 ID는 일반 ID나 이메일 형식 모두 사용할 수 있습니다.',
            passwordHint: '비밀번호는 <strong>신청 상태 확인</strong>과 <strong>고급 모드 로그인</strong>에 모두 같은 값을 씁니다. 신청번호를 따로 기억할 필요 없이, 신청 이메일과 로그인 ID만 기억하면 됩니다.',
            submitButton: '2. 신청 저장',
            lookupTitle: '5. 신청 상태 확인',
            lookupDescription: '신청 상태 확인은 신청 이메일과 조회 비밀번호로만 진행합니다. 신청번호는 따로 쓸 필요가 없고, 승인 후 로그인은 이메일 또는 로그인 ID로 진행합니다.',
            lookupButton: '상태 확인',
            lookupIdPlaceholder: '신청 이메일',
            lookupPasswordPlaceholder: '신청한 비밀번호',
            contactHtml: '문의가 있으면 <strong>zhdlsqpdj@gmail.com</strong>로 보내주세요.'
        },
        advancedFeature: {
            title: '✨ 고급 활용 가이드',
            introHtml: '<div style="font-weight:800; margin-bottom:6px;">일반 가이드와 겹치는 설명은 빼고, 고급에서 달라지는 부분만 모았습니다.</div>\n고급 모드에서는 <strong>상단 상태 바</strong>, <strong>OMR 아래 복기 버튼 구역</strong>, <strong>자료 보관함</strong>, <strong>우측 실제환경 여백</strong>이 추가됩니다.',
            summaryHtml: '<strong>추천 흐름</strong><br><strong>정답 입력 모드</strong> -> <strong>채점 및 통계 확인</strong> -> <strong>과목별 상세 통계</strong> -> <strong>TXT 다운로드 / 정오표 일괄입력</strong>',
            planHtml: '<strong>자료 보관함 위치</strong><br>자료 보관함은 OMR 아래가 아니라 <strong>더보기</strong> 메뉴에서 따로 엽니다. 고급 모드가 열린 브라우저에서만 카드가 나타납니다.',
            image1Title: '1. 상단 상태 바에서 권한 확인',
            image1Caption: '지금 열린 권한, 로그인 ID, 만료 시각은 상단에서 바로 확인합니다. 우측에는 실제 환경 감각을 맞추는 버튼 자리와 여백이 함께 복원됩니다.',
            image2Title: '2. OMR 아래 복기 구역만 익히기',
            image2Caption: '정답 입력, 채점, 상세 통계, TXT 다운로드, 정오표 일괄입력은 모두 OMR 아래에 모여 있습니다. 이 흐름만 익히면 복기 속도가 크게 빨라집니다.',
            flowButton: '고급 기능 신청 보기',
            statsButton: '문항별 상세 통계 TXT 다운로드',
            feature1Html: '<strong>1. 결과부터 확인</strong><br>채점 및 통계 확인으로 맞은 수, 정답률, 건너뜀, 못 푼 문제를 먼저 봅니다.',
            feature2Html: '<strong>2. 과목별 약점 확인</strong><br>과목별 상세 통계로 어떤 영역이 흔들렸는지 바로 확인합니다.',
            feature3Html: '<strong>3. TXT로 기록 남기기</strong><br>문항별 상세 통계 TXT 다운로드로 복기 기록을 저장합니다.',
            feature4Html: '<strong>4. 반복 연습 준비</strong><br>정오표 일괄입력, 과↺, 전↺, 시간 가이드를 조합해 같은 세트를 다시 돌립니다.'
        },
        advancedMode: {
            statusTitle: '고급 모드 상태',
            statusLeadHtml: '이 브라우저에서 현재 어떤 <strong>고급 기능</strong>이 열려 있는지 바로 확인할 수 있습니다.',
            labelState: '상태',
            labelLogin: '로그인',
            labelExpiry: '만료',
            labelArchive: '자료 보관함',
            labelRail: '우측 실제환경 여백',
            valueStateActive: '활성',
            valueStateInactive: '비활성',
            valueArchiveReady: '사용 가능',
            valueArchiveBlocked: '잠김',
            valueRailReady: '복원됨',
            valueRailBlocked: '숨김',
            valueLoginFallback: '확인 전',
            valueExpiryFallback: '확인 전',
            footnoteHtml: '자료 보관함은 <strong>고급 모드가 열린 브라우저</strong>에서만 더보기에 나타나며, 들어간 뒤에도 <strong>자료보관함 로그인</strong>으로 한 번 더 본인 확인을 합니다.',
            guideButton: '고급 활용 보기',
            archiveButton: '자료 보관함 열기',
            coachTitle: '고급 복기 순서',
            coachLeadHtml: '처음에는 아래 세 줄만 기억하면 됩니다.',
            coachStep1Html: '<strong>1. 정답 입력</strong><br>답안 체크 뒤 실제 정답만 넣습니다.',
            coachStep2Html: '<strong>2. 채점 확인</strong><br>맞은 수와 정답률을 먼저 봅니다.',
            coachStep3Html: '<strong>3. 복기 버튼</strong><br>상세 통계, TXT, 정오표로 이어갑니다.',
            coachHintHtml: '<strong>과↺</strong>는 현재 과목만, <strong>전↺</strong>는 전체 시험을 다시 시작합니다. 자료 보관함은 더보기에서 엽니다.',
            coachGuideButton: '전체 안내'
        },
        archivePage: {
            metaTitle: '개인 학습자료 보관함 | SKCT Tool',
            metaDescription: '고급 모드 이용자를 위한 개인 학습자료 보관함입니다. 문제 원문, AI 응답, 복기 메모를 로그인한 계정별로 저장합니다.',
            heroEyebrow: 'Advanced Study Library',
            heroTitle: '개인 학습자료 보관함',
            heroCopyHtml: '고급 모드 이용자 전용 보관함입니다. 자료보관함 로그인 후 문제 원문, AI 응답, 복기 메모를 계정별로 분리해 저장하고 다시 꺼내 볼 수 있습니다.',
            backButton: '메인 연습 도구로 돌아가기',
            gateTitle: '고급 모드 확인이 먼저 필요합니다',
            gateBodyHtml: '이 페이지는 <strong>고급 모드 전용</strong>입니다. 메인 화면의 <strong>고급 안내</strong>에서 승인된 신청 이메일 또는 로그인 ID로 라이선스를 먼저 확인한 뒤 다시 들어와 주세요.',
            gateButton: '고급 안내로 돌아가기',
            authLoginTab: '로그인',
            authRegisterTab: '회원가입',
            authEmailLabel: '이메일',
            authPasswordLabel: '비밀번호',
            authEmailPlaceholder: 'example@email.com',
            authPasswordPlaceholder: '비밀번호 6자 이상',
            authLoginTitle: '내 자료에 로그인',
            authLoginDescription: '고급 모드가 확인된 뒤에는 자료보관함 전용 계정으로 로그인해야 자기 자료를 읽고 수정할 수 있습니다.',
            authRegisterTitle: '자료보관함 계정 만들기',
            authRegisterDescription: '처음이라면 이메일/비밀번호 계정을 만들고, 같은 계정으로만 내 자료를 읽고 수정할 수 있습니다.',
            authLoginButton: '로그인',
            authRegisterButton: '회원가입 후 시작',
            authFootnoteHtml: '세션은 브라우저를 닫으면 종료됩니다. 일반 모드에서는 이 페이지를 사용할 수 없고, 고급 라이선스 확인 후에만 로그인 화면이 열립니다.',
            workspaceTitle: '내 보관함 작업 공간',
            workspaceCopyHtml: '입력 폼에서 저장하고, 오른쪽 목록에서 필터링하며, 상세 패널에서 복기 내용을 바로 확인합니다.',
            logoutButton: '로그아웃'
        },
        messages: {
            advancedLoading: '고급 라이선스 정보를 불러오는 중입니다.',
            advancedCooldown: '이메일 또는 로그인 ID / 비밀번호를 여러 번 틀려 {seconds}초 동안 다시 시도할 수 없습니다.',
            advancedUnlocked: '이 브라우저에 유효한 라이선스가 저장되어 있어 바로 고급 모드를 열 수 있습니다. 만료: {expiry}',
            advancedAvailable: '신청 이메일 또는 로그인 ID와 비밀번호를 입력하면 고급 팝업을 열고, 같은 브라우저에서 자료 보관함 접근도 함께 사용할 수 있습니다.',
            advancedNone: '아직 사용 가능한 라이선스가 없습니다. 먼저 이용권 신청 후 승인을 받아주세요.',
            advancedConfigMissing: '아직 라이선스 검증 공개키가 설정되지 않았습니다. 관리자 설정 저장 후 다시 시도해주세요.',
            advancedNeedConfig: '고급 라이선스 정보를 아직 불러오는 중입니다. 잠시 후 다시 시도해주세요.',
            advancedRetryAfter: '{seconds}초 후에 다시 시도할 수 있습니다.',
            advancedChecking: '신청 이메일 또는 로그인 ID와 비밀번호를 확인하고 있습니다...',
            advancedOpening: '고급 버전 팝업을 여는 중입니다.',
            advancedNeedRelogin: '이 브라우저의 라이선스가 없거나 만료되었습니다. 신청 이메일 또는 로그인 ID와 비밀번호로 다시 확인해주세요.',
            advancedReuse: '저장된 라이선스로 고급 버전을 다시 엽니다.',
            archiveAccessChecking: '이 브라우저의 고급 라이선스를 확인하는 중입니다.',
            archiveAccessDenied: '자료 보관함은 고급 모드 전용입니다. 메인 화면의 고급 안내에서 승인된 신청 이메일 또는 로그인 ID로 고급 모드를 먼저 열어주세요.',
            archiveAuthRequired: '이메일과 비밀번호를 모두 입력해주세요.',
            archiveAuthRegistering: '계정을 만드는 중입니다...',
            archiveAuthLoggingIn: '로그인하는 중입니다...',
            archiveAuthRegisterSuccess: '계정을 만들고 로그인했습니다. 이제 자료를 저장할 수 있습니다.',
            archiveAuthLoginSuccess: '로그인했습니다.',
            archiveAuthInvalidCredential: '이메일 또는 비밀번호를 다시 확인해주세요.',
            archiveAuthEmailInUse: '이미 사용 중인 이메일입니다. 로그인으로 전환하거나 다른 이메일을 사용해주세요.',
            archiveAuthWeakPassword: '비밀번호는 6자 이상으로 설정해주세요.',
            archiveAuthOperationNotAllowed: '현재 Firebase에서 이메일/비밀번호 가입이 비활성화되어 있습니다. 관리자 설정을 확인해주세요.',
            archiveAuthRegisterError: '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            archiveAuthLoginError: '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            archiveGuestLabel: '로그인이 필요합니다.',
            archiveSessionSuffix: '세션 로그인',
            manualClosed: '현재 수동 이용권 신청이 닫혀 있습니다.',
            manualConfigNotReady: '운영 설정이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.',
            manualNoPlan: '신청 가능한 이용권이 아직 열리지 않았습니다.',
            manualRequiredFields: '투네이션 이름, 이용 시작일, 닉네임, 이메일, ID, 비밀번호를 모두 입력해주세요.',
            manualInvalidEmail: '이메일 형식이 올바르지 않습니다.',
            manualPasswordShort: '비밀번호는 6자 이상으로 설정해주세요.',
            manualPasswordMismatch: '비밀번호 확인이 일치하지 않습니다.',
            manualSubmitSuccess: '신청서가 저장되었습니다. 상태 확인은 신청 이메일로, 고급 로그인은 승인 후 이메일 또는 로그인 ID로 진행할 수 있습니다.',
            manualSubmitError: '신청 저장 중 오류가 발생했습니다.',
            manualLookupRequired: '신청 이메일과 조회 비밀번호를 모두 입력해주세요.',
            manualLookupEmailOnly: '신청 조회는 신청 이메일과 조회 비밀번호로만 할 수 있습니다.',
            manualLookupError: '신청 조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
            manualLookupNotFound: '해당 이메일로 조회되는 신청을 찾지 못했습니다. 신청 이메일 또는 조회 비밀번호를 다시 확인해주세요.',
            manualLookupDecryptError: '조회 비밀번호가 일치하지 않거나 요청을 복호화하지 못했습니다.'
        }
    };

    const LEGACY_SITE_TEXT_DEFAULTS = {
        'meta.srTitle': ['SKCT 연습 툴 - SKCT 실제화면과 동일한 온라인 SKCT 환경 가이드'],
        'meta.srDescription': ["본 웹사이트는 SK그룹 인적성 검사를 대비하기 위한 완벽한 무료 SKCT 연습 애플리케이션입니다. SKCT 실제 환경, SKCT 실제화면 인터페이스, 그리고 SKCT 크기 체감까지 고려하여 최대한 정밀하게 구현하였습니다. SKCT 모의고사 인적성 테스트를 진행할 때 필수적인 'SKCT 타이머', 'SKCT 화면 계산기', 'SKCT 메모장', 'SKCT 그림판', 'SKCT 실제 OMR'의 모든 기능을 하나의 SKCT 툴 화면 안에서 제공합니다. 실제 시험과 동일한 감각으로 SKCT 모의 연습을 철저히 준비하세요!"],
        'toolbar.popupButton': ['화면 더 줄이기'],
        'helpModal.sidebarFeatureHtml': ['<div style="position:absolute; top:-10px; left:10px; background:#1e293b; padding:0 5px; color:#3b82f6; font-weight:bold;">좌측 사이드바</div>\n<p>📖 <strong>GUIDE</strong> — 업데이트 공지, 사용 예시, 기능 설명 확인</p>\n<p>📝 <strong>연습용 OMR</strong> — 답안 마킹, 채점, 통계 확인</p>\n<p>⚙ <strong>설정</strong> — 실전/연습 모드, 타이머, 가이드 시간, 화면 비율 조정</p>\n<p>↗ <strong>화면 더 줄이기</strong> — 팝업으로 더 좁은 실전 화면 구성</p>\n<p>🛡️ <strong>무적모드(테스트)</strong> — 링커리어 화면 가림막 대응 확장 설치</p>\n<p>🔥 <strong>접속자 수</strong> — 실시간 현황과 최근 7일 그래프</p>\n<p>💬 <strong>게시판</strong> — 공지, Q&A, Tip, 후기, 개선요청, FAQ</p>\n<p>☕ <strong>커피후원</strong> — 운영 후원과 문의 링크</p>\n<hr style="border-color:#334155; margin: 8px 0;">\n<p style="color:#93c5fd;">OMR에서 답 마킹 → <strong>자동 다음 문제 이동</strong></p>\n<p style="color:#93c5fd;">[문항 건너뛰기] = 현재 문항을 미응답 상태로 넘김</p>\n<p style="color:#93c5fd;">[정답 입력 모드] = 채점용 정답 입력 모드 전환, 타이머 자동 정지</p>\n<p style="color:#93c5fd;">[채점 및 통계 확인] = 과목별 오답, 미응답, 소요 시간 확인</p>'],
        'helpModal.advancedSectionTitle': ['🔒 고급 기능은 별도 버튼에서 확인'],
        'helpModal.advancedSectionLeadHtml': ['이 가이드는 <strong>일반 모드 기준</strong>으로 정리되어 있습니다. 복기용 추가 버튼, 자료 보관함, 우측 실제환경 여백처럼 고급 모드에서만 열리는 기능은 좌측 <strong>고급 기능</strong> 버튼에서 따로 확인해 주세요.'],
        'helpModal.advancedLinkButton': ['고급 기능 보기'],
        'utilityModal.descriptionHtml': ['핵심 연습 흐름 밖의 기능을 한곳에 모았습니다. 일반 모드에서는 활성 세션 확인, 커뮤니티, 운영 후원을 여기서 엽니다.'],
        'utilityModal.descriptionAdvancedHtml': ['핵심 연습 흐름 밖의 기능을 한곳에 모았습니다. 고급 모드에서는 활성 세션 확인, 커뮤니티, 자료 보관함, 운영 후원을 여기서 엽니다.'],
        'utilityModal.archiveDescription': ['고급 모드 전용 기능입니다. 로그인한 계정별로 문제 원문, AI 응답, 복기 메모를 저장하고 다시 꺼내 봅니다.'],
        'advancedFeature.image1Title': ['1. 상태 바와 우측 실제환경 여백부터 확인'],
        'advancedFeature.image1Caption': ['상단 상태 바에서는 로그인 ID, 만료 시각, 자료 보관함 가능 여부를 바로 확인할 수 있고, 우측에는 실제환경 감각을 맞추는 버튼 자리와 여백이 함께 복원됩니다.'],
        'advancedFeature.image2Title': ['2. OMR 아래 복기 버튼 흐름 따라가기'],
        'advancedFeature.image2Caption': ['정답 입력 모드, 채점, 상세 통계, 정오표 일괄입력은 모두 OMR 아래에 모여 있습니다. 순서만 익히면 일반 모드보다 복기 속도가 크게 빨라집니다.'],
        'advancedGuide.title': ['🔒 고급 이용 안내'],
        'advancedGuide.loginTitle': ['1. 승인된 신청으로 고급 모드 열기'],
        'advancedGuide.loginBody': [
            '승인된 신청에 쓴 <strong>이메일</strong> 또는 관리자가 발급한 <strong>ID</strong>와 <strong>비밀번호</strong>를 입력하면 이 브라우저에 라이선스를 저장하고 바로 고급 모드로 들어갈 수 있습니다.',
            '승인 후에는 신청 이메일 또는 관리자가 발급한 ID와 비밀번호로 라이선스를 확인하고, 바로 고급 모드로 들어갈 수 있습니다.',
            '승인 후에는 신청 이메일 또는 로그인 ID와 비밀번호로 라이선스를 확인하고, 같은 브라우저에서 자료 보관함 접근도 함께 열 수 있습니다.'
        ],
        'advancedGuide.accessIdPlaceholder': ['승인 이메일 또는 발급 ID'],
        'advancedGuide.featureTitle': ['2. 고급 모드 전용 기능'],
        'advancedGuide.featureCard1Html': ['<strong style="display:block; color:#0f172a; margin-bottom:4px;">실전 제어 확장</strong>\n과목 건너뛰기, 과목 초기화, 전체 초기화로 반복 연습과 실전 전환 속도를 높입니다.'],
        'advancedGuide.featureCard2Html': ['<strong style="display:block; color:#0f172a; margin-bottom:4px;">상세 복기 정리</strong>\n과목별 상세 통계, 문항별 상세 통계 TXT 다운로드, 정오표 일괄입력으로 복기 흐름을 짧게 만듭니다.'],
        'advancedGuide.featureCard3Html': ['<strong style="display:block; color:#0f172a; margin-bottom:4px;">시간 감각 훈련</strong>\n문항별 시간 가이드와 기록으로 어느 구간에서 시간이 밀리는지 더 세밀하게 확인합니다.'],
        'advancedGuide.featureCard4Html': ['<strong style="display:block; color:#0f172a; margin-bottom:4px;">개인 자료 보관함</strong>\n자료 보관함은 고급 모드에서만 보이며, 페이지 안에서 다시 로그인한 계정만 자기 자료를 읽고 수정할 수 있습니다.'],
        'advancedGuide.featureAccessHtml': ['<strong>접근 기준</strong><br>과목 건너뛰기, 과목 초기화, 전체 초기화, 문항별 시간 가이드, 상세 통계 다운로드, 자료 보관함은 모두 고급 모드 전용입니다. 특히 자료 보관함은 고급 라이선스가 있는 브라우저에서만 열리고, 들어간 뒤에도 로그인한 계정만 사용할 수 있습니다.'],
        'advancedGuide.planTitle': ['3. 이용권 선택'],
        'advancedGuide.planIntro': ['현재는 <strong>7일권</strong>과 <strong>14일권</strong>을 이용할 수 있습니다. 필요한 기간을 선택해 신청하면 됩니다.'],
        'advancedGuide.donateButton': ['후원 페이지 열기'],
        'advancedGuide.flowHtml': ['<strong>신청 흐름</strong><br>\n1. 후원 페이지에서 금액을 확인하고 후원을 진행합니다.<br>\n2. 아래 신청서에 정보와 이용 시작 희망일을 입력합니다.<br>\n3. 신청 이메일과 조회 비밀번호를 입력해 저장합니다.<br>\n4. 신청 조회에서 승인 상태를 확인하고, 승인되면 서명된 라이선스를 이 브라우저에 적용합니다.'],
        'advancedGuide.formTitle': ['4. 이용권 신청서'],
        'advancedGuide.formDescription': [
            '후원 후 아래 정보를 작성해 주세요. 승인되면 이 창에서 바로 라이선스를 확인하고 적용할 수 있습니다.',
            '후원 뒤에는 사용 시작일, 표시 닉네임, 이메일, 희망 ID, 조회 비밀번호만 입력하면 됩니다.',
            '후원 뒤에는 사용 시작일, 표시 닉네임, 이메일, 로그인 ID, 조회 비밀번호만 입력하면 됩니다.'
        ],
        'advancedGuide.passwordHint': [
            '여기서 입력하는 비밀번호는 <strong>신청 조회 및 라이선스 확인용</strong>입니다. 신청 이메일과 함께 기억해 주세요.',
            '비밀번호는 <strong>신청 상태 확인</strong>과 <strong>고급 모드 로그인</strong>에 모두 같은 값을 씁니다. 신청 이메일과 함께 기억해 주세요.'
        ],
        'advancedGuide.submitButton': ['신청서 저장'],
        'advancedGuide.lookupTitle': ['5. 신청 조회'],
        'advancedGuide.lookupDescription': [
            '저장 후에는 <strong>신청 이메일</strong>과 직접 정한 <strong>조회 비밀번호</strong>를 입력하면 현재 상태를 확인하고, 승인된 경우 라이선스를 바로 적용할 수 있습니다.',
            '신청 이메일과 조회 비밀번호로 현재 상태를 확인하고, 승인되면 바로 라이선스를 적용할 수 있습니다.'
        ],
        'advancedGuide.lookupButton': ['조회'],
        'advancedFeature.title': ['🔒 고급 기능'],
        'advancedFeature.introHtml': ['<div style="font-weight:800; margin-bottom:6px;">고급 모드 활용 가이드</div>\n대부분의 고급 기능은 <strong>OMR 탭</strong> 안에서 이어서 사용합니다. 이 창은 어디에서 무엇을 누르면 되는지만 빠르게 확인하는 용도로 보시면 됩니다.'],
        'advancedFeature.summaryHtml': ['<strong>기본 흐름</strong><br>답안을 체크한 뒤 <strong>정답 입력 모드</strong>로 전환하고 정답을 넣은 다음, <strong>채점 및 통계 확인</strong>을 누르면 복기용 기능이 한 번에 열립니다.<br><br><strong>자료 보관함</strong>은 일반 모드에서 보이지 않으며, 고급 라이선스가 확인된 브라우저에서만 더보기 메뉴로 열 수 있습니다.'],
        'advancedFeature.planHtml': ['<strong>복기 기능 위치</strong><br><strong>과목별 상세 통계</strong>, <strong>문항별 상세 통계 TXT 다운로드</strong>, <strong>정오표 일괄입력</strong>, <strong>과목/전체 초기화</strong>, <strong>문항별 시간 가이드</strong>는 모두 고급 모드에서 씁니다.<br><br><strong>자료 보관함</strong>은 더보기 메뉴 안의 별도 페이지이며, 고급 라이선스와 페이지 로그인 둘 다 필요합니다.'],
        'advancedFeature.feature1Html': ['<strong>1. 채점 결과 먼저 보기</strong><br>OMR 탭에서 <strong>채점 및 통계 확인</strong>을 누르면 맞은 수, 정답률, 건너뜀, 못 푼 문제를 바로 확인할 수 있습니다.'],
        'advancedFeature.feature2Html': ['<strong>2. 과목별 상세 통계 열기</strong><br><strong>과목별 상세 통계</strong> 버튼으로 과목별 정오답 분포와 문항 상태를 더 자세히 확인합니다.'],
        'advancedFeature.feature4Html': ['<strong>4. 반복 연습 이어가기</strong><br><strong>정오표 일괄입력</strong>, <strong>과목 초기화</strong>, <strong>전체 초기화</strong>, <strong>문항별 시간 가이드</strong>를 조합하면 같은 세트를 빠르게 다시 돌릴 수 있습니다.'],
        'advancedMode.statusTitle': ['고급 모드 상태'],
        'advancedMode.statusLeadHtml': ['이 브라우저에서 현재 어떤 <strong>고급 기능</strong>이 열려 있는지 바로 확인할 수 있습니다.'],
        'advancedMode.labelState': ['상태'],
        'advancedMode.labelLogin': ['로그인'],
        'advancedMode.labelExpiry': ['만료'],
        'advancedMode.labelArchive': ['자료 보관함'],
        'advancedMode.labelRail': ['우측 실제환경 여백'],
        'advancedMode.valueStateActive': ['활성'],
        'advancedMode.valueStateInactive': ['비활성'],
        'advancedMode.valueArchiveReady': ['사용 가능'],
        'advancedMode.valueArchiveBlocked': ['잠김'],
        'advancedMode.valueRailReady': ['복원됨'],
        'advancedMode.valueRailBlocked': ['숨김'],
        'advancedMode.valueLoginFallback': ['확인 전'],
        'advancedMode.valueExpiryFallback': ['확인 전'],
        'advancedMode.footnoteHtml': ['자료 보관함은 <strong>고급 모드가 열린 브라우저</strong>에서만 더보기에 나타나며, 들어간 뒤에도 <strong>자료보관함 로그인</strong>으로 한 번 더 본인 확인을 합니다.'],
        'advancedMode.guideButton': ['고급 기능 다시 보기'],
        'advancedMode.archiveButton': ['자료 보관함 열기'],
        'advancedMode.coachTitle': ['고급 버튼 빠른 설명', '고급 버튼 사용 순서'],
        'advancedMode.coachLeadHtml': ['정답 입력 모드로 바꾼 뒤 <strong>채점</strong>과 <strong>복기 버튼</strong>을 순서대로 쓰면 됩니다. 처음에는 이 박스 순서대로만 따라가도 충분합니다.', '일반 모드에는 없는 버튼만 짧게 정리했습니다. 정답 입력 후에는 아래 순서대로 쓰면 복기가 가장 빠릅니다.'],
        'advancedMode.coachStep1Html': ['<strong>1. 정답 입력 모드</strong><br>답안 체크가 끝나면 정답 입력 모드로 바꾸고 실제 정답을 넣습니다.'],
        'advancedMode.coachStep2Html': ['<strong>2. 채점 및 과목별 통계</strong><br>채점 후 과목별 상세 통계와 TXT 다운로드로 약점을 바로 정리합니다.'],
        'advancedMode.coachStep3Html': ['<strong>3. 다시 풀기 준비</strong><br>정오표 일괄입력, 과↺, 전↺, 시간 가이드를 조합해 반복 연습 속도를 높입니다.'],
        'advancedMode.coachHintHtml': ['<strong>과↺</strong>는 현재 과목만 다시 시작하고, <strong>전↺</strong>는 전체 시험을 처음 상태로 되돌립니다. 자료 보관함은 더보기에서 따로 열립니다.'],
        'advancedMode.coachGuideButton': ['안내 창', '고급 활용'],
        'advancedFeature.introHtml': ['<div style="font-weight:800; margin-bottom:6px;">일반 모드에 없는 기능만 모았습니다.</div>\n고급 모드에서는 <strong>복기용 버튼</strong>, <strong>자료 보관함</strong>, <strong>우측 실제환경 여백</strong>이 추가됩니다. 아래에서 어디가 달라지는지 먼저 확인하세요.', '<div>어디서 무엇을 누르면 되는지 먼저 보여드립니다.</div><br>대부분의 고급 기능은 <strong>OMR 탭</strong> 안에서 이어서 사용합니다. 이 창은 복기 흐름을 빠르게 다시 찾는 용도로 보시면 됩니다.', '<div style="font-weight:800; margin-bottom:6px;">어디서 무엇을 누르면 되는지 먼저 보여드립니다.</div>\n대부분의 고급 기능은 <strong>OMR 탭</strong> 안에서 이어서 사용합니다. 이 창은 복기 흐름을 빠르게 다시 찾는 용도로 보시면 됩니다.'],
        'advancedFeature.summaryHtml': ['<strong>추천 흐름</strong><br>답안을 체크한 뒤 <strong>정답 입력 모드</strong>로 전환하고 정답을 넣은 다음, <strong>채점 및 통계 확인</strong>으로 결과를 먼저 확인하세요. 그다음 상세 통계, TXT 다운로드, 정오표 일괄입력으로 복기를 이어가면 됩니다.', '<strong>추천 흐름</strong><br>답안을 체크한 뒤 <strong>정답 입력 모드</strong>로 전환하고 정답을 넣은 다음, <strong>채점 및 통계 확인</strong>을 누르면 복기용 기능이 한 번에 열립니다.<br><br><strong>자료 보관함</strong>은 일반 모드에서 보이지 않으며, 고급 라이선스가 확인된 브라우저에서만 더보기 메뉴로 열 수 있습니다.'],
        'advancedFeature.planHtml': ['<strong>먼저 볼 위치</strong><br><strong>상단 상태 바</strong>에서는 지금 열린 권한을 확인하고, <strong>OMR 아래 버튼 구역</strong>에서는 복기 기능을 사용합니다. <strong>자료 보관함</strong>은 더보기 메뉴에서 따로 엽니다.', '<strong>주로 쓰는 기능 위치</strong><br><strong>과목별 상세 통계</strong>, <strong>문항별 상세 통계 TXT 다운로드</strong>, <strong>정오표 일괄입력</strong>, <strong>과목/전체 초기화</strong>, <strong>문항별 시간 가이드</strong>는 모두 고급 모드에서 씁니다.<br><br><strong>자료 보관함</strong>은 더보기 메뉴 안의 별도 페이지이며, 고급 라이선스와 페이지 로그인 둘 다 필요합니다.'],
        'advancedFeature.image1Title': ['1. 상태 바와 우측 실제환경 여백부터 확인'],
        'advancedFeature.image1Caption': ['상단 상태 바에서는 로그인 ID, 만료 시각, 자료 보관함 가능 여부를 바로 확인할 수 있고, 우측에는 실제환경 감각을 맞추는 버튼 자리와 여백이 함께 복원됩니다.'],
        'advancedFeature.image2Title': ['2. OMR 아래 복기 버튼 흐름 따라가기'],
        'advancedFeature.image2Caption': ['정답 입력 모드, 채점, 상세 통계, 정오표 일괄입력은 모두 OMR 아래에 모여 있습니다. 순서만 익히면 일반 모드보다 복기 속도가 크게 빨라집니다.'],
        'advancedFeature.feature1Html': ['<strong>1. 결과부터 확인</strong><br>OMR 탭에서 <strong>채점 및 통계 확인</strong>을 눌러 맞은 수, 정답률, 건너뜀, 못 푼 문제를 먼저 확인합니다.'],
        'advancedFeature.feature2Html': ['<strong>2. 과목별 약점 보기</strong><br><strong>과목별 상세 통계</strong> 버튼으로 과목별 정오답 분포와 문항 상태를 더 자세히 확인합니다.'],
        'advancedFeature.feature3Html': ['<strong>3. TXT로 복기 기록 남기기</strong><br><strong>문항별 상세 통계 TXT 다운로드</strong> 버튼으로 정오답, 미응답, 문항별 시간 기록을 파일로 저장합니다.'],
        'advancedFeature.feature4Html': ['<strong>4. 같은 세트 다시 돌리기</strong><br><strong>정오표 일괄입력</strong>, <strong>과목 초기화</strong>, <strong>전체 초기화</strong>, <strong>문항별 시간 가이드</strong>를 조합하면 반복 연습이 더 빨라집니다.'],
        'messages.advancedAvailable': ['신청 이메일 또는 승인 ID와 비밀번호를 입력하면 고급 팝업을 열고, 같은 브라우저에서 자료 보관함 접근도 함께 사용할 수 있습니다.'],
        'messages.advancedCooldown': ['이메일/ID 또는 비밀번호를 여러 번 틀려 {seconds}초 동안 다시 시도할 수 없습니다.'],
        'messages.advancedUnlocked': ['이 브라우저에 유효한 라이선스가 저장되어 있어 바로 고급 모드를 열 수 있습니다. 만료: {expiry}'],
        'messages.advancedConfigMissing': ['아직 라이선스 검증 공개키가 설정되지 않았습니다. 관리자 설정 저장 후 다시 시도해주세요.'],
        'messages.advancedChecking': ['신청 이메일 또는 승인 ID와 비밀번호를 확인하고 있습니다...'],
        'messages.advancedNeedRelogin': ['이 브라우저의 라이선스가 없거나 만료되었습니다. 신청 이메일 또는 승인 ID와 비밀번호로 다시 확인해주세요.'],
        'messages.archiveAccessDenied': ['자료 보관함은 고급 모드 전용입니다. 메인 화면의 고급 안내에서 승인된 신청 이메일 또는 로그인 ID로 고급 모드를 먼저 열어주세요.'],
        'messages.archiveAuthRequired': ['이메일과 비밀번호를 모두 입력해주세요.'],
        'messages.manualSubmitSuccess': ['신청서가 저장되었습니다. 신청 이메일과 비밀번호로 상태를 다시 확인할 수 있습니다.'],
        'messages.manualLookupRequired': ['이메일과 조회 비밀번호를 모두 입력해주세요.'],
        'messages.manualLookupNotFound': ['해당 이메일로 조회되는 신청을 찾지 못했습니다. 이메일 또는 조회 비밀번호를 다시 확인해주세요.']
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
        { key: 'sidebar.helpLabel', label: '사이드바: 가이드', category: '메인 진입', selector: '#sidebarHelpLabel', prop: 'text' },
        { key: 'sidebar.noticeLabel', label: '사이드바: 공지', category: '메인 진입', selector: '#sidebarNoticeLabel', prop: 'text' },
        { key: 'sidebar.omrLabelHtml', label: '사이드바: OMR', category: '메인 진입', selector: '#sidebarOmrLabel', prop: 'html', multiline: true },
        { key: 'sidebar.settingsLabel', label: '사이드바: 설정', category: '메인 진입', selector: '#sidebarSettingsLabel', prop: 'text' },
        { key: 'sidebar.advancedGuideLabelHtml', label: '사이드바: 고급 기능', category: '메인 진입', selector: '#sidebarAdvancedGuideLabel', prop: 'html', multiline: true },
        { key: 'sidebar.advancedModeLabelHtml', label: '사이드바: 고급 활용', category: '메인 진입', selector: '#sidebarAdvancedModeLabel', prop: 'html', multiline: true },
        { key: 'sidebar.popupLabel', label: '사이드바: 팝업', category: '메인 진입', selector: '#sidebarPopupLabel', prop: 'text' },
        { key: 'sidebar.utilityLabel', label: '사이드바: 더보기', category: '메인 진입', selector: '#sidebarUtilityLabel', prop: 'text' },
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
        { key: 'utilityModal.title', label: '보조 기능 모달 제목', category: '보조 기능', selector: '#utilityModalTitle', prop: 'text' },
        { key: 'utilityModal.descriptionHtml', label: '보조 기능 모달 설명', category: '보조 기능', selector: '#utilityModalDescription', prop: 'html', multiline: true },
        { key: 'utilityModal.descriptionAdvancedHtml', label: '보조 기능 모달 설명(고급 모드)', category: '보조 기능', visual: false },
        { key: 'utilityModal.statsTitle', label: '보조 기능: 활성 세션 제목', category: '보조 기능', selector: '#utilityStatsTitle', prop: 'text' },
        { key: 'utilityModal.statsDescription', label: '보조 기능: 활성 세션 설명', category: '보조 기능', selector: '#utilityStatsDescription', prop: 'text' },
        { key: 'utilityModal.communityTitle', label: '보조 기능: 커뮤니티 제목', category: '보조 기능', selector: '#utilityCommunityTitle', prop: 'text' },
        { key: 'utilityModal.communityDescription', label: '보조 기능: 커뮤니티 설명', category: '보조 기능', selector: '#utilityCommunityDescription', prop: 'text' },
        { key: 'utilityModal.archiveTitle', label: '보조 기능: 자료 보관함 제목', category: '보조 기능', selector: '#utilityArchiveTitle', prop: 'text' },
        { key: 'utilityModal.archiveDescription', label: '보조 기능: 자료 보관함 설명', category: '보조 기능', selector: '#utilityArchiveDescription', prop: 'text' },
        { key: 'utilityModal.extensionTitle', label: '보조 기능: 별도 테스트 자료 제목', category: '보조 기능', selector: '#utilityExtensionTitle', prop: 'text' },
        { key: 'utilityModal.extensionDescription', label: '보조 기능: 별도 테스트 자료 설명', category: '보조 기능', selector: '#utilityExtensionDescription', prop: 'text' },
        { key: 'utilityModal.donateTitle', label: '보조 기능: 후원 제목', category: '보조 기능', selector: '#utilityDonateTitle', prop: 'text' },
        { key: 'utilityModal.donateDescription', label: '보조 기능: 후원 설명', category: '보조 기능', selector: '#utilityDonateDescription', prop: 'text' },
        { key: 'statsModal.title', label: '활성 세션 모달 제목', category: '활성 세션', selector: '#statsModalTitle', prop: 'text' },
        { key: 'statsModal.activeTitle', label: '활성 세션: 현재 제목', category: '활성 세션', selector: '#statsActiveLabel', prop: 'text' },
        { key: 'statsModal.activeHint', label: '활성 세션: 현재 설명', category: '활성 세션', selector: '#statsActiveHint', prop: 'text' },
        { key: 'statsModal.trendTitle', label: '활성 세션: 추세 제목', category: '활성 세션', selector: '#statsTrendTitle', prop: 'text' },
        { key: 'statsModal.totalTitle', label: '활성 세션: 누적 제목', category: '활성 세션', selector: '#statsTotalLabel', prop: 'text' },
        { key: 'statsModal.totalHint', label: '활성 세션: 누적 설명', category: '활성 세션', selector: '#statsTotalHint', prop: 'text' },
        { key: 'noticeModal.title', label: '공지 모달 제목', category: '공지 모달', selector: '#noticeModalTitle', prop: 'text' },
        { key: 'noticeModal.emptyBody', label: '공지 모달 빈 내용', category: '공지 모달', visual: false },
        { key: 'noticeModal.updatedPrefix', label: '공지 모달 업데이트 접두어', category: '공지 모달', visual: false },
        { key: 'helpModal.title', label: '기본 가이드 제목', category: '가이드 모달', selector: '#helpModalTitle', prop: 'text' },
        { key: 'helpModal.exampleSectionTitle', label: '예시 섹션 제목', category: '가이드 모달', selector: '#helpExampleSectionTitle', prop: 'text' },
        { key: 'helpModal.pdfTitle', label: 'PDF 예시 제목', category: '가이드 모달', selector: '#helpPdfExampleTitle', prop: 'text' },
        { key: 'helpModal.pdfCaption', label: 'PDF 예시 설명', category: '가이드 모달', selector: '#helpPdfExampleCaption', prop: 'text' },
        { key: 'helpModal.omrTitle', label: 'OMR 예시 제목', category: '가이드 모달', selector: '#helpOmrExampleTitle', prop: 'text' },
        { key: 'helpModal.omrCaption', label: 'OMR 예시 설명', category: '가이드 모달', selector: '#helpOmrExampleCaption', prop: 'text' },
        { key: 'helpModal.advancedSectionTitle', label: '가이드 내 고급 기능 안내 제목', category: '가이드 모달', selector: '#helpAdvancedSectionTitle', prop: 'text' },
        { key: 'helpModal.advancedSectionLeadHtml', label: '가이드 내 고급 기능 안내 설명', category: '가이드 모달', selector: '#helpAdvancedSectionLead', prop: 'html', multiline: true },
        { key: 'helpModal.advancedLinkButton', label: '가이드 내 고급 기능 이동 버튼', category: '가이드 모달', selector: '#helpAdvancedLinkBtn', prop: 'text' },
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
        { key: 'advancedGuide.title', label: '고급 기능 제목', category: '고급 안내', selector: '#advancedGuideModalTitle', prop: 'text' },
        { key: 'advancedGuide.loginTitle', label: '고급 기능: 로그인 제목', category: '고급 안내', selector: '#advancedGuideLoginTitle', prop: 'text' },
        { key: 'advancedGuide.loginBody', label: '고급 기능: 로그인 설명', category: '고급 안내', selector: '#advancedGuideLoginBody', prop: 'html', multiline: true },
        { key: 'advancedGuide.accessIdPlaceholder', label: '고급 기능: 로그인 이메일/ID placeholder', category: '고급 안내', selector: '#advancedAccessIdInput', prop: 'placeholder', visual: false },
        { key: 'advancedGuide.accessPasswordPlaceholder', label: '고급 기능: 로그인 비밀번호 placeholder', category: '고급 안내', selector: '#advancedAccessPasswordInput', prop: 'placeholder', visual: false },
        { key: 'advancedGuide.accessButton', label: '고급 기능: 로그인 버튼', category: '고급 안내', selector: '#advancedAccessSubmitBtn', prop: 'text' },
        { key: 'advancedGuide.featureTitle', label: '고급 기능: 차이점 제목', category: '고급 안내', selector: '#advancedGuideFeatureTitle', prop: 'text' },
        { key: 'advancedGuide.featureCard1Html', label: '고급 기능 카드 1', category: '고급 안내', selector: '#advancedGuideFeatureCard1', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureCard2Html', label: '고급 기능 카드 2', category: '고급 안내', selector: '#advancedGuideFeatureCard2', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureCard3Html', label: '고급 기능 카드 3', category: '고급 안내', selector: '#advancedGuideFeatureCard3', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureCard4Html', label: '고급 기능 카드 4', category: '고급 안내', selector: '#advancedGuideFeatureCard4', prop: 'html', multiline: true },
        { key: 'advancedGuide.featureAccessHtml', label: '고급 기능: 일반 모드와의 차이', category: '고급 안내', selector: '#advancedGuideFeatureAccess', prop: 'html', multiline: true },
        { key: 'advancedGuide.planTitle', label: '고급 기능: 신청 제목', category: '고급 안내', selector: '#advancedGuidePlanTitle', prop: 'text' },
        { key: 'advancedGuide.planIntro', label: '고급 기능: 신청 소개', category: '고급 안내', selector: '#advancedGuidePlanIntro', prop: 'html', multiline: true },
        { key: 'advancedGuide.donateButton', label: '고급 기능: 후원 버튼', category: '고급 안내', selector: '#manualSubscriptionDonateLink', prop: 'text' },
        { key: 'advancedGuide.flowHtml', label: '고급 기능: 신청 흐름', category: '고급 안내', selector: '#advancedGuideFlow', prop: 'html', multiline: true },
        { key: 'advancedGuide.formTitle', label: '고급 기능: 신청서 제목', category: '고급 안내', selector: '#advancedGuideFormTitle', prop: 'text' },
        { key: 'advancedGuide.formDescription', label: '고급 기능: 신청서 설명', category: '고급 안내', selector: '#advancedGuideFormDescription', prop: 'html', multiline: true },
        { key: 'advancedGuide.passwordHint', label: '고급 기능: 비밀번호 안내', category: '고급 안내', selector: '#advancedGuidePasswordHint', prop: 'html', multiline: true },
        { key: 'advancedGuide.submitButton', label: '고급 기능: 신청 저장 버튼', category: '고급 안내', selector: '#manualSubscriptionSubmitBtn', prop: 'text' },
        { key: 'advancedGuide.lookupTitle', label: '고급 기능: 신청 조회 제목', category: '고급 안내', selector: '#advancedGuideLookupTitle', prop: 'text' },
        { key: 'advancedGuide.lookupDescription', label: '고급 기능: 신청 조회 설명', category: '고급 안내', selector: '#advancedGuideLookupDescription', prop: 'html', multiline: true },
        { key: 'advancedGuide.lookupIdPlaceholder', label: '고급 기능: 조회 이메일 placeholder', category: '고급 안내', selector: '#manualSubscriptionLookupIdInput', prop: 'placeholder', visual: false },
        { key: 'advancedGuide.lookupPasswordPlaceholder', label: '고급 기능: 조회 비밀번호 placeholder', category: '고급 안내', selector: '#manualSubscriptionLookupPasswordInput', prop: 'placeholder', visual: false },
        { key: 'advancedGuide.lookupButton', label: '고급 기능: 조회 버튼', category: '고급 안내', selector: '#manualSubscriptionLookupBtn', prop: 'text' },
        { key: 'advancedGuide.contactHtml', label: '고급 기능: 문의 문구', category: '고급 안내', selector: '#advancedGuideContact', prop: 'html', multiline: true },
        { key: 'advancedFeature.title', label: '고급 기능 모달 제목', category: '고급 기능', selector: '#advancedFeatureModalTitle', prop: 'text' },
        { key: 'advancedFeature.introHtml', label: '고급 기능: 안내 상단', category: '고급 기능', selector: '#advancedFeatureIntro', prop: 'html', multiline: true },
        { key: 'advancedFeature.summaryHtml', label: '고급 기능: 요약', category: '고급 기능', selector: '#advancedFeatureSummary', prop: 'html', multiline: true },
        { key: 'advancedFeature.planHtml', label: '고급 기능: 위치 안내', category: '고급 기능', selector: '#advancedFeaturePlanInfo', prop: 'html', multiline: true },
        { key: 'advancedFeature.image1Title', label: '고급 기능: 도식 1 제목', category: '고급 기능', selector: '#advancedFeatureImage1Title', prop: 'text' },
        { key: 'advancedFeature.image1Caption', label: '고급 기능: 도식 1 설명', category: '고급 기능', selector: '#advancedFeatureImage1Caption', prop: 'text' },
        { key: 'advancedFeature.image2Title', label: '고급 기능: 도식 2 제목', category: '고급 기능', selector: '#advancedFeatureImage2Title', prop: 'text' },
        { key: 'advancedFeature.image2Caption', label: '고급 기능: 도식 2 설명', category: '고급 기능', selector: '#advancedFeatureImage2Caption', prop: 'text' },
        { key: 'advancedFeature.flowButton', label: '고급 기능: 신청 안내 버튼', category: '고급 기능', selector: '#advancedFeatureManualFlowBtn', prop: 'text' },
        { key: 'advancedFeature.statsButton', label: '고급 기능: 통계 다운로드 버튼', category: '고급 기능', selector: '#advancedStatsDownloadBtn', prop: 'text' },
        { key: 'advancedFeature.feature1Html', label: '고급 기능 설명 1', category: '고급 기능', selector: '#advancedFeatureItem1', prop: 'html', multiline: true },
        { key: 'advancedFeature.feature2Html', label: '고급 기능 설명 2', category: '고급 기능', selector: '#advancedFeatureItem2', prop: 'html', multiline: true },
        { key: 'advancedFeature.feature3Html', label: '고급 기능 설명 3', category: '고급 기능', selector: '#advancedFeatureItem3', prop: 'html', multiline: true },
        { key: 'advancedFeature.feature4Html', label: '고급 기능 설명 4', category: '고급 기능', selector: '#advancedFeatureItem4', prop: 'html', multiline: true },
        { key: 'advancedMode.statusTitle', label: '고급 상태 바 제목', category: '고급 상태 바', selector: '#advancedModeStatusTitle', prop: 'text' },
        { key: 'advancedMode.statusLeadHtml', label: '고급 상태 바 설명', category: '고급 상태 바', selector: '#advancedModeStatusLead', prop: 'html', multiline: true },
        { key: 'advancedMode.labelState', label: '고급 상태: 상태 라벨', category: '고급 상태 바', selector: '#advancedModeLabelState', prop: 'text' },
        { key: 'advancedMode.labelLogin', label: '고급 상태: 로그인 라벨', category: '고급 상태 바', selector: '#advancedModeLabelLogin', prop: 'text' },
        { key: 'advancedMode.labelExpiry', label: '고급 상태: 만료 라벨', category: '고급 상태 바', selector: '#advancedModeLabelExpiry', prop: 'text' },
        { key: 'advancedMode.labelArchive', label: '고급 상태: 보관함 라벨', category: '고급 상태 바', selector: '#advancedModeLabelArchive', prop: 'text' },
        { key: 'advancedMode.labelRail', label: '고급 상태: 우측 여백 라벨', category: '고급 상태 바', selector: '#advancedModeLabelRail', prop: 'text' },
        { key: 'advancedMode.valueStateActive', label: '고급 상태: 활성 값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.valueStateInactive', label: '고급 상태: 비활성 값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.valueArchiveReady', label: '고급 상태: 보관함 사용 가능 값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.valueArchiveBlocked', label: '고급 상태: 보관함 잠김 값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.valueRailReady', label: '고급 상태: 여백 복원 값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.valueRailBlocked', label: '고급 상태: 여백 숨김 값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.valueLoginFallback', label: '고급 상태: 로그인 기본값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.valueExpiryFallback', label: '고급 상태: 만료 기본값', category: '고급 상태 바', visual: false },
        { key: 'advancedMode.footnoteHtml', label: '고급 상태 바 하단 설명', category: '고급 상태 바', selector: '#advancedModeStatusFootnote', prop: 'html', multiline: true },
        { key: 'advancedMode.guideButton', label: '고급 상태 바 활용 버튼', category: '고급 상태 바', selector: '#advancedModeGuideBtn', prop: 'text' },
        { key: 'advancedMode.archiveButton', label: '고급 상태 바 보관함 버튼', category: '고급 상태 바', selector: '#advancedModeArchiveBtn', prop: 'text' },
        { key: 'advancedMode.coachTitle', label: '고급 버튼 순서 제목', category: '고급 버튼 가이드', selector: '#advancedCoachTitle', prop: 'text' },
        { key: 'advancedMode.coachLeadHtml', label: '고급 버튼 순서 설명', category: '고급 버튼 가이드', selector: '#advancedCoachLead', prop: 'html', multiline: true },
        { key: 'advancedMode.coachStep1Html', label: '고급 버튼 순서 1', category: '고급 버튼 가이드', selector: '#advancedCoachStep1', prop: 'html', multiline: true },
        { key: 'advancedMode.coachStep2Html', label: '고급 버튼 순서 2', category: '고급 버튼 가이드', selector: '#advancedCoachStep2', prop: 'html', multiline: true },
        { key: 'advancedMode.coachStep3Html', label: '고급 버튼 순서 3', category: '고급 버튼 가이드', selector: '#advancedCoachStep3', prop: 'html', multiline: true },
        { key: 'advancedMode.coachHintHtml', label: '고급 버튼 순서 하단 힌트', category: '고급 버튼 가이드', selector: '#advancedCoachHint', prop: 'html', multiline: true },
        { key: 'advancedMode.coachGuideButton', label: '고급 버튼 순서 활용 버튼', category: '고급 버튼 가이드', selector: '#advancedCoachGuideBtn', prop: 'text' },
        { key: 'archivePage.metaTitle', label: '자료 보관함: 브라우저 제목', category: '자료 보관함', visual: false },
        { key: 'archivePage.metaDescription', label: '자료 보관함: 설명 메타', category: '자료 보관함', visual: false },
        { key: 'archivePage.heroEyebrow', label: '자료 보관함: 상단 소제목', category: '자료 보관함', selector: '#archiveHeroEyebrow', prop: 'text', visual: false },
        { key: 'archivePage.heroTitle', label: '자료 보관함: 상단 제목', category: '자료 보관함', selector: '#archiveHeroTitle', prop: 'text', visual: false },
        { key: 'archivePage.heroCopyHtml', label: '자료 보관함: 상단 설명', category: '자료 보관함', selector: '#archiveHeroCopy', prop: 'html', multiline: true, visual: false },
        { key: 'archivePage.backButton', label: '자료 보관함: 메인 복귀 버튼', category: '자료 보관함', selector: '#archiveBackButton', prop: 'text', visual: false },
        { key: 'archivePage.gateTitle', label: '자료 보관함: 접근 제한 제목', category: '자료 보관함', selector: '#archiveAccessGateTitle', prop: 'text', visual: false },
        { key: 'archivePage.gateBodyHtml', label: '자료 보관함: 접근 제한 설명', category: '자료 보관함', selector: '#archiveAccessGateBody', prop: 'html', multiline: true, visual: false },
        { key: 'archivePage.gateButton', label: '자료 보관함: 접근 제한 버튼', category: '자료 보관함', selector: '#archiveAccessGuideLink', prop: 'text', visual: false },
        { key: 'archivePage.authLoginTab', label: '자료 보관함: 로그인 탭', category: '자료 보관함', selector: '#authLoginTab', prop: 'text', visual: false },
        { key: 'archivePage.authRegisterTab', label: '자료 보관함: 회원가입 탭', category: '자료 보관함', selector: '#authRegisterTab', prop: 'text', visual: false },
        { key: 'archivePage.authEmailLabel', label: '자료 보관함: 이메일 라벨', category: '자료 보관함', selector: '#authEmailLabel', prop: 'text', visual: false },
        { key: 'archivePage.authPasswordLabel', label: '자료 보관함: 비밀번호 라벨', category: '자료 보관함', selector: '#authPasswordLabel', prop: 'text', visual: false },
        { key: 'archivePage.authEmailPlaceholder', label: '자료 보관함: 이메일 placeholder', category: '자료 보관함', selector: '#authEmailInput', prop: 'placeholder', visual: false },
        { key: 'archivePage.authPasswordPlaceholder', label: '자료 보관함: 비밀번호 placeholder', category: '자료 보관함', selector: '#authPasswordInput', prop: 'placeholder', visual: false },
        { key: 'archivePage.authLoginTitle', label: '자료 보관함: 로그인 제목', category: '자료 보관함', visual: false },
        { key: 'archivePage.authLoginDescription', label: '자료 보관함: 로그인 설명', category: '자료 보관함', visual: false },
        { key: 'archivePage.authRegisterTitle', label: '자료 보관함: 회원가입 제목', category: '자료 보관함', visual: false },
        { key: 'archivePage.authRegisterDescription', label: '자료 보관함: 회원가입 설명', category: '자료 보관함', visual: false },
        { key: 'archivePage.authLoginButton', label: '자료 보관함: 로그인 버튼', category: '자료 보관함', visual: false },
        { key: 'archivePage.authRegisterButton', label: '자료 보관함: 회원가입 버튼', category: '자료 보관함', visual: false },
        { key: 'archivePage.authFootnoteHtml', label: '자료 보관함: 로그인 안내 문구', category: '자료 보관함', selector: '#archiveAuthFootnote', prop: 'html', multiline: true, visual: false },
        { key: 'archivePage.workspaceTitle', label: '자료 보관함: 작업 공간 제목', category: '자료 보관함', selector: '#archiveWorkspaceTitle', prop: 'text', visual: false },
        { key: 'archivePage.workspaceCopyHtml', label: '자료 보관함: 작업 공간 설명', category: '자료 보관함', selector: '#archiveWorkspaceCopy', prop: 'html', multiline: true, visual: false },
        { key: 'archivePage.logoutButton', label: '자료 보관함: 로그아웃 버튼', category: '자료 보관함', selector: '#authLogoutBtn', prop: 'text', visual: false },
        { key: 'messages.advancedLoading', label: '상태 메시지: 고급 로딩', category: '상태 메시지', visual: false },
        { key: 'messages.advancedCooldown', label: '상태 메시지: 고급 재시도 대기', category: '상태 메시지', visual: false },
        { key: 'messages.advancedUnlocked', label: '상태 메시지: 고급 인증 유지', category: '상태 메시지', visual: false },
        { key: 'messages.advancedAvailable', label: '상태 메시지: 고급 이용권 있음', category: '상태 메시지', visual: false },
        { key: 'messages.advancedNone', label: '상태 메시지: 고급 이용권 없음', category: '상태 메시지', visual: false },
        { key: 'messages.advancedConfigMissing', label: '상태 메시지: 공개키 없음', category: '상태 메시지', visual: false },
        { key: 'messages.advancedNeedConfig', label: '상태 메시지: 고급 준비 중', category: '상태 메시지', visual: false },
        { key: 'messages.advancedRetryAfter', label: '상태 메시지: 고급 재시도 초', category: '상태 메시지', visual: false },
        { key: 'messages.advancedChecking', label: '상태 메시지: 고급 확인 중', category: '상태 메시지', visual: false },
        { key: 'messages.advancedOpening', label: '상태 메시지: 고급 열기 중', category: '상태 메시지', visual: false },
        { key: 'messages.advancedNeedRelogin', label: '상태 메시지: 재로그인 필요', category: '상태 메시지', visual: false },
        { key: 'messages.advancedReuse', label: '상태 메시지: 저장된 인증 재사용', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAccessChecking', label: '상태 메시지: 보관함 라이선스 확인 중', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAccessDenied', label: '상태 메시지: 보관함 접근 제한', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthRequired', label: '상태 메시지: 보관함 로그인 필수값', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthRegistering', label: '상태 메시지: 보관함 회원가입 중', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthLoggingIn', label: '상태 메시지: 보관함 로그인 중', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthRegisterSuccess', label: '상태 메시지: 보관함 회원가입 성공', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthLoginSuccess', label: '상태 메시지: 보관함 로그인 성공', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthInvalidCredential', label: '상태 메시지: 보관함 자격 증명 오류', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthEmailInUse', label: '상태 메시지: 보관함 이메일 중복', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthWeakPassword', label: '상태 메시지: 보관함 비밀번호 길이', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthOperationNotAllowed', label: '상태 메시지: 보관함 가입 비활성', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthRegisterError', label: '상태 메시지: 보관함 회원가입 오류', category: '상태 메시지', visual: false },
        { key: 'messages.archiveAuthLoginError', label: '상태 메시지: 보관함 로그인 오류', category: '상태 메시지', visual: false },
        { key: 'messages.archiveGuestLabel', label: '상태 메시지: 보관함 로그아웃 상태 라벨', category: '상태 메시지', visual: false },
        { key: 'messages.archiveSessionSuffix', label: '상태 메시지: 보관함 세션 접미사', category: '상태 메시지', visual: false },
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
        { key: 'messages.manualLookupEmailOnly', label: '상태 메시지: 조회 이메일 전용 안내', category: '상태 메시지', visual: false },
        { key: 'messages.manualLookupError', label: '상태 메시지: 조회 오류', category: '상태 메시지', visual: false },
        { key: 'messages.manualLookupNotFound', label: '상태 메시지: 신청 조회 없음', category: '상태 메시지', visual: false },
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

    function applyLegacyValueMigrations(config, rawConfig) {
        Object.entries(LEGACY_SITE_TEXT_DEFAULTS).forEach(([path, legacyValues]) => {
            const rawValue = getValueByPath(rawConfig, path);
            if (rawValue == null) return;
            if (legacyValues.includes(rawValue)) {
                const nextValue = getValueByPath(DEFAULT_SITE_TEXT_CONFIG, path);
                if (nextValue != null) {
                    setValueByPath(config, path, nextValue);
                }
            }
        });
        return config;
    }

    function normalizeSiteTextConfig(rawConfig) {
        return applyLegacyValueMigrations(deepMerge(DEFAULT_SITE_TEXT_CONFIG, rawConfig || {}), rawConfig || {});
    }

    function sanitizeHtml(value, options = {}) {
        const { multiline = false } = options;
        const source = String(value ?? '');
        const normalized = multiline ? source.replace(/\n/g, '<br>') : source;
        const template = document.createElement('template');
        template.innerHTML = normalized;
        const allowedTags = new Set(['A', 'B', 'BR', 'DIV', 'EM', 'I', 'P', 'SMALL', 'SPAN', 'STRONG', 'U']);
        const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
        const elements = [];
        while (walker.nextNode()) {
            elements.push(walker.currentNode);
        }
        elements.forEach((element) => {
            if (!allowedTags.has(element.tagName)) {
                element.replaceWith(document.createTextNode(element.textContent || ''));
                return;
            }
            Array.from(element.attributes).forEach((attribute) => {
                const name = attribute.name.toLowerCase();
                const attrValue = String(attribute.value || '').trim();
                const allowHref = element.tagName === 'A' && name === 'href' && /^(https?:|mailto:)/i.test(attrValue);
                if (!allowHref) {
                    element.removeAttribute(attribute.name);
                }
            });
            if (element.tagName === 'A') {
                element.setAttribute('target', '_blank');
                element.setAttribute('rel', 'noopener noreferrer');
            }
        });
        return template.innerHTML;
    }

    function formatHtmlValue(value, multiline) {
        return sanitizeHtml(value, { multiline });
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
        sanitizeHtml,
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
