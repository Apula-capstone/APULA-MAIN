const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'sound.wav');

// WAV Header Parameters
const sampleRate = 44100;
const duration = 5; // 5 seconds
const numChannels = 1;
const bitsPerSample = 16;
const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
const blockAlign = numChannels * (bitsPerSample / 8);
const dataSize = sampleRate * duration * (bitsPerSample / 8);
const chunkSize = 36 + dataSize;

const buffer = Buffer.alloc(44 + dataSize);

// RIFF Chunk
buffer.write('RIFF', 0);
buffer.writeUInt32LE(chunkSize, 4);
buffer.write('WAVE', 8);

// fmt Chunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // Subchunk1Size
buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bitsPerSample, 34);

// data Chunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Generate Audio Data
const freqLow = 600;
const freqHigh = 1500;
const lfoSpeed = 4;
let phase = 0;

for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const lfo = Math.sin(2 * Math.PI * lfoSpeed * t);
    const currentFreq = freqLow + (freqHigh - freqLow) * (0.5 + 0.5 * lfo);
    
    phase += (2 * Math.PI * currentFreq) / sampleRate;
    if (phase > 2 * Math.PI) phase -= 2 * Math.PI;
    
    let sample = Math.sin(phase);
    
    // Hard Clipping for Loudness
    sample = sample * 5.0;
    if (sample > 0.9) sample = 0.9;
    if (sample < -0.9) sample = -0.9;
    
    const sampleInt = Math.floor(sample * 32767);
    buffer.writeInt16LE(sampleInt, 44 + i * 2);
}

fs.writeFileSync(filePath, buffer);
console.log(`Generated ${filePath} (${buffer.length} bytes)`);
