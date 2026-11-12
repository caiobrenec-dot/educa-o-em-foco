import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Employee,
  Store,
  PunchType,
  DayTimeRecord,
  PontoStore,
  INITIAL_STORES,
  INITIAL_EMPLOYEES,
  PunchStageInfo,
  getEmployeeDayStages,
} from "../../lib/ponto-store";
import {
  useBrasiliaClock,
  getBrasiliaDateStr,
  getBrasiliaTimeStr,
  getBrasiliaFullTimeStr,
} from "../../lib/brasilia-time";
import {
  validateCameraFrame,
  CameraValidationStatus,
  FaceValidationResult,
} from "../../lib/face-camera-validator";
import { generateCertifiedPunchPhoto } from "../../lib/facial-biometrics";
import { usePonto } from "../../hooks/use-ponto";
import { AthletaLogo } from "../AthletaLogo";
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  LogIn,
  LogOut,
  Utensils,
  RotateCcw,
  Eye,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";

interface KioskViewProps {
  onExitKiosk: () => void;
  defaultStoreId?: string;
}

type KioskStep =
  | "select_employee"     // 1. Lista de funcionários da loja
  | "employee_journey"    // 2. Visão das 4 etapas e botão inteligente
  | "camera_capture"      // 3. Câmera com detecção de rosto em tempo real
  | "preview_photo"       // 4. Prévia para conferência antes de salvar
  | "success_receipt";    // 5. Comprovante oficial com status das próximas etapas

