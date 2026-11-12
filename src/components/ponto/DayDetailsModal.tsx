import React, { useState } from "react";
import {
  DayTimeRecord,
  Employee,
  Punch,
  formatMinutesHuman,
  minutesToTime,
} from "../../lib/ponto-store";
import { usePonto } from "../../hooks/use-ponto";
import {
  Clock,
  MapPin,
  Camera,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  X,
  Building2,
  Calendar,
  User,
  History,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface DayDetailsModalProps {
  record: DayTimeRecord | null;
  employee: Employee | null;
  onClose: () => void;
}

export function DayDetailsModal({
  record,
  employee,
  onClose,
}: DayDetailsModalProps) {
  const { adjustPunch, stores } = usePonto();
  const [editingPunchId, setEditingPunchId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!record || !employee) return null;

  const store = stores.find((s) => s.id === record.storeId);
  const dateObj = new Date(record.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleStartEdit = (punch: Punch) => {
    setEditingPunchId(punch.id);
    setNewTime(punch.time);
    setAdjustmentReason(punch.adjustmentReason || "");
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPunchId || !newTime || !adjustmentReason.trim()) {
      toast.error("Preencha o novo horário e a justificativa obrigatória.");
      return;
    }

    setIsSubmitting(true);
    const success = adjustPunch({
      recordId: record.id,
      punchId: editingPunchId,
      newTime,
      reason: adjustmentReason,
      authorName: "Carlos Eduardo Silva (Gerente Admin)",
    });

    setIsSubmitting(false);
    if (success) {
      toast.success("Marcação corrigida com sucesso! Registro de auditoria gerado.");
      setEditingPunchId(null);
    } else {
      toast.error("Erro ao ajustar marcação.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Modal */}
        <div className="bg-[#005C30] text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-12 h-12 rounded-xl object-cover border border-[#FFC72C]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{employee.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-[#FFC72C] text-[#004724] font-bold">
                  {employee.role}
                </span>
              </div>
              <p className="text-xs text-white/80 capitalize mt-0.5">{formattedDate}</p>
            </div>
          </div>

          {/* Resumo da Jornada */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs bg-black/20 p-2.5 rounded-xl border border-white/10">
            <div>
              <span className="text-white/60 block text-[10px] uppercase">Previsto Escala</span>
              <span className="font-semibold text-white">
                {record.isDayOff ? "Folga / DSR" : `${record.scheduledEntry} às ${record.scheduledExit}`}
              </span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px] uppercase">Intervalo Previsto</span>
              <span className="font-semibold text-white">{record.scheduledBreak || "-"}</span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px] uppercase">Horas Feitas</span>
              <span className="font-semibold text-[#FFC72C]">
                {Math.floor(record.totalWorkedMinutes / 60)}h {record.totalWorkedMinutes % 60}m
              </span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px] uppercase">Saldo do Dia</span>
              <span
                className={`font-bold ${
                  record.balanceMinutes >= 0 ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {formatMinutesHuman(record.balanceMinutes)}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Marcações com Fotos e Detalhes */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-[#005C30]" />
              Marcações Realizadas no Dia ({record.punches.length})
            </h4>

            {record.punches.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  {record.isDayOff ? "Dia de Folga (Sem marcações previstas)" : "Nenhuma batida registrada neste dia"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {record.isDayOff ? "DSR conforme escala cadastrada." : "Falta ou ausência de marcação no totem."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {record.punches.map((punch, idx) => {
                  const typeLabel = {
                    entrada: "Entrada (Início de Turno)",
                    intervalo_saida: "Saída para Intervalo / Almoço",
                    intervalo_retorno: "Retorno do Intervalo",
                    saida: "Saída (Fim de Expediente)",
                  }[punch.type];

                  const isBeingEdited = editingPunchId === punch.id;

                  return (
                    <div
                      key={punch.id}
                      className={`border rounded-xl p-4 transition-all ${
                        punch.isManualAdjustment
                          ? "border-amber-300 bg-amber-50/40"
                          : "border-slate-200 bg-white hover:border-[#005C30]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Miniatura da foto ao vivo */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-xs">
                            <img
                              src={punch.photoUrl}
                              alt="Comprovante"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <span className="absolute bottom-1 right-1 text-[8px] font-bold text-white uppercase bg-[#005C30] px-1 rounded">
                              AO VIVO
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{typeLabel}</span>
                              {punch.isManualAdjustment && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                                  Ajustado
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              {punch.isManualAdjustment && punch.originalTime && (
                                <span className="text-xs text-slate-400 line-through font-mono">
                                  Original: {punch.originalTime}
                                </span>
                              )}
                              <span className="text-base font-black font-mono text-[#005C30]">
                                {punch.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botão de Ajuste */}
                        {!isBeingEdited && (
                          <button
                            onClick={() => handleStartEdit(punch)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#005C30] text-xs font-semibold text-slate-700 hover:text-[#005C30] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Ajustar Horário
                          </button>
                        )}
                      </div>

                      {/* Metadados de Auditoria e Geofencing */}
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#005C30]" />
                          <span>{punch.location.address}</span>
                          <span className="text-emerald-600 font-bold ml-1">✓ No Raio</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#005C30]" />
                          <span className="font-mono">NSR: #{punch.nsr}</span>
                          <span className="text-slate-400">• {punch.device.type}</span>
                        </div>
                      </div>

                      {punch.isManualAdjustment && (
                        <div className="mt-2 p-2 rounded bg-amber-100/60 text-amber-900 text-[11px]">
                          <strong>Auditoria:</strong> Ajustado por {punch.adjustedBy} em{" "}
                          {new Date(punch.adjustedAt || "").toLocaleString("pt-BR")}. Motivo: "
                          {punch.adjustmentReason}"
                        </div>
                      )}

                      {/* Formulário inline de edição auditada */}
                      {isBeingEdited && (
                        <form
                          onSubmit={handleSaveAdjustment}
                          className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Info className="w-4 h-4 text-amber-600" />
                            Ajuste de Ponto Auditável (Portaria 671 MTE)
                          </div>
                          <p className="text-[11px] text-slate-500">
                            O horário original ({punch.originalTime || punch.time}) não será apagado. Um registro
                            de auditoria com sua assinatura administrativa será gerado.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                                Novo Horário (HH:MM)
                              </label>
                              <input
                                type="time"
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="w-full text-sm font-mono font-bold p-2 border rounded-lg bg-white"
                                required
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                                Justificativa Obrigatória
                              </label>
                              <input
                                type="text"
                                value={adjustmentReason}
                                onChange={(e) => setAdjustmentReason(e.target.value)}
                                placeholder="Ex: Problema técnico na rede da loja comprovado pela gerência"
                                className="w-full text-xs p-2 border rounded-lg bg-white"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingPunchId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#005C30] hover:bg-[#004724] text-white shadow-sm"
                            >
                              Salvar Ajuste Auditado
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
