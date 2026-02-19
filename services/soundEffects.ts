// 果冻风格音效系统 - 温和、有趣的交互音效

// 创建柔和的音效（正弦波+包络）
const createTone = (freq: number, duration: number, volume: number = 0.15) => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // 柔和的 ADSR 包络
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);

        return audioCtx;
    } catch (e) {
        return null;
    }
};

// 泡泡声 - 选中音效
export const playBubbleSound = (value?: number) => {
    // 根据数字大小调整音调（越大音调越低）
    const baseFreq = value ? Math.max(400, 800 - value * 20) : 600;
    const variation = Math.random() * 50 - 25;
    createTone(baseFreq + variation, 0.08, 0.12);
};

// 点击音效 - 水滴声
export const playTapSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        // 较低的起始频率
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
        // 快速下降到低频，模拟水滴声
        oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);

        // 音量包络
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
        // 静默失败
    }
};

// 融合音效 - 类似水滴融合的 "Bloop"
export const playFusionSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // 两个频率略微不同的正弦波，创造"Bloop"效果
        [400, 500].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            // 频率快速下降，模拟水滴声
            osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.currentTime + 0.1);

            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        });
    } catch (e) {
        // 静默失败
    }
};

// 匹配成功音效 - 上扬的愉悦音效
export const playSuccessSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // 愉悦的上扬音阶
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            // 钟声般的包络
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.03 + (i * 0.04));
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5 + (i * 0.04));

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(audioCtx.currentTime + (i * 0.04));
            osc.stop(audioCtx.currentTime + 0.6 + (i * 0.04));
        });
    } catch (e) {
        // 静默失败
    }
};

// 错误音效 - 柔和的低音提示
export const playErrorSound = () => {
    createTone(200, 0.15, 0.1);
};

// 抽卡音效 - 神秘悦耳
export const playGachaSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // 神秘和弦
        const notes = [392, 494, 587.33]; // G4, B4, D5

        notes.forEach((freq) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
        });
    } catch (e) {
        // 静默失败
    }
};

// 纸屑绽放音效 - 目标完成时
export const playConfettiSound = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // 快速连续的高音
        const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6

        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01 + (i * 0.03));
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3 + (i * 0.03));

            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(audioCtx.currentTime + (i * 0.03));
            osc.stop(audioCtx.currentTime + 0.4 + (i * 0.03));
        });
    } catch (e) {
        // 静默失败
    }
};