export function KioskView({ onExitKiosk, defaultStoreId = "store-catuai" }: KioskViewProps) {
  const { stores, employees, records, schedules, recordPunch, refresh } = usePonto();

  const safeStores = stores.length > 0 ? stores : INITIAL_STORES;
  const safeEmployees = employees.length > 0 ? employees : INITIAL_EMPLOYEES;

  // Loja em uso no totem (Catuaí ou Boulevard)
  const [currentStoreId, setCurrentStoreId] = useState<string>(
    defaultStoreId && defaultStoreId !== "all" ? defaultStoreId : safeStores[0]?.id || "store-catuai"
  );
  const currentStore = safeStores.find((s) => s.id === currentStoreId) || safeStores[0];

  // Horário Oficial de Brasília sincronizado
  const brasiliaClock = useBrasiliaClock();

  // Estados do Fluxo
  const [step, setStep] = useState<KioskStep>("select_employee");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [targetPunchType, setTargetPunchType] = useState<PunchType>("entrada");

  // Modal de confirmação antes de abrir a câmera
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  // Alerta de etapa fora de sequência
  const [outOfSequenceWarning, setOutOfSequenceWarning] = useState<string | null>(null);

  // Estados da Câmera e Detecção Facial
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<FaceValidationResult>({
    status: "initializing",
    message: "INICIANDO CÂMERA... AGUARDE.",
    isReadyForCapture: false,
    metrics: { brightness: 0, sharpness: 0, faceDetected: false, faceCentered: false },
  });
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
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
    employeeName: string;
    storeName: string;
    photoUrl: string;
  } | null>(null);

  // Contador de retorno automático ao início
  const [countdown, setCountdown] = useState<number>(8);

  // Geolocalização do dispositivo
  useEffect(() => {
    if (!currentStore) return;

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
          setGpsLocation({
            latitude: currentStore?.gpsCoords?.lat ?? -23.3444,
            longitude: currentStore?.gpsCoords?.lng ?? -51.1812,
            accuracy: 10,
            address: `${currentStore?.name || "Athleta"} • ${currentStore?.address || "Londrina - PR"}`,
            inRange: true,
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [currentStoreId, currentStore]);

  // Lista de funcionários ativos daquela loja
  const storeEmployees = useMemo(() => {
    return safeEmployees.filter(
      (e) => (currentStoreId === "all" ? true : e.storeId === currentStoreId) && e.status === "ativo"
    );
  }, [safeEmployees, currentStoreId]);

  // Registro de hoje do funcionário selecionado
  const todayRecord = useMemo(() => {
    if (!selectedEmployee) return null;
    const todayStr = getBrasiliaDateStr();
    return records.find((r) => r.employeeId === selectedEmployee.id && r.date === todayStr) || null;
  }, [selectedEmployee, records]);

  // Escala do funcionário selecionado
  const employeeSchedule = useMemo(() => {
    if (!selectedEmployee) return null;
    return schedules.find((s) => s.id === selectedEmployee.defaultScheduleId) || null;
  }, [selectedEmployee, schedules]);

  // Cálculo das 4 Etapas da Jornada de Hoje
  const dayStagesInfo = useMemo(() => {
    if (!selectedEmployee) {
      return {
        stages: [],
        nextStage: null,
        completedCount: 0,
        isAllCompleted: false,
        canPunch: false,
      };
    }
    return getEmployeeDayStages({
      employee: selectedEmployee,
      dayRecord: todayRecord,
      schedule: employeeSchedule,
    });
  }, [selectedEmployee, todayRecord, employeeSchedule]);

  // Ícones específicos para as 4 etapas
  const getStageIcon = (type: PunchType) => {
    switch (type) {
      case "entrada":
        return LogIn;
      case "intervalo_saida":
        return Utensils;
      case "intervalo_retorno":
        return RotateCcw;
      case "saida":
        return LogOut;
    }
  };

  // Nomes amigáveis e completos para confirmação
  const getStageFullName = (type: PunchType) => {
    switch (type) {
      case "entrada":
        return "ENTRADA";
      case "intervalo_saida":
        return "SAÍDA PARA INTERVALO";
      case "intervalo_retorno":
        return "RETORNO DO INTERVALO";
      case "saida":
        return "SAÍDA FINAL";
    }
  };

  // 1. Ao selecionar o funcionário: abre a tela com as 4 etapas da jornada
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setOutOfSequenceWarning(null);
    setStep("employee_journey");
  };

  // 2. Ao clicar para registrar a próxima etapa
  const handleInitiatePunch = (type: PunchType) => {
    if (!selectedEmployee) return;

    // Checagem se a etapa é a próxima esperada
    if (dayStagesInfo.nextStage && dayStagesInfo.nextStage.type !== type) {
      setOutOfSequenceWarning(
        `A próxima etapa esperada é "${dayStagesInfo.nextStage.name.toUpperCase()}". Não é permitido pular marcações. Para exceções, contate o gerente.`
      );
      return;
    }

    setTargetPunchType(type);
    setShowConfirmModal(true);
  };

  // 3. Confirmar e abrir câmera
  const handleConfirmAndOpenCamera = async () => {
    setShowConfirmModal(false);
    setStep("camera_capture");
    await startCamera();
  };

  // Iniciar Câmera WebCam
  const startCamera = async () => {
    setCameraError(null);
    setValidationResult({
      status: "initializing",
      message: "INICIANDO CÂMERA... AGUARDE.",
      isReadyForCapture: false,
      metrics: { brightness: 0, sharpness: 0, faceDetected: false, faceCentered: false },
    });

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
          await videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError("A CÂMERA NÃO ESTÁ FUNCIONANDO CORRETAMENTE. VERIFIQUE A PERMISSÃO E TENTE NOVAMENTE.");
      }
    } catch (err) {
      console.warn("Acesso à câmera bloqueado ou indisponível:", err);
      setCameraError("A CÂMERA NÃO ESTÁ FUNCIONANDO CORRETAMENTE. VERIFIQUE A PERMISSÃO E TENTE NOVAMENTE.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {
        console.warn(e);
      }
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Loop contínuo de validação de câmera e detecção de rosto (a cada 150ms)
  useEffect(() => {
    if (step !== "camera_capture" || !cameraActive) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      if (!isSubscribed) return;
      if (videoRef.current) {
        const result = await validateCameraFrame(videoRef.current);
        if (isSubscribed) {
          setValidationResult(result);
        }
      }
    }, 150);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [step, cameraActive]);

  // 4. Capturar a foto quando o rosto estiver pronto
  const handleCapturePhoto = async () => {
    if (!validationResult.isReadyForCapture || !selectedEmployee || !currentStore || isCapturing) {
      return;
    }

    setIsCapturing(true);

    try {
      const todayDate = getBrasiliaDateStr();
      const clockTime = getBrasiliaTimeStr();

      const photoData = await generateCertifiedPunchPhoto({
        employee: selectedEmployee,
        store: currentStore,
        punchType: targetPunchType,
        timeStr: clockTime,
        dateStr: todayDate.split("-").reverse().join("/"),
        videoElement: videoRef.current,
        gpsAddress: gpsLocation?.address || `${currentStore.name} • Londrina/PR`,
      });

      setCapturedPhotoUrl(photoData);
      stopCamera();
      setStep("preview_photo");
    } catch (err) {
      console.error("Erro na captura da foto:", err);
      toast.error("Erro ao capturar foto. Tente novamente.");
    } finally {
      setIsCapturing(false);
    }
  };

  // 5. Confirmar a foto e SALVAR DEFINITIVAMENTE no banco de dados
  const handleConfirmAndSavePunch = () => {
    if (!selectedEmployee || !currentStore || !capturedPhotoUrl) return;

    const clockTime = getBrasiliaTimeStr();
    const todayDate = getBrasiliaDateStr();

    // Grava no store com todas as regras de validação
    const result = recordPunch({
      employeeId: selectedEmployee.id,
      storeId: currentStoreId as "store-catuai" | "store-boulevard",
      punchType: targetPunchType,
      photoUrl: capturedPhotoUrl,
      location: gpsLocation || {
        latitude: currentStore?.gpsCoords?.lat ?? -23.3444,
        longitude: currentStore?.gpsCoords?.lng ?? -51.1812,
        accuracy: 10,
        address: `${currentStore.name} • Londrina/PR`,
        inRange: true,
      },
      deviceType: currentStoreId === "store-catuai" ? "Totem Tablet Catuaí" : "Totem Tablet Boulevard",
    });

    // Se houve erro ou falha ao salvar: NÃO MOSTRA SUCESSO!
    if (!result.success || !result.punch) {
      toast.error(result.errorMessage || "Não foi possível registrar o ponto. Tente novamente.");
      return;
    }

    // Atualiza imediatamente todo o sistema
    refresh();

    // Preenche dados do comprovante oficial
    setReceiptData({
      time: result.punch.time || clockTime,
      date: todayDate.split("-").reverse().join("/"),
      nsr: result.punch.nsr,
      hash: result.punch.hash,
      typeLabel: getStageFullName(targetPunchType),
      employeeName: selectedEmployee.name,
      storeName: currentStore.name,
      photoUrl: capturedPhotoUrl,
    });

    setStep("success_receipt");
    setCountdown(8);
  };

  // Contador regressivo na tela de comprovante
  useEffect(() => {
    if (step !== "success_receipt") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const handleFinish = () => {
    stopCamera();
    setSelectedEmployee(null);
    setCapturedPhotoUrl(null);
    setReceiptData(null);
    setStep("select_employee");
    refresh();
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-[#00381c] via-[#004724] to-[#012513] text-white flex flex-col min-h-[calc(100vh-68px)] select-none">
      {/* 1. TOPO DO TOTEM COM HORÁRIO OFICIAL DE BRASÍLIA */}
      <header className="bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-3 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AthletaLogo variant="yellow" size="md" subtitleText="QUIOSQUE" />
          <div className="h-7 w-px bg-white/20 hidden sm:block" />

          {/* Seletor rápido de Unidade */}
          <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
            {safeStores.map((s) => {
              const isSelected = currentStoreId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentStoreId(s.id);
                    if (step !== "select_employee") {
                      handleFinish();
                    }
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#FFC72C] text-[#004724] font-black shadow-xs"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  {s.name.replace("Athleta ", "")}
                </button>
              );
            })}
          </div>
        </div>

        {/* RELÓGIO OFICIAL DE BRASÍLIA VISÍVEL COM SEGUNDOS */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#FFC72C] block">
              Horário Oficial de Brasília
            </span>
            <div className="font-mono text-2xl md:text-3xl font-black text-white tracking-wider leading-none mt-0.5">
              {brasiliaClock.fullTimeStr}
            </div>
            <div className="text-[10px] text-white/70 capitalize mt-0.5 font-medium">
              {brasiliaClock.longDateStr}
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onExitKiosk();
            }}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Voltar ao Painel Total"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Painel ADM</span>
          </button>
        </div>
      </header>

      {/* 2. CORPO PRINCIPAL */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        {/* PASSO 1: SELECIONAR FUNCIONÁRIO */}
        {step === "select_employee" && (
          <div className="w-full max-w-4xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Totem REP-P Portaria 671 MTE
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Toque no seu nome para registrar o ponto
              </h2>
              <p className="text-sm text-white/70 mt-1">
                Unidade: <strong className="text-[#FFC72C]">{currentStore.name}</strong> • Londrina/PR
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
                    className="group bg-gradient-to-b from-[#0b3d26] to-[#041a10] hover:from-[#005C30] hover:to-[#004724] border border-[#0d4a2f] hover:border-[#FFC72C] rounded-2xl p-4 text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl active:scale-95 flex flex-col items-center justify-between cursor-pointer"
                  >
                    <div className="relative mb-3">
                      <img
                        src={
                          emp.photoUrl ||
                          emp.avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                        }
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

                    <div className="mt-3 w-full py-1.5 rounded-lg bg-white/10 group-hover:bg-[#FFC72C] text-[11px] font-bold text-white group-hover:text-[#004724] transition-colors">
                      Selecionar →
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* PASSO 2: JORNADA DO DIA COM AS 4 ETAPAS MUITO VISÍVEIS */}
        {step === "employee_journey" && selectedEmployee && (
          <div className="w-full max-w-3xl bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Funcionário */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedEmployee.photoUrl || selectedEmployee.avatar}
                  alt={selectedEmployee.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FFC72C] shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedEmployee.name}</h3>
                    <span className="px-2 py-0.5 rounded bg-[#FFC72C] text-[#004724] text-[10px] font-black uppercase">
                      {selectedEmployee.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/70 mt-0.5">
                    <span>{currentStore.name}</span>
                    <span>•</span>
                    <span>Matrícula: {selectedEmployee.matricula}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep("select_employee")}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors self-start sm:self-auto cursor-pointer"
              >
                ← Trocar Colaborador
              </button>
            </div>

            {/* Aviso de Etapa fora de sequência se houver */}
            {outOfSequenceWarning && (
              <div className="p-3.5 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-xs text-amber-200 flex items-center justify-between gap-3 animate-in shake">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FFC72C] shrink-0" />
                  <span>{outOfSequenceWarning}</span>
                </div>
                <button
                  onClick={() => setOutOfSequenceWarning(null)}
                  className="text-amber-200 font-bold hover:text-white px-2 py-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* AS QUATRO ETAPAS DA JORNADA MUITO VISÍVEIS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FFC72C] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  As Quatro Marcações Obrigatórias do Dia
                </h4>
                <span className="text-[11px] text-white/60 font-semibold">
                  {dayStagesInfo.completedCount}/4 concluídas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dayStagesInfo.stages.map((stage) => {
                  const Icon = getStageIcon(stage.type);
                  const isDone = stage.status === "concluido";
                  const isNext = stage.status === "proxima";

                  return (
                    <div
                      key={stage.type}
                      className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                        isDone
                          ? "bg-emerald-950/60 border-emerald-500/50"
                          : isNext
                          ? "bg-gradient-to-b from-[#14532d] to-[#052e16] border-[#FFC72C] shadow-lg ring-2 ring-[#FFC72C]/30"
                          : "bg-white/5 border-white/10 opacity-70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-xl ${
                              isDone
                                ? "bg-emerald-500 text-white"
                                : isNext
                                ? "bg-[#FFC72C] text-[#004724]"
                                : "bg-white/10 text-white/60"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isDone
                                ? "bg-emerald-400 text-emerald-950"
                                : isNext
                                ? "bg-[#FFC72C] text-[#004724] animate-pulse"
                                : "bg-white/10 text-white/50"
                            }`}
                          >
                            {isDone ? "Concluído" : isNext ? "Próxima" : "Aguardando"}
                          </span>
                        </div>

                        <span className="font-bold text-white text-xs block leading-snug">
                          {stage.name}
                        </span>

                        <div className="mt-3 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between text-white/60">
                            <span>Previsto:</span>
                            <span className="font-mono font-semibold text-white/80">{stage.expectedTime}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-white/10">
                            <span className="font-bold text-white/80">Registrado:</span>
                            {stage.actualTime ? (
                              <span className="font-mono font-black text-emerald-400 text-xs">
                                {stage.actualTime} ✓
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-300/80">
                                PENDENTE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botão de atalho caso seja a próxima */}
                      {isNext && (
                        <button
                          onClick={() => handleInitiatePunch(stage.type)}
                          className="mt-3 w-full py-1.5 rounded-xl bg-[#FFC72C] hover:bg-[#ffcf47] text-[#004724] font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                          Bater Agora →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTÃO INTELIGENTE DE MARCAÇÃO EM DESTAQUE */}
            <div className="pt-2">
              {dayStagesInfo.nextStage ? (
                <button
                  onClick={() => handleInitiatePunch(dayStagesInfo.nextStage!.type)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFC72C] via-[#ffcf47] to-[#e6b220] hover:from-[#ffd457] hover:to-[#FFC72C] text-[#004724] font-black text-base uppercase tracking-wider transition-all transform hover:scale-[1.01] active:scale-98 shadow-xl flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  REGISTRAR {getStageFullName(dayStagesInfo.nextStage.type)}
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <h5 className="text-base font-black text-white">JORNADA DO DIA CONCLUÍDA!</h5>
                  <p className="text-xs text-emerald-200">
                    Todas as 4 marcações do dia foram realizadas com sucesso no Horário Oficial de Brasília.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASSO 3: CÂMERA AO VIVO COM VALIDAÇÃO DE ROSTO EM TEMPO REAL */}
        {step === "camera_capture" && selectedEmployee && (
          <div className="w-full max-w-lg bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Header da Câmera */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFC72C] text-[#004724]">
                Marcação Oficial: {getStageFullName(targetPunchType)}
              </span>
              <h3 className="text-lg font-black text-white mt-1.5">
                Validação de Presença Facial
              </h3>
              <p className="text-xs text-white/70">
                {selectedEmployee.name} • {currentStore.name}
              </p>
            </div>

            {/* CÂMERA AO VIVO COM OVERLAY INTELIGENTE */}
            <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-black border-2 border-[#FFC72C] shadow-2xl flex items-center justify-center">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="p-6 text-center space-y-2">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300">
                    {cameraError || "Iniciando câmera... Aguarde."}
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white text-xs font-bold cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {/* MIRA FACIAL DINÂMICA BASEADA NO ESTADO DE VALIDAÇÃO */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Elipse Central de Enquadramento */}
                  <div
                    className={`w-48 h-60 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      validationResult.status === "ready"
                        ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        : validationResult.status === "off_center" || validationResult.status === "too_close" || validationResult.status === "too_far"
                        ? "border-[#FFC72C] shadow-[0_0_15px_rgba(255,199,44,0.4)]"
                        : "border-red-400/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    }`}
                  >
                    {/* Cantos guias */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/60" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/60" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/60" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/60" />
                  </div>
                </div>
              )}
            </div>

            {/* BANNER DINÂMICO DE FEEDBACK / ORIENTAÇÃO */}
            <div
              className={`p-3 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                validationResult.status === "ready"
                  ? "bg-emerald-500/20 border-emerald-400 text-emerald-200"
                  : validationResult.status === "no_face"
                  ? "bg-red-500/20 border-red-400 text-red-200"
                  : validationResult.status === "black_screen" || validationResult.status === "dark_screen"
                  ? "bg-amber-500/20 border-amber-400 text-amber-200"
                  : "bg-white/10 border-white/20 text-white/90"
              }`}
            >
              {validationResult.status === "ready" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
              )}
              <span>{validationResult.message}</span>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  stopCamera();
                  setStep("employee_journey");
                }}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Voltar
              </button>

              <button
                onClick={handleCapturePhoto}
                disabled={!validationResult.isReadyForCapture || isCapturing}
                className={`flex-2 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  validationResult.isReadyForCapture && !isCapturing
                    ? "bg-[#FFC72C] hover:bg-[#ffcf47] text-[#004724] transform hover:scale-102 active:scale-98"
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
                }`}
              >
                <Camera className="w-4 h-4" />
                {isCapturing
                  ? "Capturando..."
                  : validationResult.isReadyForCapture
                  ? "Capturar Foto do Ponto"
                  : "Aguardando Rosto Humano..."}
              </button>
            </div>
          </div>
        )}

        {/* PASSO 4: PRÉVIA PARA CONFERÊNCIA ANTES DE SALVAR */}
        {step === "preview_photo" && selectedEmployee && capturedPhotoUrl && (
          <div className="w-full max-w-md bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                Conferência da Foto
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Confirme seu Registro de Ponto
              </h3>
              <p className="text-xs text-white/70">
                Verifique a foto capturada antes de confirmar o registro
              </p>
            </div>

            {/* Imagem Capturada */}
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black border-2 border-emerald-400 shadow-xl mx-auto">
              <img
                src={capturedPhotoUrl}
                alt="Foto do Ponto"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
                Rosto Validado ✓
              </span>
            </div>

            {/* Detalhes do Registro que será salvo */}
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-white/60">Etapa:</span>
                <span className="font-bold text-[#FFC72C]">{getStageFullName(targetPunchType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Colaborador:</span>
                <span className="font-semibold text-white">{selectedEmployee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Horário de Brasília:</span>
                <span className="font-mono font-bold text-white">{brasiliaClock.fullTimeStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Localização:</span>
                <span className="text-white/80 truncate max-w-[200px]">{currentStore.name}</span>
              </div>
            </div>

            {/* Botões de Decisão */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={async () => {
                  setCapturedPhotoUrl(null);
                  setStep("camera_capture");
                  await startCamera();
                }}
                className="py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Tirar Outra Foto
              </button>

              <button
                onClick={handleConfirmAndSavePunch}
                className="py-3 rounded-2xl bg-[#005C30] hover:bg-[#004724] text-white font-black text-xs uppercase tracking-wider transition-all transform hover:scale-102 active:scale-98 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer border border-[#FFC72C]/40"
              >
                <CheckCircle2 className="w-4 h-4 text-[#FFC72C]" />
                Confirmar Registro
              </button>
            </div>
          </div>
        )}

        {/* PASSO 5: COMPROVANTE OFICIAL DE SUCESSO (COM PRÓXIMAS ETAPAS) */}
        {step === "success_receipt" && receiptData && selectedEmployee && (
          <div className="w-full max-w-lg bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#FFC72C] block pt-2">
                Portaria 671/2021 MTE • REP-P
              </span>
              <h2 className="text-2xl font-black text-white">
                MARCAÇÃO REALIZADA COM SUCESSO!
              </h2>
            </div>

            {/* Dados do Comprovante */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-xs text-left space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-white/60">Tipo de Marcação:</span>
                <span className="font-black text-[#FFC72C] text-sm uppercase">{receiptData.typeLabel}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-white/50 block">Funcionário:</span>
                  <span className="font-bold text-white block">{receiptData.employeeName}</span>
                </div>
                <div>
                  <span className="text-white/50 block">Unidade:</span>
                  <span className="font-bold text-white block">{receiptData.storeName}</span>
                </div>
                <div>
                  <span className="text-white/50 block">Data Oficial:</span>
                  <span className="font-mono font-bold text-white block">{receiptData.date}</span>
                </div>
                <div>
                  <span className="text-white/50 block">Horário Oficial de Brasília:</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs block">{receiptData.time}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-white/50 font-mono">
                NSR Oficial: #{receiptData.nsr} • Hash: {receiptData.hash.slice(0, 24)}...
              </div>
            </div>

            {/* Visão Rápida das Próximas Etapas */}
            <div className="p-3 bg-black/30 rounded-2xl text-left text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
                Status Atualizado da sua Jornada:
              </span>
              <div className="grid grid-cols-4 gap-1 text-center">
                {dayStagesInfo.stages.map((st) => (
                  <div
                    key={st.type}
                    className={`p-1.5 rounded-lg text-[10px] ${
                      st.isCompleted
                        ? "bg-emerald-500/30 text-emerald-200 font-bold"
                        : st.isNext
                        ? "bg-[#FFC72C]/20 text-[#FFC72C] font-bold"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    <span className="block truncate">{st.shortName}</span>
                    <span>{st.actualTime || "Aguardando"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botão de Fechamento */}
            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-[#FFC72C] hover:bg-[#ffcf47] text-[#004724] font-black text-xs uppercase tracking-wider transition-all transform hover:scale-102 active:scale-98 shadow-lg cursor-pointer"
            >
              Concluir ({countdown}s)
            </button>
          </div>
        )}
      </main>

      {/* MODAL DE CONFIRMAÇÃO PRÉVIA ANTES DE ABRIR A CÂMERA */}
      {showConfirmModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0b3d26] border border-[#0d4a2f] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FFC72C]/20 text-[#FFC72C] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                Confirmação de Registro
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                Você está prestes a registrar sua {getStageFullName(targetPunchType)}. Confirma?
              </h4>
              <p className="text-xs text-white/70 mt-1">
                {selectedEmployee.name} • {brasiliaClock.fullTimeStr} (Horário de Brasília)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmAndOpenCamera}
                className="py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#ffcf47] text-[#004724] font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Abrir Câmera →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
