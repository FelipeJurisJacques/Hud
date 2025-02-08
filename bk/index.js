meSpeak.loadConfig("mespeak/mespeak_config.json")
meSpeak.loadVoice("mespeak/voices/pt.json")

function speak2() {
    const msg = "Olá, esse é um teste de sintese de voz com modulação no audio."
    const options = {
        amplitude: 40, // Ajuste o volume de 0 a 100
        wordgap: 3, // Ajuste o espaçamento entre as palavras
        variant: "m3", // Escolha a variante de voz
        pitch: 45, // Ajuste o valor de 0 a 100 para alterar o tom
        speed: 175, // Ajuste a velocidade da fala
        rawdata: "wav",
    }
    const audioData = meSpeak.speak(msg, options)
    // return

    // const audioElement = audioContext.createBufferSource()
    // audioElement.buffer = audioData
    // audioElement.connect(gainNode)
    // gainNode.connect(audioContext.destination)
    // ringModulator.connect(gainNode)
    // audioElement.start()

    const blob = new Blob([audioData], {
        type: "audio/wav",
    })
    console.log(blob.size)

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "audio.wav"
    link.click()
    link.remove()
    return

    const audioContext = new AudioContext()
    const audioSource = audioContext.createBufferSource()
    const ringModulator = audioContext.createGain()
    const distortion = audioContext.createWaveShaper()

    audioContext.decodeAudioData(audioData).then(audioBuffer => {
        audioSource.buffer = audioBuffer
        audioSource.connect(ringModulator)
        ringModulator.connect(distortion)
        distortion.connect(audioContext.destination)
    })

    // Configurar o efeito de ring modulation
    ringModulator.gain.value = 1 // valor de ganho para o ring modulation
    distortion.curve = new Float32Array([0, 0.5, 1, 0.5, 0]); // curva de ressonância

    // Reproduzir o áudio
    audioSource.start()
}


function speak3() {
    async function loadAudio(audioUrl) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);
        
        return { audioContext, audioBuffer };
    }
    
    // 🔊 Função base para tocar o áudio original
    function playOriginalAudio(audioContext, audioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    }
    
    // 🎚️ Efeito 1: **Equalizador** (para testar isoladamente)
    function applyEqualizer(audioContext, source) {
        const eq = audioContext.createBiquadFilter();
        eq.type = "peaking";  // Realça uma faixa de frequência
        eq.frequency.value = 2000 // Afeta médios-altos (voz metálica)
        eq.gain.value = 40 // Aumenta a intensidade dessa frequência
        source.connect(eq);
        eq.connect(audioContext.destination);
    }
    
    // 🎛️ Efeito 2: **Ring Modulation** (som robótico)
    function applyRingModulation(audioContext, source) {
        const ringMod = audioContext.createOscillator();
        const ringGain = audioContext.createGain();
        
        ringMod.frequency.value = 7; // Define a frequência robótica
        ringGain.gain.value = 1.0; // Ajusta a intensidade do efeito
        ringMod.connect(ringGain);
        ringMod.start();
        
        source.connect(ringGain);
        ringGain.connect(audioContext.destination);
    }
    
    // 🔊 Efeito 3: **Reverb** (eco metálico)
    function applyReverb(audioContext, source) {
        const mix = 0.8 // Intensidade do efeito de reverb
        const decay = 0.7 // Tempo de decaimento do eco
        const reverb = audioContext.createConvolver();
        const reverbBuffer = audioContext.createBuffer(
            2,
            audioContext.sampleRate * decay,
            audioContext.sampleRate
        )
        
        for (let i = 0; i < reverbBuffer.numberOfChannels; i++) {
            let channelData = reverbBuffer.getChannelData(i);
            for (let j = 0; j < channelData.length; j++) {
                channelData[j] = (Math.random() * 2 - 1) * 0.01 // Gera um padrão de eco suave
            }
        }
        
        reverb.buffer = reverbBuffer

        // 🔄 Mix de som original + reverberado
        const dryGain = audioContext.createGain() // Som original
        const wetGain = audioContext.createGain() // Som com efeito
    
        dryGain.gain.value = 1 - mix  // Exemplo: Se mix = 0.3, som original = 0.7
        wetGain.gain.value = mix      // Se mix = 0.3, o som reverberado é 30% do total
    
        source.connect(dryGain);
        source.connect(reverb);
        reverb.connect(wetGain);
        
        dryGain.connect(audioContext.destination);
        wetGain.connect(audioContext.destination);
    }
    
    // 🎚️ Teste um efeito por vez!
    async function testEffect(audioUrl, effectName) {
        const { audioContext, audioBuffer } = await loadAudio(audioUrl);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
    
        if (effectName === "original") {
            playOriginalAudio(audioContext, audioBuffer);
        } else if (effectName === "equalizer") {
            applyEqualizer(audioContext, source);
        } else if (effectName === "ringmod") {
            applyRingModulation(audioContext, source);
        } else if (effectName === "reverb") {
            applyReverb(audioContext, source);
        } else {
            console.warn("Efeito não encontrado!");
            return;
        }
    
        source.start();
    }
    
    // 🛠 Exemplo de uso (testando um efeito de cada vez)
    // testEffect('amostra.wav', "equalizer");  // Testa o equalizador
    // testEffect('amostra.wav', "ringmod");  // Testa o ring modulation
    testEffect('amostra.wav', "reverb");   // Testa o reverb
    // testEffect('audio/voz.wav', "original"); // Apenas toca o áudio original
    
}

