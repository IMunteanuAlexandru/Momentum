<template>
    <div class="focus-container">
        <div class="timer-section">
            <div class="timer-main">
                <h1 class="timer-display">{{ formatTime(currentTime) }}</h1>

                <div class="timer-controls">
                    <v-btn :color="isRunning ? 'error' : 'success'" @click="toggleTimer" class="control-btn"
                        size="large" :elevation="3">
                        {{ isRunning ? 'Pauză' : 'Start' }}
                    </v-btn>
                    <v-btn color="primary" @click="resetTimer" class="control-btn" size="large" :elevation="3"
                        :disabled="isRunning">
                        Resetare
                    </v-btn>
                </div>
            </div>

            <v-divider class="my-6"></v-divider>

            <div class="settings-grid">
                <div class="setting-group">
                    <h3>Timp de Focus</h3>
                    <div class="slider-with-presets">
                        <div class="presets">
                            <v-chip v-for="preset in focusPresets" :key="preset"
                                :color="focusTime === preset ? 'primary' : 'default'" @click="setFocusTime(preset)"
                                :disabled="isRunning" class="preset-chip" variant="elevated">
                                {{ preset }} min
                            </v-chip>
                            <span class="time-label">Focus: {{ focusTime }}min</span>
                        </div>
                        <v-slider v-model="focusTime" :min="1" :max="120" :step="1" thumb-label :disabled="isRunning"
                            @update:modelValue="checkTimeRatio" color="primary" track-color="primary"
                            :tick-labels="focusTickLabels" :ticks="true">
                            <template v-slot:thumb-label="{ modelValue }">
                                {{ modelValue }}m
                            </template>
                        </v-slider>
                    </div>
                </div>

                <div class="setting-group">
                    <h3>Timp de Pauză</h3>
                    <div class="slider-with-presets">
                        <div class="presets">
                            <v-chip v-for="preset in breakPresets" :key="preset"
                                :color="breakTime === preset ? 'primary' : 'default'" @click="setBreakTime(preset)"
                                :disabled="isRunning" class="preset-chip" variant="elevated">
                                {{ preset }} min
                            </v-chip>
                            <span class="time-label">Pauză: {{ breakTime }}min</span>
                        </div>
                        <v-slider v-model="breakTime" :min="1" :max="30" :step="1" thumb-label :disabled="isRunning"
                            @update:modelValue="checkTimeRatio" color="info" track-color="info"
                            :tick-labels="breakTickLabels" :ticks="true">
                            <template v-slot:thumb-label="{ modelValue }">
                                {{ modelValue }}m
                            </template>
                        </v-slider>
                    </div>
                </div>
            </div>
        </div>

        <!-- Secțiunea Sfaturi (Jos) -->
        <div class="tips-section" v-if="tipData.message">
            <v-expand-transition>
                <div class="tip-card"
                    :class="{ 'efficient': tipData.isEfficient, 'inefficient': !tipData.isEfficient }">
                    <div class="tip-header">
                        <div class="tip-status">
                            {{ tipData.isEfficient ? '🟢 Combinație Eficientă' : '🔴 Atenție!' }}
                        </div>
                        <div class="tip-ratio">
                            {{ focusTime }}:{{ breakTime }}
                        </div>
                    </div>
                    <v-divider></v-divider>
                    <div class="tip-body">
                        <div class="tip-content">
                            <div class="tip-icon mb-4">
                                {{ tipData.isEfficient ? '✨' : '⚠️' }}
                            </div>
                            <div class="tip-message">
                                <h3 class="tip-title mb-2">{{ tipData.title }}</h3>
                                <p class="tip-text">{{ tipData.message }}</p>
                                <div class="tip-recommendations mt-4" v-if="tipData.recommendations">
                                    <h4 class="mb-2">Recomandări:</h4>
                                    <ul>
                                        <li v-for="(rec, index) in tipData.recommendations" :key="index">
                                            {{ rec }}
                                        </li>
                                    </ul>
                                </div>
                                <p class="tip-note mt-4">{{ tipData.note }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </v-expand-transition>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Focus',
    data() {
        return {
            focusTime: 25,
            breakTime: 5,
            currentTime: 25 * 60,
            isRunning: false,
            timer: null,
            isBreak: false,
            completedSessions: 0,
            tipData: {
                isEfficient: true,
                title: '',
                message: '',
                note: '',
                recommendations: [],
            },
            focusPresets: [25, 45, 90],
            breakPresets: [5, 15, 30],
            focusTickLabels: ['1', '30', '60', '90', '120'],
            breakTickLabels: ['1', '5', '10', '15', '20', '25', '30'],
        }
    },
    methods: {
        setFocusTime(time) {
            this.focusTime = time
            if (!this.isRunning && !this.isBreak) {
                this.currentTime = time * 60
            }
            this.checkTimeRatio()
        },
        setBreakTime(time) {
            this.breakTime = time
            if (!this.isRunning && this.isBreak) {
                this.currentTime = time * 60
            }
            this.checkTimeRatio()
        },
        toggleTimer() {
            if (this.isRunning) {
                this.pauseTimer()
            } else {
                if (!this.tipData.isEfficient) {
                    if (confirm('Această combinație de timp nu este optimă pentru productivitate. Ești sigur că vrei să continui?')) {
                        this.startTimer()
                    }
                } else {
                    this.startTimer()
                }
            }
        },
        startTimer() {
            if (!this.timer) {
                this.timer = setInterval(() => {
                    if (this.currentTime > 0) {
                        this.currentTime--
                        if (this.currentTime === 5) {
                            const audio = new Audio('/notification.mp3')
                            audio.play()
                        }
                        if (this.currentTime <= 5 && this.currentTime > 0) {
                            this.playCountdownBeep()
                        }
                    } else {
                        this.handleTimerComplete()
                    }
                }, 1000)
            }
            this.isRunning = true
        },
        pauseTimer() {
            clearInterval(this.timer)
            this.timer = null
            this.isRunning = false
        },
        resetTimer() {
            this.pauseTimer()
            this.currentTime = this.focusTime * 60
            this.isBreak = false
        },
        handleTimerComplete() {
            this.pauseTimer()

            if (!this.isBreak) {
                this.completedSessions++
                this.isBreak = true
                this.currentTime = this.breakTime * 60
                this.startTimer()
            } else {
                this.isBreak = false
                this.currentTime = this.focusTime * 60
            }

            if (Notification.permission === 'granted') {
                new Notification(this.isBreak ? 'Break Time!' : 'Focus Time!', {
                    body: this.isBreak ? 'Time for a break!' : 'Time to focus!',
                })
            }
        },
        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60)
            const remainingSeconds = seconds % 60
            return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
        },
        playCountdownBeep() {
            const beep = new Audio('/beep.mp3')
            beep.play()
        },
        checkTimeRatio() {
            const focus = this.focusTime
            const break_ = this.breakTime

            if (focus === 45 && break_ === 15) {
                this.tipData = {
                    isEfficient: true,
                    title: 'Ciclu Optim de Productivitate',
                    message: 'Această combinație de 45 de minute de focus și 15 minute de pauză se bazează pe cercetări științifice despre ciclurile naturale de atenție și recuperare ale creierului.',
                    recommendations: [
                        'Folosiți pauza pentru mișcare fizică ușoară',
                        'Practicați exerciții de relaxare a ochilor (regula 20-20-20)',
                        'Mergeți afară în timpul pauzei, dacă este posibil'
                    ],
                    note: 'Studiile arată că 45 de minute este perioada optimă pentru menținerea focusului intens, iar 15 minute de pauză permit recuperarea completă.'
                }
            } else if (focus === 25 && break_ === 5) {
                this.tipData = {
                    isEfficient: true,
                    title: 'Tehnica Tradițională Pomodoro',
                    message: 'Metoda Pomodoro, dezvoltată de Francesco Cirillo în anii 1980, este dovedită științific ca fiind eficientă pentru îmbunătățirea productivității și reducerea procrastinării.',
                    recommendations: [
                        'Folosiți pauza pentru exerciții de întindere',
                        'Beți apă și evitați dispozitivele electronice',
                        'Notați progresul după fiecare sesiune completă'
                    ],
                    note: 'Eficacitatea metodei Pomodoro este confirmată de numeroase studii de productivitate și neuroștiință.'
                }
            } else if (focus === 90 && break_ === 30) {
                this.tipData = {
                    isEfficient: true,
                    title: 'Ciclu Natural Ultradian',
                    message: "Acest interval urmează ciclul natural ultradian al corpului, care alternează între perioade de performanță ridicată și nevoia de recuperare la fiecare 90-120 de minute",
                    recommendations: [
                        'Planificați sarcini complexe pentru sesiunea de 90 de minute',
                        'Includeți o călătorie scurtă în timpul pauzei de 30 de minute',
                        'Folosiți pauza pentru o mică gustare nutritivă'
                    ],
                    note: "Studii de chronobiologie confirmă că acest ciclu se aliniază cu ritmul natural al corpului"
                }
            } else if (focus >= 60 && break_ <= 5) {
                this.tipData = {
                    isEfficient: false,
                    title: 'Risc de Exhaustie Cognitivă',
                    message: 'Perioade lungi de focus cu pauze insuficiente pot duce la epuizarea mentală și scăderea performanței cognitive.',
                    recommendations: [
                        'Adăugați pauze mai lungi (cel puțin 10-15 minute)',
                        'Împărțiți sesiunea în intervale mai mici',
                        'Monitorizați semnele de oboseală mentală'
                    ],
                    note: 'Studii neuroștiință arată că pauze scurte după efort mental lung nu permit recuperarea resurselor cognitive.'
                }
            } else if (focus <= 15) {
                this.tipData = {
                    isEfficient: false,
                    title: 'Timp de Focus Insuficient',
                    message: 'Studiile arată că creierul are nevoie de 10-15 minute doar pentru a atinge un stadiu optim de focus.',
                    recommendations: [
                        'Măriți durata la cel puțin 25 minute pentru eficiență',
                        'Folosiți aceste intervale doar pentru sarcini simple',
                        'Combinați mai multe intervale scurte într-o sesiune mai lungă'
                    ],
                    note: 'Conform studiilor de neuroplasticitate, focusul adânc necesită timp pentru dezvoltare.'
                }
            } else if (break_ >= 45) {
                this.tipData = {
                    isEfficient: false,
                    title: 'Pauză Extinsă',
                    message: 'Pauzele prea lungi pot întrerupe starea de flux și reduce motivația pentru a reveni la activitate.',
                    recommendations: [
                        'Restrângeți pauzele la 15-30 minute',
                        'Planificați activități specifice pentru pauza',
                        'Stabiliți alarme pentru a reveni la muncă'
                    ],
                    note: 'Studii de psihologie cognitivă indică că pauzele prea lungi pot întrerupe memoria și concentrarea.'
                }
            } else {
                const ratio = focus / break_
                if (ratio < 3 || ratio > 7) {
                    this.tipData = {
                        isEfficient: false,
                        title: 'Raport Necalitativ',
                        message: `Raportul curent de ${ratio.toFixed(1)}:1 între focus și pauză nu respectă principii științifice ale gestionării energiei cognitive.`,
                        recommendations: [
                            'Ajustați în direcția unui raport de 4:1 sau 5:1',
                            'Adaptăți durata pauzei la intensitatea efortului mental',
                            'Testați diferite combinații din setările oferite'
                        ],
                        note: 'Studii în ergonomie cognitivă recomandă un raport între 3:1 și 7:1 pentru optimizarea performanței.'
                    }
                } else {
                    this.tipData = {
                        isEfficient: true,
                        title: 'Ritm Personalizat Adaptat',
                        message: 'Ați găsit un raport echilibrat care respectă principii generale ale gestionării energiei cognitive.',
                        recommendations: [
                            'Observați nivelurile energiei și focusului',
                            'Notați productivitatea pentru diferite tipuri de sarcini',
                            "Ajustați pe baza feedback-ului corpului"
                        ],
                        note: 'Personalizarea intervalelor în limite sănătoase poate crește eficiența individuală, conform studiilor de productivitate.'
                    }
                }
            }
        },
    },
    watch: {
        focusTime(newValue) {
            if (!this.isRunning && !this.isBreak) {
                this.currentTime = newValue * 60
            }
        },
        breakTime(newValue) {
            if (!this.isRunning && this.isBreak) {
                this.currentTime = newValue * 60
            }
        },
    },
    beforeUnmount() {
        if (this.timer) {
            clearInterval(this.timer)
        }
    },
    mounted() {
        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }
    },
}
</script>

