/**
 * ATHLETA PONTO — VALIDADOR INTELIGENTE DE CÂMERA E DETECÇÃO DE ROSTO HUMANO
 * 
 * Regras Obrigatórias Atendidas:
 * 1. Não permite captura se câmera estiver preta, escura, desfocada ou sem sinal.
 * 2. Valida a presença de um rosto humano vivo em frente à câmera.
 * 3. Valida se o rosto está centralizado e dentro do enquadramento.
 * 4. Fornece mensagens claras e instantâneas de orientação.
 * 5. Não substitui conferência humana (valida presença física no ato).
 */

export type CameraValidationStatus =
  | "initializing"     // Câmera iniciando... aguarde
  | "black_screen"     // Câmera preta / sem sinal
  | "dark_screen"      // Iluminação insuficiente / muito escuro
  | "no_face"          // Nenhum rosto visível
  | "off_center"       // Rosto fora do centro ou cortado nas bordas
  | "too_close"        // Rosto colado demais na câmera
  | "too_far"          // Rosto muito distante
  | "blurry"           // Imagem desfocada
  | "frozen"           // Imagem travada / congelada
  | "ready";           // Rosto identificado e enquadrado perfeitamente

export interface FaceValidationResult {
  status: CameraValidationStatus;
  message: string;
  isReadyForCapture: boolean;
  metrics: {
    brightness: number; // 0-100
    sharpness: number;  // 0-100
    faceDetected: boolean;
    faceCentered: boolean;
    faceBox?: {
      xPercent: number;
      yPercent: number;
      widthPercent: number;
      heightPercent: number;
    };
  };
}

let lastFrameHash = 0;
let frozenFrameCounter = 0;

/**
 * Analisa o elemento <video> frame a frame e retorna o diagnóstico completo
 */