async function speak() {
    const url = 'amostra.wav'
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const response = await fetch(url)
    const audioData = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(audioData)

    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    
    // Efeito 1: **Equalizador** (para testar isoladamente)
    const eq = audioContext.createBiquadFilter()
    eq.type = "peaking"  // Realça uma faixa de frequência
    eq.frequency.value = 2000 // Afeta médios-altos (voz metálica)
    eq.gain.value = 40 // Aumenta a intensidade dessa frequência
    source.connect(eq)
    eq.connect(audioContext.destination)
    
    // Efeito 2: **Ring Modulation** (som robótico)
    // const ringMod = audioContext.createOscillator()
    // const ringGain = audioContext.createGain()
    
    // ringMod.frequency.value = 7 // Define a frequência robótica
    // ringGain.gain.value = 1.0 // Ajusta a intensidade do efeito
    // ringMod.connect(ringGain)
    // ringMod.start()
    
    // source.connect(ringGain)
    // ringGain.connect(audioContext.destination)
    
    // Efeito 3: **Reverb** (eco metálico)
    const mix = 0.99 // Intensidade do efeito de reverb
    const decay = 1.0 // Tempo de decaimento do eco
    const reverb = audioContext.createConvolver()
    const reverbBuffer = audioContext.createBuffer(
        2,
        audioContext.sampleRate * decay,
        audioContext.sampleRate
    )
    
    for (let i = 0; i < reverbBuffer.numberOfChannels; i++) {
        let channelData = reverbBuffer.getChannelData(i)
        for (let j = 0; j < channelData.length; j++) {
            channelData[j] = (Math.random() * 2 - 1) * 0.01 // Gera um padrão de eco suave
        }
    }
    
    reverb.buffer = reverbBuffer

    // 🔄 Mix de som original + reverberado
    const dryGain = audioContext.createGain() // Som original
    const wetGain = audioContext.createGain() // Som com efeito

    dryGain.gain.value = 1 - mix  // Exemplo: Se mix = 0.3, som original = 0.7
    wetGain.gain.value = mix      // Se mix = 0.3, o som reverberado é 30% do total

    source.connect(dryGain)
    source.connect(reverb)
    reverb.connect(wetGain)
    // reverb.connect(ringGain)
    
    dryGain.connect(audioContext.destination)
    wetGain.connect(audioContext.destination)
    // ringGain.connect(audioContext.destination)
    
    source.start()
}