<style scoped>
.focus-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: var(--background);
    color: var(--text);
}

.timer-section {
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: var(--background);
}

.timer-main {
    text-align: center;
    margin-bottom: 2rem;
}

.timer-display {
    font-size: 7rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
    color: var(--primary);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.settings-grid {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    margin-top: 2rem;
    align-items: center;
    justify-content: center;
}

.setting-group {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    align-items: center;
    justify-content: center;
    width: 100%;
}

.setting-group h3 {
    display: flex;
    align-items: center;
    font-size: 1.7em;
    margin-bottom: 1.5rem;
    color: var(--primary);
}

.tips-section {
    margin-top: 1rem;
}

.tip-card {
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.tip-card.efficient {
    border-left: 6px solid var(--primary);
    border-right: 6px solid var(--primary);
}

.tip-card.inefficient {
    border-left: 6px solid var(--secondary);
    border-right: 6px solid var(--secondary);
}

.tip-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tip-status {
    font-size: 1.2rem;
    font-weight: 600;
}

.tip-ratio {
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 20px;
}

.tip-body {
    padding: 2rem;
}

.tip-content {
    display: flex;
    gap: 2rem;
}

.tip-icon {
    font-size: 3rem;
    flex-shrink: 0;
}

.tip-message {
    flex: 1;
}

.tip-title {
    font-size: 1.4rem;
    color: var(--text);
    margin-bottom: 1rem;
}

.tip-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text);
}

