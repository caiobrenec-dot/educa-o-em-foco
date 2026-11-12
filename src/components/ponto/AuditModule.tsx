import React, { useState, useMemo } from "react";
import { usePonto } from "../../hooks/use-ponto";
import { CorrectionRequest, AuditLog } from "../../lib/ponto-store";
import {
  ShieldCheck,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Building2,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export function AuditModule() {
  const { auditLogs, corrections, reviewCorrection, employees, stores } = usePonto();
  const [activeTab, setActiveTab] = useState<"logs" | "solicitacoes">("logs");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [reviewModalData, setReviewModalData] = useState<{
    request: CorrectionRequest;
    approved: boolean;
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const filteredLogs = React.useMemo(() => {
    if (filterAction === "all") return auditLogs;
    return auditLogs.filter((l) => l.actionType === filterAction);
  }, [auditLogs, filterAction]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalData) return;

    reviewCorrection({
      requestId: reviewModalData.request.id,
      approved: reviewModalData.approved,
      reviewedBy: "Carlos Eduardo Silva (Gerente Admin)",
      reviewNotes: reviewNotes.trim() || undefined,
    });

    toast.success(
      reviewModalData.approved
        ? "Solicitação aprovada e integrada ao espelho do colaborador!"
        : "Solicitação rejeitada com justificativa registrada."
    );
    setReviewModalData(null);
    setReviewNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Header com Abas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Controle Total, Auditoria Fiscal & Trilha Inviolável
          </h3>
          <p className="text-xs text-slate-500">
            Registros imutáveis de jornada, preservação de dados originais e homologação de correções (Portaria 671)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "bg-[#005C30] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-4 h-4 text-[#FFC72C]" />
            Trilha de Auditoria ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("solicitacoes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "solicitacoes"
                ? "bg-[#005C30] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-[#FFC72C]" />
            Solicitações de Ponto ({corrections.filter((c) => c.status === "pendente").length} pendentes)
          </button>
        </div>
      </div>

      {/* ABA 1: TRILHA DE AUDITORIA IMUTÁVEL */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Filtrar por tipo de ação:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="p-1.5 bg-slate-50 border rounded-lg text-xs font-semibold"
            >
              <option value="all">Todas as Ações</option>
              <option value="ajuste_ponto">Ajuste de Ponto Manual</option>
              <option value="aprovacao_solicitacao">Aprovação de Solicitação</option>
              <option value="rejeicao_solicitacao">Rejeição de Solicitação</option>
              <option value="alteracao_escala">Alteração de Escala</option>
              <option value="registro_ponto_quiosque">Marcação no Totem Quiosque</option>
              <option value="novo_funcionario">Cadastro de Funcionário</option>
              <option value="configuracao_alterada">Configurações</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const dateFormatted = new Date(log.timestamp).toLocaleString("pt-BR");

              const badgeColor = {
                ajuste_ponto: "bg-amber-100 text-amber-900 border-amber-200",
                aprovacao_solicitacao: "bg-emerald-100 text-emerald-900 border-emerald-200",
                rejeicao_solicitacao: "bg-red-100 text-red-900 border-red-200",
                alteracao_escala: "bg-blue-100 text-blue-900 border-blue-200",
                registro_ponto_quiosque: "bg-emerald-50 text-emerald-800 border-emerald-100",
                novo_funcionario: "bg-purple-100 text-purple-900 border-purple-200",
                configuracao_alterada: "bg-slate-100 text-slate-800 border-slate-200",
              }[log.actionType] || "bg-slate-100 text-slate-800";

              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
                        {log.actionType.replace(/_/g, " ")}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{log.title}</h4>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{dateFormatted}</span>
                  </div>

                  <p className="text-slate-600">{log.details}</p>

                  {/* Diferenciação Clara: Valor Anterior vs Valor Novo */}
                  {(log.previousValue || log.newValue) && (
                    <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {log.previousValue && (
                        <div>
                          <span className="text-slate-400 font-bold block uppercase text-[9px]">
                            Registro Anterior / Original:
                          </span>
                          <span className="text-slate-700 font-mono line-through">
                            {log.previousValue}
                          </span>
                        </div>
                      )}
                      {log.newValue && (
                        <div>
                          <span className="text-[#005C30] font-bold block uppercase text-[9px]">
                            Novo Valor Homologado:
                          </span>
                          <span className="text-[#005C30] font-mono font-bold">
                            {log.newValue}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>Autor: <strong className="text-slate-700">{log.authorName}</strong></span>
                    {log.employeeName && (
                      <span>Colaborador: <strong className="text-slate-700">{log.employeeName}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: GESTÃO DE SOLICITAÇÕES DE PONTO */}
      {activeTab === "solicitacoes" && (
        <div className="space-y-4">
          {corrections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">Todas as solicitações foram avaliadas.</p>
              <p className="text-xs text-slate-400 mt-1">Nenhum pedido pendente de aprovação.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {corrections.map((corr) => {
                const emp = employees.find((e) => e.id === corr.employeeId);
                const store = stores.find((s) => s.id === corr.storeId);

                return (
                  <div
                    key={corr.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp?.avatar}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{emp?.name}</h4>
                            <span className="text-slate-500 font-semibold">• {store?.name}</span>
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            Solicitação para a data:{" "}
                            <strong>{corr.date.split("-").reverse().join("/")}</strong>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          corr.status === "aprovada"
                            ? "bg-emerald-100 text-emerald-800"
                            : corr.status === "rejeitada"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}
                      >
                        {corr.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-500 uppercase font-bold mb-1">
                        Horário Solicitado para {corr.punchType.replace("_", " ")}:
                      </p>
                      <p className="font-mono text-base font-black text-[#005C30]">
                        {corr.requestedTime}
                      </p>
                      <p className="mt-2 text-slate-700 italic">
                        Justificativa do funcionário: "{corr.reason}"
                      </p>
                    </div>

                    {corr.status === "pendente" && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => setReviewModalData({ request: corr, approved: false })}
                          className="px-4 py-2 rounded-xl border border-red-200 text-red-700 font-bold hover:bg-red-50 text-xs transition-colors"
                        >
                          Rejeitar Solicitação
                        </button>
                        <button
                          onClick={() => setReviewModalData({ request: corr, approved: true })}
                          className="px-4 py-2 rounded-xl bg-[#005C30] hover:bg-[#004724] text-white font-bold text-xs transition-colors shadow-sm"
                        >
                          Aprovar & Integrar ao Ponto
                        </button>
                      </div>
                    )}

                    {corr.reviewedBy && (
                      <div className="text-[11px] text-slate-500 pt-2 border-t">
                        Revisado por <strong>{corr.reviewedBy}</strong> em{" "}
                        {new Date(corr.reviewedAt || "").toLocaleString("pt-BR")}.{" "}
                        {corr.reviewNotes && `Parecer: "${corr.reviewNotes}"`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Homologação de Correção */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              {reviewModalData.approved ? "Aprovar Solicitação de Ponto" : "Rejeitar Solicitação de Ponto"}
            </h4>
            <p className="text-xs text-slate-600">
              {reviewModalData.approved
                ? "A marcação será inserida no espelho com registro de auditoria transparente."
                : "Informe o motivo da recusa para ciência do colaborador."}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Parecer do Administrador / Justificativa
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Ex: Atestado validado / Inconsistência não comprovada..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
                    reviewModalData.approved
                      ? "bg-[#005C30] hover:bg-[#004724]"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirmar Decisão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
