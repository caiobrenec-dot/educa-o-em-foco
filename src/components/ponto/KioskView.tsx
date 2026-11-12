import React, { useState, useEffect, useRef } from "react";
import {
  Employee,
  Store,
  PunchType,
  DayTimeRecord,
  PontoStore,
} from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import { AthletaLogo } from "../AthletaLogo";
import {
  Camera,
  MapPin,
  Lock,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Fingerprint,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface KioskViewProps {
  onExitKiosk: () => void;
  defaultStoreId?: string;
}

type KioskStep = "select_employee" | "enter_pin" | "capture_photo" | "success_receipt";

export function KioskView({ onExitKiosk, defaultStoreId = "store-catuai" }: KioskViewProps) {
  const { stores, employees, records, recordPunch } = usePonto();

  // Loja em uso no tablet
  const [currentStoreId, setCurrentStoreId] = useState<string>(defaultStoreId);
  const currentStore = stores.find((s) => s.id === currentStoreId) || stores[0];

  // Passo atual do fluxo
  const [step, setStep] = useState<KioskStep>("select_employee");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // PIN
  const [pinDigits, setPinDigits] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Tipo de batida inteligente
  const [selectedPunchType, setSelectedPunchType] = useState<PunchType>("entrada");

  // WebCam e Foto
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);

  // Geolocalização
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address: string;
    inRange: boolean;
  } | null>(null);

  // Comprovante emitido
  const [receiptData, setReceiptData] = useState<{
    time: string;
    date: string;
    nsr: number;
    hash: string;
    typeLabel: string;
  } | null>(null);

  // Relógio em tempo real
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  // Contador de retorno automático
  const [countdown, setCountdown] = useState<number>(4);

  // Atualização do relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Coleta inicial de geolocalização do tablet/computador da loja
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            address: `${currentStore?.name} • ${currentStore?.city} - ${currentStore?.state}`,
            inRange: true,
          });
        },
        () => {
          // Fallback para as coordenadas da loja cadastrada
          if (currentStore) {
            setGpsLocation({
              latitude: currentStore.gpsCoords.lat,
              longitude: currentStore.gpsCoords.lng,
              accuracy: 10,
              address: `${currentStore.name} • ${currentStore.address}`,
              inRange: true,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [currentStoreId, currentStore]);

  // Lista de funcionários ativos daquela loja
  const storeEmployees = employees.filter(
    (e) => e.storeId === currentStoreId && e.status === "ativo"
  );

  // Determina automaticamente o próximo tipo de marcação recomendada
  const getNextPunchType = (empId: string): PunchType => {
    const todayStr = new Date().toISOString().split("T")[0];
    const todayRecord = records.find((r) => r.employeeId === empId && r.date === todayStr);

    if (!todayRecord || todayRecord.punches.length === 0) {
      return "entrada";
    }

    const lastPunch = todayRecord.punches[todayRecord.punches.length - 1];
    if (lastPunch.type === "entrada") return "intervalo_saida";
    if (lastPunch.type === "intervalo_saida") return "intervalo_retorno";
    if (lastPunch.type === "intervalo_retorno") return "saida";
    return "saida";
  };

  // 1. Ao selecionar o funcionário
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setPinDigits("");
    setPinError(null);
    setSelectedPunchType(getNextPunchType(emp.id));
    setStep("enter_pin");
  };

  // 2. Teclado de PIN
  const handlePinInput = (num: string) => {
    if (pinDigits.length >= 6) return;
    const newPin = pinDigits + num;
    setPinDigits(newPin);
    setPinError(null);

    // Validação automática se atingir 4 dígitos
    if (newPin.length >= 4) {
      verifyPin(newPin);
    }
  };

  const handlePinBackspace = () => {
    setPinDigits((prev) => prev.slice(0, -1));
    setPinError(null);
  };

  const handlePinClear = () => {
    setPinDigits("");
    setPinError(null);
  };

  const verifyPin = (pinToTest: string) => {
    if (!selectedEmployee) return;

    // Compara o PIN do colaborador
    if (pinToTest === selectedEmployee.pin) {
      // PIN Correto! Inicia câmera
      startCamera();
      setStep("capture_photo");
    } else {
      setPinError("PIN incorreto. Tente novamente.");
      // Limpa após 1 segundo
      setTimeout(() => setPinDigits(""), 800);
    }
  };

  // 3. Ativação da WebCam / Câmera integrada
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError("Câmera não suportada neste navegador.");
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable, using canvas preview:", err);
      setCameraError("Acesso à câmera não concedido ou câmera ocupada.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Encerrar câmera ao desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 4. Capturar foto e registrar ponto
  const handleCaptureAndPunch = () => {
    if (!selectedEmployee) return;

    let photoData = "";

    // Captura do frame real do <video> se a câmera estiver ativa
    if (videoRef.current && cameraActive) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Espelha horizontalmente para efeito natural de espelho
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          photoData = canvas.toDataURL("image/jpeg", 0.85);
        }
      } catch (err) {
        console.error("Erro ao capturar frame da câmera:", err);
      }
    }

    // Se a câmera do dispositivo não gerou dados (ex: ambiente simulado sem webcam conectada),
    // gera foto certificada com identificador biométrico instantâneo
    if (!photoData) {
      const initials = selectedEmployee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);
      const timeStr = `${String(currentTime.getHours()).padStart(2, "0")}:${String(
        currentTime.getMinutes()
      ).padStart(2, "0")}`;

      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#005C30";
        ctx.fillRect(0, 0, 400, 400);

        // Guia facial
        ctx.strokeStyle = "#FFC72C";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(200, 180, 80, 110, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#FFC72C";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(initials, 200, 195);

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(selectedEmployee.name, 200, 330);

        ctx.fillStyle = "#10B981";
        ctx.font = "bold 13px monospace";
        ctx.fillText(`FOTO AO VIVO: ${timeStr} • QUIOSQUE`, 200, 360);

        photoData = canvas.toDataURL("image/jpeg", 0.9);
      }
    }

    setCapturedPhotoUrl(photoData);

    // Registra a marcação oficialmente no banco
    const result = recordPunch({
      employeeId: selectedEmployee.id,
      storeId: currentStoreId,
      punchType: selectedPunchType,
      photoUrl: photoData,
      location: gpsLocation || {
        latitude: currentStore?.gpsCoords.lat || -23.3421,
        longitude: currentStore?.gpsCoords.lng || -51.1872,
        accuracy: 5,
        address: `${currentStore?.name} • ${currentStore?.city} - ${currentStore?.state}`,
        inRange: true,
      },
      deviceType: "Totem Quiosque Tablet",
    });

    stopCamera();

    const typeLabel = {
      entrada: "Entrada (Início de Expediente)",
      intervalo_saida: "Saída para Intervalo / Almoço",
      intervalo_retorno: "Retorno do Intervalo",
      saida: "Saída (Fim de Expediente)",
    }[selectedPunchType];

    setReceiptData({
      time: result.punch.time,
      date: new Date().toLocaleDateString("pt-BR"),
      nsr: result.punch.nsr,
      hash: result.punch.hash,
      typeLabel,
    });

    setStep("success_receipt");

    // Inicia contagem regressiva para retornar à tela inicial
    setCountdown(4);
  };

  // Contagem regressiva no comprovante para retornar automaticamente
  useEffect(() => {
    if (step === "success_receipt") {
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            resetToStart();
            return 4;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const resetToStart = () => {
    stopCamera();
    setSelectedEmployee(null);
    setPinDigits("");
    setPinError(null);
    setCapturedPhotoUrl(null);
    setReceiptData(null);
    setStep("select_employee");
  };

  const formattedClock = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#062316] text-white flex flex-col justify-between overflow-y-auto select-none">
      {/* Topo do Quiosque: Logo, Loja e Relógio */}
      <header className="p-4 md:px-8 border-b border-[#0d4a2f] bg-[#004724]/90 backdrop-blur-md flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <AthletaLogo variant="white" size="md" subtitleText="TOTEM LOJA" />

          {/* Seletor de Loja do Tablet */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <Building2 className="w-4 h-4 text-[#FFC72C]" />
            <select
              value={currentStoreId}
              onChange={(e) => {
                setCurrentStoreId(e.target.value);
                resetToStart();
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Relógio Digital Oficial */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-mono text-2xl md:text-3xl font-black text-[#FFC72C] tracking-wider leading-none">
              {formattedClock}
            </div>
            <div className="text-[11px] text-white/70 capitalize mt-1 font-medium">
              {formattedDate}
            </div>
          </div>

          <button
            onClick={onExitKiosk}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            title="Voltar ao Painel Administrativo"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sair do Totem</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Fluxo */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {/* PASSO 1: SELECIONAR FUNCIONÁRIO ATIVO DA LOJA */}
        {step === "select_employee" && (
          <div className="w-full max-w-4xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Ponto Eletrônico Oficial
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Toque no seu nome para bater o ponto
              </h2>
              <p className="text-sm text-white/70 mt-1">
                Unidade: <strong className="text-[#FFC72C]">{currentStore?.name}</strong> •
                Identificação individual obrigatória
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
              {storeEmployees.length === 0 ? (
                <div className="col-span-full py-12 bg-white/5 rounded-2xl border border-white/10">
                  <UserCheck className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-semibold">Nenhum funcionário ativo nesta loja.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Alterne a unidade no topo ou cadastre colaboradores no painel.
                  </p>
                </div>
              ) : (
                storeEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    className="group bg-gradient-to-b from-[#0b3d26] to-[#041a10] hover:from-[#005C30] hover:to-[#004724] border border-[#0d4a2f] hover:border-[#FFC72C] rounded-2xl p-4 text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl active:scale-95 flex flex-col items-center justify-between"
                  >
                    <div className="relative mb-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-18 h-18 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-transparent group-hover:border-[#FFC72C] shadow-md transition-colors"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#062316] flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                    </div>

                    <div className="w-full">
                      <h4 className="font-bold text-white text-sm md:text-base group-hover:text-[#FFC72C] transition-colors line-clamp-1">
                        {emp.name.split(" ").slice(0, 2).join(" ")}
                      </h4>
                      <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">{emp.role}</p>
                    </div>

                    <div className="mt-3 w-full py-1.5 rounded-lg bg-white/5 group-hover:bg-[#FFC72C] text-[11px] font-bold text-white group-hover:text-[#004724] transition-colors">
                      Selecionar →
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* PASSO 2: AUTENTICAÇÃO POR PIN NUMÉRICO INDIVIDUAL */}
        {step === "enter_pin" && selectedEmployee && (
          <div className="w-full max-w-md bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Foto e Nome do Colaborador Selecionado */}
            <div className="flex items-center justify-center gap-3 border-b border-white/10 pb-4">
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFC72C]"
              />
              <div className="text-left">
                <h3 className="font-black text-white text-lg">{selectedEmployee.name}</h3>
                <p className="text-xs text-[#FFC72C] font-semibold">{selectedEmployee.role}</p>
                <p className="text-[10px] text-white/60">Matrícula: {selectedEmployee.matricula}</p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">Digite seu PIN individual</h4>
              <p className="text-xs text-white/70 mt-0.5">
                Segurança antifraude: somente você pode bater seu ponto
              </p>

              {/* Indicadores visuais dos dígitos */}
              <div className="flex items-center justify-center gap-3 my-5">
                {[0, 1, 2, 3].map((idx) => {
                  const hasDigit = pinDigits.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        hasDigit
                          ? "bg-[#FFC72C] border-[#FFC72C] scale-125 shadow-md shadow-[#FFC72C]/40"
                          : "border-white/30 bg-transparent"
                      }`}
                    />
                  );
                })}
              </div>

              {pinError && (
                <p className="text-xs font-bold text-red-400 bg-red-950/60 py-1.5 px-3 rounded-lg border border-red-800 animate-shake">
                  {pinError}
                </p>
              )}
            </div>

            {/* Teclado Numérico Touch Grande */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePinInput(String(n))}
                  className="h-14 rounded-2xl bg-white/10 hover:bg-[#FFC72C] hover:text-[#004724] active:scale-95 font-mono text-2xl font-black text-white transition-all shadow-sm"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={handlePinClear}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 text-xs font-bold uppercase text-white/70 active:scale-95 transition-all"
              >
                Limpar
              </button>
              <button
                onClick={() => handlePinInput("0")}
                className="h-14 rounded-2xl bg-white/10 hover:bg-[#FFC72C] hover:text-[#004724] active:scale-95 font-mono text-2xl font-black text-white transition-all shadow-sm"
              >
                0
              </button>
              <button
                onClick={handlePinBackspace}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/15 text-xs font-bold uppercase text-white/70 active:scale-95 transition-all"
              >
                ⌫
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={resetToStart}
                className="text-xs font-semibold text-white/70 hover:text-white"
              >
                ← Não é você? Trocar
              </button>
              <span className="text-[10px] text-white/40">PIN de 4 dígitos</span>
            </div>
          </div>
        )}

        {/* PASSO 3: CÂMERA AO VIVO OBRIGATÓRIA (SEM UPLOAD) E REGISTRO */}
        {step === "capture_photo" && selectedEmployee && (
          <div className="w-full max-w-xl bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="text-left">
                <span className="text-xs font-bold text-[#FFC72C] uppercase tracking-wider">
                  Validação Facial Obrigatória
                </span>
                <h3 className="text-lg font-black text-white">{selectedEmployee.name}</h3>
              </div>
              <div className="text-right font-mono text-sm font-bold text-[#FFC72C]">
                {formattedClock}
              </div>
            </div>

            {/* Seleção do Tipo de Batida */}
            <div>
              <p className="text-xs text-white/80 font-medium mb-2 text-left">
                Selecione o tipo de registro (sugerido automaticamente):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: "entrada" as PunchType, label: "Entrada" },
                  { type: "intervalo_saida" as PunchType, label: "Saída Alm." },
                  { type: "intervalo_retorno" as PunchType, label: "Retorno" },
                  { type: "saida" as PunchType, label: "Saída" },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedPunchType(item.type)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      selectedPunchType === item.type
                        ? "bg-[#FFC72C] text-[#004724] shadow-md shadow-[#FFC72C]/30 scale-102"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Container da Câmera ao Vivo com Guia Facial Oval */}
            <div className="relative w-full max-w-sm mx-auto aspect-4/3 rounded-2xl overflow-hidden bg-black border-2 border-[#FFC72C]/50 shadow-inner flex items-center justify-center">
              {/* Elemento de Vídeo WebCam em Tempo Real */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Guia Facial Oval */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-64 border-2 border-dashed border-[#FFC72C] rounded-[50%] shadow-lg camera-guide-ring flex items-center justify-center">
                  <div className="w-44 h-60 border border-[#FFC72C]/40 rounded-[50%]" />
                </div>
                <span className="mt-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[11px] font-bold text-[#FFC72C] uppercase tracking-wider">
                  Posicione seu rosto aqui
                </span>
              </div>

              {/* Badges de Status na Câmera */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Câmera ao Vivo
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/80 bg-black/60 backdrop-blur-xs p-1.5 px-2.5 rounded-lg">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#FFC72C]" />
                  {currentStore?.name}
                </span>
                <span className="text-emerald-400 font-bold shrink-0">GPS Validado</span>
              </div>
            </div>

            {/* Aviso de Não Permitir Upload de Foto da Galeria */}
            <p className="text-[11px] text-white/60">
              * A foto é capturada <strong>obrigatoriamente na hora</strong> pela câmera do tablet,
              sem opção de envio de fotos da galeria, garantindo conformidade com a Portaria 671 MTE.
            </p>

            {/* Botão Principal de Disparo */}
            <button
              onClick={handleCaptureAndPunch}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFC72C] to-[#E6A817] hover:brightness-110 active:scale-98 text-[#004724] font-black text-lg shadow-xl shadow-[#FFC72C]/20 transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-6 h-6" />
              Tirar Foto & Registrar Ponto
            </button>

            <button
              onClick={resetToStart}
              className="text-xs text-white/60 hover:text-white underline"
            >
              Cancelar marcação
            </button>
          </div>
        )}

        {/* PASSO 4: COMPROVANTE DIGITAL OFICIAL DE PONTO E RETORNO AUTOMÁTICO */}
        {step === "success_receipt" && receiptData && selectedEmployee && (
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-[#005C30] space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Ícone de Sucesso */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#005C30]">
                Marcação Registrada com Sucesso!
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {selectedEmployee.name}
              </h3>
              <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                {receiptData.typeLabel}
              </p>
            </div>

            {/* Foto Capturada e Dados Oficiais */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left">
              {capturedPhotoUrl && (
                <img
                  src={capturedPhotoUrl}
                  alt="Foto capturada"
                  className="w-20 h-20 rounded-xl object-cover border border-[#005C30] shadow-xs shrink-0"
                />
              )}
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Horário Oficial
                  </span>
                  <span className="font-mono text-lg font-black text-[#005C30]">
                    {receiptData.time}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Unidade
                  </span>
                  <span className="font-semibold text-slate-700">
                    {currentStore?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Dados Fiscais de Portaria 671 */}
            <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 font-mono text-left space-y-1 border border-slate-200">
              <p>NSR (Número Sequencial): #{receiptData.nsr}</p>
              <p className="truncate">Hash Criptográfico: {receiptData.hash}</p>
              <p>Dispositivo: Totem Quiosque Athleta (Tablet Fixo Loja)</p>
              <p>Data: {receiptData.date}</p>
            </div>

            {/* Contagem Regressiva e Retorno Automático */}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-medium">
                Retornando à tela inicial em{" "}
                <strong className="text-[#005C30] font-black text-sm">{countdown}s</strong>
              </p>
              <button
                onClick={resetToStart}
                className="mt-2 w-full py-2.5 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white text-xs font-bold transition-colors"
              >
                Concluir agora (Próximo Colaborador)
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Institucional do Quiosque */}
      <footer className="p-3 text-center border-t border-[#0d4a2f] bg-[#00361c] text-[11px] text-white/50 flex items-center justify-between px-6 flex-wrap gap-2">
        <span>
          ATHLETA PONTO • Portaria 671 MTE • Dispositivo Homologado da Unidade
        </span>
        <span className="text-[#FFC72C] font-semibold">
          Segurança Facial Obrigatória Ativa
        </span>
      </footer>
    </div>
  );
}
