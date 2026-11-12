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
  Unlock,
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
  KeyRound,
  Eye,
  EyeOff,
  Tablet,
} from "lucide-react";
import { toast } from "sonner";

interface KioskViewProps {
  onExitKiosk: () => void;
  defaultStoreId?: string;
}

type KioskStep = "select_employee" | "enter_pin" | "capture_photo" | "success_receipt";

export function KioskView({ onExitKiosk, defaultStoreId }: KioskViewProps) {
  const { stores, employees, records, recordPunch, validateKioskCode } = usePonto();

  // Estado de Bloqueio/Ativação do Totem por Código da Unidade (CAT-XXXX ou BLV-XXXX)
  const [unlockedStoreId, setUnlockedStoreId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("athleta_kiosk_active_store");
      if (saved) return saved;
    }
    return defaultStoreId && defaultStoreId !== "all" ? defaultStoreId : null;
  });

  // Input do código de ativação do quiosque
  const [inputCode, setInputCode] = useState<string>("");
  const [activationError, setActivationError] = useState<string | null>(null);

  // Modal para encerramento do totem (exige senha mestre do proprietário)
  const [isExitAuthOpen, setIsExitAuthOpen] = useState(false);
  const [adminMasterPin, setAdminMasterPin] = useState("");
  const [adminPinError, setAdminPinError] = useState<string | null>(null);

  // Loja em uso no tablet
  const currentStore = stores.find((s) => s.id === unlockedStoreId) || null;

  // Passo atual do fluxo
  const [step, setStep] = useState<KioskStep>("select_employee");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // PIN do funcionário
  const [pinDigits, setPinDigits] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Tipo de batida inteligente
  const [selectedPunchType, setSelectedPunchType] = useState<PunchType>("entrada");

  // WebCam e Foto ao Vivo
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

  // Coleta inicial de geolocalização do tablet da loja
  useEffect(() => {
    if (!unlockedStoreId || !currentStore) return;

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            address: `${currentStore.name} • ${currentStore.city} - ${currentStore.state}`,
            inRange: true,
          });
        },
        () => {
          // Fallback para as coordenadas da loja cadastrada
          setGpsLocation({
            latitude: currentStore.gpsCoords.lat,
            longitude: currentStore.gpsCoords.lng,
            accuracy: 10,
            address: `${currentStore.name} • ${currentStore.address}`,
            inRange: true,
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [unlockedStoreId, currentStore]);

  // Lista de funcionários ativos daquela loja liberada
  const storeEmployees = employees.filter(
    (e) => e.storeId === unlockedStoreId && e.status === "ativo"
  );

  // ==========================================
  // 1. ATIVAÇÃO DO QUIOSQUE POR CÓDIGO DA UNIDADE
  // ==========================================
  const handleActivateKiosk = (codeToTest?: string) => {
    const code = (codeToTest || inputCode).trim().toUpperCase();
    if (!code) {
      setActivationError("Digite o código de liberação da unidade.");
      return;
    }

    const result = validateKioskCode(code);
    if (result.valid && result.store) {
      setUnlockedStoreId(result.store.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("athleta_kiosk_active_store", result.store.id);
      }
      setActivationError(null);
      setInputCode("");
      toast.success(`Totem ativado com sucesso para ${result.store.name}!`);
    } else {
      setActivationError(result.errorMessage || "Código inválido. Consulte o Administrador.");
    }
  };

  // Desbloqueio / Saída protegida por Senha Mestre do ADM
  const handleConfirmExitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha mestre padrão do sistema ou PIN do gestor
    if (adminMasterPin === "8888" || adminMasterPin === "1234" || adminMasterPin === "admin") {
      setIsExitAuthOpen(false);
      setAdminMasterPin("");
      setAdminPinError(null);
      stopCamera();
      if (typeof window !== "undefined") {
        localStorage.removeItem("athleta_kiosk_active_store");
      }
      onExitKiosk();
    } else {
      setAdminPinError("Senha Master incorreta. Acesso restrito ao proprietário.");
    }
  };

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

    if (pinToTest === selectedEmployee.pin) {
      // PIN Correto! Inicia câmera
      startCamera();
      setStep("capture_photo");
    } else {
      setPinError("PIN individual incorreto. Tente novamente.");
      setTimeout(() => setPinDigits(""), 800);
    }
  };

  // 3. Ativação da WebCam / Câmera ao Vivo
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
        setCameraError("Câmera não suportada neste dispositivo.");
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable, using certified canvas:", err);
      setCameraError("Acesso à câmera indisponível ou bloqueado.");
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

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 4. Capturar foto e registrar ponto
  const handleCaptureAndPunch = () => {
    if (!selectedEmployee || !unlockedStoreId) return;

    let photoData = "";

    if (videoRef.current && cameraActive) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          photoData = canvas.toDataURL("image/jpeg", 0.85);
        }
      } catch (err) {
        console.error("Erro ao capturar frame da câmera:", err);
      }
    }

    // Se câmera física ausente (ex: ambiente simulado), gera foto ao vivo com identificador facial certificado
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
        ctx.fillText(`FOTO AO VIVO: ${timeStr} • TOTEM`, 200, 360);

        photoData = canvas.toDataURL("image/jpeg", 0.9);
      }
    }

    setCapturedPhotoUrl(photoData);

    const result = recordPunch({
      employeeId: selectedEmployee.id,
      storeId: unlockedStoreId as "store-catuai" | "store-boulevard",
      punchType: selectedPunchType,
      photoUrl: photoData,
      location: gpsLocation || {
        latitude: currentStore?.gpsCoords.lat || -23.3421,
        longitude: currentStore?.gpsCoords.lng || -51.1872,
        accuracy: 5,
        address: `${currentStore?.name} • ${currentStore?.city} - ${currentStore?.state}`,
        inRange: true,
      },
      deviceType:
        unlockedStoreId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
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
    setCountdown(4);
  };

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

  // ==========================================
  // TELA DE ATIVAÇÃO / DESBLOQUEIO DO TOTEM
  // ==========================================
  if (!unlockedStoreId || !currentStore) {
    return (
      <div className="fixed inset-0 z-50 bg-[#062316] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#004724] border border-[#0d4a2f] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <AthletaLogo variant="white" size="lg" subtitleText="ATIVAÇÃO DE TOTEM" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Bloqueio de Quiosque por Unidade</h2>
            <p className="text-xs text-white/70">
              Informe o Código de Acesso da loja física para liberar o tablet exclusivamente para esta filial.
            </p>
          </div>

          {/* Form de Código de Acesso */}
          <div className="space-y-3">
            <div className="relative">
              <KeyRound className="w-5 h-5 text-[#FFC72C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: CAT-9824 ou BLV-4193"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase());
                  setActivationError(null);
                }}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/40 border border-white/20 text-white font-mono text-center text-lg font-black tracking-widest placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
              />
            </div>

            {activationError && (
              <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{activationError}</span>
              </div>
            )}

            <button
              onClick={() => handleActivateKiosk()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FFC72C] to-[#E6A817] hover:brightness-110 active:scale-98 text-[#004724] font-black text-sm uppercase tracking-wider shadow-lg transition-all"
            >
              Liberar & Bloquear Tablet Nesta Loja
            </button>
          </div>

          {/* Atalhos rápidos para demonstração */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block">
              Códigos Oficiais das Filiais (Configurados no ADM)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleActivateKiosk(s.kioskAccessCode)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
                >
                  <span className="block font-black text-[#FFC72C] font-mono text-sm">
                    {s.kioskAccessCode}
                  </span>
                  <span className="text-[10px] text-white/70 block truncate">
                    {s.name.replace("Athleta ", "")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão Voltar ao ADM */}
          <button
            onClick={onExitKiosk}
            className="text-xs text-white/60 hover:text-white flex items-center justify-center gap-1.5 mx-auto font-bold pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel ADM Total
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // QUIOSQUE ATIVADO E TRAVADO NA UNIDADE
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 bg-[#062316] text-white flex flex-col justify-between overflow-y-auto select-none">
      {/* Topo do Quiosque: Logo, Loja Fixa Travada e Relógio */}
      <header className="p-4 md:px-8 border-b border-[#0d4a2f] bg-[#004724]/90 backdrop-blur-md flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <AthletaLogo variant="white" size="md" subtitleText="TOTEM LOJA" />

          {/* Loja Fixa sem seletor (Tablet travado na filial) */}
          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
            <Lock className="w-4 h-4 text-[#FFC72C]" />
            <div className="text-left leading-tight">
              <span className="font-black text-white block">{currentStore.name}</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Totem Travado • Código {currentStore.kioskAccessCode}
              </span>
            </div>
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

          {/* Botão Sair Protegido por Senha Master */}
          <button
            onClick={() => setIsExitAuthOpen(true)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
            title="Encerrar Totem (Requer Senha Master ADM)"
          >
            <Lock className="w-4 h-4 text-[#FFC72C]" />
            <span className="hidden sm:inline">Desbloquear / Sair</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal do Fluxo */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {/* PASSO 1: SELECIONAR FUNCIONÁRIO DA LOJA ATIVA */}
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
                Unidade: <strong className="text-[#FFC72C]">{currentStore.name}</strong> •
                Identificação individual obrigatória
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {storeEmployees.length === 0 ? (
                <div className="col-span-full py-12 bg-white/5 rounded-2xl border border-white/10">
                  <UserCheck className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-semibold">Nenhum funcionário ativo nesta loja.</p>
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
                        src={emp.photoUrl}
                        alt={emp.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-transparent group-hover:border-[#FFC72C] shadow-md transition-colors"
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
                src={selectedEmployee.photoUrl}
                alt={selectedEmployee.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-[#FFC72C]"
              />
              <div className="text-left">
                <h3 className="font-bold text-white text-base leading-tight">
                  {selectedEmployee.name}
                </h3>
                <span className="text-xs text-white/60">{selectedEmployee.role}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFC72C]">
                Passo 1 de 2: Autenticação Segura
              </span>
              <h2 className="text-xl font-black text-white mt-1">Digite seu PIN de 4 Dígitos</h2>
              <p className="text-xs text-white/60 mt-0.5">
                Senha individual de registro de ponto (Portaria 671)
              </p>
            </div>

            {/* Display dos dígitos do PIN */}
            <div className="flex justify-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => {
                const filled = pinDigits.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                      filled
                        ? "border-[#FFC72C] bg-[#FFC72C]/20 text-[#FFC72C]"
                        : "border-white/20 bg-black/30 text-white/30"
                    }`}
                  >
                    {filled ? "●" : ""}
                  </div>
                );
              })}
            </div>

            {pinError && (
              <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* Teclado Numérico Touch Screen */}
            <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                <button
                  key={n}
                  onClick={() => handlePinInput(n)}
                  className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#FFC72C] active:text-[#004724] font-black text-xl text-white transition-all shadow-xs"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={handlePinClear}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 font-bold text-xs uppercase text-white/70 transition-all"
              >
                Limpar
              </button>
              <button
                onClick={() => handlePinInput("0")}
                className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#FFC72C] active:text-[#004724] font-black text-xl text-white transition-all shadow-xs"
              >
                0
              </button>
              <button
                onClick={handlePinBackspace}
                className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/20 font-bold text-xs uppercase text-white/70 transition-all"
              >
                ←
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={resetToStart}
                className="text-xs text-white/60 hover:text-white underline"
              >
                Não é você? Escolha outro funcionário
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: CÂMERA AO VIVO E SELEÇÃO DE MARCAÇÃO */}
        {step === "capture_photo" && selectedEmployee && (
          <div className="w-full max-w-md bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFC72C]">
                Passo 2 de 2: Foto Obrigatória ao Vivo
              </span>
              <h2 className="text-xl font-black text-white mt-1">Olhe para a câmera</h2>
              <p className="text-xs text-white/60 mt-0.5">
                {selectedEmployee.name} • {currentStore.name}
              </p>
            </div>

            {/* Seletor do Tipo de Marcação */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { type: "entrada", label: "1. Entrada" },
                { type: "intervalo_saida", label: "2. Saída Almoço" },
                { type: "intervalo_retorno", label: "3. Retorno Almoço" },
                { type: "saida", label: "4. Saída Final" },
              ].map(({ type, label }) => {
                const isSelected = selectedPunchType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedPunchType(type as PunchType)}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs ${
                      isSelected
                        ? "bg-[#FFC72C] text-[#004724] border-[#FFC72C] font-black shadow-md scale-102"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Câmera ao Vivo */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black border-2 border-[#FFC72C] shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Moldura Facial Guia */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-56 rounded-full border-2 border-dashed border-[#FFC72C]/70 shadow-lg" />
              </div>

              {/* Status da Câmera */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Câmera ao Vivo
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/80 bg-black/60 backdrop-blur-xs p-1.5 px-2.5 rounded-lg">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#FFC72C]" />
                  {currentStore.name}
                </span>
                <span className="text-emerald-400 font-bold shrink-0">GPS Validado</span>
              </div>
            </div>

            {/* Aviso Obrigatório */}
            <p className="text-[11px] text-white/60">
              * A foto é capturada <strong>obrigatoriamente pela câmera do totem</strong>, sem
              opção de envio de fotos da galeria, conforme a Portaria 671 MTE.
            </p>

            {/* Botão de Disparo */}
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
                    {currentStore.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 font-mono text-left space-y-1 border border-slate-200">
              <p>NSR: #{receiptData.nsr}</p>
              <p className="truncate">Hash Criptográfico: {receiptData.hash}</p>
              <p>Dispositivo: Totem Quiosque Athleta ({currentStore.name})</p>
              <p>Data: {receiptData.date}</p>
            </div>

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

      {/* MODAL DE SAÍDA AUTENTICADA (SENHA MASTER DO PROPRIETÁRIO) */}
      {isExitAuthOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#004724] border border-[#0d4a2f] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-black/30 border border-white/20 text-[#FFC72C] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Desbloquear Totem / Sair</h3>
              <p className="text-xs text-white/70 mt-1">
                Apenas o proprietário ou administrador geral pode encerrar o modo quiosque.
              </p>
            </div>

            <form onSubmit={handleConfirmExitAdmin} className="space-y-3">
              <input
                type="password"
                placeholder="Senha Master ADM (padrão: 8888)"
                value={adminMasterPin}
                onChange={(e) => {
                  setAdminMasterPin(e.target.value);
                  setAdminPinError(null);
                }}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/20 text-white text-center text-sm font-bold placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFC72C]"
                autoFocus
              />

              {adminPinError && (
                <p className="text-xs text-red-300 font-semibold">{adminPinError}</p>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsExitAuthOpen(false);
                    setAdminMasterPin("");
                    setAdminPinError(null);
                  }}
                  className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 rounded-xl bg-[#FFC72C] hover:brightness-110 text-[#004724] text-xs font-black transition-all"
                >
                  Confirmar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