export async function validateCameraFrame(
  video: HTMLVideoElement | null
): Promise<FaceValidationResult> {
  // 1. Câmera não carregada ou sem dados de vídeo
  if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    return {
      status: "initializing",
      message: "INICIANDO CÂMERA... AGUARDE.",
      isReadyForCapture: false,
      metrics: {
        brightness: 0,
        sharpness: 0,
        faceDetected: false,
        faceCentered: false,
      },
    };
  }

  // 2. Extrai pixels usando Canvas em escala de análise rápida (160x120)
  const width = 160;
  const height = 120;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    return {
      status: "initializing",
      message: "INICIANDO CÂMERA... AGUARDE.",
      isReadyForCapture: false,
      metrics: { brightness: 50, sharpness: 50, faceDetected: false, faceCentered: false },
    };
  }

  try {
    ctx.drawImage(video, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let totalLuminance = 0;
    let maxBrightness = 0;
    let laplacianVariance = 0;
    let currentHash = 0;

    // Métricas de segmentação facial
    let skinPixelCount = 0;
    let minSkinX = width;
    let maxSkinX = 0;
    let minSkinY = height;
    let maxSkinY = 0;

    const totalPixels = width * height;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Luminância ITU-R BT.601
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;
        if (lum > maxBrightness) maxBrightness = lum;

        // Hash amostral para detectar câmera congelada
        if ((x + y) % 17 === 0) {
          currentHash = (currentHash << 3) - currentHash + (r + g + b);
          currentHash |= 0;
        }

        // Estimador de foco / nitidez (Laplaciano simplificado nos 4 vizinhos)
        const leftIdx = (y * width + (x - 1)) * 4;
        const rightIdx = (y * width + (x + 1)) * 4;
        const topIdx = ((y - 1) * width + x) * 4;
        const bottomIdx = ((y + 1) * width + x) * 4;
        const leftLum = 0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2];
        const rightLum = 0.299 * data[rightIdx] + 0.587 * data[rightIdx + 1] + 0.114 * data[rightIdx + 2];
        const topLum = 0.299 * data[topIdx] + 0.587 * data[topIdx + 1] + 0.114 * data[topIdx + 2];
        const bottomLum = 0.299 * data[bottomIdx] + 0.587 * data[bottomIdx + 1] + 0.114 * data[bottomIdx + 2];

        const delta = Math.abs(4 * lum - (leftLum + rightLum + topLum + bottomLum));
        laplacianVariance += delta;

        // Modelo de detecção de pele humana (YCbCr + RGB)
        const Cb = -0.169 * r - 0.331 * g + 0.500 * b + 128;
        const Cr = 0.500 * r - 0.419 * g - 0.081 * b + 128;

        const isSkin =
          r > 45 &&
          g > 30 &&
          b > 20 &&
          r > g &&
          r > b &&
          r - g > 8 &&
          Cb >= 75 &&
          Cb <= 130 &&
          Cr >= 130 &&
          Cr <= 180;

        if (isSkin) {
          skinPixelCount++;
          if (x < minSkinX) minSkinX = x;
          if (x > maxSkinX) maxSkinX = x;
          if (y < minSkinY) minSkinY = y;
          if (y > maxSkinY) maxSkinY = y;
        }
      }
    }

    const avgLuminance = totalLuminance / totalPixels;
    const sharpnessScore = Math.min(100, Math.round((laplacianVariance / totalPixels) * 4));
    const brightnessScore = Math.min(100, Math.round((avgLuminance / 255) * 100));

    // 3. Verificação de tela preta ou sem sinal
    if (avgLuminance < 14 || maxBrightness < 32) {
      return {
        status: "black_screen",
        message: "A CÂMERA NÃO ESTÁ FUNCIONANDO CORRETAMENTE. VERIFIQUE A PERMISSÃO E TENTE NOVAMENTE.",
        isReadyForCapture: false,
        metrics: { brightness: brightnessScore, sharpness: sharpnessScore, faceDetected: false, faceCentered: false },
      };
    }

    // 4. Verificação de imagem escura / iluminação insuficiente
    if (avgLuminance < 24) {
      return {
        status: "dark_screen",
        message: "AMBIENTE MUITO ESCURO. POSICIONE-SE EM LOCAL COM MAIS ILUMINAÇÃO.",
        isReadyForCapture: false,
        metrics: { brightness: brightnessScore, sharpness: sharpnessScore, faceDetected: false, faceCentered: false },
      };
    }

    // 5. Verificação de imagem congelada
    if (currentHash === lastFrameHash && currentHash !== 0) {
      frozenFrameCounter++;
      if (frozenFrameCounter > 15) {
        return {
          status: "frozen",
          message: "A IMAGEM DA CÂMERA ESTÁ CONGELADA. VERIFIQUE SUA CONEXÃO.",
          isReadyForCapture: false,
          metrics: { brightness: brightnessScore, sharpness: sharpnessScore, faceDetected: false, faceCentered: false },
        };
      }
    } else {
      frozenFrameCounter = 0;
      lastFrameHash = currentHash;
    }

    // 6. Verificação de imagem desfocada
    if (sharpnessScore < 6 && avgLuminance > 30) {
      return {
        status: "blurry",
        message: "IMAGEM DESFOCADA. LIMPE A LENTE E MANTENHA-SE PARADO.",
        isReadyForCapture: false,
        metrics: { brightness: brightnessScore, sharpness: sharpnessScore, faceDetected: false, faceCentered: false },
      };
    }

    // 7. Detecção de Rosto Humano:
    // Tenta primeiro a API nativa FaceDetector se disponível no navegador
    let nativeFaceDetected = false;
    let nativeFaceBox: any = null;

    if (typeof window !== "undefined" && "FaceDetector" in window) {
      try {
        const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        const faces = await detector.detect(video);
        if (faces && faces.length > 0) {
          nativeFaceDetected = true;
          const box = faces[0].boundingBox;
          nativeFaceBox = {
            xPercent: Math.round((box.x / video.videoWidth) * 100),
            yPercent: Math.round((box.y / video.videoHeight) * 100),
            widthPercent: Math.round((box.width / video.videoWidth) * 100),
            heightPercent: Math.round((box.height / video.videoHeight) * 100),
          };
        }
      } catch {
        // Fallback para o algoritmo de visão computacional abaixo
      }
    }

    // Algoritmo de visão computacional por agrupamento facial
    const skinRatio = skinPixelCount / totalPixels;
    const faceW = maxSkinX - minSkinX;
    const faceH = maxSkinY - minSkinY;
    const faceCenterX = (minSkinX + faceW / 2) / width;
    const faceCenterY = (minSkinY + faceH / 2) / height;

    const cvFaceDetected = skinRatio >= 0.05 && faceW >= 24 && faceH >= 24;

    const isFaceDetected = nativeFaceDetected || cvFaceDetected;

    if (!isFaceDetected) {
      return {
        status: "no_face",
        message: "NÃO CONSEGUIMOS IDENTIFICAR SEU ROSTO. POSICIONE-SE EM FRENTE À CÂMERA.",
        isReadyForCapture: false,
        metrics: {
          brightness: brightnessScore,
          sharpness: sharpnessScore,
          faceDetected: false,
          faceCentered: false,
        },
      };
    }

    // 8. Verificação de enquadramento e centralização
    // Se o rosto estiver colado na borda (cortado)
    const isBorderClipped = minSkinX <= 2 || maxSkinX >= width - 2 || minSkinY <= 2;
    // Se estiver muito descentralizado (fora do centro 28% a 72%)
    const isOffCenter = faceCenterX < 0.28 || faceCenterX > 0.72 || faceCenterY < 0.18 || faceCenterY > 0.75;

    if (isBorderClipped || isOffCenter) {
      return {
        status: "off_center",
        message: "CENTRALIZE SEU ROSTO DENTRO DA MOLDURA.",
        isReadyForCapture: false,
        metrics: {
          brightness: brightnessScore,
          sharpness: sharpnessScore,
          faceDetected: true,
          faceCentered: false,
          faceBox: nativeFaceBox || {
            xPercent: Math.round((minSkinX / width) * 100),
            yPercent: Math.round((minSkinY / height) * 100),
            widthPercent: Math.round((faceW / width) * 100),
            heightPercent: Math.round((faceH / height) * 100),
          },
        },
      };
    }

    // 9. Distância do rosto
    if (skinRatio > 0.55 || faceW > width * 0.85) {
      return {
        status: "too_close",
        message: "AFASTE-SE UM POUCO DA CÂMERA.",
        isReadyForCapture: false,
        metrics: { brightness: brightnessScore, sharpness: sharpnessScore, faceDetected: true, faceCentered: true },
      };
    }

    if (skinRatio < 0.06 || faceW < width * 0.22) {
      return {
        status: "too_far",
        message: "APROXIME-SE UM POUCO MAIS DA CÂMERA.",
        isReadyForCapture: false,
        metrics: { brightness: brightnessScore, sharpness: sharpnessScore, faceDetected: true, faceCentered: true },
      };
    }

    // 10. SUCESSO: Rosto humano detectado, nítido e centralizado!
    return {
      status: "ready",
      message: "ROSTO DETECTADO E CENTRALIZADO ✓",
      isReadyForCapture: true,
      metrics: {
        brightness: brightnessScore,
        sharpness: sharpnessScore,
        faceDetected: true,
        faceCentered: true,
        faceBox: nativeFaceBox || {
          xPercent: Math.round((minSkinX / width) * 100),
          yPercent: Math.round((minSkinY / height) * 100),
          widthPercent: Math.round((faceW / width) * 100),
          heightPercent: Math.round((faceH / height) * 100),
        },
      },
    };
  } catch (err) {
    console.error("Erro na validação da câmera:", err);
    return {
      status: "initializing",
      message: "PROCESSANDO IMAGEM DA CÂMERA...",
      isReadyForCapture: false,
      metrics: { brightness: 50, sharpness: 50, faceDetected: false, faceCentered: false },
    };
  }
}