.tip-recommendations {
    padding: 1rem;
    border-radius: 8px;
}

.tip-recommendations h4 {
    color: var(--text);
    font-size: 1.1rem;
}

.tip-recommendations ul {
    list-style-type: none;
    padding: 0;
}

.tip-recommendations li {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
}

.tip-recommendations li::before {
    content: '•';
    color: var(--primary);
    position: absolute;
    left: 0;
}

.tip-note {
    font-size: 0.9rem;
    color: var(--text);
    background-color: rgba(var(--v-theme-surface), 0.1);
    padding: 0.75rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
}

.timer-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin: 2rem 0;
}

.control-btn {
    min-width: 140px !important;
    font-size: 1.2rem !important;
    text-transform: none !important;
    border-radius: 12px !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
    background-color: var(--primary) !important;
}

.control-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.time-label {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 500;
    color: var(--primary);
}

.preset-chip {
    cursor: pointer;
}

.presets {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    font-size: 1.5rem;
}

@media (max-width: 768px) {
    .focus-container {
        padding: 1rem;
    }

    .timer-display {
        font-size: 4rem;
    }

    .settings-grid {
        grid-template-columns: 1fr;
    }

    .tip-content {
        flex-direction: column;
        text-align: center;
    }

    .tip-recommendations {
        text-align: left;
    }
}
</style>