document.addEventListener('DOMContentLoaded', () => {
    const runtimeFlags = window.SKCT_FLAGS || {};
    const isAdminPreviewMode = runtimeFlags.adminPreview === true;

    /* --- State Restoration from LocalStorage --- */
    const savedOmrWidth = localStorage.getItem('skct_omr_width');
    if (savedOmrWidth) {
        document.documentElement.style.setProperty('--omr-width', `${savedOmrWidth}px`);
    }

    // Layout Ratios Settings
    const savedRatios = isAdminPreviewMode
        ? { timer: 0.2, utils: 1, calc: 2 }
        : (JSON.parse(localStorage.getItem('skct_layout_ratios')) || { timer: 0.2, utils: 1, calc: 2 });
    document.documentElement.style.setProperty('--timer-ratio', savedRatios.timer);
    document.documentElement.style.setProperty('--utils-ratio', savedRatios.utils);
    document.documentElement.style.setProperty('--calc-ratio', savedRatios.calc);
    
    const ratioTimer = document.getElementById('ratioTimer');
    const ratioUtils = document.getElementById('ratioUtils');
    const ratioCalc = document.getElementById('ratioCalc');
    
    if (ratioTimer) ratioTimer.value = savedRatios.timer;
    if (ratioUtils) ratioUtils.value = savedRatios.utils;
    if (ratioCalc) ratioCalc.value = savedRatios.calc;

    const applyRatios = () => {
        if (!ratioTimer) return;
        const tR = parseFloat(ratioTimer.value) || 0;
        const uR = parseFloat(ratioUtils.value) || 0;
        const cR = parseFloat(ratioCalc.value) || 0;
        
        document.documentElement.style.setProperty('--timer-ratio', tR);
        document.documentElement.style.setProperty('--utils-ratio', uR);
        document.documentElement.style.setProperty('--calc-ratio', cR);
        
        if (!isAdminPreviewMode) {
            localStorage.setItem('skct_layout_ratios', JSON.stringify({ timer: tR, utils: uR, calc: cR }));
        }
        // flex가 변경되면 utils 영역 높이가 바뀌므로 캔버스 리사이즈
        if (typeof resizeCanvas === 'function') {
            requestAnimationFrame(resizeCanvas);
        }
    };

    if (ratioTimer) {
        ratioTimer.addEventListener('input', applyRatios);
        ratioUtils.addEventListener('input', applyRatios);
        ratioCalc.addEventListener('input', applyRatios);
    }

    // Save window size if we are in popup mode
    let winResizeTimeout = null;
    window.addEventListener('resize', () => {
        if (window.name === 'skct_popup_mode') {
            clearTimeout(winResizeTimeout);
            winResizeTimeout = setTimeout(() => {
                localStorage.setItem('skct_popup_width', window.outerWidth);
                localStorage.setItem('skct_popup_height', window.outerHeight);
                localStorage.setItem('skct_popup_left', window.screenX);
                localStorage.setItem('skct_popup_top', window.screenY);
            }, 500);
        }
    });

    /* --- OMR & Scoring Logic --- */
    const subjects = [
        { id: 'lang_und', name: '언어이해', count: 20 },
        { id: 'data_ana', name: '자료해석', count: 20 },
        { id: 'crea_math', name: '창의수리', count: 20 },
        { id: 'lang_rea', name: '언어추리', count: 20 },
        { id: 'seq_rea', name: '수열추리', count: 20 }
    ];

    const sanitizeMinutes = (value, fallback) => {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    };

    const omrState = {
        myAnswers: {},
        correctAnswers: {},
        mode: 'answer', // 'answer' | 'score'
        currentGlobalIndex: 0
    };

    /* --- Multi-Phase Timer State --- */
    let timerInterval = null;
    let totalSeconds = 75 * 60;
    let configTotalMins = 75;
    let configSubjectMins = 15;
    let configBreakMins = 1;
    let phases = [];
    let currentPhaseIdx = 0;
    let currentPhaseSeconds = 0;
    let timerIsRunning = false;

    // 실전/연습 모드 (기본: 실전 모드)
    let isPracticeMode = localStorage.getItem('skct_practice_mode') === 'true';
    // 실전 모드에서 시간 종료된 과목 인덱스를 추적
    const lockedSubjectIndices = new Set();

    const omrSidebar = document.getElementById('omrSidebar');
    const omrToggleBtn = document.getElementById('omrToggleBtn');
    const omrContent = document.getElementById('omrContent');
    const omrBody = document.getElementById('omrBody');
    
    // Toggle OMR Sidebar
    omrToggleBtn.addEventListener('click', () => {
        omrSidebar.classList.remove('collapsed');
        omrContent.classList.remove('hidden');
        // 리사이저 힌트 애니메이션 표시
        const resizer = document.getElementById('omrResizer');
        if (resizer) {
            resizer.classList.add('hint-active');
            // 플로팅 힌트 배지 생성
            const badge = document.createElement('div');
            badge.className = 'resizer-hint-badge';
            badge.innerHTML = '<span class="arrows">◀▶</span> 드래그하여 폭 조절';
            document.body.appendChild(badge);
            // 리사이저 위치에 배지 배치
            requestAnimationFrame(() => {
                const rect = resizer.getBoundingClientRect();
                badge.style.top = (rect.top + rect.height / 2 - 15) + 'px';
                badge.style.left = (rect.right + 8) + 'px';
            });
            // 3초 후 정리
            setTimeout(() => {
                resizer.classList.remove('hint-active');
                if (badge.parentNode) badge.parentNode.removeChild(badge);
            }, 3000);
        }
    });

    document.getElementById('omrCollapseBtn').addEventListener('click', () => {
        omrSidebar.classList.add('collapsed');
        omrContent.classList.add('hidden');
    });

    // OMR Drag Resizer
    const omrResizer = document.getElementById('omrResizer');
    let isResizingOmr = false;

    omrResizer.addEventListener('mousedown', (e) => {
        isResizingOmr = true;
        document.body.style.cursor = 'col-resize';
        // 방해 방지용
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizingOmr) return;
        let newWidth = e.clientX;
        if (newWidth < 130) newWidth = 130; // 좁혀진 레이아웃에 맞춰 최소폭 하향
        if (newWidth > document.body.clientWidth * 0.8) newWidth = document.body.clientWidth * 0.8; // 최대폭
        document.documentElement.style.setProperty('--omr-width', `${newWidth}px`);
    });

    document.addEventListener('mouseup', () => {
        if (isResizingOmr) {
            isResizingOmr = false;
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            const currentWidth = getComputedStyle(document.documentElement).getPropertyValue('--omr-width').replace('px', '').trim();
            localStorage.setItem('skct_omr_width', currentWidth);
            resizeCanvas(); // OMR 너비 변동으로 캔버스 폭 변경 대응
        }
    });

    // Question Timing
    let questionTimings = {}; // { "math_1": { spent: 45, state: 'answered' | 'skipped' } }
    let questionSpentSec = 0;

    // Helper to get current Question Key
    const getCurrentQKey = () => {
        let globalIndex = 0;
        for (let subj of subjects) {
            for (let i = 1; i <= subj.count; i++) {
                if (globalIndex === omrState.currentGlobalIndex) return `${subj.id}_${i}`;
                globalIndex++;
            }
        }
        return null;
    };

    const advanceQuestion = (isSkip = false) => {
        if (timerIsRunning) {
            const qKey = getCurrentQKey();
            if (qKey) {
                if (!questionTimings[qKey]) questionTimings[qKey] = { spent: 0, state: 'answered' };
                questionTimings[qKey].spent += questionSpentSec;
                if (isSkip) questionTimings[qKey].state = 'skipped';
                else questionTimings[qKey].state = 'answered';
                questionSpentSec = 0; // reset
            }
        }
        document.getElementById('globalClearBtn').click();
    };

    // 현재 globalIndex가 어떤 과목(subjectIndex)에 속하는지 반환
    const getSubjectIndexForGlobal = (globalIdx) => {
        let cumulative = 0;
        for (let i = 0; i < subjects.length; i++) {
            cumulative += subjects[i].count;
            if (globalIdx < cumulative) return i;
        }
        return subjects.length - 1;
    };

    // 과목 인덱스별 시작 globalIndex 반환
    const getSubjectStartIndex = (subjIdx) => {
        let start = 0;
        for (let k = 0; k < subjIdx; k++) {
            start += subjects[k].count;
        }
        return start;
    };

    // Render OMR
    function renderOMR() {
        let globalIndex = 0;
        omrBody.innerHTML = '';
        subjects.forEach((subj, subjIdx) => {
            const group = document.createElement('div');
            group.className = 'subject-group';
            const isSubjLocked = lockedSubjectIndices.has(subjIdx) && (!isPracticeMode && timerIsRunning);
            if (isSubjLocked) group.classList.add('subject-locked');
            group.innerHTML = `<div class="subject-title">${subj.name}${isSubjLocked ? ' <span class="lock-badge">🔒 시간종료</span>' : ''}</div>`;
            
            for (let i = 1; i <= subj.count; i++) {
                const qRow = document.createElement('div');
                qRow.className = 'q-row';
                const currentIdx = globalIndex;
                const isCurrent = (currentIdx === omrState.currentGlobalIndex);
                const isPast = (currentIdx < omrState.currentGlobalIndex);

                if (omrState.mode === 'answer') {
                    if (isSubjLocked) {
                        qRow.classList.add('locked-q');
                    } else if (isCurrent) {
                        qRow.classList.add('current-q');
                    } else if (isPast) {
                        qRow.classList.add('past-q');
                    }
                } else if (omrState.mode === 'score') {
                    const qKey = `${subj.id}_${i}`;
                    const myAns = omrState.myAnswers[qKey];
                    const corAns = omrState.correctAnswers[qKey];
                    if (!myAns) qRow.classList.add('status-missed');
                    else if (myAns === corAns) qRow.classList.add('status-correct');
                    else qRow.classList.add('status-wrong');
                }
                
                let optionsHtml = '';
                for (let opt = 1; opt <= 5; opt++) {
                    const qKey = `${subj.id}_${i}`;
                    const isMyAnswer = omrState.myAnswers[qKey] === opt;
                    const isCorrectAnswer = omrState.correctAnswers[qKey] === opt;
                    
                    let extraClass = '';
                    if (omrState.mode === 'answer' && isMyAnswer) {
                        extraClass = 'selected';
                    } else if (omrState.mode === 'score') {
                        if (isCorrectAnswer) {
                            extraClass = 'selected correct';
                        } else if (isMyAnswer) {
                            extraClass = 'selected wrong';
                        }
                    }

                    let disabledAttr = '';
                    if (omrState.mode === 'answer') {
                        if (isPracticeMode || !timerIsRunning) {
                            // 연습 모드이거나 타이머 정지 시: 모든 문항 자유 입력
                            disabledAttr = '';
                        } else if (isSubjLocked) {
                            disabledAttr = 'disabled';
                        } else if (!isCurrent) {
                            disabledAttr = 'disabled';
                        }
                    }

                    optionsHtml += `<button class="q-opt ${extraClass}" data-key="${qKey}" data-opt="${opt}" data-gidx="${currentIdx}" ${disabledAttr}>${opt}</button>`;
                }
                
                qRow.innerHTML = `
                    <div class="q-num">${i}.</div>
                    <div class="q-options" style="display:flex; align-items:center; gap:4px;">
                        ${optionsHtml}
                    </div>
                `;
                group.appendChild(qRow);
                globalIndex++;
            }
            omrBody.appendChild(group);
        });

        // Let's add scroll auto-focus right after render
        requestAnimationFrame(() => {
            const currentEl = document.querySelector('.q-row.current-q');
            if (currentEl) {
                currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // Attach events
        document.querySelectorAll('.q-opt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.dataset.key;
                const opt = parseInt(e.target.dataset.opt);
                const gIdx = parseInt(e.target.dataset.gidx);
                
                if (omrState.mode === 'answer') {
                    if (!e.target.disabled) {
                        omrState.myAnswers[key] = (omrState.myAnswers[key] === opt) ? null : opt;
                        if (isPracticeMode) {
                            // 연습 모드: 클릭한 문항 위치로 currentGlobalIndex 이동 후 advance
                            omrState.currentGlobalIndex = gIdx;
                        }
                        advanceQuestion(false);
                    }
                } else {
                    omrState.correctAnswers[key] = (omrState.correctAnswers[key] === opt) ? null : opt;
                    renderOMR();
                }
            });
        });
    }

    renderOMR();

    // Mode Toggle (단일 토글 버튼)
    const modeToggleBtn = document.getElementById('modeToggleBtn');
    const omrModeLabel = document.getElementById('omrModeLabel');

    const updateModeUI = () => {
        if (omrState.mode === 'answer') {
            modeToggleBtn.textContent = '📝 정답 입력 모드로 전환';
            modeToggleBtn.classList.remove('active-score');
            if (omrModeLabel) {
                omrModeLabel.textContent = '📝 답안 작성 중';
                omrModeLabel.style.color = '';
            }
        } else {
            modeToggleBtn.textContent = '✏️ 답안 작성 모드로 돌아가기';
            modeToggleBtn.classList.add('active-score');
            if (omrModeLabel) omrModeLabel.textContent = '✅ 정답 입력 중';
            if (omrModeLabel) omrModeLabel.style.color = '#4ade80';
        }
    };

    const stopTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerIsRunning = false;
        if (timerPlayBtn) {
            timerPlayBtn.innerText = '▶ 시작 / 정지';
        }
        updateTimerUI();
        applyPhaseToOMR();
    };

    const enterScoreMode = () => {
        omrState.mode = 'score';
        stopTimer();
        updateModeUI();
        renderOMR();
    };

    if (modeToggleBtn) {
        modeToggleBtn.addEventListener('click', () => {
            if (omrState.mode === 'answer') {
                enterScoreMode();
            } else {
                omrState.mode = 'answer';
                updateModeUI();
                renderOMR();
            }
        });
    }

    document.getElementById('scoreBtn').addEventListener('click', () => {
        // 정답이 하나도 입력 안 됐으면 안내
        const hasCorrectAnswers = Object.values(omrState.correctAnswers).some(v => v != null);
        if (!hasCorrectAnswers) {
            // 정답 입력 모드로 자동 전환
            enterScoreMode();
            return;
        }

        let totalScore = 0;
        let attemptedCount = 0;

        subjects.forEach(subj => {
            for (let i=1; i<=subj.count; i++) {
                const qKey = `${subj.id}_${i}`;
                if (omrState.myAnswers[qKey]) {
                    attemptedCount++;
                }
                if (omrState.correctAnswers[qKey] && omrState.myAnswers[qKey] === omrState.correctAnswers[qKey]) {
                    totalScore++;
                }
            }
        });
        
        const maxQ = subjects.reduce((sum, s) => sum + s.count, 0);
        document.getElementById('statAttempted').innerText = `${attemptedCount} / ${maxQ}`;
        document.getElementById('statCorrect').innerText = `${totalScore} 개`;
        
        const rate = attemptedCount > 0 ? ((totalScore / attemptedCount) * 100).toFixed(1) : 0;
        document.getElementById('statRate').innerText = `${rate}%`;
        
        const resEl = document.getElementById('scoreResult');
        resEl.classList.remove('hidden');
        const detailScoreBtn = document.getElementById('detailScoreBtn');
        if(detailScoreBtn) detailScoreBtn.classList.remove('hidden');
        renderOMR();
    });

    const detailScoreBtn = document.getElementById('detailScoreBtn');
    if (detailScoreBtn) {
        detailScoreBtn.addEventListener('click', () => {
            const tbody = document.getElementById('statTableBody');
            const detailWrapper = document.getElementById('statDetailWrapper');
            if(!tbody) return;
            
            let trHtml = '';
            let detailHtml = '';
            let allTimes = [];

            subjects.forEach(subj => {
                for (let i = 1; i <= subj.count; i++) {
                    const qKey = `${subj.id}_${i}`;
                    if (questionTimings[qKey]) {
                        allTimes.push({
                            key: qKey,
                            subjId: subj.id,
                            subjName: subj.name,
                            num: i,
                            spent: questionTimings[qKey].spent,
                            state: questionTimings[qKey].state
                        });
                    }
                }
            });
            
            subjects.forEach(subj => {
                let sAtt = 0;
                let sCor = 0;
                let wrongItems = [];
                for (let i=1; i<=subj.count; i++) {
                    const qKey = `${subj.id}_${i}`;
                    const myAns = omrState.myAnswers[qKey];
                    const corAns = omrState.correctAnswers[qKey];
                    if (myAns) sAtt++;
                    if (corAns && myAns === corAns) {
                        sCor++;
                    } else if (corAns) {
                       let myAnsText = myAns ? myAns : "-";
                       wrongItems.push(`<span style="background: ${myAns?'#fee2e2':'#f1f5f9'}; color: ${myAns?'#ef4444':'#64748b'}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${myAns?'#fca5a5':'#cbd5e1'}; white-space: nowrap; font-size: 11px;">
                            <strong>${i}번</strong>: 답(${myAnsText}) 정답(${corAns})
                       </span>`);
                    }
                }
                const rate = sAtt > 0 ? ((sCor / sAtt) * 100).toFixed(1) : 0;
                trHtml += `
                    <tr style="border-bottom: 1px solid #e2e8f0; height: 30px;">
                        <td style="font-weight: bold; color: #1e293b;">${subj.name}</td>
                        <td style="color: #64748b;">${subj.count}</td>
                        <td style="color: #3b82f6;">${sAtt}</td>
                        <td style="color: #22c55e;">${sCor}</td>
                        <td style="color: #f59e0b; font-weight: bold;">${rate}%</td>
                    </tr>
                `;
                const subjectTimes = allTimes.filter(t => t.subjId === subj.id);
                const wrongHtml = wrongItems.length > 0
                    ? `<div style="margin-bottom: 10px;">
                            <div style="font-size: 11px; color: #475569; font-weight: bold; margin-bottom: 4px;">오답/미응답</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${wrongItems.join('')}</div>
                       </div>`
                    : `<div style="margin-bottom: 10px; color:#10b981; font-weight:600;">오답/미응답이 없습니다.</div>`;
                const timeHtml = subjectTimes.length > 0
                    ? `<div>
                            <div style="font-size: 11px; color: #475569; font-weight: bold; margin-bottom: 4px;">소요 시간</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${subjectTimes.map(t => `<span style="background: ${t.state==='skipped' ? '#f1f5f9' : '#e0f2fe'}; color: ${t.state==='skipped' ? '#64748b' : '#0369a1'}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${t.state==='skipped' ? '#cbd5e1' : '#bae6fd'}; white-space: nowrap; font-size: 11px;">
                                <strong>${t.num}번</strong>: ${t.spent}초 소요${t.state==='skipped'?' (건너뜀)':''}
                            </span>`).join('')}</div>
                       </div>`
                    : `<div style="color:#64748b;">기록된 소요 시간이 없습니다.</div>`;
                detailHtml += `
                    <details style="border:1px solid #dbeafe; border-radius:10px; background:#f8fbff; padding:0 12px;" data-stat-subject="${subj.id}">
                        <summary style="cursor:pointer; list-style:none; padding:12px 0; display:flex; align-items:center; justify-content:space-between; gap:12px; font-weight:700; color:#1d4ed8;">
                            <span>${subj.name}</span>
                            <span style="font-size:11px; color:#475569; font-weight:600;">${sCor}/${sAtt || 0} 정답 · ${rate}% · ${subjectTimes.length}개 시간기록</span>
                        </summary>
                        <div style="padding:0 0 12px; border-top:1px dashed #bfdbfe;">
                            <div style="padding-top:10px;">
                                ${wrongHtml}
                                ${timeHtml}
                            </div>
                        </div>
                    </details>
                `;
            });
            tbody.innerHTML = trHtml;
            
            let topTimeHtml = '';
            if (allTimes.length > 0) {
                const sortedTimes = [...allTimes].sort((a, b) => b.spent - a.spent);
                const topHtml = sortedTimes.slice(0, 3).map((item, idx) => `
                    <div style="color: ${idx===0 ? '#ef4444' : '#f97316'}; font-weight:bold; font-size:12px; margin-top:2px;">
                        ${idx+1}위: [${item.subjName}] ${item.num}번 - ${item.spent}초 (${item.state === 'skipped' ? '건너뜀' : '마킹함'})
                    </div>
                `).join('');

                topTimeHtml = `
                    <div style="padding: 10px; background: #fffcf8; border: 1px solid #fed7aa; border-radius: 6px; margin-bottom: 8px;">
                        <span style="font-size:11px; color:#c2410c; font-weight:bold;">🚨 가장 오래 걸린 문항 Top 3</span>
                        ${topHtml}
                    </div>`;
            }

            if(detailWrapper) {
                detailWrapper.innerHTML = topTimeHtml + (detailHtml === '' ? '<div style="text-align:center; color:#10b981; font-weight:bold; margin-top:10px;">표시할 과목별 상세 통계가 없습니다.</div>' : detailHtml);
            }
            document.getElementById('statModal').classList.remove('hidden');
        });
    }


    /* --- Notepad / Canvas Toggle --- */
    const tabNotepad = document.getElementById('tabNotepad');
    const tabCanvas = document.getElementById('tabCanvas');
    const notepadWrapper = document.getElementById('notepadWrapper');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const notepad = document.getElementById('notepad');

    tabNotepad.addEventListener('click', () => {
        tabNotepad.classList.add('active');
        tabCanvas.classList.remove('active');
        notepadWrapper.classList.remove('hidden');
        canvasWrapper.classList.add('hidden');
    });

    tabCanvas.addEventListener('click', () => {
        tabCanvas.classList.add('active');
        tabNotepad.classList.remove('active');
        canvasWrapper.classList.remove('hidden');
        notepadWrapper.classList.add('hidden');
        resizeCanvas(); // Ensure canvas fits when revealed
    });

    /* --- Drawing Board (Canvas) Logic --- */
    const canvas = document.getElementById('drawingBoard');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Resize canvas safely
    function resizeCanvas() {
        if (canvasWrapper.classList.contains('hidden')) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = canvasWrapper.clientWidth;
        canvas.height = canvasWrapper.clientHeight;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // 흐물흐물한 크레용 느낌 모방 (투명도 + 굵기)
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(40, 40, 60, 0.9)';

        ctx.drawImage(tempCanvas, 0, 0);
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 50);
    });
    
    // Initial size
    setTimeout(() => { if (!canvasWrapper.classList.contains('hidden')) resizeCanvas(); }, 100);

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function startDrawing(e) {
        if(e.type === 'mousedown' && e.button !== 0) return; // Only left click
        isDrawing = true;
        const pos = getMousePos(e);
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault(); // prevent touch scroll
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getMousePos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

    /* --- global Utilities --- */
    document.getElementById('clearCurrentToolBtn').addEventListener('click', () => {
        if (!canvasWrapper.classList.contains('hidden')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            notepad.value = '';
        }
    });

    document.getElementById('globalClearBtn').addEventListener('click', () => {
        // Clear all states across problems
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        notepad.value = '';
        // Note: SKCT initializes Calculator as well, so we can init it too.
        calcState.current = '0';
        calcState.previous = null;
        calcState.operator = null;
        calcState.waitingNew = false;
        updateCalcDisplay();
        
        // Advance question
        if (omrState.mode === 'answer') {
            const maxQ = subjects.reduce((sum, s) => sum + s.count, 0);
            if (omrState.currentGlobalIndex < maxQ - 1) {
                omrState.currentGlobalIndex++;
            }
            renderOMR();
        }
    });

    const omrResetBtn = document.getElementById('omrResetBtn');
    if (omrResetBtn) {
        omrResetBtn.addEventListener('click', () => {
            if (confirm("모든 답안과 정답을 초기화하시겠습니까?")) {
                omrState.myAnswers = {};
                omrState.correctAnswers = {};
                omrState.currentGlobalIndex = 0;
                omrState.mode = 'answer';
                questionTimings = {};
                questionSpentSec = 0;
                lockedSubjectIndices.clear(); // 잠금 해제
                updateModeUI();
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                notepad.value = '';
                calcState.current = '0';
                calcState.previous = null;
                calcState.operator = null;
                calcState.waitingNew = false;
                updateCalcDisplay();
                
                document.getElementById('scoreResult').classList.add('hidden');
                renderOMR();
                
                requestAnimationFrame(() => {
                    omrBody.scrollTop = 0;
                });
            }
        });
    }

    /* --- Calculator Logic --- */
    const calcDisplay = document.getElementById('calcDisplay');
    const calcState = {
        current: '0',
        previous: null,
        operator: null,
        waitingNew: false
    };

    function updateCalcDisplay() {
        // Prevent display of extremely long decimals
        let displayStr = calcState.current;
        if(displayStr.length > 12) {
            // Very hacky display fit
            displayStr = displayStr.substring(0, 12);
        }
        calcDisplay.value = displayStr;

        const opDisplay = document.getElementById('calcOpDisplay');
        if (opDisplay) {
            let symbol = '';
            if (calcState.operator === '*') symbol = '×';
            else if (calcState.operator === '/') symbol = '÷';
            else if (calcState.operator === '+') symbol = '+';
            else if (calcState.operator === '-') symbol = '-';
            opDisplay.innerText = symbol;
        }
    }

    function handleNumber(numStr) {
        if (calcState.waitingNew) {
            calcState.current = numStr === '.' ? '0.' : numStr;
            calcState.waitingNew = false;
        } else {
            if (numStr === '.') {
                if (!calcState.current.includes('.')) {
                    calcState.current += '.';
                }
            } else if (calcState.current === '0') {
                calcState.current = numStr;
            } else {
                calcState.current += numStr;
            }
        }
        updateCalcDisplay();
    }

    function handleOperator(op) {
        if (calcState.operator && !calcState.waitingNew) {
            calculateResult();
        }
        calcState.previous = calcState.current;
        calcState.operator = op;
        calcState.waitingNew = true;
    }

    function calculateResult() {
        if (!calcState.operator || calcState.previous === null) return;
        
        let prev = parseFloat(calcState.previous);
        let curr = parseFloat(calcState.current);
        let res = 0;

        switch (calcState.operator) {
            case '+': res = prev + curr; break;
            case '-': res = prev - curr; break;
            case '*': res = prev * curr; break;
            case '/': res = curr !== 0 ? prev / curr : 'Error'; break;
        }

        // Float accuracy precision
        if(res !== 'Error') {
            res = Math.round(res * 100000000) / 100000000;
        }

        calcState.current = String(res);
        calcState.operator = null;
        calcState.previous = null;
        calcState.waitingNew = true;
        updateCalcDisplay();
    }

    function handleFn(fnStr) {
        if (fnStr === 'C') {
            calcState.current = '0';
            calcState.previous = null;
            calcState.operator = null;
            calcState.waitingNew = false;
        } else if (fnStr === '=') {
            calculateResult();
        }
        updateCalcDisplay();
    }

    // UI Buttons
    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const val = e.target.dataset.val;
            if (e.target.classList.contains('num-btn')) {
                handleNumber(val);
            } else if (e.target.classList.contains('op-btn')) {
                handleOperator(val);
            } else if (e.target.classList.contains('fn-btn')) {
                // If it's pure C/Equal
                handleFn(val);
            }
        });
    });

    // Keyboard Support
    window.addEventListener('keydown', (e) => {
        // Prevent if user is typing in notepad or timer
        if (document.activeElement === notepad || document.activeElement.tagName === 'INPUT') {
            return;
        }

        const key = e.key;

        // Numbers
        if (/[0-9\.]/.test(key)) {
            handleNumber(key);
            e.preventDefault();
        } 
        // Operators
        else if (['+', '-', '*', '/'].includes(key)) {
            handleOperator(key);
            e.preventDefault();
        } 
        else if (key === 'Enter' || key === '=') {
            calculateResult();
            e.preventDefault();
        }
        else if (key === 'Backspace') {
            if (!calcState.waitingNew && calcState.current !== '0') {
                calcState.current = calcState.current.slice(0, -1);
                if (calcState.current === '' || calcState.current === '-') calcState.current = '0';
                updateCalcDisplay();
            }
            e.preventDefault();
        }
        // Explicitly block Delete, Escape from clearing the calc as requested
        else if (key === 'Delete' || key === 'Escape') {
            // Do nothing intentionally
            e.preventDefault();
        }
    });


    const buildPhases = () => {
        phases = [];
        subjects.forEach((subj, idx) => {
            phases.push({ type: 'subject', name: `${idx+1}과목 ${subj.name}`, mins: configSubjectMins });
            if (idx < subjects.length - 1) {
                phases.push({ type: 'break', name: '쉬는 시간', mins: configBreakMins });
            }
        });
        currentPhaseIdx = 0;
        if (phases.length > 0) {
            currentPhaseSeconds = phases[0].mins * 60;
        }
    };
    
    const savedTimerCfg = isAdminPreviewMode ? null : JSON.parse(localStorage.getItem('skct_timer_cfg'));
    if (savedTimerCfg) {
        configTotalMins = sanitizeMinutes(savedTimerCfg.total, 75);
        configSubjectMins = sanitizeMinutes(savedTimerCfg.subj, 15);
        configBreakMins = sanitizeMinutes(savedTimerCfg.brk, 1);
    }

    let configGuideEnabled = true;
    let configGuideSec = 45;
    const savedGuideCfg = isAdminPreviewMode ? null : JSON.parse(localStorage.getItem('skct_guide_cfg'));
    if (savedGuideCfg) {
        configGuideEnabled = savedGuideCfg.enabled;
        configGuideSec = savedGuideCfg.sec;
    }
    const totalTimeInput = document.getElementById('cfgTotal');
    const subjectTimeInput = document.getElementById('cfgSubj');
    const breakTimeInput = document.getElementById('cfgBreak');
    const guideEnabledInput = document.getElementById('cfgGuideEnabled');
    const guideSecInput = document.getElementById('cfgGuideSec');

    if(totalTimeInput) totalTimeInput.value = configTotalMins;
    if(subjectTimeInput) subjectTimeInput.value = configSubjectMins;
    if(breakTimeInput) breakTimeInput.value = configBreakMins;
    if(guideEnabledInput) guideEnabledInput.checked = configGuideEnabled;
    if(guideSecInput) guideSecInput.value = configGuideSec;
    
    totalSeconds = configTotalMins * 60;
    buildPhases();

    const displayTotal = document.getElementById('displayTotalTime');
    const displayPName = document.getElementById('displayPhaseName');
    const displayPTime = document.getElementById('displayPhaseTime');
    const timerPlayBtn = document.getElementById('timerPlayBtn');
    
    const formatTime = (totalSecs) => {
        if (totalSecs < 0) totalSecs = 0;
        const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
        const s = (totalSecs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const updateTimerUI = () => {
        if(!displayTotal) return;
        displayTotal.innerText = `${formatTime(totalSeconds)}`;
        if (currentPhaseIdx < phases.length) {
            const p = phases[currentPhaseIdx];
            displayPName.innerText = `${p.name}`;
            displayPTime.innerText = formatTime(currentPhaseSeconds);
            if (p.type === 'break') {
                displayPName.style.color = '#fb923c'; 
                displayPTime.style.color = '#fb923c';
            } else {
                displayPName.style.color = '#60a5fa'; 
                displayPTime.style.color = '#4ade80';
            }
        } else {
            displayPName.innerText = '모든 시험 종료';
            displayPTime.innerText = '00:00';
            displayPName.style.color = '#ef4444';
            displayPTime.style.color = '#ef4444';
        }

        // Guide Timer Update (연습 모드에서는 가이드 타이머 숨김)
        const guideWrapper = document.getElementById('guideTimerWrapper');
        const displayGuide = document.getElementById('displayGuideTime');
        const qKey = getCurrentQKey();
        if (guideWrapper && displayGuide && configGuideEnabled && !isPracticeMode && timerIsRunning && qKey && currentPhaseIdx < phases.length && phases[currentPhaseIdx].type !== 'break') {
            guideWrapper.style.display = 'block';
            const remaining = configGuideSec - questionSpentSec;
            if (remaining >= 0) {
                displayGuide.style.color = '#38bdf8';
                displayGuide.innerText = `${remaining}초 남음`;
            } else {
                displayGuide.style.color = '#ef4444';
                displayGuide.innerText = `+${Math.abs(remaining)}초 초과`;
            }
        } else if (guideWrapper) {
            guideWrapper.style.display = 'none';
        }
    };

    window.applyRemoteTimerDefaults = (total, subj, brk) => {
        if (timerIsRunning) return; // ignore if running
        configSubjectMins = sanitizeMinutes(subj, 15);
        configBreakMins = sanitizeMinutes(brk, 1);
        configTotalMins = sanitizeMinutes(total, 75);

        if (totalTimeInput) totalTimeInput.value = configTotalMins;
        if (subjectTimeInput) subjectTimeInput.value = configSubjectMins;
        if (breakTimeInput) breakTimeInput.value = configBreakMins;

        totalSeconds = configTotalMins * 60;
        buildPhases();
        updateTimerUI();
    };

    window.applyRemoteGuideDefaults = (enabled, sec) => {
        configGuideEnabled = enabled;
        configGuideSec = sec || 45;
        if (guideEnabledInput) guideEnabledInput.checked = enabled;
        if (guideSecInput) guideSecInput.value = sec;
        updateTimerUI();
    };

    window.applyRemoteLayoutRatios = (timer, utils, calc) => {
        const tR = parseFloat(timer) || 0.2;
        const uR = parseFloat(utils) || 1;
        const cR = parseFloat(calc) || 2;

        document.documentElement.style.setProperty('--timer-ratio', tR);
        document.documentElement.style.setProperty('--utils-ratio', uR);
        document.documentElement.style.setProperty('--calc-ratio', cR);

        if (ratioTimer) ratioTimer.value = tR;
        if (ratioUtils) ratioUtils.value = uR;
        if (ratioCalc) ratioCalc.value = cR;

        if (typeof resizeCanvas === 'function') {
            requestAnimationFrame(resizeCanvas);
        }
    };

    // 부드러운 알람 비프음 (Web Audio API)
    let audioCtx = null;
    const initAudio = () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    };

    const playBeep = (freq = 600, durationMs = 300, count = 1) => {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const playSingle = (startTime) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'triangle'; // 부드러운 소리
            osc.frequency.setValueAtTime(freq, startTime);
            
            // Envelope: 부드럽게 커지고 서서히 작아짐 (팝 노이즈 방지)
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durationMs / 1000);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + durationMs / 1000);
        };

        const now = audioCtx.currentTime;
        for (let i = 0; i < count; i++) {
            playSingle(now + i * (durationMs / 1000 + 0.2)); // 간격 추가
        }
    };

    updateTimerUI();

    const timerTick = () => {
        if (timerIsRunning && currentPhaseIdx < phases.length && phases[currentPhaseIdx].type !== 'break') {
            questionSpentSec++;
        }

        if (totalSeconds > 0) {
            totalSeconds--;
        } else {
            clearInterval(timerInterval);
            timerIsRunning = false;
            timerPlayBtn.innerText = '▶ 시작 / 정지';
            currentPhaseIdx = phases.length;
            updateTimerUI();
            playBeep(440, 300, 3); // 전체 시간 종료
            return;
        }

        if (currentPhaseIdx < phases.length) {
            if (currentPhaseSeconds > 0) {
                currentPhaseSeconds--;
            } else {
                // 페이즈 종료 → 알람음 재생
                const endedPhase = phases[currentPhaseIdx];
                const endedPhaseIdx = currentPhaseIdx;
                currentPhaseIdx++;
                
                // --- 도구 초기화 (과목 전환 혹은 쉬는 시간 진입 시) ---
                if (typeof ctx !== 'undefined' && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (typeof notepad !== 'undefined') notepad.value = '';
                if (typeof calcState !== 'undefined') {
                    calcState.current = '0';
                    calcState.previous = null;
                    calcState.operator = null;
                    calcState.waitingNew = false;
                    if (typeof updateCalcDisplay === 'function') updateCalcDisplay();
                }
                // ------------------------------------------------
                if (currentPhaseIdx < phases.length) {
                    currentPhaseSeconds = phases[currentPhaseIdx].mins * 60;
                    if (endedPhase.type === 'subject') {
                        playBeep(659, 400, 2); // 과목 종료: 부드러운 더블 차임 (E5)
                        // 실전 모드: 종료된 과목 잠금
                        if (!isPracticeMode) {
                            const subjIdx = Math.floor(endedPhaseIdx / 2);
                            lockedSubjectIndices.add(subjIdx);
                        }
                    } else {
                        playBeep(523, 400, 1); // 쉬는시간 종료: 단일 차임 (C5)
                    }
                    applyPhaseToOMR();
                } else {
                    clearInterval(timerInterval);
                    timerIsRunning = false;
                    timerPlayBtn.innerText = '▶ 시작 / 정지';
                    playBeep(440, 500, 3); // 전체 종료
                    // 실전 모드: 마지막 과목도 잠금
                    if (!isPracticeMode) {
                        const subjIdx = Math.floor((currentPhaseIdx - 1) / 2);
                        lockedSubjectIndices.add(subjIdx);
                    }
                    applyPhaseToOMR();
                }
            }
        }
        updateTimerUI();
    };

    const applyPhaseToOMR = () => {
        const breakOverlay = document.getElementById('omrBreakOverlay');
        if (currentPhaseIdx >= phases.length) {
            if (breakOverlay) breakOverlay.classList.add('hidden');
            renderOMR();
            return;
        }
        const currentPhase = phases[currentPhaseIdx];
        if (currentPhase.type === 'break') {
            if (!isPracticeMode && timerIsRunning) {
                if (breakOverlay) breakOverlay.classList.remove('hidden');
            } else {
                // 연습 모드이거나 타이머 중지 상태: break overlay 표시하지 않음
                if (breakOverlay) breakOverlay.classList.add('hidden');
            }
        } else {
            if (breakOverlay) breakOverlay.classList.add('hidden');
            
            const subjIdx = Math.floor(currentPhaseIdx / 2);
            const targetIndex = getSubjectStartIndex(subjIdx);
            if (!isPracticeMode) {
                // 실전 모드: 강제로 다음 과목 첫 문항으로 이동
                if (omrState.currentGlobalIndex < targetIndex) {
                    omrState.currentGlobalIndex = targetIndex;
                }
            }
            renderOMR();
        }
    };

    // --- 초기 렌더링 갱신 ---
    updateTimerUI();
    applyPhaseToOMR();

    if(timerPlayBtn) {
        timerPlayBtn.addEventListener('click', () => {
            initAudio(); // 사용자 인터랙션 시 AudioContext 활성화
            if (currentPhaseIdx >= phases.length && totalSeconds <= 0) return;
            if (timerIsRunning) {
                clearInterval(timerInterval);
                timerIsRunning = false;
                timerPlayBtn.innerText = '▶ 시작 / 정지';
                applyPhaseToOMR();
            } else {
                timerInterval = setInterval(timerTick, 1000);
                timerIsRunning = true;
                timerPlayBtn.innerText = '⏸ 일시정지';
                applyPhaseToOMR();
            }
        });
    }

    const settingsToggle = document.getElementById('settingsToggle');
    const settingsModal = document.getElementById('settingsModal');
    if(settingsToggle && settingsModal) {
        settingsToggle.addEventListener('click', () => {
            // 모달 열릴 때 현재 모드 상태 동기화
            const practiceModeInput = document.getElementById('cfgPracticeMode');
            if (practiceModeInput) practiceModeInput.checked = isPracticeMode;
            settingsModal.classList.remove('hidden');
        });
    }

    /* --- Extension Modal Logic --- */
    const extToggle = document.getElementById('extensionToggle');
    const extModal = document.getElementById('extensionModal');
    const extClose = document.getElementById('extensionClose');
    const extStatusCheck = document.getElementById('extStatusCheck');
    const extInstallGuide = document.getElementById('extInstallGuide');
    
    if (extToggle && extModal && extClose) {
        extToggle.addEventListener('click', () => {
            extModal.style.display = 'flex';
            extModal.classList.remove('hidden');
            
            // Check if extension injected the marker
            setTimeout(() => {
                const marker = document.getElementById('skct-extension-installed');
                if (marker) {
                    extStatusCheck.innerHTML = `
                        <div style="font-size:50px; margin-bottom:10px;">✅</div>
                        <div style="font-weight:bold; font-size:18px; color:#10b981;">설치 완료 및 정상 작동중!</div>
                        <div style="font-size:12px; color:#94a3b8; margin-top:8px;">이제 링커리어 화면에 가림막이 뜨지 않습니다.</div>
                    `;
                    extInstallGuide.classList.add('hidden');
                } else {
                    extStatusCheck.innerHTML = `
                        <div style="font-size:50px; margin-bottom:10px;">❌</div>
                        <div style="font-weight:bold; font-size:18px; color:#ef4444;">무적모드(테스트 기능) 확장이 아직 설치되지 않았습니다</div>
                    `;
                    extInstallGuide.classList.remove('hidden');
                }
            }, 300); // 딜레이 약간 주어 렌더링 안정화
        });
        
        extClose.addEventListener('click', () => {
            extModal.classList.add('hidden');
            extModal.style.display = '';
        });
    }

    const settingsApplyBtn = document.getElementById('settingsApplyBtn');
    if (settingsApplyBtn) {
        settingsApplyBtn.addEventListener('click', () => {
            configSubjectMins = sanitizeMinutes(document.getElementById('cfgSubj').value, 15);
            configBreakMins = sanitizeMinutes(document.getElementById('cfgBreak').value, 1);
            configTotalMins = sanitizeMinutes(document.getElementById('cfgTotal').value, 75);
            document.getElementById('cfgTotal').value = configTotalMins;
            if (!isAdminPreviewMode) {
                localStorage.setItem('skct_timer_cfg', JSON.stringify({total: configTotalMins, subj: configSubjectMins, brk: configBreakMins}));
            }
            
            configGuideEnabled = document.getElementById('cfgGuideEnabled').checked;
            configGuideSec = parseInt(document.getElementById('cfgGuideSec').value) || 45;
            if (!isAdminPreviewMode) {
                localStorage.setItem('skct_guide_cfg', JSON.stringify({enabled: configGuideEnabled, sec: configGuideSec}));
            }

            // 모드 설정 적용
            const practiceModeInput = document.getElementById('cfgPracticeMode');
            if (practiceModeInput) {
                isPracticeMode = practiceModeInput.checked;
                localStorage.setItem('skct_practice_mode', isPracticeMode);
            }

            if (timerIsRunning) {
                stopTimer();
            }
            totalSeconds = configTotalMins * 60;
            lockedSubjectIndices.clear(); // 모드 변경 시 잠금 초기화
            buildPhases();
            updateTimerUI();
            applyRatios();
            renderOMR();
            settingsModal.classList.add('hidden');
        });
    }

    // Modal & Help Controls
    const helpToggle = document.getElementById('helpToggle');
    const helpModal = document.getElementById('helpModal');
    if(helpToggle && helpModal) {
        helpToggle.addEventListener('click', () => helpModal.classList.remove('hidden'));
    }

    const donateToggle = document.getElementById('donateToggle');
    const donateModal = document.getElementById('donateModal');
    if (donateToggle && donateModal) {
        donateToggle.addEventListener('click', () => {
            donateModal.classList.remove('hidden');
        });
    }
    const donateConfirmBtn = document.getElementById('donateConfirmBtn');
    if (donateConfirmBtn) {
        donateConfirmBtn.addEventListener('click', () => {
            donateModal.classList.add('hidden');
            window.open('https://toon.at/donate/foreveryonehappy', '_blank');
        });
    }
    const donateLaterBtn = document.getElementById('donateLaterBtn');
    if (donateLaterBtn) {
        donateLaterBtn.addEventListener('click', () => {
             donateModal.classList.add('hidden');
        });
    }
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            if (modal) {
                modal.classList.add('hidden');
                if (modal.id === 'statsModal' && typeof window.stopPresencePolling === 'function') {
                    window.stopPresencePolling();
                }
            }
        });
    });

    // Developer Notice System - Firebase 기반 공지 렌더링 함수 (호출은 index.html에서 수행)

    // 🛡️ 숨겨진 관리자 페이지 통로
    const helpModalHeaderTitle = document.querySelector('.help-modal-header h3');
    if (helpModalHeaderTitle) {
        helpModalHeaderTitle.style.cursor = 'pointer';
        helpModalHeaderTitle.title = "더블 클릭 시 관리자 페이지로 이동합니다.";
        helpModalHeaderTitle.addEventListener('dblclick', () => {
            window.open('admin.html', '_blank');
        });
    }

    function renderNotice(data) {
        if (!data.show) return;
        const noticeContainer = document.getElementById('devNotice');
        if (!noticeContainer) return;

        const typeColors = {
            info: { bg: '#eff6ff', border: '#3b82f6', icon: '💡' },
            warning: { bg: '#fffbeb', border: '#f59e0b', icon: '⚠️' },
            update: { bg: '#f0fdf4', border: '#22c55e', icon: '🆕' },
            event: { bg: '#fdf4ff', border: '#a855f7', icon: '🎉' }
        };
        const style = typeColors[data.type] || typeColors.info;

        // message에서 줄바꿈을 <br>로 변환
        const formattedMessage = (data.message || '').replace(/\n/g, '<br>');

        noticeContainer.innerHTML = `
            <div style="background: ${style.bg}; border: 1px solid ${style.border}; border-left: 4px solid ${style.border}; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px; font-size: 13px;">
                <div style="font-weight: bold; color: #1e293b; margin-bottom: 4px;">${style.icon} ${data.title || '공지'}</div>
                <div style="color: #475569; line-height: 1.5;">${formattedMessage}</div>
                ${data.updated ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 6px; text-align: right;">📅 ${data.updated}</div>` : ''}
            </div>
        `;
    }
    window.renderNotice = renderNotice;

    // (hitscounter.dev 로직이 Firebase total_visits로 대체되어 완전히 제거됨)

    // Disable implicit focusing on calcDisplay
    const calcDisplayEl = document.getElementById('calcDisplay');
    if(calcDisplayEl) calcDisplayEl.addEventListener('mousedown', (e) => e.preventDefault());

    /* --- Window Popup Mode Logic --- */
    const popupBtn = document.getElementById('popupBtn');
    if (popupBtn) {
        popupBtn.addEventListener('click', () => {
            alert("팝업창이 탭 형태로 열리지 않고, 독립된 창으로 열립니다.\n창 테두리를 드래그하시면 일반 브라우저의 한계를 무시하고 폭을 아주 얇게 조절할 수 있습니다!\n\n새 창이 뜨면, 이 기존 창은 닫으시면 됩니다.");
            
            // 기존 스토리지 값
            let w = parseInt(localStorage.getItem('skct_popup_width')) || 350;
            let h = parseInt(localStorage.getItem('skct_popup_height')) || 800;
            let left = parseInt(localStorage.getItem('skct_popup_left'));
            let top = parseInt(localStorage.getItem('skct_popup_top'));
            
            if (isNaN(left)) left = Math.round((screen.width - w) / 2);
            if (isNaN(top)) top = Math.round((screen.height - h) / 2);

            const popupParams = `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,directories=no`;
            const newWin = window.open(window.location.href, 'skct_popup_mode', popupParams);
            
            if (newWin) {
                document.body.innerHTML = '<h2 style="padding: 20px; color: #64748b; text-align: center;">팝업 모드로 이동되었습니다.<br><br>이 창은 자동으로 닫히거나 무시하시면 됩니다.</h2>';
                setTimeout(() => { window.close(); }, 100);
            }
        });
        
        if (window.name === 'skct_popup_mode') {
            popupBtn.style.display = 'none';
        }
    }

});
